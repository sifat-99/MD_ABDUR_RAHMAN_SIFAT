import { IconExternalLink } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { CometCard } from "@/components/ui/comet-card";
import { getCertifications } from "@/lib/db-service";

export async function CertificationsSection() {
    const certifications = await getCertifications();

    if (!certifications || certifications.length === 0) {
        return null;
    }

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const isExpired = (expiryDate: string | null | undefined) => {
        if (!expiryDate) return false;
        return new Date(expiryDate) < new Date();
    };

    return (
        <section
            id="certifications"
            className="py-6 sm:py-8 md:py-10 bg-gradient-to-b from-background via-muted/20 to-background"
        >
            <div className="w-full max-w-[2200px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 2xl:px-16">
                <div className="text-center mb-6 sm:mb-8">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
                        Certifications
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
                        Professional credentials and verified achievements
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 items-stretch">
                    {certifications.map((cert, index) => (
                        <CometCard
                            key={`${cert.id || index}`}
                            rotateDepth={6}
                            translateDepth={8}
                            className="w-full h-full flex flex-col"
                        >
                            {/* Outer Frame with Uniform Height */}
                            <div
                                className="relative bg-card border-4 sm:border-8 border-card/80 rounded-2xl shadow-2xl p-3 sm:p-4 h-full flex flex-col flex-1"
                                style={{
                                    transformStyle: "preserve-3d",
                                }}
                            >
                                {/* Inner Certificate */}
                                <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 dark:from-zinc-950 dark:via-black dark:to-zinc-950 border-2 border-yellow-600/40 rounded-xl p-5 sm:p-7 flex flex-col justify-between h-full flex-1 min-h-[580px] sm:min-h-[620px]">
                                    {/* Decorative Corner Frames */}
                                    <div className="absolute top-0 left-0 w-16 h-16 pointer-events-none">
                                        <div className="absolute top-2.5 left-2.5 w-8 h-8 border-t-2 border-l-2 border-yellow-600/60" />
                                    </div>
                                    <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
                                        <div className="absolute top-2.5 right-2.5 w-8 h-8 border-t-2 border-r-2 border-yellow-600/60" />
                                    </div>
                                    <div className="absolute bottom-0 left-0 w-16 h-16 pointer-events-none">
                                        <div className="absolute bottom-2.5 left-2.5 w-8 h-8 border-b-2 border-l-2 border-yellow-600/60" />
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none">
                                        <div className="absolute bottom-2.5 right-2.5 w-8 h-8 border-b-2 border-r-2 border-yellow-600/60" />
                                    </div>

                                    {/* Top Content: Date, Header, Title, Description */}
                                    <div className="relative z-10 flex flex-col items-center text-center">
                                        {/* Date at Top */}
                                        <div className="mb-2">
                                            <p className="text-xs text-zinc-400 font-medium tracking-wider">
                                                {cert.issueDate ? formatDate(cert.issueDate) : "Official Credential"}
                                            </p>
                                        </div>

                                        {/* Certificate Header */}
                                        <div className="mb-2">
                                            <h4 className="text-xs sm:text-sm font-bold text-yellow-500/90 uppercase tracking-widest">
                                                CERTIFICATE
                                            </h4>
                                            <p className="text-[10px] text-yellow-500/80 italic font-serif">for</p>
                                        </div>

                                        {/* Certificate Name - Fixed line-clamp and uniform min-height */}
                                        <h3 className="text-base sm:text-lg font-bold text-white mb-2 leading-snug px-2 line-clamp-3 min-h-[3.8rem] flex items-center justify-center text-center">
                                            {cert.name}
                                        </h3>

                                        {/* Description - Fixed line-clamp and uniform min-height */}
                                        <p className="text-xs text-zinc-300/80 line-clamp-2 min-h-[2.2rem] px-2 leading-relaxed text-center">
                                            {cert.description || `${cert.name} issued by ${cert.issuer}`}
                                        </p>
                                    </div>

                                    {/* Middle Content: Certificate Image Preview */}
                                    <div className="relative z-10 my-3 w-full flex flex-col items-center justify-center">
                                        {cert.logo ? (
                                            <div className="relative w-full max-w-[280px] h-36 sm:h-40 rounded-xl overflow-hidden border border-yellow-600/40 bg-black/60 shadow-xl group/certimg">
                                                <Image
                                                    src={cert.logo}
                                                    alt={`${cert.name} certificate`}
                                                    fill
                                                    sizes="(max-width: 640px) 280px, 320px"
                                                    className="object-contain p-2 transition-transform duration-300 group-hover/certimg:scale-105"
                                                />
                                                <a
                                                    href={cert.logo}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover/certimg:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px] text-white text-xs font-semibold gap-1.5"
                                                    title="View Full Resolution Certificate"
                                                >
                                                    <span>View Certificate</span>
                                                    <IconExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                            </div>
                                        ) : (
                                            <div className="w-full max-w-[280px] h-36 sm:h-40 rounded-xl border border-dashed border-yellow-600/20 bg-yellow-600/5 flex items-center justify-center">
                                                <span className="text-xs text-yellow-600/60 font-mono">
                                                    Verified Certificate
                                                </span>
                                            </div>
                                        )}

                                        {/* Issuer */}
                                        <div className="mt-2.5 text-center">
                                            <p className="text-sm sm:text-base font-bold text-yellow-500 tracking-wide">
                                                {cert.issuer}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Bottom Content: Skills, Expiry, Action Button */}
                                    <div className="relative z-10 flex flex-col justify-end w-full mt-auto">
                                        {/* Skills Badges - Fixed min-height so rows stay aligned */}
                                        <div className="min-h-[2rem] flex items-center justify-center mb-3">
                                            {cert.skills && cert.skills.length > 0 ? (
                                                <div className="flex flex-wrap justify-center gap-1.5">
                                                    {cert.skills.slice(0, 4).map((skillName, idx) => (
                                                        <span
                                                            key={`${cert.id}-skill-${idx}`}
                                                            className="px-2 py-0.5 text-[10px] bg-yellow-600/20 text-yellow-400 font-medium border border-yellow-600/30 rounded-md"
                                                        >
                                                            {skillName}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-zinc-500 font-mono">
                                                    Credential Verified
                                                </span>
                                            )}
                                        </div>

                                        {/* Expiry and Credential Info */}
                                        <div className="space-y-1 text-xs mb-3 min-h-[2.4rem] flex flex-col justify-center text-center">
                                            {cert.expiryDate ? (
                                                <div>
                                                    <span className="text-zinc-400 text-[11px]">Valid Until: </span>
                                                    <span
                                                        className={
                                                            isExpired(cert.expiryDate)
                                                                ? "text-red-400 font-semibold text-[11px]"
                                                                : "text-zinc-300 font-semibold text-[11px]"
                                                        }
                                                    >
                                                        {formatDate(cert.expiryDate)}
                                                        {isExpired(cert.expiryDate) && " (Expired)"}
                                                    </span>
                                                </div>
                                            ) : null}
                                            {cert.credentialId ? (
                                                <div>
                                                    <p className="text-[10px] font-mono text-zinc-400 truncate px-4">
                                                        ID: {cert.credentialId}
                                                    </p>
                                                </div>
                                            ) : null}
                                        </div>

                                        {/* Verify Credential Button or fallback */}
                                        <div className="w-full pt-3 border-t border-yellow-600/20">
                                            {cert.credentialUrl ? (
                                                <Link
                                                    href={cert.credentialUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-zinc-950 bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 hover:from-yellow-400 hover:to-amber-300 rounded-xl transition-all shadow-md hover:shadow-yellow-500/20 hover:scale-[1.01] active:scale-[0.99]"
                                                >
                                                    <span>Verify Credential</span>
                                                    <IconExternalLink className="w-3.5 h-3.5" />
                                                </Link>
                                            ) : (
                                                <div className="w-full py-2 text-center text-xs font-medium text-yellow-500/70 border border-yellow-600/20 rounded-xl bg-yellow-500/5">
                                                    Verified Official Certificate
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CometCard>
                    ))}
                </div>
            </div>
        </section>
    );
}
