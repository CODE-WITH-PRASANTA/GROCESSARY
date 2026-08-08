import React from 'react';
import './HomeCategories.css';

// Import local images from your assets folder
import bakersImg from '../../assets/bakers.webp';
import fruitsImg from '../../assets/fruits.avif';
import vegetablesImg from '../../assets/vegetables.webp';
import accessoriesImg from '../../assets/accessories.avif';

const HomeCategories = () => {
  const categories = [
    {
      id: 'bakers',
      title: 'Bakery & Breads',
      description: 'Explore Grocery Sathi’s freshly baked artisan breads, pastries, and treats made with wholesome daily ingredients.',
      image: bakersImg,
      link: '/category/bakers'
    },
    {
      id: 'fruits',
      title: 'Fresh Fruits',
      description: "Enjoy sweet, farm-fresh seasonal fruits packed with natural vitamins for healthy living delivered straight to your door.",
      image: fruitsImg,
      link: '/category/fruits'
    },
    {
      id: 'vegetables',
      title: 'Organic Vegetables',
      description: 'Discover crunchy bell peppers, earthy mushrooms, and 100% fresh organic vegetables for your daily nutritious meals.',
      image: vegetablesImg,
      link: '/category/vegetables'
    },
    {
      id: 'accessories',
      title: 'Grocery Essentials',
      description: 'Find all your kitchen accessories, household pantry staples, and cooking essentials in one single place.',
      image: accessoriesImg,
      link: '/category/accessories'
    },
  ];

  const handleCategoryClick = (e, link) => {
    e.preventDefault();
    // Replace with standard router navigation if using react-router-dom (e.g., navigate(link))
    window.location.href = link;
  };

  return (
    <section className="HomeCategories" aria-labelledby="home-categories-heading">
      <div className="HomeCategories__container">
        <h2 id="home-categories-heading" className="HomeCategories__title">
          Explore Grocery Sathi Categories
        </h2>
        
        <div className="HomeCategories__grid">
          {categories.map((category) => (
            <article 
              key={category.id} 
              className="HomeCategories__card"
              style={{ backgroundImage: `url(${category.image})` }}
              role="region"
              aria-label={category.title}
            >
              {/* Dark overlay for text readability */}
              <div className="HomeCategories__overlay" aria-hidden="true" />

              <div className="HomeCategories__card-content">
                <h3 className="HomeCategories__card-title">{category.title}</h3>
                <p className="HomeCategories__card-description">{category.description}</p>
                
                {/* SEO-Friendly Semantic Anchor Link */}
                <a 
                  href={category.link}
                  className="HomeCategories__card-button"
                  onClick={(e) => handleCategoryClick(e, category.link)}
                  aria-label={`Browse ${category.title} category`}
                >
                  <span>Go to Category</span> 
                  <span className="HomeCategories__card-button-icon" aria-hidden="true">&rsaquo;</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeCategories;