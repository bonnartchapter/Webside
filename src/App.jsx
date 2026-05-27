import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { locales } from './locales';

// Reusable animated section wrapper
function PageTransition({ children }) {
  const location = useLocation();
  const [animateKey, setAnimateKey] = useState(location.pathname);

  useEffect(() => {
    setAnimateKey(location.pathname);
  }, [location]);

  return (
    <div key={animateKey} className="section" style={{ padding: 0 }}>
      {children}
    </div>
  );
}

function App() {
  const [lang, setLang] = useState('CH');
  
  useEffect(() => {
    document.documentElement.lang = lang === 'CH' ? 'zh-TW' : 'en';
    document.title = lang === 'CH' ? 'Bonn Art Chapter | 年度藝術行動計畫' : 'Bonn Art Chapter | Annual Art Initiative';
  }, [lang]);

  return (
    <Router>
      <AppContent lang={lang} setLang={setLang} />
    </Router>
  );
}

function AppContent({ lang, setLang }) {
  const t = locales[lang];
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState('idle'); // 'idle', 'submitting', 'success', 'error'

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribeStatus('submitting');
    try {
      const response = await fetch('https://formspree.io/f/mojbpzdn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      if (response.ok) {
        setSubscribeStatus('success');
        setEmail('');
      } else {
        setSubscribeStatus('error');
      }
    } catch (err) {
      setSubscribeStatus('error');
    }
  };

  // Reset selectedArtist when route changes
  useEffect(() => {
    setSelectedArtist(null);
  }, [location.pathname]);

  // Track window scroll to switch transparent navbar to solid white
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isArtistDetail = location.pathname === '/archive' && selectedArtist !== null;
  const showTransparentNav = (isHome || isArtistDetail) && !isScrolled;

  return (
    <>
      <nav className={`nav-bar ${showTransparentNav ? 'transparent' : ''}`}>
        <div className="nav-left">
          <Link to="/" className="nav-logo">
            <img src="/L.png" alt="Bonn Art Chapter Logo" />
          </Link>
        </div>
        
        <div className="nav-center">
          <div className="nav-links">
            <Link to="/about">{t.nav.about}</Link>
            <Link to="/chapter">{t.nav.chapter}</Link>
            <Link to="/archive">{t.nav.archive}</Link>
            <Link to="/open-call">{t.nav.openCall}</Link>
            <Link to="/press">{t.nav.press}</Link>
          </div>
        </div>

        <div className="nav-right">
          <div className="lang-switch">
            <button 
              className={`lang-btn ${lang === 'EN' ? 'active' : ''}`} 
              onClick={() => setLang('EN')}
            >EN</button>
            <span className="lang-divider">|</span>
            <button 
              className={`lang-btn ${lang === 'CH' ? 'active' : ''}`} 
              onClick={() => setLang('CH')}
            >CH</button>
          </div>
        </div>
      </nav>

      {/* If transparent nav is showing, pad top is 0 for full bleed hero video. Otherwise, pad 120px. */}
      <div style={{ paddingTop: showTransparentNav ? '0' : '120px', minHeight: 'calc(100vh - 140px)' }}>
        <Routes>
          <Route path="/" element={<Home t={t} />} />
          <Route path="/about" element={<AboutLanding t={t} />} />
          <Route path="/about/what-we-do" element={<AboutWhatWeDo t={t} />} />
          <Route path="/about/charter" element={<AboutCharter t={t} />} />
          <Route path="/chapter" element={<Chapter t={t} />} />
          <Route 
            path="/archive" 
            element={
              <Archive 
                t={t} 
                selectedArtist={selectedArtist} 
                setSelectedArtist={setSelectedArtist} 
              />
            } 
          />
          <Route path="/open-call" element={<OpenCall t={t} />} />
          <Route path="/press" element={<Press t={t} />} />
        </Routes>
      </div>

      <footer className="footer">
        <div className="footer-top">
          {/* Left Column: Logo */}
          <div className="footer-logo-col">
            <Link to="/" className="footer-logo">
              <img src="/L.png" alt="Bonn Art Chapter Logo" />
            </Link>
          </div>

          {/* Middle Column: Grid Links */}
          <div className="footer-links-cols">
            <div className="footer-links-col">
              <Link to="/about">{t.nav.about}</Link>
              <Link to="/chapter">{t.nav.chapter}</Link>
              <Link to="/archive">{t.nav.archive}</Link>
            </div>
            <div className="footer-links-col">
              <Link to="/open-call">{t.nav.openCall}</Link>
              <Link to="/press">{t.nav.press}</Link>
              <a href="mailto:bonnartchapter@gmail.com">CONTACT</a>
            </div>
          </div>

          {/* Right Column: Social Icons */}
          <div className="footer-social-col">
            <a 
              href="https://www.instagram.com/bonnartchapter/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-icon-link"
              title="Instagram"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
          </div>
        </div>

        {/* Email Signup Area */}
        <div className="footer-middle">
          <div className="email-signup-wrapper">
            {subscribeStatus === 'success' ? (
              <div className="email-success-message" style={{ color: 'var(--text-color)', fontSize: '0.85rem', letterSpacing: '0.05em', fontWeight: '500', minHeight: '35px', display: 'flex', alignItems: 'center' }}>
                ✓ {lang === 'CH' ? '感謝您的訂閱！' : 'THANK YOU FOR YOUR SUBSCRIPTION.'}
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="email-signup-input-row">
                <input 
                  type="email" 
                  placeholder={lang === 'CH' ? '您的電子信箱' : 'Your email address'} 
                  className="email-input" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={subscribeStatus === 'submitting'}
                  required
                />
                <button type="submit" className="email-submit-btn" aria-label="Subscribe" disabled={subscribeStatus === 'submitting'}>
                  {subscribeStatus === 'submitting' ? (
                    <span className="email-loading-spinner" />
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  )}
                </button>
              </form>
            )}
            {subscribeStatus === 'error' && (
              <p className="email-disclaimer" style={{ color: '#ff3b30', marginTop: '0.2rem' }}>
                {lang === 'CH' ? '訂閱失敗，請稍後再試。' : 'Subscription failed, please try again later.'}
              </p>
            )}
            {subscribeStatus !== 'success' && (
              <p className="email-disclaimer">
                {lang === 'CH' 
                  ? '訂閱以獲取 Bonn Art Chapter 的最新消息與年度徵件資訊。' 
                  : 'Subscribe to receive the latest updates and annual open call news from Bonn Art Chapter.'
                }
              </p>
            )}
          </div>
        </div>

        {/* Bottom row: policies and copyright */}
        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy policy</a>
            <a href="#accessibility" onClick={(e) => e.preventDefault()}>Accessibility policy</a>
          </div>
          <div className="footer-bottom-right">
            <span>© {new Date().getFullYear()} BONN ART CHAPTER.</span>
          </div>
        </div>
      </footer>
    </>
  );
}

