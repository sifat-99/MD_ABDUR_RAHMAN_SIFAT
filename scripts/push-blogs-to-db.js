const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

function parseMarkdownFile(filePath) {
  const fileContent = fs.readFileSync(filePath, "utf8");
  const match = fileContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    throw new Error(`Failed to parse frontmatter in ${filePath}`);
  }

  const rawYaml = match[1];
  const markdownBody = match[2].trim();

  const data = {};
  for (const line of rawYaml.split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let val = line.slice(colonIdx + 1).trim();

    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1);
    } else if (val.startsWith("[") && val.endsWith("]")) {
      val = JSON.parse(val);
    } else if (val !== "" && !isNaN(Number(val))) {
      val = Number(val);
    }

    data[key] = val;
  }

  data.content = markdownBody;
  return data;
}

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI missing!");
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const blogsCollection = db.collection("blogs");

  const files = [
    "modern-php-vulnerabilities-security-guide.md",
    "nodejs-revolution-native-typescript-builtin-sqlite.md",
    "mastering-react-19-use-hook-async-promises.md",
  ];

  for (const file of files) {
    const fullPath = path.join(process.cwd(), "content", "blogs", file);
    const blogData = parseMarkdownFile(fullPath);
    console.log(`Pushing blog: "${blogData.title}" (${blogData.slug})...`);

    await blogsCollection.replaceOne(
      { id: blogData.id },
      {
        ...blogData,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      { upsert: true }
    );
  }

  const count = await blogsCollection.countDocuments();
  console.log(`\n🎉 Successfully pushed all blogs to MongoDB! Total blogs in DB: ${count}`);

  // Also sync to Firebase Realtime Database
  const fbBaseUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL?.replace(/\/$/, "");
  if (fbBaseUrl) {
    console.log("Syncing blogs to Firebase Realtime Database...");
    // Clean test key
    await fetch(`${fbBaseUrl}/blogs/test.json`, { method: "DELETE" }).catch(() => {});

    for (const file of files) {
      const fullPath = path.join(process.cwd(), "content", "blogs", file);
      const blogData = parseMarkdownFile(fullPath);
      const fbUrl = `${fbBaseUrl}/blogs/${blogData.id}.json`;
      await fetch(fbUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blogData),
      });
      console.log(`Synced to Firebase: ${blogData.id}`);
    }
  }

  const sample = await blogsCollection
    .find({})
    .project({ id: 1, title: 1, slug: 1, category: 1, readTime: 1 })
    .toArray();
  console.log("\nCurrent Blogs in DB:", sample);

  await client.close();
}

run().catch((err) => {
  console.error("Error pushing blogs:", err);
  process.exit(1);
});
