import { PGlite } from '@electric-sql/pglite';
import { readFileSync, readdirSync } from 'node:fs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PgDialect } from 'drizzle-orm/pg-core';
import { leaderboardQuery, summaryQuery, learnerProfileQuery } from '@/lib/rewards/sql';

const pg = new PGlite();
const q = (s: string, p: unknown[] = []) => pg.query<Record<string, unknown>>(s, p);
beforeAll(async () => {
  // Minimal existing tables; reward DDL and function come from the real migration.
  await pg.exec(`CREATE TABLE lessons(id text PRIMARY KEY, kind text, status text);
    CREATE TABLE progress(user_id text, lesson_id text, completed_at timestamptz, PRIMARY KEY(user_id,lesson_id));
    CREATE TABLE entitlements(user_id text, expires_at timestamptz);
    CREATE TABLE user_roles(user_id text, role text);
    CREATE SCHEMA neon_auth;
    CREATE TABLE neon_auth."user"(id uuid PRIMARY KEY, name text, email text);
    CREATE TABLE quiz_questions(id uuid PRIMARY KEY, lesson_id text, answer integer);
    CREATE TABLE quiz_results(user_id text, question_id uuid, selected integer, answered_at timestamptz, PRIMARY KEY(user_id,question_id));
    INSERT INTO lessons VALUES ('a','lesson','published'),('b','lesson','published'),('exam','exam','published');
    INSERT INTO progress VALUES ('legacy','a',now());
    INSERT INTO quiz_questions VALUES
      ('00000000-0000-0000-0000-000000000001','a',0),
      ('00000000-0000-0000-0000-000000000002','a',1),
      ('00000000-0000-0000-0000-000000000003','a',2),
      ('00000000-0000-0000-0000-000000000004','a',3),
      ('00000000-0000-0000-0000-000000000005','a',0);`);
  const files = readdirSync('drizzle').filter(n => /^000[78]_.*\.sql$/.test(n)).sort();
  expect(files, 'initial and first-attempt reward migrations exist').toHaveLength(2);
  for (const file of files) await pg.exec(readFileSync(`drizzle/${file}`, 'utf8'));
}, 30000);
afterAll(() => pg.close());
const claim = async (user = 'learner') => (await q('select claim_checkpoint($1,$2) as xp', [user, 'a'])).rows[0] as {xp:number};
const answers = async (user = 'learner') => q(`INSERT INTO quiz_results SELECT $1,id,answer,clock_timestamp() FROM quiz_questions WHERE lesson_id='a'
  ON CONFLICT(user_id,question_id) DO UPDATE SET selected=EXCLUDED.selected,answered_at=EXCLUDED.answered_at`, [user]);

describe('transactional checkpoint rewards', () => {
  it('refuses an empty/incomplete checkpoint', async () => {
    await expect(claim()).rejects.toThrow(/complete/i);
  });
  it('awards completion, first-try accuracy, and secret perfect XP once', async () => {
    await answers();
    const results = await Promise.all([claim(), claim(), claim()]);
    expect(results.map(r => r.xp).sort((a,b) => a-b)).toEqual([0,0,40]);
    expect((await q("select kind,amount from xp_events where user_id='learner' order by kind")).rows).toEqual([
      {kind:'accuracy',amount:10}, {kind:'completion',amount:20},
      {kind:'first_try',amount:5}, {kind:'perfect_first_try',amount:5},
    ]);
  });
  it('awards first-try XP at 80 percent without the secret perfect bonus', async () => {
    await answers('eighty');
    await q("UPDATE quiz_results SET selected=3 WHERE user_id='eighty' AND question_id='00000000-0000-0000-0000-000000000001'");
    expect(await claim('eighty')).toEqual({xp:35});
    expect((await q("select kind from xp_events where user_id='eighty' order by kind")).rows).toEqual([
      {kind:'accuracy'}, {kind:'completion'}, {kind:'first_try'},
    ]);
  });
  it('cannot farm review XP by resetting or resubmitting before seven days', async () => {
    await q("DELETE FROM quiz_results WHERE user_id='learner'");
    await answers();
    expect(await claim()).toEqual({xp:0});
  });
  it('requires fresh answers after cooldown, then awards only one review', async () => {
    await q("UPDATE checkpoint_rewards SET last_reward_at=now()-interval '8 days' WHERE user_id='learner'");
    await q("UPDATE quiz_results SET answered_at=now()-interval '9 days' WHERE user_id='learner'");
    expect(await claim()).toEqual({xp:0});
    await q("UPDATE quiz_results SET answered_at=now()-interval '7 days' WHERE user_id='learner'");
    expect(await claim()).toEqual({xp:0});
    await answers();
    expect(await claim()).toEqual({xp:5});
    expect(await claim()).toEqual({xp:0});
  });
  it('marks checkpoint completion in ordinary course progress too', async () => {
    expect((await q("SELECT lesson_id FROM progress WHERE user_id='learner'")).rows).toEqual([{lesson_id:'a'}]);
  });
  it('keeps user rewards isolated and awards accuracy later', async () => {
    await answers('other');
    await q("UPDATE quiz_results SET selected=3 WHERE user_id='other'");
    expect(await claim('other')).toEqual({xp:20});
    await answers('other');
    expect(await claim('other')).toEqual({xp:10});
    expect(await claim('other')).toEqual({xp:0});
  });
  it('backfills legacy completion without counting it as current activity', async () => {
    expect((await q("select amount,legacy from xp_events where user_id='legacy'")).rows).toEqual([{amount:20,legacy:true}]);
    expect((await q("select count(*)::int as count from xp_events where user_id='legacy' and not legacy")).rows).toEqual([{count:0}]);
  });
  it('rejects non-lesson and unpublished checkpoint requests', async () => {
    await expect(q("select claim_checkpoint('learner','exam')")).rejects.toThrow(/lesson/i);
    await q("UPDATE lessons SET status='draft' WHERE id='b'");
    await expect(q("select claim_checkpoint('learner','b')")).rejects.toThrow(/lesson/i);
  });
});

