import TransitionLink from './TransitionLink';
import styles from './Navbar.module.css';

type NavbarVariant = 'hero' | 'header';
type ActivePage = 'writing' | 'photography' | 'music' | null;

interface NavbarProps {
  variant?: NavbarVariant;
  activePage?: ActivePage;
}

export default function Navbar({ variant = 'header', activePage = null }: NavbarProps) {
  const isHero = variant === 'hero';
  const containerClass = isHero ? styles.heroContainer : styles.headerContainer;

  const logoContent = (
    <h1 className={styles.logo}>
      <span className={styles.ward}>ward</span>
      <span className={styles.sh}>.sh</span>
    </h1>
  );

  return (
    <div className={containerClass}>
      {isHero ? logoContent : <TransitionLink href="/">{logoContent}</TransitionLink>}
      <nav className={styles.nav}>
        {activePage === 'writing' ? (
          <span className={`${styles.navLink} ${styles.navLinkActive}`}>
            writing
          </span>
        ) : (
          <TransitionLink href="/writing" className={styles.navLink}>
            writing
          </TransitionLink>
        )}
        {activePage === 'photography' ? (
          <span className={`${styles.navLink} ${styles.navLinkActive}`}>
            photography
          </span>
        ) : (
          <TransitionLink href="/photography" className={styles.navLink}>
            photography
          </TransitionLink>
        )}
        {activePage === 'music' ? (
          <span className={`${styles.navLink} ${styles.navLinkActive}`}>
            music
          </span>
        ) : (
          <TransitionLink href="/music" className={styles.navLink}>
            music
          </TransitionLink>
        )}
      </nav>
    </div>
  );
}

