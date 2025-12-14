import { createBlogPost, createBlogTag, addTagToPost } from "../db.js";

async function main() {
  try {
    const now = new Date();

    // Create some tags
    const tags = [
      { name: "announcement", slug: "announcement" },
      { name: "release", slug: "release" },
      { name: "cyberpunk", slug: "cyberpunk" },
      { name: "visuals", slug: "visuals" },
    ];
    const createdTags: any[] = [];
    for (const t of tags) {
      const ct = await (createBlogTag as any)({ ...t } as any);
      createdTags.push(ct?.insertId ? { id: ct.insertId, ...t } : ct);
    }

    const findTagId = (slug: string) => (createdTags.find((t) => t?.slug === slug)?.id) || undefined;

    await createBlogPost({
      title: "Welcome to JOYDAO.Z",
      slug: "welcome-to-joydao",
      excerpt: "Booting up the creative terminal...",
      content: `# Hello Agent\n\nThis is the first post served from MySQL via tRPC.\\n\\n- Contact form and newsletter now hit the live API.\n- Admin features will be enabled next with minimal auth.`,
      status: "published",
      publishedAt: now,
    });

    const post2 = await createBlogPost({
      title: "Signals and Systems",
      slug: "signals-and-systems",
      excerpt: "Transmission clear.",
      content: `# Signals and Systems\n\nWe are online. Expect updates on releases, events, and dev logs.`,
      status: "published",
      publishedAt: now,
    });

    // Additional posts referencing Instagram content (placeholders)
    const igPosts = [
      {
        title: "Neon Field Recording",
        slug: "neon-field-recording",
        excerpt: "Captured frequencies.",
        content: `# Neon Field Recording\n\nCaptured ambient signals. See visuals on Instagram: https://instagram.com/joydao.light`,
        tags: ["visuals", "cyberpunk"],
      },
      {
        title: "Studio Pulse",
        slug: "studio-pulse",
        excerpt: "Work-in-progress from the lab.",
        content: `# Studio Pulse\n\nLive patch explorations and process notes. See more: https://instagram.com/joydao.light`,
        tags: ["release"],
      },
    ];

    for (const p of igPosts) {
      const result = await createBlogPost({
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content: p.content,
        status: "published",
        publishedAt: now,
      });
      const postId = (result as any)?.insertId; // MySQL result
      if (postId) {
        for (const slug of p.tags) {
          const tagId = findTagId(slug);
          if (tagId) {
            await addTagToPost(postId, tagId);
          }
        }
      }
    }

    console.log("Seed completed: blog posts and tags inserted.");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
}

main();
