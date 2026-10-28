import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  if (!content) return null;

  return (
    <div className={`prose dark:prose-invert max-w-none text-foreground/90 leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          strong: ({ children, ...props }) => (
            <strong className="font-bold text-foreground" {...props}>{children}</strong>
          ),
          b: ({ children, ...props }) => (
            <b className="font-bold text-foreground" {...props}>{children}</b>
          ),
          em: ({ children, ...props }) => (
            <em className="italic text-foreground/95 font-medium" {...props}>{children}</em>
          ),
          i: ({ children, ...props }) => (
            <i className="italic text-foreground/95 font-medium" {...props}>{children}</i>
          ),
          h1: ({ children, ...props }) => (
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mt-8 mb-4 tracking-tight border-b border-primary/20 pb-2 font-heading" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-7 mb-3.5 tracking-tight flex items-center gap-2.5 font-heading" {...props}>
              <span className="w-1.5 h-6 rounded-full bg-primary inline-block shrink-0 shadow-xs shadow-primary/40" />
              <span>{children}</span>
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mt-6 mb-3 tracking-tight flex items-center gap-2 font-heading" {...props}>
              <span className="w-1.5 h-5 rounded-full bg-primary/80 inline-block shrink-0" />
              <span>{children}</span>
            </h3>
          ),
          h4: ({ children, ...props }) => (
            <h4 className="text-base sm:text-lg font-bold text-foreground mt-4 mb-2 font-heading" {...props}>
              {children}
            </h4>
          ),
          p: ({ children, ...props }) => (
            <p className="mb-4 text-foreground/85 leading-relaxed font-normal last:mb-0" {...props}>
              {children}
            </p>
          ),
          ul: ({ children, ...props }) => (
            <ul className="list-disc list-outside ml-6 space-y-1.5 my-4 text-foreground/85 marker:text-primary" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="list-decimal list-outside ml-6 space-y-1.5 my-4 text-foreground/85 marker:text-primary font-medium" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="leading-relaxed pl-1" {...props}>{children}</li>
          ),
          blockquote: ({ children, ...props }) => (
            <blockquote className="border-l-4 border-primary pl-4.5 py-3 my-5 italic text-foreground/90 bg-primary/[0.04] rounded-r-2xl border-y border-r border-primary/10 shadow-xs" {...props}>
              {children}
            </blockquote>
          ),
          code: ({ className, children, ...props }: any) => {
            const isInline = !className && typeof children === "string" && !children.includes("\n");
            if (isInline) {
              return (
                <code className="px-2 py-0.5 rounded-lg bg-primary/10 font-mono text-xs text-primary font-bold border border-primary/20 shadow-2xs whitespace-nowrap" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children, ...props }) => (
            <pre className="p-4 rounded-xl bg-zinc-950 text-zinc-100 overflow-x-auto my-5 text-xs font-mono border border-border shadow-md" {...props}>
              {children}
            </pre>
          ),
          table: ({ children, ...props }) => (
            <div className="w-full overflow-x-auto my-6 rounded-2xl border border-primary/20 shadow-xs backdrop-blur-xs">
              <table className="w-full border-collapse text-left text-sm" {...props}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children, ...props }) => (
            <thead className="bg-primary/[0.06] border-b border-primary/20 text-xs uppercase font-extrabold text-foreground font-heading tracking-wider" {...props}>
              {children}
            </thead>
          ),
          tbody: ({ children, ...props }) => (
            <tbody className="divide-y divide-border/60" {...props}>{children}</tbody>
          ),
          tr: ({ children, ...props }) => (
            <tr className="hover:bg-primary/[0.03] transition-colors" {...props}>{children}</tr>
          ),
          th: ({ children, ...props }) => (
            <th className="px-4 py-3 font-bold text-foreground" {...props}>{children}</th>
          ),
          td: ({ children, ...props }) => (
            <td className="px-4 py-3 text-foreground/85" {...props}>{children}</td>
          ),
          a: ({ href, children, ...props }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-semibold underline underline-offset-4 hover:opacity-80 transition-opacity"
              {...props}
            >
              {children}
            </a>
          ),
          hr: (props) => <hr className="my-8 border-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" {...props} />,
          img: ({ src, alt, ...props }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={alt || "Illustration"}
              className="rounded-xl border border-border/80 max-w-full h-auto my-6 shadow-md"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