// Pages
function Home({ t }) {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <PageTransition>
      <section className="hero-video-wrapper">
        <video 
          ref={videoRef}
          className="hero-video" 
          autoPlay 
          muted={isMuted} 
          loop 
          playsInline
        >
          <source src="https://media.githubusercontent.com/media/bonnartchapter/Webside/master/public/首頁影片_最終.mp4" type="video/mp4" />
        </video>
        
        {/* Subtle dark gradient overlay at top so white nav text is readable on bright videos */}
        <div className="hero-top-gradient"></div>

        <div className="video-controls">
          <button className="sound-btn" onClick={toggleMute}>
            {isMuted ? 'SOUND OFF' : 'SOUND ON'}
          </button>
        </div>
      </section>

      {/* Put Open Call directly below Home video */}
      <div className="container">
        <OpenCallContent t={t} />
      </div>
    </PageTransition>
  );
}

function AboutLanding({ t }) {
  return (
    <PageTransition>
      <div className="container" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
        
        {/* WHAT WE DO Entry with background video */}
        <Link to="/about/what-we-do" className="about-entry" style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: '#fff', backgroundColor: '#333', borderBottom: '1px solid #000', overflow: 'hidden' }}>
          <video 
            src="https://media.githubusercontent.com/media/bonnartchapter/Webside/master/public/what_we_do.mp4" 
            autoPlay 
            muted 
            loop 
            playsInline
            className="about-entry-bg"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease', zIndex: 1, opacity: 0.65 }}
          />
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.15)', zIndex: 1.5 }}></div>
          
          <h2 style={{ position: 'relative', zIndex: 2, fontSize: 'clamp(3rem, 6vw, 6rem)', fontWeight: '400', borderBottom: 'none', margin: 0, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
            {t.about.whatWeDoTitle}
          </h2>
        </Link>

        {/* CHARTER Entry with background video */}
        <Link to="/about/charter" className="about-entry" style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: '#fff', backgroundColor: '#222', overflow: 'hidden' }}>
          <video 
            src="https://media.githubusercontent.com/media/bonnartchapter/Webside/master/public/charter.mp4" 
            autoPlay 
            muted 
            loop 
            playsInline
            className="about-entry-bg"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease', zIndex: 1, opacity: 0.65 }}
          />
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.15)', zIndex: 1.5 }}></div>
          
          <h2 style={{ position: 'relative', zIndex: 2, fontSize: 'clamp(3rem, 6vw, 6rem)', fontWeight: '400', borderBottom: 'none', margin: 0, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
            {t.about.charterTitle}
          </h2>
        </Link>
      </div>
    </PageTransition>
  );
}

