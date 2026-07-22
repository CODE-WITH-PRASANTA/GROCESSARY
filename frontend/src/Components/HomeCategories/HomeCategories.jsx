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
      title: 'Bakers',
      description: 'our menu features all of the best fruits and vegetables in the market. With just a slide of your finger.',
      image: bakersImg,
      link: '/category/bakers'
    },
    {
      id: 'fruits',
      title: 'Fruits',
      description: "So whether you're looking for fresh produce meals, Fruits has you covered!",
      image: fruitsImg,
      link: '/category/fruits'
    },
    {
      id: 'vegetables',
      title: 'Vegetables',
      description: 'Vegetables has the perfect healthy option for you. crunchy bell peppers, earthy mushrooms,',
      image: vegetablesImg,
      link: '/category/vegetables'
    },
    {
      id: 'accessories',
      title: 'Accessories',
      description: "you'll never run out of ideas for how to enjoy these amazing fruits & vegetables.",
      image: accessoriesImg,
      link: '/category/accessories'
    },
  ];

  const handleCategoryClick = (link) => {
    // Handle navigation logic here (e.g., using react-router useNavigate)
    window.location.href = link;
  };

  return (
    <section className="HomeCategories">
      <div className="HomeCategories__container">
        <h2 className="HomeCategories__title">Love our categories</h2>
        
        <div className="HomeCategories__grid">
          {categories.map((category) => (
            <div 
              key={category.id} 
              className="HomeCategories__card"
              style={{ backgroundImage: `url(${category.image})` }}
            >
              {/* Dark overlay for text readability */}
              <div className="HomeCategories__overlay" />

              <div className="HomeCategories__card-content">
                <h3 className="HomeCategories__card-title">{category.title}</h3>
                <p className="HomeCategories__card-description">{category.description}</p>
                <button 
                  className="HomeCategories__card-button"
                  onClick={() => handleCategoryClick(category.link)}
                >
                  Go to Category <span className="HomeCategories__card-button-icon">&rsaquo;</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeCategories;