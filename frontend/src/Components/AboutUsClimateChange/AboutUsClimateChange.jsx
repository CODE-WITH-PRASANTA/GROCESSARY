import React from 'react';
import './AboutUsClimateChange.css';

// Importing your image assets
import img1 from '../../assets/aboutusclimatechange1.webp';
import img2 from '../../assets/aboutusclimatechange2.webp';
  
const AboutUsClimateChange = () => {
  // Structured Data for SEO optimization customized for Grocery Sathi
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About Grocery Sathi - Sustainable Practice & Climate Action",
    "description": "Learn about Grocery Sathi's commitment to quality, transparency, local farm sourcing, and sustainable eco-friendly practices to combat climate change.",
    "publisher": {
      "@type": "Organization",
      "name": "Grocery Sathi",
      "url": "https://www.grocerysathi.com"
    }
  };

  return (
    <article className="climate-change-container" itemScope itemType="https://schema.org/AboutPage">
      {/* SEO JSON-LD Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <div className="climate-change-wrapper">
        
        {/* Section 1: Quality & Transparency */}
        <section className="section-clear-concise">
          <h2 className="section-title">Freshness and Quality You Can Trust</h2>
          <div className="two-column-text">
            <p>
              At Grocery Sathi, we understand that a well-stocked pantry is the foundation of every
              nutritious meal and a key to a healthy, balanced lifestyle. We are passionate about providing our
              customers with a wide range of premium groceries, farm-fresh organic vegetables, and daily essentials sourced from trusted local suppliers.
            </p>
            <p>
              We deeply value transparency and sustainability. That’s why we work hand-in-hand with
              local farmers who share our steadfast commitment to ethical sourcing, eco-friendly packaging, and superior product quality. Together, we build resilient local communities.
            </p>
          </div>
        </section>

        {/* Section 2: Banner Callout */}
        <section className="section-banner-heading" aria-label="Climate action declaration">
          <h2 className="banner-heading">
            The world needs to move fast to make a meaningful impact against climate change.
          </h2>
        </section>

        {/* Section 3: Inviting & Engaging (Text Left, Image Right) */}
        <section className="section-inviting-engaging">
          <div className="grid-layout">
            <div className="content-col">
              <h2 className="section-title">Convenient & Eco-Friendly Shopping</h2>
              <p className="text-paragraph">
                At Grocery Sathi, customer satisfaction and environmental responsibility go hand in hand. Our dedicated team is always ready to assist you with personalized recommendations, fresh recipe inspirations, or tailored dietary needs.
              </p>
              <p className="text-paragraph">
                We value your time and the planet's future. That’s why we offer smart online ordering coupled with green home delivery routes. Browse our digital catalog, select your farm-fresh favorites, and enjoy door-to-door delivery with minimized carbon footprints.
              </p>
            </div>
            <div className="image-col">
              <div className="image-wrapper">
                <img
                  src={img1}
                  alt="Customer receiving an eco-friendly grocery delivery box from Grocery Sathi"
                  className="section-img"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Short & Sweet (Image Left, Text Right) */}
        <section className="section-short-sweet">
          <div className="grid-layout image-left">
            <div className="image-col">
              <div className="image-wrapper">
                <img
                  src={img2}
                  alt="Assortment of freshly baked organic artisan bread and sustainable grains from Grocery Sathi"
                  className="section-img"
                  loading="lazy"
                />
              </div>
            </div>
            <div className="content-col">
              <h2 className="section-title">Building a Sustainable Community</h2>
              <p className="text-paragraph">
                We believe that good food brings people together. Beyond daily essentials, Grocery Sathi strives to foster a strong local community by supporting green initiatives, reducing single-use plastics, and encouraging sustainable consumption.
              </p>
              <p className="text-paragraph">
                More than just an online supermarket, Grocery Sathi is your dedicated companion on the journey toward a healthier lifestyle and a greener planet. Join us in embracing mindful food choices and sustainable living.
              </p>
            </div>
          </div>
        </section>

      </div>
    </article>
  );
};

export default AboutUsClimateChange;