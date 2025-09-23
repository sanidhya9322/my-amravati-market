import React from "react";
import { Helmet } from "react-helmet-async";

const NewItems = () => {
  return (
    <div>
      <Helmet>
        <title>Buy New Items in Amravati | MyAmravati Market</title>
        <meta
          name="description"
          content="Shop brand new items across multiple categories including clothes, electronics, and more in Amravati."
        />
        <meta
          name="keywords"
          content="Amravati new products, Amravati shopping, buy new items Amravati, Amravati marketplace"
        />
        <link rel="canonical" href="https://myamravati.com/category/new-items" />
      </Helmet>

      <h1>🛍️ New Items</h1>
      <p>Find fresh arrivals and brand new items from trusted sellers in Amravati.</p>
    </div>
  );
};

export default NewItems;