const execute = async (statement: ReturnType<typeof summaryQuery>) => {
  const {sql,params} = new PgDialect().sqlToQuery(statement);
  return (await q(sql,params)).rows;
};
describe('member leaderboard and totals', () => {
  it('excludes hidden members before ranking, shares ranks for ties, and omits private identifiers', async () => {
    await pg.exec(`INSERT INTO entitlements VALUES ('learner',null),('other',null),('legacy',null),('hidden',null);
      INSERT INTO learner_profiles VALUES ('hidden','Hidden','◆',false);
      INSERT INTO xp_events(user_id,lesson_id,kind,amount) VALUES ('hidden','a','review',500);`);
    const rows = await execute(leaderboardQuery('learner'));
    expect(rows.map(r=>[r.rank,r.xp,r.is_me])).toEqual([[1,45,true],[2,30,false],[3,20,false]]);
    expect(rows.every(r=>!('user_id' in r))).toBe(true);
    await q("INSERT INTO entitlements VALUES ('tied',null)");
    await q("INSERT INTO xp_events(user_id,lesson_id,kind,amount) VALUES ('tied','a','completion',20)");
    expect((await execute(leaderboardQuery('legacy'))).filter(r=>r.xp===20).map(r=>r.rank)).toEqual([3,3]);
  });
  it('includes legacy credit in the single all-time leaderboard', async () => {
    expect(await execute(summaryQuery('legacy'))).toEqual([{xp:20,today:0,completed:1,reviews:0}]);
    const rows = await execute(leaderboardQuery('legacy'));
    expect(rows.find(r=>r.is_me)).toMatchObject({xp:20,total_xp:20});
  });
  it('shows the viewer outside the top 100 without returning the entire member list', async () => {
    await q("INSERT INTO entitlements SELECT 'bulk-'||n,NULL FROM generate_series(1,110) n");
    await q("INSERT INTO xp_events(user_id,lesson_id,kind,amount) SELECT 'bulk-'||n,'a','completion',100 FROM generate_series(1,110) n");
    const rows = await execute(leaderboardQuery('legacy'));
    expect(rows).toHaveLength(101);
    expect(rows[100]).toMatchObject({is_me:true,rank:113});
  });
  it('defaults leaderboard and profile names to the account name, preserving custom names', async () => {
    const user='11111111-1111-1111-1111-111111111111';
    await q('INSERT INTO neon_auth."user" VALUES ($1,$2,$3)',[user,'Yousef','private@example.com']);
    await q('INSERT INTO entitlements VALUES ($1,NULL)',[user]);
    expect((await execute(leaderboardQuery(user))).find(r=>r.is_me)).toMatchObject({name:'Yousef'});
    expect(await execute(learnerProfileQuery(user))).toEqual([{name:'Yousef',avatar:'◆',visible:true}]);
    await q('INSERT INTO learner_profiles VALUES ($1,$2,$3,true)',[user,'Chart Student','✦']);
    expect((await execute(leaderboardQuery(user))).find(r=>r.is_me)).toMatchObject({name:'Chart Student'});
    expect(await execute(learnerProfileQuery(user))).toEqual([{name:'Chart Student',avatar:'✦',visible:true}]);
  });
  it('uses a pseudonym for an empty account name, never the email', async () => {
    const user='22222222-2222-2222-2222-222222222222';
    await q('INSERT INTO neon_auth."user" VALUES ($1,$2,$3)',[user,'   ','private@example.com']);
    const [profile]=await execute(learnerProfileQuery(user));
    expect(profile.name).toMatch(/^Learner [a-f0-9]{6}$/);
  });
});
