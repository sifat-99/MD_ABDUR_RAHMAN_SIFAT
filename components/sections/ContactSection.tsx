import Link from "next/link";
import WorldMapDemo from "@/components/world-map-demo";
import { getProfile } from "@/lib/db-service";
import { ContactForm } from "./ContactForm";

export async function ContactSection() {
    const profile = await getProfile();

    if (!profile) {
        return null;
    }

    return (
        <section id="contact" className="pt-6 sm:pt-8 md:pt-10 pb-36 sm:pb-40 md:pb-48 lg:pb-52 bg-muted/30">
            <WorldMapDemo />

            <div className="w-full max-w-[2200px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 2xl:px-16">
                <div className="text-center mb-6 sm:mb-8">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3">Get In Touch</h2>
                    <p className="text-xl text-muted-foreground">
                        Wherever you are in the world, let&apos;s work together on your next project.
                    </p>
                </div>

                <div className="@container">
                    <div className="grid grid-cols-1 @3xl:grid-cols-2 gap-8">
                        {/* Contact Info */}
                        <div className="@container/info space-y-6">
                            <h3 className="text-xl @md/info:text-2xl font-semibold mb-6">
                                Contact Information
                            </h3>

                            {profile.email && (
                                <div className="flex items-start gap-3 @md/info:gap-4">
                                    <div className="w-10 h-10 @md/info:w-12 @md/info:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <span className="text-xl @md/info:text-2xl">📧</span>
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-semibold mb-1 text-sm @md/info:text-base">
                                            Email
                                        </h4>
                                        <Link
                                            href={`mailto:${profile.email}`}
                                            className="text-muted-foreground hover:text-primary transition-colors text-xs @md/info:text-sm truncate block"
                                        >
                                            {profile.email}
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {profile.phone && (
                                <div className="flex items-start gap-3 @md/info:gap-4">
                                    <div className="w-10 h-10 @md/info:w-12 @md/info:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <span className="text-xl @md/info:text-2xl">📱</span>
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-semibold mb-1 text-sm @md/info:text-base">
                                            Phone
                                        </h4>
                                        <Link
                                            href={`tel:${profile.phone}`}
                                            className="text-muted-foreground hover:text-primary transition-colors text-xs @md/info:text-sm"
                                        >
                                            {profile.phone}
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {profile.location && (
                                <div className="flex items-start gap-3 @md/info:gap-4">
                                    <div className="w-10 h-10 @md/info:w-12 @md/info:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <span className="text-xl @md/info:text-2xl">📍</span>
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-semibold mb-1 text-sm @md/info:text-base">
                                            Location
                                        </h4>
                                        <p className="text-muted-foreground text-xs @md/info:text-sm">
                                            {profile.location}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {profile.socialLinks && (
                                <div className="pt-6">
                                    <h4 className="font-semibold mb-4 text-sm @md/info:text-base">
                                        Follow Me
                                    </h4>
                                    <div className="flex flex-wrap gap-2 @md/info:gap-3">
                                        {profile.socialLinks.github && (
                                            <Link
                                                href={profile.socialLinks.github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-3 py-1.5 @md/info:px-4 @md/info:py-2 rounded-lg border hover:bg-accent transition-colors text-xs @md/info:text-sm"
                                            >
                                                GitHub
                                            </Link>
                                        )}
                                        {profile.socialLinks.linkedin && (
                                            <Link
                                                href={profile.socialLinks.linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-3 py-1.5 @md/info:px-4 @md/info:py-2 rounded-lg border hover:bg-accent transition-colors text-xs @md/info:text-sm"
                                            >
                                                LinkedIn
                                            </Link>
                                        )}
                                        {profile.socialLinks.twitter && (
                                            <Link
                                                href={profile.socialLinks.twitter}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-3 py-1.5 @md/info:px-4 @md/info:py-2 rounded-lg border hover:bg-accent transition-colors text-xs @md/info:text-sm"
                                            >
                                                Twitter
                                            </Link>
                                        )}
                                        {profile.socialLinks.website && (
                                            <Link
                                                href={profile.socialLinks.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-3 py-1.5 @md/info:px-4 @md/info:py-2 rounded-lg border hover:bg-accent transition-colors text-xs @md/info:text-sm"
                                            >
                                                Website
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Contact Form */}
                        <ContactForm />
                    </div>
                </div>
            </div>
        </section>
    );
}
