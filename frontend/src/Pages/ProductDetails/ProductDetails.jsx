import React from 'react'
import ProductDetailsVegetables from '../../Components/ProductDetailsVegetables/ProductDetailsVegetables';
import ProductDetailsDiscounts from '../../Components/ProductDetailsDiscounts/ProductDetailsDiscounts';
import ProductDetailsTestimonials from '../../Components/ProductDetailsTestimonials/ProductDetailsTestimonials';

const ProductDetails = () => {
  return (
    <div>
      <ProductDetailsVegetables />
      <ProductDetailsDiscounts />
      <ProductDetailsTestimonials />
    </div>
  );
};

export default ProductDetails;