// app/components/screens/BlogDetails/BlogDetails.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CustomCursor } from "../../components/ui/cursor";
import { FooterSection } from "../../components/screens/Home/sections/FooterSection/FooterSection";
import { HeroSection, BlogContentSection } from "./sections";
import SEO, { buildBlogPostingSchema } from "../../src/utils/SEO"; // ✅ SEO + helper

const BlogDetails = (): JSX.Element => {
  const { slug } = useParams();
  const [blog, setBlog] = useState<any>(null);

  useEffect(() => {
    if (!slug) return;

    fetch(
      `https://interiorvillabd.com/api/blog-posts?where[slug][equals]=${slug}&depth=1&draft=false`
    )
      .then((res) => res.json())
      .then((json) => {
        if (json?.docs?.[0]) {
          setBlog(json.docs[0]);
        }
      })
      .catch((err) => console.error("Failed to fetch blog details:", err));
  }, [slug]);

  const seo = blog?.seoDetails;

  return (
    <main className="flex flex-col w-full items-start relative bg-white overflow-x-hidden min-h-screen">
      {/* ✅ SEO for blog details */}
      {seo && (
        <SEO
          title={seo.metaTitle}
          description={seo.metaDescription}
          keywords={seo.metaKey}
          url={`https://interiorvillabd.com/blog/${slug}`}
          image={blog?.featuredImage?.url}
          extraJsonLd={
            seo.seoStructuredData ||
            buildBlogPostingSchema({
              headline: seo.metaTitle,
              description: seo.metaDescription,
              image: blog?.featuredImage?.url,
              url: `https://interiorvillabd.com/blog/${slug}`,
              datePublished: blog?.createdAt,
              dateModified: blog?.updatedAt,
              authorName: blog?.author || "Interior Villa",
            })
          }
        />
      )}

      {/* Custom Cursor */}
      <CustomCursor className="custom-cursor" />

      {/* Hero Section */}
      <HeroSection blog={blog} />

      {/* Main Content Container */}
      <article className="w-full">
        <BlogContentSection blog={blog} />
      </article>

      {/* Footer */}
      <FooterSection />
    </main>
  );
};

export { BlogDetails };
