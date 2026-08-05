import React, { useState } from 'react';
import { 
  Search, 
  User, 
  ShoppingBag, 
  Grid, 
  ChevronRight, 
  ChevronDown,
  Apple, 
  Carrot, 
  Cookie, 
  Home, 
  TrendingUp, 
  FileText, 
  BookOpen, 
  Menu, 
  X 
} from 'lucide-react';
import logo from '../../assets/Grocessary Sathi Png.png';
import './Navbar.css';

const NAV_PATHS = {
  HOME: '/',
  ACCOUNT: '/account',
  CART: '/cart',
  FAQ: '/faq',
  SUPPORT: '/support',
  CONTACT: '/contact-us',
  ABOUT: '/about-us',
  SEARCH: '/search',
  CATEGORIES: '/categories',
};

const categoriesData = [
  {
    id: 'vegetables',
    title: 'Vegetables',
    path: `${NAV_PATHS.CATEGORIES}/vegetables`,
    icon: Carrot,
    subCategories: [
      { id: 'organic-veggies', title: 'Organic Veggies', path: `${NAV_PATHS.CATEGORIES}/vegetables/organic` },
      { id: 'leafy-greens', title: 'Leafy Greens', path: `${NAV_PATHS.CATEGORIES}/vegetables/leafy-greens` },
      { id: 'root-vegetables', title: 'Root Vegetables', path: `${NAV_PATHS.CATEGORIES}/vegetables/root` },
      { id: 'exotic-veggies', title: 'Exotic Veggies', path: `${NAV_PATHS.CATEGORIES}/vegetables/exotic` },
    ],
  },
  {
    id: 'fresh-fruits',
    title: 'Fresh Fruits',
    path: `${NAV_PATHS.CATEGORIES}/fruits`,
    icon: Apple,
    subCategories: [
      { id: 'citrus-fruits', title: 'Citrus Fruits', path: `${NAV_PATHS.CATEGORIES}/fruits/citrus` },
      { id: 'berries', title: 'Berries', path: `${NAV_PATHS.CATEGORIES}/fruits/berries` },
      { id: 'tropical-fruits', title: 'Tropical Fruits', path: `${NAV_PATHS.CATEGORIES}/fruits/tropical` },
      { id: 'seasonal-fruits', title: 'Seasonal Fruits', path: `${NAV_PATHS.CATEGORIES}/fruits/seasonal` },
    ],
  },
  {
    id: 'cookies-sweetener',
    title: 'Cookies and Sweetener',
    path: `${NAV_PATHS.CATEGORIES}/bakery-sweets`,
    icon: Cookie,
    subCategories: [
      { id: 'bakery-cookies', title: 'Bakery Cookies', path: `${NAV_PATHS.CATEGORIES}/bakery-sweets/cookies` },
      { id: 'sugar-free', title: 'Sugar Free', path: `${NAV_PATHS.CATEGORIES}/bakery-sweets/sugar-free` },
      { id: 'natural-honey', title: 'Natural Honey', path: `${NAV_PATHS.CATEGORIES}/bakery-sweets/honey` },
      { id: 'syrups', title: 'Syrups', path: `${NAV_PATHS.CATEGORIES}/bakery-sweets/syrups` },
    ],
  },
  {
    id: 'home-accessories',
    title: 'Home Accessories',
    path: `${NAV_PATHS.CATEGORIES}/home-accessories`,
    icon: Home,
    subCategories: [
      { id: 'kitchen-tools', title: 'Kitchen Tools', path: `${NAV_PATHS.CATEGORIES}/home-accessories/kitchen-tools` },
      { id: 'storage-containers', title: 'Storage Containers', path: `${NAV_PATHS.CATEGORIES}/home-accessories/storage` },
      { id: 'cleaning-supplies', title: 'Cleaning Supplies', path: `${NAV_PATHS.CATEGORIES}/home-accessories/cleaning` },
    ],
  },
  {
    id: 'bestsellers',
    title: 'Bestseller',
    path: `${NAV_PATHS.CATEGORIES}/bestsellers`,
    icon: TrendingUp,
    subCategories: [
      { id: 'top-rated', title: 'Top Rated', path: `${NAV_PATHS.CATEGORIES}/bestsellers/top-rated` },
      { id: 'trending-items', title: 'Trending Items', path: `${NAV_PATHS.CATEGORIES}/bestsellers/trending` },
      { id: 'weekly-deals', title: 'Weekly Deals', path: `${NAV_PATHS.CATEGORIES}/bestsellers/weekly-deals` },
    ],
  },
  {
    id: 'pages',
    title: 'Pages',
    path: '/pages',
    icon: FileText,
    subCategories: [
      { id: 'our-story', title: 'Our Story', path: '/pages/our-story' },
      { id: 'privacy-policy', title: 'Privacy Policy', path: '/pages/privacy-policy' },
      { id: 'terms-of-service', title: 'Terms of Service', path: '/pages/terms-of-service' },
    ],
  },
  {
    id: 'blogs',
    title: 'Blogs',
    path: '/blogs',
    icon: BookOpen,
  },
];

