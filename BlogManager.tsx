import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { FileText, Plus, Edit2, Trash2, Save, X } from "lucide-react";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  status: "draft" | "published";
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function BlogManager() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    status: "draft" as "draft" | "published",
  });

  const postsQuery = trpc.admin.getAllBlogPosts.useQuery();
  const createMutation = trpc.admin.createBlogPost.useMutation({
    onSuccess: () => {
      postsQuery.refetch();
      resetForm();
    },
  });
  const updateMutation = trpc.admin.updateBlogPost.useMutation({
    onSuccess: () => {
      postsQuery.refetch();
      resetForm();
    },
  });
  const deleteMutation = trpc.admin.deleteBlogPost.useMutation({
    onSuccess: () => {
      postsQuery.refetch();
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      status: "draft",
    });
    setIsCreating(false);
    setEditingId(null);
  };

  const handleEdit = (post: BlogPost) => {
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content,
      status: post.status,
    });
    setEditingId(post.id);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.slug || !formData.content) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          ...formData,
        });
      } else {
        await createMutation.mutateAsync(formData);
      }
    } catch (error) {
      console.error("Error saving blog post:", error);
      alert("Failed to save blog post");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this post?")) {
      try {
        await deleteMutation.mutateAsync({ id });
      } catch (error) {
        console.error("Error deleting blog post:", error);
        alert("Failed to delete blog post");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Create/Edit Form */}
      {(isCreating || editingId) && (
        <div className="border border-accent/30 p-4 bg-black/50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-accent font-bold">
              {editingId ? "EDIT_POST" : "CREATE_NEW_POST"}
            </h3>
            <button
              onClick={resetForm}
              className="text-muted-foreground hover:text-primary"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">TITLE</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 bg-black border border-accent/30 text-primary text-sm focus:border-accent outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground">SLUG</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                className="w-full px-3 py-2 bg-black border border-accent/30 text-primary text-sm focus:border-accent outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground">EXCERPT</label>
              <input
                type="text"
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData({ ...formData, excerpt: e.target.value })
                }
                className="w-full px-3 py-2 bg-black border border-accent/30 text-primary text-sm focus:border-accent outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground">CONTENT (MARKDOWN)</label>
              <textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                rows={8}
                className="w-full px-3 py-2 bg-black border border-accent/30 text-primary text-sm focus:border-accent outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground">STATUS</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as "draft" | "published",
                  })
                }
                className="w-full px-3 py-2 bg-black border border-accent/30 text-primary text-sm focus:border-accent outline-none"
              >
                <option value="draft">DRAFT</option>
                <option value="published">PUBLISHED</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 border border-accent text-accent hover:bg-accent hover:text-black transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                SAVE_POST
              </button>
              <button
                onClick={resetForm}
                className="flex items-center gap-2 px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-black transition-all"
              >
                <X className="w-4 h-4" />
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Button */}
      {!isCreating && !editingId && (
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 border border-accent text-accent hover:bg-accent hover:text-black transition-all"
        >
          <Plus className="w-4 h-4" />
          CREATE_NEW_POST
        </button>
      )}

      {/* Posts List */}
      <div className="space-y-3">
        {postsQuery.isLoading ? (
          <div className="text-center py-8">
            <span className="text-accent animate-pulse">LOADING_POSTS...</span>
          </div>
        ) : postsQuery.data?.length === 0 ? (
          <div className="border border-accent/30 p-4 text-center text-muted-foreground">
            NO_BLOG_POSTS_FOUND
          </div>
        ) : (
          postsQuery.data?.map((post) => (
            <div
              key={post.id}
              className="border border-accent/30 p-4 hover:border-accent transition-all hover:shadow-[0_0_10px_rgba(0,255,150,0.1)]"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-accent" />
                    <p className="text-accent font-bold">{post.title}</p>
                    <span
                      className={`text-xs px-2 py-1 border ${
                        post.status === "published"
                          ? "border-primary text-primary"
                          : "border-muted-foreground text-muted-foreground"
                      }`}
                    >
                      {post.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">/{post.slug}</p>
                  {post.excerpt && (
                    <p className="text-xs text-primary mt-2">{post.excerpt}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleEdit(post)}
                  className="flex items-center gap-1 px-2 py-1 text-xs border border-primary text-primary hover:bg-primary hover:text-black transition-all"
                >
                  <Edit2 className="w-3 h-3" />
                  EDIT
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="flex items-center gap-1 px-2 py-1 text-xs border border-destructive text-destructive hover:bg-destructive hover:text-black transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                  DELETE
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
