import ProjectsClient from "@/components/ProjectsClient";
import fs from "fs/promises";
import path from "path";
import { cacheLife } from "next/cache";

async function getProjects() {
    'use cache';
    cacheLife("blog"); // Using the same cache profile

    const filePath = path.join(process.cwd(), "public", "Projects.json");
    const jsonData = await fs.readFile(filePath, "utf-8");
    return JSON.parse(jsonData);
}

export default async function Projects() {
    const projects = await getProjects();

    return <ProjectsClient projects={projects} />;
}
