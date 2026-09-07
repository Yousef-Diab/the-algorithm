import { ImageResponse } from 'next/og';

export const alt = 'The Algorithm — Learning how price is really delivered';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function PreviewMark() {
  return <svg width="390" height="243" viewBox="0 0 180 112">
    <path fill="none" stroke="#232b3d" strokeWidth="1" d="M14 20H166M14 56H166M14 92H166M42 10V102M90 10V102M138 10V102" />
    <path fill="none" stroke="#e8b45a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M12 84L42 70L68 78L94 42L121 54L166 20" />
    <g fill="#11151f" stroke="#7aa5ff" strokeWidth="2">
      <path d="M42 48V86" /><rect x="36" y="58" width="12" height="18" rx="2" />
      <path d="M76 50V90" /><rect x="70" y="61" width="12" height="20" rx="2" />
      <path d="M121 29V68" /><rect x="115" y="39" width="12" height="20" rx="2" />
    </g>
    <path fill="#0b0e14" stroke="#e8b45a" strokeWidth="2.5" d="M94 30L106 42L94 54L82 42Z" />
    <circle fill="#e8b45a" cx="166" cy="20" r="4" />
  </svg>;
}

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{
      width: '100%', height: '100%', display: 'flex', alignItems: 'center',
      padding: '70px 76px', color: '#d7dce6', background: '#0b0e14',
      fontFamily: 'Segoe UI, sans-serif', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', opacity: .35, backgroundImage: 'linear-gradient(#232b3d 1px, transparent 1px), linear-gradient(90deg, #232b3d 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
      <div style={{ position: 'absolute', width: 620, height: 620, right: -90, top: -210, borderRadius: 999, background: 'radial-gradient(circle, rgba(79,140,255,.18), transparent 68%)' }} />
      <div style={{ position: 'absolute', width: 560, height: 560, left: -210, bottom: -300, borderRadius: 999, background: 'radial-gradient(circle, rgba(232,180,90,.14), transparent 68%)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 58, width: '100%', position: 'relative' }}>
        <div style={{ display: 'flex', width: 420, height: 310, alignItems: 'center', justifyContent: 'center', border: '1px solid #2d374d', borderRadius: 32, background: 'rgba(17,21,31,.82)', boxShadow: '0 28px 80px rgba(0,0,0,.45)' }}>
          <PreviewMark />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ color: '#7aa5ff', fontSize: 22, fontWeight: 700, letterSpacing: 5, textTransform: 'uppercase', marginBottom: 22 }}>ICT Mentorship Course</div>
          <div style={{ display: 'flex', fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -3 }}>
            <span>The&nbsp;</span><span style={{ color: '#e8b45a' }}>Algorithm</span>
          </div>
          <div style={{ width: 92, height: 5, borderRadius: 99, background: 'linear-gradient(90deg, #e8b45a, #4f8cff)', margin: '28px 0 24px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', color: '#aab2c2', fontSize: 30, lineHeight: 1.35 }}>
            <div>Learning how price is</div>
            <div>really delivered.</div>
          </div>
        </div>
      </div>
    </div>,
    size,
  );
}