const Navbar = () => {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleCategoryDropdown = () => {
    setIsCategoryOpen((prev) => !prev);
  };

  const handleCategoryClick = (id) => {
    setActiveCategory(activeCategory === id ? null : id);
  };

  return (
    <>
      {/* SEO Schema Markup for Grocery Sathi */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Grocery Sathi",
          "url": "https://www.grocerysathi.com",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://www.grocerysathi.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        })}
      </script>

      <header className="navbar-header" role="banner">
        {/* Top Bar */}
        <div className="navbar-top-bar">
          <div className="navbar-container navbar-top-container">
            
            {/* Brand Logo */}
            <div className="navbar-logo-container">
              <a href={NAV_PATHS.HOME} aria-label="Grocery Sathi Homepage">
                <img src={logo} alt="Grocery Sathi - Fresh Organic Groceries Logo" className="navbar-logo-img" />
              </a>
            </div>

            {/* Search Bar */}
            <form className="navbar-search-box" action={NAV_PATHS.SEARCH} method="GET" role="search">
              <Search className="navbar-search-icon" size={18} aria-hidden="true" />
              <input 
                type="text" 
                name="q"
                placeholder="Search fresh vegetables, fruits, groceries..." 
                className="navbar-search-input"
                aria-label="Search products"
                required
              />
            </form>

            {/* Contact & Hours Info */}
            <div className="navbar-info-wrapper">
              <div className="navbar-info-item">
                <span className="navbar-info-title">Monday - Friday:</span>
                <span className="navbar-info-sub">8:00 AM - 9:00 PM</span>
              </div>

              <div className="navbar-info-item">
                <span className="navbar-info-title">Support 24/7:</span>
                <a href="tel:+919887868746" className="navbar-info-phone" aria-label="Call Grocery Sathi Support">+91 98878 68746</a>
              </div>
            </div>

            {/* User Actions */}
            <div className="navbar-user-actions">
              <a href={NAV_PATHS.ACCOUNT} className="navbar-icon-btn" aria-label="User Account Dashboard">
                <User size={22} aria-hidden="true" />
              </a>

              <a href={NAV_PATHS.CART} className="navbar-cart-container" aria-label="View Shopping Cart">
                <div className="navbar-cart-text">
                  <span className="navbar-cart-label">My Cart:</span>
                  <span className="navbar-cart-price">$0.00</span>
                </div>
                <div className="navbar-cart-icon-wrapper">
                  <ShoppingBag size={22} className="navbar-cart-icon" aria-hidden="true" />
                  <span className="navbar-cart-badge" aria-label="0 items in cart">0</span>
                </div>
              </a>

              {/* Mobile Hamburger Toggle */}
              <button 
                type="button"
                className="navbar-mobile-toggle"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
              </button>
            </div>

          </div>
        </div>

        {/* Bottom Navigation Bar */}
        <nav className={`navbar-bottom-bar ${isMobileMenuOpen ? 'navbar-mobile-active' : ''}`} aria-label="Main Navigation">
          <div className="navbar-container navbar-bottom-container">
            
            {/* Main Categories Menu */}
            <div className="navbar-category-wrapper">
              <button 
                type="button"
                className={`navbar-category-btn ${isCategoryOpen ? 'navbar-category-btn-active' : ''}`}
                onClick={toggleCategoryDropdown}
                aria-expanded={isCategoryOpen}
                aria-controls="category-dropdown-menu"
              >
                <div className="navbar-category-btn-left">
                  <Grid size={18} aria-hidden="true" />
                  <span>All Categories</span>
                </div>
                <ChevronRight size={18} className={`navbar-category-arrow ${isCategoryOpen ? 'rotate-90' : ''}`} aria-hidden="true" />
              </button>

              {/* Level 1 Dropdown */}
              <div id="category-dropdown-menu" className={`navbar-dropdown-menu ${isCategoryOpen ? 'navbar-dropdown-show' : ''}`}>
                <ul className="navbar-dropdown-list">
                  {categoriesData.map((category) => {
                    const IconComponent = category.icon;
                    const isSubOpen = activeCategory === category.id;

                    return (
                      <li 
                        key={category.id} 
                        className="navbar-dropdown-item"
                        onMouseEnter={() => window.innerWidth > 768 && setActiveCategory(category.id)}
                        onMouseLeave={() => window.innerWidth > 768 && setActiveCategory(null)}
                      >
                        <div className="navbar-dropdown-item-header">
                          <a href={category.path} className="navbar-dropdown-title-link">
                            <IconComponent size={18} className="navbar-dropdown-icon" aria-hidden="true" />
                            <span className="navbar-category-title-text">{category.title}</span>
                          </a>

                          {category.subCategories && (
                            <button 
                              type="button"
                              className="navbar-sub-toggle-btn"
                              onClick={() => handleCategoryClick(category.id)}
                              aria-expanded={isSubOpen}
                              aria-label={`Toggle ${category.title} subcategories`}
                            >
                              {isSubOpen ? <ChevronDown size={16} aria-hidden="true" /> : <ChevronRight size={16} aria-hidden="true" />}
                            </button>
                          )}
                        </div>

                        {/* Level 2 Sub-Dropdown */}
                        {category.subCategories && (
                          <div className={`navbar-sub-dropdown ${isSubOpen ? 'navbar-sub-dropdown-show' : ''}`}>
                            <ul className="navbar-sub-list">
                              {category.subCategories.map((sub) => (
                                <li key={sub.id} className="navbar-sub-item">
                                  <a href={sub.path}>{sub.title}</a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Special Offer Banner */}
            <div className="navbar-offer-text">
              <strong>-30% off</strong> on your first order over $200.{' '}
              <a href="/promotions/first-order-discount">Show More</a>
            </div>

            {/* Quick Nav Links */}
            <div className="navbar-nav-links">
              <a href={NAV_PATHS.HOME}>Home</a>
              <a href={NAV_PATHS.FAQ}>Faq</a>
              <a href={NAV_PATHS.SUPPORT}>Support</a>
              <a href={NAV_PATHS.CONTACT}>Contact</a>
              <a href={NAV_PATHS.ABOUT}>About Us</a>
            </div>

          </div>
        </nav>
      </header>
    </>
  );
};

export default Navbar;