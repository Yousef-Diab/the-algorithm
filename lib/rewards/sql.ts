import { sql } from 'drizzle-orm';

export function learnerProfileQuery(user:string) {
  return sql`SELECT coalesce(p.display_name,nullif(btrim(u.name),''),'Learner '||substr(md5(${user}),1,6)) AS name,
    coalesce(p.avatar,'◆') AS avatar,coalesce(p.visible,true) AS visible
    FROM (SELECT 1) seed LEFT JOIN learner_profiles p ON p.user_id=${user}
    LEFT JOIN neon_auth."user" u ON u.id::text=${user}`;
}
export function summaryQuery(user:string) {
  return sql`SELECT coalesce(sum(amount),0)::int AS xp,
    coalesce(sum(amount) FILTER(WHERE NOT legacy AND earned_at >=
      (date_trunc('day',now() AT TIME ZONE 'Asia/Riyadh') AT TIME ZONE 'Asia/Riyadh')),0)::int AS today,
    count(*) FILTER(WHERE kind='completion')::int AS completed,
    count(*) FILTER(WHERE kind='review')::int AS reviews
    FROM xp_events WHERE user_id=${user}`;
}
export function leaderboardQuery(user:string) {
  return sql`WITH members AS (
      SELECT DISTINCT user_id FROM entitlements WHERE expires_at IS NULL OR expires_at>now()
      UNION SELECT user_id FROM user_roles WHERE role='admin'
    ), scores AS (
      SELECT m.user_id,
        coalesce(p.display_name,nullif(btrim(u.name),''),'Learner '||substr(md5(m.user_id),1,6)) AS name,
        coalesce(p.avatar,'◆') AS avatar,
        coalesce(sum(e.amount),0)::int AS xp,
        coalesce(sum(e.amount),0)::int AS total_xp,
        count(e.id) FILTER(WHERE e.kind='completion')::int AS completed
      FROM members m LEFT JOIN learner_profiles p ON p.user_id=m.user_id
      LEFT JOIN neon_auth."user" u ON u.id::text=m.user_id
      LEFT JOIN xp_events e ON e.user_id=m.user_id
      WHERE coalesce(p.visible,true)
      GROUP BY m.user_id,p.display_name,p.avatar,u.name
    ), ranked AS (
      SELECT *,rank() OVER(ORDER BY xp DESC)::int AS rank,
        row_number() OVER(ORDER BY xp DESC,user_id) AS position FROM scores
    ) SELECT rank,name,avatar,xp,total_xp,completed,user_id=${user} AS is_me
      FROM ranked WHERE position<=100 OR user_id=${user} ORDER BY position`;
}
