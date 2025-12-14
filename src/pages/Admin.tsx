import { useState } from "react";
import { trpc } from "../lib/trpc";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Calendar, FileText } from "lucide-react";
import ImageUploader from "../components/ImageUploader";

export default function Admin() {
  const [openId, setOpenId] = useState<string>(() => localStorage.getItem("admin-openid") || "");

  const contactQuery = trpc.admin.getContactMessages.useQuery(undefined, { enabled: false });
  const subsQuery = trpc.admin.getNewsletterSubscribers.useQuery(undefined, { enabled: false });

  const postsQuery = trpc.admin.getAllBlogPosts.useQuery(undefined, { enabled: false });
  const createPost = trpc.admin.createBlogPost.useMutation();
  const updatePost = trpc.admin.updateBlogPost.useMutation();
  const deletePost = trpc.admin.deleteBlogPost.useMutation();
  const unsubscribeEmail = trpc.admin.unsubscribeEmail.useMutation();

  const tagsQuery = trpc.blog.getAllTags.useQuery(undefined, { enabled: false });
  const createTag = trpc.admin.createBlogTag.useMutation();
  const addTag = trpc.admin.addTagToPost.useMutation();
  const removeTag = trpc.admin.removeTagFromPost.useMutation();


  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    status: "draft" as "draft" | "published",
  });
  const [autoSlug, setAutoSlug] = useState(true);
  const [showLivePreview, setShowLivePreview] = useState(false);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // remove special chars
      .replace(/\s+/g, '-')      // spaces to hyphens
      .replace(/-+/g, '-')       // collapse multiple hyphens
      .replace(/^-+|-+$/g, '');  // trim hyphens
  };

  const handleTitleChange = (title: string) => {
    setForm((f) => ({
      ...f,
      title,
      slug: autoSlug ? generateSlug(title) : f.slug,
    }));
  };

  const handleSlugChange = (slug: string) => {
    setAutoSlug(false); // user manually edited slug, disable auto
    setForm((f) => ({ ...f, slug }));
  };

  const handleSave = () => {
    localStorage.setItem("admin-openid", openId.trim());
    alert("Admin OpenId saved. Reload admin data.");
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ title: "", slug: "", excerpt: "", content: "", status: "draft" });
    setAutoSlug(true);
  };

  const validateSlug = (slug: string): string | null => {
    if (!slug || slug.trim() === "") {
      return "Slug cannot be empty";
    }
    // Check valid slug format
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return "Slug must be lowercase letters, numbers, and hyphens only (no spaces or special chars)";
    }
    // Check for duplicate slug (exclude current post if editing)
    const duplicate = (postsQuery.data || []).find(
      (p: any) => p.slug === slug && p.id !== editingId
    );
    if (duplicate) {
      return `Slug "${slug}" is already used by post: "${duplicate.title}"`;
    }
    return null;
  };

  const submitForm = async () => {
    if (!form.title || !form.slug || !form.content) {
      alert("Title, Slug, and Content are required");
      return;
    }

    const slugError = validateSlug(form.slug);
    if (slugError) {
      alert(slugError);
      return;
    }

    try {
      if (editingId) {
        await updatePost.mutateAsync({
          id: editingId,
          title: form.title,
          slug: form.slug,
          content: form.content,
          excerpt: form.excerpt || undefined,
          status: form.status,
        });
        alert("Post updated successfully!");
      } else {
        await createPost.mutateAsync({
          title: form.title,
          slug: form.slug,
          content: form.content,
          excerpt: form.excerpt || undefined,
          status: form.status,
        });
        alert("Post created successfully!");
      }
      await postsQuery.refetch();
      resetForm();
    } catch (error: any) {
      console.error("Submit error:", error);
      alert(`Error: ${error.message || "Failed to save post"}`);
    }
  };

  const onEdit = (p: any) => {
    setEditingId(p.id);
    setForm({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt || "",
      content: p.content,
      status: p.status,
    });
    setAutoSlug(false); // editing existing post, don't auto-generate
  }

  const onDelete = async (id: number) => {
    if (!confirm("Delete this post?")) return;
    await deletePost.mutateAsync({ id });
    await postsQuery.refetch();
  };

  const onUnsubscribe = async (email: string) => {
    if (!confirm(`Unsubscribe ${email}?`)) return;
    await unsubscribeEmail.mutateAsync({ email });
    await subsQuery.refetch();
  };

  return (
    <div className="min-h-screen bg-black text-primary">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-mono text-accent">Admin Panel (Minimal)</h1>
        <div className="border border-primary/30 p-4 space-y-2">
          <label className="text-sm font-mono">OWNER_OPEN_ID</label>
          <input
            value={openId}
            onChange={(e) => setOpenId(e.target.value)}
            placeholder="paste your OWNER_OPEN_ID"
            className="w-full bg-transparent border border-primary/30 p-2 font-mono"
          />
          <button onClick={handleSave} className="mt-2 border border-accent px-3 py-1 text-accent hover:bg-accent hover:text-black font-mono">Save</button>
          <p className="text-xs text-muted-foreground font-mono">Requests include header X-OpenId from localStorage.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Tag Create Panel */}
          <div className="border border-primary/30 p-4 space-y-2">
            <h2 className="font-mono text-primary">Create Tag</h2>
            <TagCreate onCreated={() => tagsQuery.refetch()} />
          </div>
          {/* Blog Posts Management */}
          <div className="border border-primary/30 p-4 space-y-3 md:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-primary">Blog Posts</h2>
              <div className="flex gap-2">
                <button onClick={() => postsQuery.refetch()} className="border border-primary px-2 py-1 font-mono hover:bg-primary hover:text-black">Reload</button>
                <button onClick={resetForm} className="border border-accent px-2 py-1 font-mono text-accent hover:bg-accent hover:text-black">New</button>
                <button onClick={() => setShowLivePreview(!showLivePreview)} className={`border px-2 py-1 font-mono ${showLivePreview ? 'border-accent text-accent bg-accent/10' : 'border-primary/30'}`}>
                  {showLivePreview ? 'Hide' : 'Show'} Preview
                </button>
              </div>
            </div>

            {/* Form and Preview */}
            <div className={`grid gap-4 ${showLivePreview ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
              {/* Form */}
              <div className="space-y-2">
              <input value={form.title} onChange={(e)=>handleTitleChange(e.target.value)} placeholder="Title" className="w-full bg-transparent border border-primary/30 p-2 font-mono" />
              <div>
                <div className="flex items-center gap-2">
                  <input value={form.slug} onChange={(e)=>handleSlugChange(e.target.value)} placeholder="Slug (auto-generated)" className="flex-1 bg-transparent border border-primary/30 p-2 font-mono" />
                  <button type="button" onClick={()=>setAutoSlug(true)} className="border border-primary/30 px-2 py-1 text-xs font-mono hover:bg-primary hover:text-black" title="Re-enable auto slug from title">Auto</button>
                </div>
                {form.slug && validateSlug(form.slug) && (
                  <div className="text-xs text-accent mt-1 font-mono">{validateSlug(form.slug)}</div>
                )}
              </div>
              <input value={form.excerpt} onChange={(e)=>setForm(f=>({...f,excerpt:e.target.value}))} placeholder="Excerpt (optional)" className="w-full bg-transparent border border-primary/30 p-2 font-mono" />
              <ImageUploader onImageUrl={(url) => {
                const markdown = `![image](${url})`;
                setForm(f => ({ ...f, content: f.content + '\n' + markdown }));
              }} />
              <textarea value={form.content} onChange={(e)=>setForm(f=>({...f,content:e.target.value}))} placeholder="Content (markdown)" rows={8} className="w-full bg-transparent border border-primary/30 p-2 font-mono" />
              <div className="flex items-center gap-3">
                <label className="font-mono text-sm">Status</label>
                <select value={form.status} onChange={(e)=>setForm(f=>({...f,status:e.target.value as any}))} className="bg-transparent border border-primary/30 p-1 font-mono">
                  <option value="draft">draft</option>
                  <option value="published">published</option>
                </select>
                <button 
                  type="button"
                  onClick={() => {
                    if (!form.slug) {
                      alert("Generate a slug first");
                      return;
                    }
                    const previewUrl = `/blog/${form.slug}`;
                    window.open(previewUrl, '_blank');
                  }}
                  className="border border-accent px-3 py-1 font-mono text-accent hover:bg-accent hover:text-black"
                  title="Preview in new tab (shows saved version)"
                >
                  Preview
                </button>
                <button onClick={submitForm} className="ml-auto border border-primary px-3 py-1 font-mono hover:bg-primary hover:text-black">{editingId?"Update":"Create"}</button>
              </div>
              </div>

              {/* Live Preview */}
              {showLivePreview && (
                <div className="border border-accent/30 p-4 bg-black/30 overflow-y-auto max-h-[600px]">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <FileText className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h1 className="text-2xl font-bold text-accent font-mono mb-2">
                          {form.title || "Untitled Post"}
                        </h1>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground font-mono mb-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                          </div>
                          <span className="text-xs px-2 py-1 border border-primary text-primary bg-black/50">
                            {form.status.toUpperCase()}
                          </span>
                        </div>
                        {form.excerpt && (
                          <p className="text-primary text-sm italic border-l-2 border-accent pl-3 py-1 mb-2">
                            {form.excerpt}
                          </p>
                        )}
                        <div className="text-xs text-muted-foreground font-mono">
                          URL: /blog/{form.slug || "your-slug-here"}
                        </div>
                      </div>
                    </div>

                    <div className="prose prose-invert prose-sm max-w-none">
                      <div className="border border-accent/20 p-4 bg-black/50">
                        {form.content ? (
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.content}</ReactMarkdown>
                        ) : (
                          <p className="text-muted-foreground italic">Content preview will appear here...</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* List */}
            <ul className="space-y-2 text-sm font-mono">
              {(postsQuery.data || []).map((p: any) => (
                <li key={p.id} className="border border-primary/20 p-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-accent">{p.title}</}</div>
                      <div className="text-muted-foreground">/{p.slug}</div>
                      <div className="text-xs text-muted-foreground">Created: {p.createdAt ? new Date(p.createdAt).toLocaleString() : '—'}</div>
                      <div className="text-xs text-muted-foreground">Published: {p.publishedAt ? new Date(p.publishedAt).toLocaleString() : '—'}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => onEdit(p)} className="border border-primary px-2 py-1 hover:bg-primary hover:text-black">Edit</button>
                      <button onClick={() => onDelete(p.id)} className="border border-accent px-2 py-1 text-accent hover:bg-accent hover:text-black">Delete</button>
                    </div>
                  </div>

                  {/* Tag management per post */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => tagsQuery.refetch()} className="border border-primary/30 px-2 py-0.5">Refresh Tags</button>
                    {(tagsQuery.data || []).map((t: any) => (
                      <button key={t.id} onClick={() => addTag.mutate({ postId: p.id, tagId: t.id })} className="border border-primary/30 px-2 py-0.5 hover:bg-primary hover:text-black">+ {t.name}</button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="border border-primary/30 p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-mono text-primary">Contact Messages</h2>
              <button onClick={() => contactQuery.refetch()} className="border border-primary px-2 py-1 font-mono hover:bg-primary hover:text-black">Load</button>
            </div>
            {contactQuery.isFetching && <div className="text-xs font-mono">Loading...</div>}
            {contactQuery.error && <div className="text-xs text-accent font-mono">{String(contactQuery.error.message)}</div>}
            <ul className="space-y-2 text-sm font-mono">
              {(contactQuery.data || []).map((m: any) => (
                <li key={m.id} className="border border-primary/20 p-2">
                  <div className="text-accent">{m.name} &lt;{m.email}&gt;</div>
                  <div className="text-primary/80 whitespace-pre-wrap">{m.message}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="border border-primary/30 p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-mono text-primary">Newsletter Subscribers</h2>
              <div className="flex gap-2">
                <button onClick={() => tagsQuery.refetch()} className="border border-primary px-2 py-1 font-mono hover:bg-primary hover:text-black">Load Tags</button>
                <button onClick={() => subsQuery.refetch()} className="border border-primary px-2 py-1 font-mono hover:bg-primary hover:text-black">Load Subscribers</button>
              </div>
            </div>
            {subsQuery.isFetching && <div className="text-xs font-mono">Loading...</div>}
            {subsQuery.error && <div className="text-xs text-accent font-mono">{String(subsQuery.error.message)}</div>}
            <ul className="space-y-2 text-sm font-mono">
              {(subsQuery.data || []).map((s: any) => (
                <li key={s.id} className="border border-primary/20 p-2 flex items-center justify-between">
                  <div>
                    <div className="text-accent">{s.email}</div>
                    <div className="text-primary/80">Active: {s.isActive ? "Yes" : "No"}</div>
                  </div>
                  <button onClick={() => onUnsubscribe(s.email)} className="border border-accent px-2 py-1 text-accent hover:bg-accent hover:text-black">Unsubscribe</button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-xs text-muted-foreground font-mono">Note: Admin endpoints are protected server-side. The server checks OWNER_OPEN_ID.</p>
      </div>
    </div>
  );
}

function TagCreate({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const createTag = trpc.admin.createBlogTag.useMutation();
  const submit = async () => {
    if (!name || !slug) return alert("Name and slug required");
    await createTag.mutateAsync({ name, slug });
    setName("");
    setSlug("");
    onCreated();
  };
  return (
    <div className="space-y-2">
      <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Tag name" className="w-full bg-transparent border border-primary/30 p-2 font-mono" />
      <input value={slug} onChange={(e)=>setSlug(e.target.value)} placeholder="slug" className="w-full bg-transparent border border-primary/30 p-2 font-mono" />
      <button onClick={submit} className="border border-primary px-3 py-1 font-mono hover:bg-primary hover:text-black">Create Tag</button>
    </div>
  );
}
