import { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY;
            if (offset > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const toggleMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const closeMenu = () => {
        setMobileMenuOpen(false);
    };

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <a href="#hero" className="navbar-logo" onClick={closeMenu}>
                <span className="logo-icon">🪐</span>
                <span className="logo-text">Soumik</span>
            </a>

            <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle navigation">
                {mobileMenuOpen ? '✕' : '☰'}
            </button>

            <ul className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
                <li>
                    <a href="#hero" className="nav-link" onClick={closeMenu}>Home</a>
                </li>
                <li>
                    <a href="#tech-section" className="nav-link" onClick={closeMenu}>Tech Stack</a>
                </li>
                <li>
                    <a href="#projects-section" className="nav-link" onClick={closeMenu}>Projects</a>
                </li>
                <li>
                    <a href="#footer-section" className="nav-link" onClick={closeMenu}>Contact</a>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
