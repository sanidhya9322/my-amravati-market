import React from "react";
import { Helmet } from "react-helmet-async";

const HandmadeItems = () => {
  return (
    <div>
      <Helmet>
        <title>Handmade Items in Amravati | Support Local Creators</title>
        <meta
          name="description"
          content="Discover unique handmade crafts, gifts, and products created by local artisans in Amravati."
        />
        <meta
          name="keywords"
          content="Amravati handmade, Amravati crafts, handmade gifts Amravati, handmade products Amravati"
        />
        <link rel="canonical" href="https://myamravati.com/category/handmade-items" />
      </Helmet>

      <h1>🎨 Handmade Items</h1>
      <p>Support local artisans and shop unique handmade creations from Amravati.</p>
    </div>
  );
};

export default HandmadeItems;
