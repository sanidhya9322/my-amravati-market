import React from "react";
import { Helmet } from "react-helmet-async";

const BooksNotes = () => {
  return (
    <div>
      <Helmet>
        <title>Buy Books & Notes in Amravati | MyAmravati Market</title>
        <meta
          name="description"
          content="Find second-hand and new books, study notes, exam guides, and college materials in Amravati. Affordable prices, trusted local sellers."
        />
        <meta
          name="keywords"
          content="Amravati books, Amravati notes, second hand books Amravati, study material Amravati, exam guides Amravati"
        />
        <link rel="canonical" href="https://myamravati.com/category/books-notes" />
      </Helmet>

      <h1>📚 Books & Notes</h1>
      <p>Browse a wide collection of books, notes, and study materials from trusted sellers in Amravati.</p>
    </div>
  );
};

export default BooksNotes;
