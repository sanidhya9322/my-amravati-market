import React from "react";
import { Helmet } from "react-helmet-async";

const HomemadeFood = () => {
  return (
    <div>
      <Helmet>
        <title>Homemade Food in Amravati | Fresh & Tasty</title>
        <meta
          name="description"
          content="Order homemade snacks, meals, sweets, and traditional food from Amravati’s home chefs."
        />
        <meta
          name="keywords"
          content="Amravati homemade food, Amravati tiffin, homemade snacks Amravati, traditional food Amravati"
        />
        <link rel="canonical" href="https://myamravati.com/category/homemade-food" />
      </Helmet>

      <h1>🍲 Homemade Food</h1>
      <p>Fresh, tasty, and hygienic homemade food prepared by local home chefs in Amravati.</p>
    </div>
  );
};

export default HomemadeFood;
