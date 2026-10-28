import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { getTestimonials } from "@/lib/db-service";

export async function TestimonialsSection() {
  const testimonials = await getTestimonials();

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  const formattedTestimonials = testimonials.map((testimonial) => ({
    quote: testimonial.testimonial || "",
    name: testimonial.name || "Anonymous",
    designation: testimonial.company
      ? `${testimonial.position} at ${testimonial.company}`
      : testimonial.position || "",
    src: testimonial.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=500&auto=format&fit=crop",
    companyLogo: testimonial.companyLogo || undefined,
  }));

  return (
    <section id="testimonials" className="py-6 sm:py-8 md:py-10">
      <div className="w-full max-w-[2200px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 2xl:px-16">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3">
            Client Testimonials
          </h2>
          <p className="text-xl text-muted-foreground">
            What people say about working with me
          </p>
        </div>

        <AnimatedTestimonials
          testimonials={formattedTestimonials}
          autoplay={true}
        />
      </div>
    </section>
  );
}
