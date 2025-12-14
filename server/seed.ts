import { createBlogPost } from "../db.js";

async function main() {
  try {
    const now = new Date();

    await createBlogPost({
      title: "Welcome to JOYDAO.Z",
      slug: "welcome-to-joydao",
      excerpt: "Booting up the creative terminal...",
      content: `# Hello Agent\n\nThis is the first post served from MySQL via tRPC.\\n\\n- Contact form and newsletter now hit the live API.\n- Admin features will be enabled next with minimal auth.`,
      status: "published",
      publishedAt: now,
    });

    await createBlogPost({
      title: "Signals and Systems",
      slug: "signals-and-systems",
      excerpt: "Transmission clear.",
      content: `# Signals and Systems\n\nWe are online. Expect updates on releases, events, and dev logs.`,
      status: "published",
      publishedAt: now,
    });

    console.log("Seed completed: blog posts inserted.");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
}

main();
