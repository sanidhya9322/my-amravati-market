import { Helmet } from "react-helmet-async";

function Blog() {
  return (
    <div className="container mt-4">
      <Helmet>
        <title>Blog | MyAmravati Market</title>
        <meta
          name="description"
          content="Read local stories, guides, and tips about Amravati market. Discover homemade food, second-hand goods, and more."
        />
        <meta name="keywords" content="Amravati blog, Amravati market news, homemade food Amravati, second hand Amravati, Books and Notes" />
        <link rel="canonical" href="https://myamravati.com/blog" />
      </Helmet>

      <h1 className="mb-3">📚 MyAmravati Blog</h1>
      <p>Read guides, tips, and local stories from Amravati.</p>
      {/* blog list */}
    </div>
  );
}
