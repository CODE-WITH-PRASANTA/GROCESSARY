import React from "react";
import { useParams } from "react-router-dom";

import ProductDetailsVegetables from "../../Components/ProductDetailsVegetables/ProductDetailsVegetables";
import ProductDetailsDiscounts from "../../Components/ProductDetailsDiscounts/ProductDetailsDiscounts";
import ProductDetailsTestimonials from "../../Components/ProductDetailsTestimonials/ProductDetailsTestimonials";

const ProductDetails = () => {
  const { id } = useParams();

  return (
    <div>
      <ProductDetailsVegetables productId={id} />
      <ProductDetailsDiscounts />
      <ProductDetailsTestimonials />
    </div>
  );
};

export default ProductDetails;