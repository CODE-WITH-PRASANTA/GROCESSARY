import React, { useState } from "react";
import { useParams } from "react-router-dom";

import ProductDetailsVegetables from "../../Components/ProductDetailsVegetables/ProductDetailsVegetables";
import ProductDetailsDiscounts from "../../Components/ProductDetailsDiscounts/ProductDetailsDiscounts";
import ProductDetailsTestimonials from "../../Components/ProductDetailsTestimonials/ProductDetailsTestimonials";

const ProductDetails = () => {
  const { id, slug } = useParams();
  const identifier = slug || id;
  const [productData, setProductData] = useState(null);

  return (
    <div>
      <ProductDetailsVegetables
        productId={identifier}
        onProductLoaded={(prod) => setProductData(prod)}
      />

      {/* <ProductDetailsDiscounts /> */}

      <ProductDetailsTestimonials
        productId={productData?._id || productData?.id || identifier}
        product={productData}
      />
    </div>
  );
};

export default ProductDetails;