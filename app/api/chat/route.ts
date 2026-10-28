import { getProjects, getSkills, getProfile } from "@/lib/db-service";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const lastMessage = messages[messages.length - 1];
    const text = lastMessage?.content?.toLowerCase() || "";
    let responseText = "";

    await new Promise(r => setTimeout(r, 400));

    // KEYWORD MATCHING LOGIC
    if (text.includes("project") || text.includes("work") || text.includes("portfolio") || text.includes("built")) {
      const projects = await getProjects();
      responseText = "### My Projects\n\nHere are some of the key projects I've built:\n\n";
      if (Array.isArray(projects) && projects.length > 0) {
        projects.forEach((p) => {
          const title = p.title?.trim();
          const url = p.liveUrl || p.githubUrl;
          const titleMd = url ? `[${title}](${url})` : title;
          responseText += `- **${titleMd}**: ${p.tagline || "Web development project"} \n`;
          if (p.technologies && p.technologies.length > 0) {
            responseText += `  - *Technologies*: ${p.technologies.join(", ")}\n`;
          }
          if (p.liveUrl) {
            responseText += `  - *Live Demo*: [${p.liveUrl}](${p.liveUrl})\n`;
          }
          if (p.githubUrl) {
            responseText += `  - *GitHub*: [${p.githubUrl}](${p.githubUrl})\n`;
          }
          responseText += `\n`;
        });
      } else {
        responseText += "Check out the projects section on my homepage!\n";
      }
    } else if (text.includes("skill") || text.includes("tech") || text.includes("stack") || text.includes("experience")) {
      const skills = await getSkills();
      responseText = "### My Skills\n\nI specialize in the following technologies:\n\n";
      if (Array.isArray(skills) && skills.length > 0) {
        skills.forEach((s) => {
          responseText += `- **${s.name}** (${s.category}): ${s.percentage}%\n`;
        });
      } else {
        responseText += "React, Next.js, TypeScript, Tailwind CSS, Node.js, Firebase, MongoDB, AI/ML.\n";
      }
    } else if (text.includes("contact") || text.includes("email") || text.includes("hire") || text.includes("about") || text.includes("who are you")) {
      const profile = await getProfile();
      responseText = `### About Me\n\n${profile?.shortBio || "I am a full-stack developer."}\n\n**Email**: ${profile?.email || "mdabdurrahmansifat@gmail.com"}\n**Location**: ${profile?.location || "Dhaka, Bangladesh"}`;
    } else {
      responseText = "I'm your AI digital assistant! You can ask me about my **projects**, technical **skills**, work **experience**, or **contact info**.";
    }

    // Stream response with typing effect
    const stream = new ReadableStream({
      async start(controller) {
        const words = responseText.split(" ");
        for (const word of words) {
          controller.enqueue(new TextEncoder().encode(`0:${JSON.stringify(word + " ")}\n`));
          await new Promise(r => setTimeout(r, 25));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error: any) {
    console.error("Chat API Critical Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