function AboutWhatWeDo({ t }) {
  return (
    <PageTransition>
      <div className="container">
        <section className="section">
          <h2>{t.about.whatWeDoTitle}</h2>
          
          <div className="about-split-layout" style={{ marginTop: '4rem' }}>
            {/* Left side: Text content */}
            <div>
              <p style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.5rem)', lineHeight: '1.4', fontWeight: '400', margin: 0 }}>
                {t.about.whatWeDoContent}
              </p>
            </div>

            {/* Right side: Constrained Video Player */}
            <div>
              <video 
                src="https://media.githubusercontent.com/media/bonnartchapter/Webside/master/public/what_we_do.mp4" 
                controls 
                autoPlay 
                muted 
                loop 
                playsInline
                className="portfolio-video-player"
                style={{ width: '100%', display: 'block' }}
              />
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}

function AboutCharter({ t }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleAccordion = (index) => {
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else {
      setExpandedIndex(index);
    }
  };

  return (
    <PageTransition>
      <div className="container">
        <section className="section">
          <div style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#999', marginBottom: '4rem' }}>
            {t.about.charterTitle}
          </div>
          
          <div className="about-split-layout" style={{ marginBottom: '8rem' }}>
            {/* Left side: Mission text */}
            <div>
              <h3 style={{ fontSize: 'clamp(2rem, 3vw, 3rem)', fontWeight: '400', color: 'var(--text-color)', marginBottom: '2rem' }}>
                {t.about.missionTitle}
              </h3>
              <p style={{ fontSize: 'clamp(1.2rem, 2vw, 2rem)', lineHeight: '1.5', margin: 0 }}>
                {t.about.missionContent}
              </p>
            </div>

            {/* Right side: Constrained Video Player */}
            <div>
              <video 
                src="https://media.githubusercontent.com/media/bonnartchapter/Webside/master/public/charter.mp4" 
                controls 
                autoPlay 
                muted 
                loop 
                playsInline
                className="portfolio-video-player"
                style={{ width: '100%', display: 'block' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
            {/* The title on the left, accordion on the right, matching LAS layout */}
            <div className="charter-goals-layout">
              <div>
                <h3 style={{ fontSize: 'clamp(2rem, 3vw, 3rem)', fontWeight: '400', margin: 0, color: 'var(--text-color)' }}>
                  {t.about.goalsTitle}
                </h3>
              </div>
              
              <div className="accordion-list" style={{ borderTop: '1px solid var(--border-color)' }}>
                {t.about.goals.map((goal, index) => {
                  const isExpanded = expandedIndex === index;
                  return (
                    <div key={index} className="accordion-item" style={{ borderBottom: '1px solid var(--border-color)', padding: '1.5rem 0' }}>
                      <button 
                        onClick={() => toggleAccordion(index)}
                        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '0.5rem 0' }}
                      >
                        <h4 style={{ fontSize: '1.1rem', fontWeight: '400', margin: 0, color: 'var(--text-color)' }}>
                          {goal.title}
                        </h4>
                        <span style={{ fontSize: '1.5rem', color: '#999', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </span>
                      </button>
                      
                      <div style={{ 
                        maxHeight: isExpanded ? '500px' : '0', 
                        overflow: 'hidden', 
                        transition: 'max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        opacity: isExpanded ? 1 : 0,
                      }}>
                        <p style={{ fontSize: '1rem', color: '#666', paddingTop: '1.5rem', paddingBottom: '0.5rem', lineHeight: '1.6', maxWidth: '800px' }}>
                          {goal.content}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}

function Chapter({ t }) {
  return (
    <PageTransition>
      <div className="container">
        <section className="section">
          <div className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '2rem' }}>
            <h2 style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>{t.nav.chapter}</h2>
            <select className="year-selector" defaultValue="2026" style={{ fontSize: '1.2rem', padding: '0.5rem 2rem 0.5rem 1rem', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-color)', fontFamily: 'inherit', outline: 'none', cursor: 'pointer', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}>
              <option value="2026">2026</option>
            </select>
          </div>
          
          <div className="chapter-split-layout">
            {/* Left Column: Metadata & Details */}
            <div className="chapter-meta">
              <div className="chapter-meta-header">
                <h1>{t.chapter.title}</h1>
                <h3>{t.chapter.artist}</h3>
              </div>

              <div className="chapter-info-list">
                <div className="info-item">
                  <h4>{t.chapter.launchLabel}</h4>
                  <p>{t.chapter.launch}</p>
                </div>
                <div className="info-item">
                  <h4>{t.chapter.locationLabel}</h4>
                  <p>{t.chapter.location}</p>
                </div>
              </div>
            </div>
            
            {/* Right Column: Constrained Video Player */}
            <div className="chapter-video-wrapper">
              <div className="chapter-video-player">
                <video 
                  src="https://media.githubusercontent.com/media/bonnartchapter/Webside/master/public/Chapter1.mp4" 
                  controls 
                  autoPlay 
                  muted 
                  loop 
                  playsInline 
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}

function Archive({ t, selectedArtist, setSelectedArtist }) {
  if (selectedArtist === 'teom-chen') {
    return <ArtistDetail t={t} onBack={() => setSelectedArtist(null)} />;
  }

  return (
    <PageTransition>
      <div className="container">
        <section className="section">
          <div className="archive-header" style={{ marginBottom: '4rem' }}>
            <h2>{t.archive.title}</h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
              {t.archive.description}
            </p>
          </div>

          <div className="artists-grid">
            {/* Chapter 01 Artist Card */}
            <div className="artist-card" onClick={() => setSelectedArtist('teom-chen')}>
              <div className="artist-card-image-wrapper">
                <img src="/images/artist_teom_chen.png" alt="Teom Chen" className="artist-card-img portrait" />
                <img src="/images/work_kidonsi.png" alt="KIDONSI - Teom Chen" className="artist-card-img artwork-hover" />
              </div>
              <div className="artist-card-info">
                <span className="artist-card-chapter">CHAPTER 01 / 2026</span>
                <h3 className="artist-card-name">TEOM CHEN</h3>
              </div>
            </div>

            {/* Chapter 02 Placeholder Card linking to Open Call */}
            <Link to="/open-call" className="artist-card open-call-card">
              <div className="artist-card-image-wrapper placeholder-wrapper">
                <div className="placeholder-bg">
                  <span className="placeholder-text-clean">OPEN CALL</span>
                </div>
              </div>
              <div className="artist-card-info">
                <span className="artist-card-chapter">CHAPTER 02 / 2027</span>
                <h3 className="artist-card-name">OPEN CALL</h3>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}

function ArtistDetail({ t, onBack }) {
  const introRef = useRef(null);
  const worksRef = useRef(null);
  const exhiRef = useRef(null);
  const perfRef = useRef(null);
  const awardsRef = useRef(null);

  const scrollToSection = (elementRef) => {
    if (elementRef.current) {
      elementRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <PageTransition>
      {/* Widescreen Full Bleed Hero Video Banner with absolute content overlays */}
      <div className="artist-detail-hero">
        <video 
          className="artist-detail-hero-video" 
          autoPlay 
          muted 
          loop 
          playsInline
        >
          <source src="https://media.githubusercontent.com/media/bonnartchapter/Webside/master/public/hero.mp4.mp4" type="video/mp4" />
        </video>
        
        {/* Dark overlay gradient for contrast */}
        <div className="artist-hero-overlay"></div>

        {/* Absolute positioned overlay headers & menu */}
        <div className="artist-hero-content">
          <div className="artist-hero-left">
            <hr className="artist-hero-line" />
            <h1 className="artist-hero-name">Teom Chen</h1>
            <p className="artist-hero-location">{t.archive.artistLocation}</p>
          </div>
          
          <div className="artist-hero-right">
            <nav className="artist-hero-menu">
              <button onClick={() => scrollToSection(introRef)}>Introduction</button>
              <button onClick={() => scrollToSection(worksRef)}>Interactive works</button>
              <button onClick={() => scrollToSection(exhiRef)}>Exhibitions</button>
              <button onClick={() => scrollToSection(perfRef)}>Performances</button>
              <button onClick={() => scrollToSection(awardsRef)}>Awards</button>
            </nav>
            <hr className="artist-hero-line" />
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '4rem' }}>
        {/* Back Button to return to Artists list */}
        <button className="back-button" onClick={onBack} style={{ marginBottom: '4rem' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span style={{ verticalAlign: 'middle', marginLeft: '6px' }}>{t.archive.backToArtists}</span>
        </button>

        {/* 1. INTRODUCTION SECTION */}
        <section ref={introRef} className="artist-detail-section" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '4rem' }}>
          <h2 className="detail-section-title">{t.archive.introductionTitle}</h2>
          <p className="artist-bio-text" style={{ fontSize: '1.25rem', lineHeight: '1.7', maxWidth: '1000px', margin: '3rem 0', fontWeight: '300' }}>
            {t.archive.teomBio}
          </p>
        </section>

        {/* 2. INTERACTIVE WORKS SECTION */}
        <section ref={worksRef} className="artist-detail-section" style={{ marginTop: '5rem' }}>
          <h2 className="detail-section-title">{t.archive.tabs.works}</h2>
          
          <div className="video-works-container" style={{ display: 'flex', flexDirection: 'column', gap: '6rem', margin: '3rem 0' }}>
            {t.archive.interactiveWorksList.map((work, idx) => (
              <div 
                className="interactive-work-item-split" 
                key={idx} 
                style={{ 
                  borderBottom: idx < t.archive.interactiveWorksList.length - 1 ? '1px solid var(--border-color)' : 'none', 
                  paddingBottom: idx < t.archive.interactiveWorksList.length - 1 ? '5rem' : '0' 
                }}
              >
                {/* Left side: Video Player */}
                <div className="interactive-work-video-col">
                  {/* Native MP4 video player playing H.264 MP4 natively in the browser */}
                  <video 
                    src={work.videoSrc} 
                    controls 
                    className="portfolio-video-player"
                    style={{ width: '100%', display: 'block' }}
                  >
                    Your browser does not support playing standard MP4 files natively.
                  </video>
                </div>

                {/* Right side: Text details */}
                <div className="interactive-work-info-col">
                  <div className="video-work-title-row" style={{ borderBottom: 'none', paddingBottom: '0' }}>
                    <h3 className="video-work-name" style={{ fontSize: '1.4rem', whiteSpace: 'pre-line' }}>{work.title}</h3>
                    <span className="video-work-year" style={{ fontSize: '1.1rem' }}>{work.year}</span>
                  </div>
                  <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1.2rem 0' }} />
                  <p className="video-work-description" style={{ whiteSpace: 'pre-line', fontSize: '1rem', lineHeight: '1.6', color: 'var(--text-color)' }}>
                    {work.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. EXHIBITIONS SECTION */}
        <section ref={exhiRef} className="artist-detail-section" style={{ marginTop: '5rem', borderTop: '1px solid var(--border-color)', paddingTop: '4rem' }}>
          <h2 className="detail-section-title">{t.archive.exhibitionsTitle}</h2>
          
          <div className="exhibitions-split-layout">
            {/* Left side: The CV list */}
            <div className="exhibitions-left-column">
              <div className="cv-section">
                <div className="cv-list" style={{ gap: '1.5rem' }}>
                  {t.archive.exhibitionsList.map((item, idx) => (
                    <div className="cv-row" key={idx} style={{ gridTemplateColumns: '80px 1fr' }}>
                      <span className="cv-year" style={{ fontSize: '1.1rem' }}>{item.year}</span>
                      <span className="cv-text" style={{ fontSize: '1.1rem', color: 'var(--text-color)' }}>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side: The installation image */}
            <div className="exhibitions-right-column">
              <img 
                src="/images/exhibition_sensor.jpg" 
                alt="Teom Chen Exhibition Installation" 
                className="exhibition-split-img"
              />
            </div>
          </div>
        </section>

        {/* 4. PERFORMANCES SECTION */}
        <section ref={perfRef} className="artist-detail-section" style={{ marginTop: '5rem', borderTop: '1px solid var(--border-color)', paddingTop: '4rem' }}>
          <h2 className="detail-section-title">{t.archive.performancesTitle}</h2>
          
          <div style={{ maxWidth: '1000px', margin: '3rem 0' }}>
            <div className="cv-section">
              <div className="cv-list" style={{ gap: '1.5rem' }}>
                {t.archive.performancesList.map((item, idx) => (
                  <div className="cv-row" key={idx} style={{ gridTemplateColumns: '100px 1fr' }}>
                    <span className="cv-year" style={{ fontSize: '1.1rem' }}>{item.year}</span>
                    <span className="cv-text" style={{ fontSize: '1.1rem', color: 'var(--text-color)' }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 5. AWARDS SECTION */}
        <section ref={awardsRef} className="artist-detail-section" style={{ marginTop: '5rem', borderTop: '1px solid var(--border-color)', paddingTop: '4rem', marginBottom: '8rem' }}>
          <h2 className="detail-section-title">{t.archive.awardsTitle}</h2>
          
          <div style={{ maxWidth: '1000px', margin: '3rem 0' }}>
            <div className="cv-section">
              <div className="cv-list" style={{ gap: '1.5rem' }}>
                {t.archive.awardsList.map((item, idx) => (
                  <div className="cv-row" key={idx} style={{ gridTemplateColumns: '100px 1fr' }}>
                    <span className="cv-year" style={{ fontSize: '1.1rem' }}>{item.year}</span>
                    <span className="cv-text" style={{ fontSize: '1.1rem', color: 'var(--text-color)' }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}

function OpenCallContent({ t }) {
  const marqueeText = `${t.openCall.btn} • ${t.openCall.btn} • ${t.openCall.btn} • ${t.openCall.btn} • ${t.openCall.btn} • `;

  return (
    <>
      <div className="marquee-container" style={{ margin: '0 -5vw' }}>
        <div className="marquee-content">
          {marqueeText}{marqueeText}
        </div>
      </div>
      
      <section className="section" style={{ minHeight: '30vh', padding: '4rem 0' }}>
        <h2>{t.nav.openCall}</h2>
        <div className="info-grid">
          <div className="info-item">
            <h4>{t.openCall.periodLabel}</h4>
            <p>{t.openCall.period}</p>
          </div>
          <div className="info-item">
            <h4>{t.openCall.howLabel}</h4>
            <p>{t.openCall.how}</p>
          </div>
        </div>
        <a href={`mailto:${t.openCall.how}`} className="cta-button">
          {t.openCall.btn}
        </a>
      </section>
    </>
  );
}

function OpenCall({ t }) {
  return (
    <PageTransition>
      <div className="container">
        <OpenCallContent t={t} />
      </div>
    </PageTransition>
  );
}

function Press({ t }) {
  return (
    <PageTransition>
      <div className="container">
        <section className="section">
          <h2>{t.nav.press}</h2>
          <div className="press-list">
            {t.press.articles.map((article, index) => (
              <a href={article.link} className="press-row" key={index} target="_blank" rel="noopener noreferrer">
                <div style={{ color: '#666', fontFamily: 'monospace' }}>{article.date}</div>
                <div>{article.media}</div>
                <div>{article.title}</div>
              </a>
            ))}
          </div>
        </section>
      </div>
    </PageTransition>
  );
}

export default App;
