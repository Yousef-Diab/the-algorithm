import styles from './SiteLoader.module.css';
import { BrandMark } from './BrandMark';

export function SiteLoader({ label = 'Loading' }: { label?: string }) {
  return <div className={styles.loader} role="status" aria-live="polite">
    <BrandMark className={styles.mark} />
    <span className={styles.srOnly}>{label}</span>
  </div>;
}
