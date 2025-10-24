import TransitionLink from './TransitionLink';
import styles from './Navbar.module.css';

type NavbarVariant = 'hero' | 'header';
type ActivePage = 'textual' | 'visual' | 'audible' | null;

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
        {activePage === 'textual' ? (
          <span className={`${styles.navLink} ${styles.navLinkActive}`}>
            textual
          </span>
        ) : (
          <TransitionLink href="/textual" className={styles.navLink}>
            textual
          </TransitionLink>
        )}
        {activePage === 'visual' ? (
          <TransitionLink href="/visual" className={`${styles.navLink} ${styles.navLinkActive}`}>
            visual
          </TransitionLink>
        ) : (
          <TransitionLink href="/visual" className={styles.navLink}>
            visual
          </TransitionLink>
        )}
        {activePage === 'audible' ? (
          <TransitionLink href="/audible" className={`${styles.navLink} ${styles.navLinkActive}`}>
            audible
          </TransitionLink>
        ) : (
          <TransitionLink href="/audible" className={styles.navLink}>
            audible
          </TransitionLink>
        )}
      </nav>
    </div>
  );
}

