import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogBySlug, getBlogs, getProfile } from "@/lib/db-service";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import {
  BlogReadingClient,
  BackToHomeButton,
} from "@/components/blog/BlogReadingClient";
import {
  IconCalendar,
  IconClock,
  IconArrowRight,
  IconSend,
} from "@tabler/icons-react";

export const revalidate = 60;

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const blogs = await getBlogs();
  return blogs.map((post) => ({
    slug: post.slug || post.id,
  }));
}

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);

  if (!post) {
    return {
      title: "Article Not Found | Md Abdur Rahman Sifat",
    };
  }

  const title = `${post.title} | Md Abdur Rahman Sifat`;
  const description =
    post.excerpt ||
    "In-depth software engineering article by Md Abdur Rahman Sifat.";
  const url = `https://sifat.online/blog/${post.slug || post.id}`;
  const ogImage = post.featuredImage || "/opengraph-image.png";

  return {
    metadataBase: new URL("https://sifat.online"),
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      publishedTime: post.publishedAt,
      authors: ["Md Abdur Rahman Sifat"],
      tags: post.tags,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
      creator: "@md_sifat_99",
    },
  };
}

export default async function BlogPostPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const [post, allBlogs, profile] = await Promise.all([
    getBlogBySlug(slug),
    getBlogs(),
    getProfile(),
  ]);

  if (!post) {
    notFound();
  }

  const relatedPosts = allBlogs
    .filter((b) => (b.slug || b.id) !== (post.slug || post.id))
    .slice(0, 3);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const isSvgOrUploadThing = Boolean(
    post.featuredImage &&
      (post.featuredImage.endsWith(".svg") ||
        post.featuredImage.includes(".svg") ||
        post.featuredImage.includes("ufs.sh"))
  );

  const fullName = profile
    ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
    : "Md Abdur Rahman Sifat";

  return (
    <article className="min-h-screen py-10 sm:py-16 md:py-20">
      {/* Top Reading Progress & Share Buttons */}
      <BlogReadingClient slug={post.slug || post.id} title={post.title} />

      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Navigation & Share Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-12">
          <BackToHomeButton />

          <div className="flex items-center gap-3">
            {post.category && (
              <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium text-xs capitalize tracking-wide">
                {post.category.replace("-", " ")}
              </span>
            )}
          </div>
        </div>

        {/* Article Header */}
        <header className="space-y-6 mb-10 sm:mb-14">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground font-heading leading-[1.18]">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed font-normal">
              {post.excerpt}
            </p>
          )}

          {/* Author & Publication Meta Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-y border-border/70 py-4 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              {profile?.profileImage ? (
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-border">
                  <Image
                    src={profile.profileImage}
                    alt={fullName}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-sm border border-primary/30">
                  AR
                </div>
              )}
              <div>
                <p className="font-semibold text-foreground">{fullName}</p>
                <p className="text-xs text-muted-foreground">
                  {profile?.headline || "Full-Stack Web Developer & Engineer"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm">
              {post.publishedAt && (
                <span className="flex items-center gap-1.5">
                  <IconCalendar className="w-4 h-4 text-primary" />
                  <span>{formatDate(post.publishedAt)}</span>
                </span>
              )}
              {post.readTime && (
                <span className="flex items-center gap-1.5">
                  <IconClock className="w-4 h-4 text-primary" />
                  <span>{post.readTime} min read</span>
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="relative aspect-video w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-border/80 shadow-2xl mb-12 sm:mb-16 bg-muted/40">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              priority
              unoptimized={isSvgOrUploadThing}
              sizes="(max-width: 1024px) 100vw, 900px"
              className="object-cover"
            />
          </div>
        )}

        {/* Article Body */}
        <section className="bg-card/40 dark:bg-card/25 backdrop-blur-xl border border-border/80 rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-12 shadow-sm mb-12 sm:mb-16">
          <MarkdownRenderer
            content={post.content || ""}
            className="text-base sm:text-lg leading-relaxed"
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-border flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground mr-1">
                Topics:
              </span>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-lg bg-muted text-foreground text-xs font-mono font-medium border border-border/70 hover:border-primary/50 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Author Bio Box */}
        <div className="bg-gradient-to-br from-card to-card/60 border border-border rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-16 shadow-md">
          {profile?.profileImage ? (
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-primary/20 shrink-0 shadow-lg">
              <Image
                src={profile.profileImage}
                alt={fullName}
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-primary/10 border-2 border-primary/30 text-primary font-extrabold flex items-center justify-center text-2xl shrink-0">
              AR
            </div>
          )}

          <div className="flex-1 text-center sm:text-left space-y-2">
            <h3 className="text-lg sm:text-xl font-bold text-foreground">
              Written by {fullName}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {profile?.shortBio ||
                "Full-Stack Web Developer & Engineer specializing in Next.js, React, Node.js, and high-performance modern architectures."}
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <Link
                href="/#contact"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-md shadow-primary/20 transition-all hover:scale-[1.02]"
              >
                <IconSend className="w-3.5 h-3.5" />
                <span>Get in Touch</span>
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-medium border border-border transition-all"
              >
                <span>View Portfolio</span>
              </Link>
            </div>
          </div>
        </div>

        {/* More / Related Articles */}
        {relatedPosts.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground font-heading">
                More Articles to Read
              </h2>
              <Link
                href="/#blog"
                className="text-xs sm:text-sm text-primary hover:underline font-semibold"
              >
                See All
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map((rel) => {
                const relUrl = `/blog/${rel.slug || rel.id}`;
                return (
                  <article
                    key={rel.slug || rel.id}
                    className="group bg-card/70 border border-border/80 hover:border-primary/50 rounded-2xl overflow-hidden hover:shadow-lg transition-all flex flex-col justify-between"
                  >
                    <div>
                      {rel.featuredImage && (
                        <Link
                          href={relUrl}
                          className="block relative aspect-video overflow-hidden bg-muted"
                        >
                          <Image
                            src={rel.featuredImage}
                            alt={rel.title}
                            fill
                            unoptimized={Boolean(
                              rel.featuredImage.endsWith(".svg") ||
                                rel.featuredImage.includes(".svg") ||
                                rel.featuredImage.includes("ufs.sh")
                            )}
                            sizes="(max-width: 768px) 100vw, 400px"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </Link>
                      )}
                      <div className="p-5 space-y-2">
                        {rel.category && (
                          <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                            {rel.category.replace("-", " ")}
                          </span>
                        )}
                        <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          <Link href={relUrl}>{rel.title}</Link>
                        </h3>
                        {rel.excerpt && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {rel.excerpt}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="p-5 pt-0">
                      <Link
                        href={relUrl}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                      >
                        <span>Read Article</span>
                        <IconArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
