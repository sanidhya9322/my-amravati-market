import { Helmet } from "react-helmet-async";

// Inside BlogPost return()
<>
  <Helmet>
    <title>{post.title} | MyAmravati Market</title>
    <meta
      name="description"
      content={
        post.title.includes("Homemade Food")
          ? "Discover Amravati’s homemade food sellers. Order snacks, sweets, and authentic dishes from local chefs."
          : "Learn how to sell second-hand goods in Amravati. Tips for books, clothes, furniture, and more."
      }
    />
    <meta name="keywords" content="Amravati market, Amravati food, Amravati second hand, MyAmravati " />
    <link rel="canonical" href={`https://myamravati.com/blog/${slug}`} />
  </Helmet>
  <h1>{post.title}</h1>
  <div>{post.content}</div>
  <Link to="/blog" className="btn btn-secondary mt-3">
    ← Back to Blog
  </Link>
</>
