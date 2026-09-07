import type { SVGProps } from 'react';

type BrandMarkProps = SVGProps<SVGSVGElement> & {
  title?: string;
};

export function BrandMark({ title, ...props }: BrandMarkProps) {
  return <svg
    viewBox="0 0 180 112"
    role={title ? 'img' : undefined}
    aria-hidden={title ? undefined : true}
    {...props}
  >
    {title ? <title>{title}</title> : null}
    <path data-brand-grid fill="none" stroke="var(--border, #232b3d)" strokeWidth="1" d="M14 20H166M14 56H166M14 92H166M42 10V102M90 10V102M138 10V102" />
    <path data-brand-trail fill="none" stroke="var(--gold, #e8b45a)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M12 84L42 70L68 78L94 42L121 54L166 20" />
    <g data-brand-candle fill="var(--bg2, #11151f)" stroke="var(--accent2, #7aa5ff)" strokeWidth="2">
      <path d="M42 48V86" /><rect x="36" y="58" width="12" height="18" rx="2" />
    </g>
    <g data-brand-candle fill="var(--bg2, #11151f)" stroke="var(--accent2, #7aa5ff)" strokeWidth="2">
      <path d="M76 50V90" /><rect x="70" y="61" width="12" height="20" rx="2" />
    </g>
    <g data-brand-candle fill="var(--bg2, #11151f)" stroke="var(--accent2, #7aa5ff)" strokeWidth="2">
      <path d="M121 29V68" /><rect x="115" y="39" width="12" height="20" rx="2" />
    </g>
    <path data-brand-diamond fill="var(--bg, #0b0e14)" stroke="var(--gold, #e8b45a)" strokeWidth="2.5" d="M94 30L106 42L94 54L82 42Z" />
    <circle data-brand-signal fill="var(--gold, #e8b45a)" cx="166" cy="20" r="4" />
  </svg>;
}
