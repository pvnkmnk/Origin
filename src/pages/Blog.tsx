import { useMemo, useState } from "react";
import { Link } from "wouter";
import { trpc } from "../lib/trpc";
import { FileText, Calendar, ArrowRight, X } from "lucide-react";
import { useLocation } from "wouter";

export default function Blog() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const postsQuery = trpc.blog.getPublishedPosts.useQuery();
  const tagsQuery = trpc.blog.getAllTags.useQuery();
  const [activeTag, setActiveTag] = useState<number | null>(null);

  // Extract all unique tags from posts
  const allTags = useMemo(() => {
    if (!postsQuery.data) return [];
    const tags = new Set<string>();
    postsQuery.data.forEach((post) => {
      post.tags?.forEach((tag) => tags.add(tag.name));
    });
    return Array.from(tags).sort();
  }, [postsQuery.data]);

  // Filter posts based on search query and selected tags
  const filteredPosts = useMemo(() => {
    if (!postsQuery.data) return [];
    return postsQuery.data.filter((post) => {
      // Search query filter
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());

      // Tag filter
      const postTags = post.tags?.map((tag) => tag.name) || [];
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => postTags.includes(tag));

      return matchesSearch && matchesTags;
    });
  }, [postsQuery.data, searchQuery, selectedTags]);

  const handlePostClick = (slug: string) => {
    setLocation(`/blog/${slug}`);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Unpublished";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-black text-primary">
      {/* Header */}
      <div className="border-b border-accent/30 py-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-accent" />
            <h1 className="text-3xl md:text-4xl font-bold text-accent font-mono">
              BLOG
            </h1>
          </div>
          <p className="text-muted-foreground text-sm md:text-base">
            &gt; ACCESSING_NEURAL_DATABASE.BLOG_POSTS... ({filteredPosts.length} POSTS_FOUND)
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="border-b border-accent/30 py-6 px-4 md:px-8 bg-black/50">
        <div className="max-w-6xl mx-auto">
          <div className="relative mb-6">
            <span className="absolute left-3 top-3 text-accent text-sm">&gt;</span>
            <input
              type="text"
              placeholder="SEARCH_POSTS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-4 py-2 bg-black border border-accent/30 text-primary placeholder-muted-foreground focus:border-accent outline-none font-mono text-sm transition-all"
            />
          </div>

          {/* Tags Filter */}
          {allTags.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground font-mono">
                FILTER_BY_TAGS:
              </p>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 text-xs font-mono border transition-all ${
                      selectedTags.includes(tag)
                        ? "border-accent bg-accent text-black"
                        : "border-accent/30 text-accent hover:border-accent"
                    }`}
                  >
                    {tag.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Active Tags Display */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-accent/20">
                  {selectedTags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/30 text-accent text-xs font-mono"
                    >
                      <span>{tag}</span>
                      <button
                        onClick={() => toggleTag(tag)}
                        className="hover:text-primary transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setSelectedTags([])}
                    className="px-3 py-1 text-xs font-mono border border-accent/30 text-muted-foreground hover:text-accent transition-colors"
                  >
                    CLEAR_ALL
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Posts Grid */}
      <div className="py-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {postsQuery.isLoading ? (
            <div className="text-center py-12">
              <span className="text-accent animate-pulse font-mono">
                LOADING_POSTS...
              </span>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="border border-accent/30 p-8 text-center bg-black/50">
              <p className="text-muted-foreground font-mono">
                NO_POSTS_FOUND. TRY_DIFFERENT_SEARCH_QUERY_OR_TAGS.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => handlePostClick(post.slug)}
                  className="group border border-accent/30 p-6 bg-black hover:border-accent hover:shadow-[0_0_15px_rgba(0,255,150,0.15)] transition-all cursor-pointer"
                >
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-4">
                    <FileText className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-xs px-2 py-1 border border-primary text-primary bg-black/50">
                      {post.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Post Title */}
                  <h2 className="text-lg font-bold text-accent mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h2>

                  {/* Post Excerpt */}
                  {post.excerpt && (
                    <p className="text-sm text-primary mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Post Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="text-xs px-2 py-1 bg-accent/10 border border-accent/30 text-accent font-mono"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Post Meta */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 border-t border-accent/20 pt-4">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(post.publishedAt)}</span>
                  </div>

                  {/* Read More Link */}
                  <div className="flex items-center gap-2 text-accent text-sm font-mono group-hover:gap-3 transition-all">
                    <span>READ_POST</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>

                  {/* Glitch Effect on Hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="border-t border-accent/30 py-8 px-4 md:px-8 bg-black/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="border border-accent/20 p-4">
              <p className="text-2xl font-bold text-accent">
                {filteredPosts.length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">POSTS_FOUND</p>
            </div>
            <div className="border border-accent/20 p-4">
              <p className="text-2xl font-bold text-primary">
                {postsQuery.data?.length || 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1">TOTAL_POSTS</p>
            </div>
            <div className="border border-accent/20 p-4">
              <p className="text-2xl font-bold text-accent">
                {allTags.length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">TOTAL_TAGS</p>
            </div>
            <div className="border border-accent/20 p-4">
              <p className="text-2xl font-bold text-primary">ACTIVE</p>
              <p className="text-xs text-muted-foreground mt-1">STATUS</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
