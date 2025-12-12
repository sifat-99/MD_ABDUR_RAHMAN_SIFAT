import { client } from "@/sanity/lib/client";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Pure Static Logic - No AI Model
    const lastMessage = messages[messages.length - 1];
    const text = lastMessage?.content?.toLowerCase() || "";
    let responseText = "";

    // Simulate thinking delay
    await new Promise(r => setTimeout(r, 500));

    // KEYWORD MATCHING LOGIC
    if (text.includes('project') || text.includes('work') || text.includes('portfolio') || text.includes('built')) {
        const query = `*[_type == "project"]{title, "imageUrl": mainImage.asset->url, summary, technologies, liveUrl, githubUrl}`;
        const projects = await client.fetch(query);
        responseText = "### My Projects\n\nHere are some of the projects I've built:\n\n";
        if(Array.isArray(projects)) {
            projects.forEach((p: any) => {
                const title = p.title?.trim();
                const url = p.liveUrl || p.githubUrl;
                const titleMd = url ? `[${title}](${url})` : title;
                responseText += `- **${titleMd}**: ${p.summary || "No summary"} \n`;
                responseText += `\nTechnologies: ${(p.technologies || []).map((t: any) => t._ref.replace(/^skill-/, '')).join(', ')} \n`;
                responseText += `\nLive URL: ${p.liveUrl ? `[${p.liveUrl}](${p.liveUrl})` : "No live URL"} \n`;
                responseText += `\nGitHub URL: ${p.githubUrl ? `[${p.githubUrl}](${p.githubUrl})` : "No GitHub URL"} \n`;
                console.log(p.technologies);

                responseText += `\n--- \n\n\n`;
            });
        }
    }
    else if (text.includes('skill') || text.includes('tech') || text.includes('stack') || text.includes('experience')) {
        const query = `*[_type == "skill"]{name, percentage}`; // Updated fields to match schema
        const skills = await client.fetch(query);
        responseText = "### My Skills\n\nI specialize in the following technologies:\n\n";
            if(Array.isArray(skills)) {
            skills.forEach((s: any) => {
                responseText += `- **${s.name}**: ${s.percentage}%\n`; // Use correct names here
            });
        }
    }
    else if (text.includes('contact') || text.includes('email') || text.includes('hire') || text.includes('about') || text.includes('who are you')) {
        const query = `*[_type == "profile"][0]`;
        const profile = await client.fetch(query);
        responseText = `### About Me\n\n${profile?.about || "I am a developer."}\n\n**Contact**: ${profile?.email || "Check my site!"}`;
    }
    else {
        responseText = "I'm currently a static database assistant. I can only answer specific questions about my **projects**, **skills**, or **contact info**. Try asking one of those!";
    }

    // Stream the response
    const stream = new ReadableStream({
      async start(controller) {
        const words = responseText.split(" ");
        for (const word of words) {
            controller.enqueue(new TextEncoder().encode(`0:${JSON.stringify(word + " ")}\n`));
            await new Promise(r => setTimeout(r, 30)); // Typing effect
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
