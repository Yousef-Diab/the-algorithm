import styles from './SiteLoader.module.css';

export function SiteLoader({ label = 'Loading' }: { label?: string }) {
  return <div className={styles.loader} role="status" aria-live="polite">
    <svg className={styles.mark} viewBox="0 0 180 112" aria-hidden="true">
      <path className={styles.grid} d="M14 20H166M14 56H166M14 92H166M42 10V102M90 10V102M138 10V102" />
      <path className={styles.trail} d="M12 84L42 70L68 78L94 42L121 54L166 20" />
      <g className={styles.candle}>
        <path d="M42 48V86" /><rect x="36" y="58" width="12" height="18" rx="2" />
      </g>
      <g className={styles.candle}>
        <path d="M76 50V90" /><rect x="70" y="61" width="12" height="20" rx="2" />
      </g>
      <g className={styles.candle}>
        <path d="M121 29V68" /><rect x="115" y="39" width="12" height="20" rx="2" />
      </g>
      <path className={styles.diamond} d="M94 30L106 42L94 54L82 42Z" />
      <circle className={styles.signal} cx="166" cy="20" r="4" />
    </svg>
    <span className={styles.srOnly}>{label}</span>
  </div>;
}
