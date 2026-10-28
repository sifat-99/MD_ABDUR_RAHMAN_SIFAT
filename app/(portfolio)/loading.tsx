import React from "react";

export default function Loading() {
  return (
    <div className="w-full min-h-screen bg-transparent select-none overflow-x-hidden">
      {/* Top Floating / Fixed Shimmer Line */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/80 to-transparent z-50 animate-pulse" />

      {/* Main Container mirroring full ultra-wide 4K/5K responsive width */}
      <div className="w-full max-w-[2200px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 2xl:px-24 py-16 space-y-28">

        {/* 1. HERO SECTION SKELETON (0ms wave) */}
        <section className="relative pt-12 pb-16 opacity-95 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Hero Text Skeleton */}
            <div className="lg:col-span-7 space-y-6">
              {/* Status / Greeting Pill */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/60 border border-white/10 backdrop-blur-xl animate-skeleton-shimmer w-48 h-8" />

              {/* Huge Name Header */}
              <div className="space-y-3">
                <div className="h-12 sm:h-16 lg:h-20 w-4/5 rounded-2xl bg-card/70 border border-white/10 backdrop-blur-xl animate-skeleton-shimmer" />
                <div className="h-8 sm:h-10 w-2/3 rounded-xl bg-card/50 border border-white/10 backdrop-blur-xl animate-skeleton-shimmer" />
              </div>

              {/* Bio Paragraph Lines */}
              <div className="space-y-2.5 pt-2 max-w-2xl">
                <div className="h-4 w-full rounded-md bg-muted/60 animate-skeleton-shimmer" />
                <div className="h-4 w-5/6 rounded-md bg-muted/50 animate-skeleton-shimmer" />
                <div className="h-4 w-3/4 rounded-md bg-muted/40 animate-skeleton-shimmer" />
              </div>

              {/* Social Links Row */}
              <div className="flex flex-wrap items-center gap-3 pt-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-10 w-28 rounded-xl bg-card/70 border border-white/10 backdrop-blur-xl animate-skeleton-shimmer"
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-2">
                <div className="h-12 w-40 rounded-xl bg-primary/25 border border-primary/30 backdrop-blur-xl animate-skeleton-shimmer" />
                <div className="h-12 w-36 rounded-xl bg-card/70 border border-white/10 backdrop-blur-xl animate-skeleton-shimmer" />
              </div>
            </div>

            {/* Right Hero Avatar Skeleton */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 xl:w-96 xl:h-96 rounded-full bg-card/40 border-2 border-white/10 backdrop-blur-2xl flex items-center justify-center p-3 animate-skeleton-shimmer shadow-2xl">
                <div className="w-full h-full rounded-full bg-muted/40 border border-white/10" />
                {/* Decorative orbit ring */}
                <div className="absolute inset-0 rounded-full border border-primary/20 animate-pulse pointer-events-none" />
              </div>
            </div>
          </div>
        </section>

        {/* 2. ABOUT ME SECTION SKELETON (100ms wave) */}
        <section className="space-y-10 [animation-delay:100ms] animate-in fade-in duration-600">
          <div className="text-center space-y-3">
            <div className="h-10 w-48 rounded-xl bg-card/70 border border-white/10 mx-auto animate-skeleton-shimmer" />
            <div className="h-5 w-64 rounded-md bg-muted/50 mx-auto animate-skeleton-shimmer" />
          </div>

          <div className="rounded-3xl bg-card/50 border border-white/10 backdrop-blur-2xl p-6 sm:p-10 space-y-8 shadow-xl">
            <div className="space-y-3">
              <div className="h-4 w-full rounded-md bg-muted/60 animate-skeleton-shimmer" />
              <div className="h-4 w-11/12 rounded-md bg-muted/50 animate-skeleton-shimmer" />
              <div className="h-4 w-4/5 rounded-md bg-muted/40 animate-skeleton-shimmer" />
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-white/10">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center space-y-2 p-4 rounded-2xl bg-card/40 border border-white/5 animate-skeleton-shimmer">
                  <div className="h-8 w-16 mx-auto rounded-lg bg-primary/20" />
                  <div className="h-3 w-20 mx-auto rounded-md bg-muted/60" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. TESTIMONIALS SECTION SKELETON (200ms wave) */}
        <section className="space-y-10 [animation-delay:200ms] animate-in fade-in duration-600">
          <div className="text-center space-y-3">
            <div className="h-10 w-56 rounded-xl bg-card/70 border border-white/10 mx-auto animate-skeleton-shimmer" />
            <div className="h-5 w-72 rounded-md bg-muted/50 mx-auto animate-skeleton-shimmer" />
          </div>

          <div className="rounded-3xl bg-card/50 border border-white/10 backdrop-blur-2xl p-8 sm:p-12 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="w-full aspect-square max-w-sm mx-auto rounded-2xl bg-muted/40 border border-white/10 animate-skeleton-shimmer" />
              <div className="space-y-4">
                <div className="h-5 w-3/4 rounded-md bg-muted/60 animate-skeleton-shimmer" />
                <div className="h-4 w-full rounded-md bg-muted/50 animate-skeleton-shimmer" />
                <div className="h-4 w-5/6 rounded-md bg-muted/40 animate-skeleton-shimmer" />
                <div className="pt-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 animate-skeleton-shimmer" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-28 rounded-md bg-foreground/30 animate-skeleton-shimmer" />
                    <div className="h-3 w-20 rounded-md bg-muted/60 animate-skeleton-shimmer" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. SKILLS & COMPETENCIES SECTION SKELETON (300ms wave) */}
        <section className="space-y-10 [animation-delay:300ms] animate-in fade-in duration-600">
          <div className="text-center space-y-3">
            <div className="h-10 w-60 rounded-xl bg-card/70 border border-white/10 mx-auto animate-skeleton-shimmer" />
            <div className="h-5 w-80 rounded-md bg-muted/50 mx-auto animate-skeleton-shimmer" />
          </div>

          {/* Dual / Triple Chart Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
            {[1, 2, 3].map((cat) => (
              <div
                key={cat}
                className="rounded-2xl bg-card/60 border border-white/10 backdrop-blur-2xl p-6 space-y-5 shadow-lg animate-skeleton-shimmer"
              >
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="h-5 w-32 rounded-md bg-muted/70" />
                  <div className="h-4 w-12 rounded-full bg-primary/20" />
                </div>
                <div className="space-y-3.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <div className="h-3 w-24 rounded bg-muted/60" />
                        <div className="h-3 w-8 rounded bg-muted/40" />
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted/40 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary/30"
                          style={{ width: `${60 + ((s * 7) % 35)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. WORK EXPERIENCE TIMELINE SKELETON (400ms wave) */}
        <section className="space-y-10 [animation-delay:400ms] animate-in fade-in duration-600">
          <div className="text-center space-y-3">
            <div className="h-10 w-52 rounded-xl bg-card/70 border border-white/10 mx-auto animate-skeleton-shimmer" />
            <div className="h-5 w-64 rounded-md bg-muted/50 mx-auto animate-skeleton-shimmer" />
          </div>

          <div className="space-y-6 max-w-4xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl bg-card/60 border border-white/10 backdrop-blur-2xl p-6 shadow-md flex items-start gap-5 animate-skeleton-shimmer"
              >
                <div className="w-14 h-14 rounded-xl bg-muted/60 border border-white/10 shrink-0" />
                <div className="flex-1 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <div className="h-5 w-44 rounded-md bg-foreground/30" />
                    <div className="h-4 w-24 rounded-full bg-muted/50" />
                  </div>
                  <div className="h-4 w-32 rounded-md bg-primary/20" />
                  <div className="h-3 w-full rounded-md bg-muted/40" />
                  <div className="h-3 w-4/5 rounded-md bg-muted/40" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. EDUCATION SECTION SKELETON (500ms wave) */}
        <section className="space-y-10 [animation-delay:500ms] animate-in fade-in duration-600">
          <div className="text-center space-y-3">
            <div className="h-10 w-44 rounded-xl bg-card/70 border border-white/10 mx-auto animate-skeleton-shimmer" />
            <div className="h-5 w-60 rounded-md bg-muted/50 mx-auto animate-skeleton-shimmer" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl bg-card/60 border border-white/10 backdrop-blur-2xl p-6 shadow-md flex items-start gap-4 animate-skeleton-shimmer"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-3/4 rounded-md bg-foreground/30" />
                  <div className="h-4 w-1/2 rounded-md bg-primary/20" />
                  <div className="h-3 w-2/3 rounded-md bg-muted/50" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. PROJECTS GRID SKELETON (600ms wave) */}
        <section className="space-y-10 [animation-delay:600ms] animate-in fade-in duration-600">
          <div className="text-center space-y-3">
            <div className="h-10 w-56 rounded-xl bg-card/70 border border-white/10 mx-auto animate-skeleton-shimmer" />
            <div className="h-5 w-72 rounded-md bg-muted/50 mx-auto animate-skeleton-shimmer" />
          </div>

          {/* Filter Pills Skeleton */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-8 w-24 rounded-full bg-card/60 border border-white/10 backdrop-blur-xl animate-skeleton-shimmer"
              />
            ))}
          </div>

          {/* Responsive Multi-column Project Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="rounded-2xl bg-card/60 border border-white/10 backdrop-blur-2xl overflow-hidden shadow-xl flex flex-col justify-between animate-skeleton-shimmer"
              >
                {/* Thumbnail */}
                <div className="aspect-video w-full bg-muted/50 border-b border-white/10 relative">
                  <div className="absolute top-3 left-3 h-5 w-16 rounded-full bg-black/40 border border-white/10" />
                </div>

                {/* Content */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="h-5 w-3/4 rounded-md bg-foreground/30" />
                    <div className="h-3 w-full rounded-md bg-muted/50" />
                    <div className="h-3 w-4/5 rounded-md bg-muted/40" />
                  </div>

                  {/* Tech stack tags */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {[1, 2, 3].map((t) => (
                      <div key={t} className="h-5 w-14 rounded-md bg-muted/40" />
                    ))}
                  </div>

                  {/* Card Footer Button */}
                  <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                    <div className="h-4 w-20 rounded bg-primary/20" />
                    <div className="h-4 w-16 rounded bg-muted/40" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 8. SERVICES, BLOGS & CONTACT SKELETON (700ms wave) */}
        <section className="space-y-10 [animation-delay:700ms] animate-in fade-in duration-600">
          <div className="text-center space-y-3">
            <div className="h-10 w-48 rounded-xl bg-card/70 border border-white/10 mx-auto animate-skeleton-shimmer" />
            <div className="h-5 w-64 rounded-md bg-muted/50 mx-auto animate-skeleton-shimmer" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl bg-card/60 border border-white/10 backdrop-blur-2xl p-6 space-y-4 shadow-lg animate-skeleton-shimmer"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/25" />
                <div className="h-5 w-2/3 rounded-md bg-foreground/30" />
                <div className="h-3 w-full rounded-md bg-muted/50" />
                <div className="h-3 w-4/5 rounded-md bg-muted/40" />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Floating Bottom Dock Skeleton */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <div className="h-14 w-80 sm:w-96 rounded-full bg-card/80 border border-white/15 backdrop-blur-2xl shadow-2xl flex items-center justify-around px-4 animate-skeleton-shimmer">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="w-8 h-8 rounded-full bg-muted/60" />
          ))}
        </div>
      </div>
    </div>
  );
}
