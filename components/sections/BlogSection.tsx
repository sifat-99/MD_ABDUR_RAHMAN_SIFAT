import Image from "next/image";
import Link from "next/link";
import { getBlogs } from "@/lib/db-service";

export async function BlogSection() {
  const posts = await getBlogs();

  if (!posts || posts.length === 0) {
    return null;
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <section id="blog" className="py-6 sm:py-8 md:py-10 bg-muted/30">
      <div className="w-full max-w-[2200px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 2xl:px-16">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3">
            Latest Blog Posts
          </h2>
          <p className="text-xl text-muted-foreground">
            Thoughts, tutorials, and insights
          </p>
        </div>

        <div className="@container">
          <div className="grid grid-cols-1 @xl:grid-cols-2 @4xl:grid-cols-3 @7xl:grid-cols-4 2xl:grid-cols-4 3xl:grid-cols-5 gap-8">
            {posts.map((post) => (
              <article
                key={post.slug || post.id}
                className="@container/card group bg-card border rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {post.featuredImage && (
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    <Image
                      src={post.featuredImage}
                      alt={post.title || "Blog post"}
                      fill
                      unoptimized={Boolean(
                        post.featuredImage.endsWith(".svg") ||
                        post.featuredImage.includes(".svg") ||
                        post.featuredImage.includes("ufs.sh")
                      )}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-4 @md/card:p-6 space-y-3 @md/card:space-y-4">
                  <div className="flex flex-col @xs/card:flex-row @xs/card:items-center gap-2 text-xs @md/card:text-sm text-muted-foreground">
                    {post.category && (
                      <span className="px-2 py-0.5 @md/card:py-1 rounded-full bg-primary/10 text-primary text-xs w-fit capitalize">
                        {post.category.replace("-", " ")}
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      {post.publishedAt && (
                        <span className="truncate">
                          {formatDate(post.publishedAt)}
                        </span>
                      )}
                      {post.readTime && (
                        <>
                          <span>•</span>
                          <span>{post.readTime} min read</span>
                        </>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg @md/card:text-xl font-semibold group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-muted-foreground text-xs @md/card:text-sm line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 @md/card:gap-2">
                      {post.tags.slice(0, 3).map((tag: string) => (
                        <span
                          key={`${post.id}-${tag}`}
                          className="text-xs px-2 py-0.5 @md/card:py-1 rounded-md bg-muted"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <Link
                    href={`#blog`}
                    className="inline-flex items-center text-primary hover:underline text-xs @md/card:text-sm font-medium"
                  >
                    Read More →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
