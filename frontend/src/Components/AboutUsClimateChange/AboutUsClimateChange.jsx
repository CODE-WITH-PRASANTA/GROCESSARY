import React from 'react';
import './AboutUsClimateChange.css';

// Importing your image assets
import img1 from '../../assets/aboutusclimatechange1.webp';
import img2 from '../../assets/aboutusclimatechange2.webp';

const AboutUsClimateChange = () => {
  // Structured Data for SEO optimization
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About Us - Sustainable Practice & Climate Action",
    "description": "Learn about Grocery Themes commitment to quality, transparency, local sourcing, and sustainable practices to help fight climate change.",
    "publisher": {
      "@type": "Organization",
      "name": "Grocery Themes"
    }
  };

  return (
    <article className="climate-change-container">
      {/* SEO JSON-LD Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <div className="climate-change-wrapper">
        
        {/* Section 1: Be clear and concise */}
        <section className="section-clear-concise">
          <h2 className="section-title">Be clear and concise</h2>
          <div className="two-column-text">
            <p>
              At Grocery Themes, we understand that a well-stocked pantry is the foundation of every
              delicious meal and a key to a healthy lifestyle. We are passionate about providing our
              customers with a wide range of high-quality groceries, sourced from trusted suppliers, to
              help you create culinary masterpieces and nourish your body.
            </p>
            <p>
              We value the importance of quality and transparency. That’s why we work closely with
              local farmers and suppliers who share our commitment to sustainable practices, ethical
              sourcing, and superior quality. We believe in supporting local communities and fostering
              relationships that benefit both our customers and our partners.
            </p>
          </div>
        </section>

        {/* Section 2: Banner Callout */}
        <section className="section-banner-heading">
          <h2 className="banner-heading">
            The world needs to move fast to make a meaning against climate change.
          </h2>
        </section>

        {/* Section 3: Make it inviting and engaging (Text Left, Image Right) */}
        <section className="section-inviting-engaging">
          <div className="grid-layout">
            <div className="content-col">
              <h2 className="section-title">Make it inviting and engaging</h2>
              <p className="text-paragraph">
                At Grocery Themes, we prioritize the satisfaction of our customers. Our friendly and
                knowledgeable staff is always ready to assist you, providing personalized service and
                expert advice. Whether you’re searching for a specific ingredient, seeking inspiration for
                a new recipe, or have dietary restrictions, we’re here to help you find what you need.
              </p>
              <p className="text-paragraph">
                We understand the value of time in today’s fast-paced world. That’s why we offer
                convenient shopping options, including online ordering and home delivery services. You
                can browse our virtual aisles, select your items, and have them delivered right to your
                doorstep, saving you time and ensuring your groceries are just a click away.
              </p>
            </div>
            <div className="image-col">
              <div className="image-wrapper">
                <img
                  src={img1}
                  alt="Customer unboxing fresh sustainable grocery delivery at home"
                  className="section-img"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Keep it short and sweet (Image Left, Text Right) */}
        <section className="section-short-sweet">
          <div className="grid-layout image-left">
            <div className="image-col">
              <div className="image-wrapper">
                <img
                  src={img2}
                  alt="Assortment of freshly baked organic artisan bread and grains"
                  className="section-img"
                  loading="lazy"
                />
              </div>
            </div>
            <div className="content-col">
              <h2 className="section-title">Keep it short and sweet</h2>
              <p className="text-paragraph">
                We believe that food brings people together, and we strive to create a sense of
                community within our store. From hosting cooking classes and tastings to supporting local
                initiatives, we aim to foster connections and inspire a love for good food.
              </p>
              <p className="text-paragraph">
                At Grocery Themes, we are more than just a grocery store. We are a trusted partner on
                your culinary journey, dedicated to providing you with the finest ingredients and
                exceptional service. Join us in exploring the world of flavors, discovering new tastes, and
                embracing the joy of cooking and sharing meals with loved ones.
              </p>
            </div>
          </div>
        </section>

      </div>
    </article>
  );
};

export default AboutUsClimateChange;