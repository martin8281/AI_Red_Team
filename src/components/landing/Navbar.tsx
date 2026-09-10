import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, Lock } from 'lucide-react';
import { ShieldLogo } from '../../assets/logo/ShieldLogo';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Security', href: '#security' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (location.pathname !== '/') {
      return; // Let standard link navigation work if not on home
    }
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      const navOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      setMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-[#070D18]/90 backdrop-blur-md border-b border-border-dark shadow-lg shadow-black/30'
          : 'bg-transparent border-b border-border-dark/50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Product Name */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-brand-primary/50 rounded-lg p-1"
          >
            <ShieldLogo size={32} />
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold tracking-wider group-hover:text-white flex items-center gap-1.5">
                <span className="text-brand-primary font-extrabold">AI</span> <span className="text-[#e00000]">RED</span> <span className="text-white">TEAM ASSISTANT</span>
              </span>
              <span className="text-[10px] text-text-muted font-mono tracking-widest uppercase">
                Authorized Security Testing
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="px-3.5 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-elevated/60 rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button to="/login" variant="outline" size="sm">
              Sign In
            </Button>
            <Button
              to="/register"
              variant="primary"
              size="sm"
              icon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Get Started
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated border border-border-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-bg-surface/98 border-b border-border-dark backdrop-blur-xl px-4 pt-3 pb-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="px-4 py-2.5 text-base font-medium text-text-secondary hover:text-text-primary hover:bg-bg-elevated rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pt-3 border-t border-border-dark flex flex-col gap-2.5">
            <Button to="/login" variant="outline" size="md" fullWidth>
              Sign In
            </Button>
            <Button
              to="/register"
              variant="primary"
              size="md"
              fullWidth
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Get Started
            </Button>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-text-muted pt-1">
            <Lock className="w-3 h-3 text-brand-primary" />
            <span>Human-in-the-Loop Security Platform</span>
          </div>
        </div>
      )}
    </header>
  );
};
