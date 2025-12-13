import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Trash2, LogOut, Mail, MessageSquare, Lock, Download, Trash, TrendingUp, FileText } from "lucide-react";
import { useLocation } from "wouter";
import BlogManager from "@/components/BlogManager";

export default function AdminDashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"messages" | "subscribers" | "blog">("messages");
  const [selectedSubscribers, setSelectedSubscribers] = useState<Set<number>>(new Set());

  const contactMessagesQuery = trpc.admin.getContactMessages.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const subscribersQuery = trpc.admin.getNewsletterSubscribers.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const unsubscribeMutation = trpc.admin.unsubscribeEmail.useMutation({
    onSuccess: () => {
      subscribersQuery.refetch();
      setSelectedSubscribers(new Set());
    },
  });

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const handleUnsubscribe = (email: string) => {
    if (confirm(`Unsubscribe ${email} from newsletter?`)) {
      unsubscribeMutation.mutate({ email });
    }
  };

  const handleLogin = () => {
    window.location.href = getLoginUrl();
  };

  const toggleSubscriberSelection = (id: number) => {
    const newSelected = new Set(selectedSubscribers);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedSubscribers(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedSubscribers.size === subscribersQuery.data?.length) {
      setSelectedSubscribers(new Set());
    } else {
      const allIds = new Set(subscribersQuery.data?.map((s) => s.id) || []);
      setSelectedSubscribers(allIds);
    }
  };

  const handleBulkUnsubscribe = () => {
    if (selectedSubscribers.size === 0) {
      alert("Please select at least one subscriber");
      return;
    }

    if (confirm(`Unsubscribe ${selectedSubscribers.size} subscriber(s)?`)) {
      const selectedEmails = subscribersQuery.data
        ?.filter((s) => selectedSubscribers.has(s.id))
        .map((s) => s.email) || [];

      selectedEmails.forEach((email) => {
        unsubscribeMutation.mutate({ email });
      });
    }
  };

  const handleExportCSV = () => {
    if (!subscribersQuery.data || subscribersQuery.data.length === 0) {
      alert("No subscribers to export");
      return;
    }

    const selectedData =
      selectedSubscribers.size > 0
        ? subscribersQuery.data.filter((s) => selectedSubscribers.has(s.id))
        : subscribersQuery.data;

    const headers = ["Email", "Subscribed Date", "Status"];
    const rows = selectedData.map((sub) => [
      sub.email,
      new Date(sub.subscribedAt).toISOString(),
      "ACTIVE",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `newsletter_subscribers_${Date.now()}.csv`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-primary font-mono flex items-center justify-center">
        {/* CRT Overlay */}
        <div className="fixed inset-0 z-50 crt-overlay opacity-50 pointer-events-none"></div>

        <div className="w-full h-full max-w-2xl p-8 font-mono text-sm md:text-base text-primary flex flex-col justify-center items-center relative z-10">
          <div className="border-2 border-accent p-8 bg-black text-center max-w-md w-full">
            <Lock className="w-16 h-16 text-accent mx-auto mb-6 animate-pulse" />

            <h1 className="text-2xl font-bold text-accent mb-2 tracking-widest">ADMIN_ACCESS</h1>
            <p className="text-muted-foreground mb-6 text-sm">AUTHENTICATION_REQUIRED</p>

            <p className="text-primary mb-8 text-sm leading-relaxed">
              You must authenticate to access the admin dashboard. Click below to sign in via OAuth.
            </p>

            <button
              onClick={handleLogin}
              className="w-full px-6 py-3 border-2 border-accent text-accent hover:bg-accent hover:text-black transition-all font-bold tracking-widest mb-4"
            >
              LOGIN_TO_ADMIN
            </button>

            <button
              onClick={() => setLocation("/")}
              className="w-full px-6 py-3 border-2 border-primary text-primary hover:bg-primary hover:text-black transition-all font-bold tracking-widest"
            >
              RETURN_HOME
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-primary font-mono">
      {/* Header */}
      <div className="border-b border-accent bg-black p-4 shadow-[0_0_15px_rgba(255,0,85,0.1)]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-accent tracking-widest">ADMIN_TERMINAL</h1>
            <p className="text-xs text-muted-foreground mt-1">
              LOGGED_IN_AS: {user?.name || user?.email || "UNKNOWN"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 border border-accent text-accent hover:bg-accent hover:text-black transition-all"
          >
            <LogOut className="w-4 h-4" />
            LOGOUT
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        {/* Analytics Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Total Messages Card */}
          <div className="border border-accent/30 p-4 bg-black/50 hover:border-accent transition-all hover:shadow-[0_0_10px_rgba(0,255,150,0.1)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">TOTAL_MESSAGES</p>
                <p className="text-3xl font-bold text-accent">{contactMessagesQuery.data?.length || 0}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-accent/50" />
            </div>
          </div>

          {/* Total Subscribers Card */}
          <div className="border border-accent/30 p-4 bg-black/50 hover:border-accent transition-all hover:shadow-[0_0_10px_rgba(0,255,150,0.1)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">ACTIVE_SUBSCRIBERS</p>
                <p className="text-3xl font-bold text-accent">{subscribersQuery.data?.length || 0}</p>
              </div>
              <Mail className="w-8 h-8 text-accent/50" />
            </div>
          </div>

          {/* System Status Card */}
          <div className="border border-accent/30 p-4 bg-black/50 hover:border-accent transition-all hover:shadow-[0_0_10px_rgba(0,255,150,0.1)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">SYSTEM_STATUS</p>
                <p className="text-3xl font-bold text-primary">ONLINE</p>
              </div>
              <div className="w-8 h-8 border-2 border-primary rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-accent/30">
          <button
            onClick={() => setActiveTab("messages")}
            className={`px-4 py-2 border-b-2 transition-all ${
              activeTab === "messages"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-primary"
            }`}
          >
            <MessageSquare className="w-4 h-4 inline mr-2" />
            CONTACT_MESSAGES ({contactMessagesQuery.data?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("subscribers")}
            className={`px-4 py-2 border-b-2 transition-all ${
              activeTab === "subscribers"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-primary"
            }`}
          >
            <Mail className="w-4 h-4 inline mr-2" />
            NEWSLETTER_SUBSCRIBERS ({subscribersQuery.data?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("blog")}
            className={`px-4 py-2 border-b-2 transition-all ${
              activeTab === "blog"
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-primary"
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            BLOG_POSTS
          </button>
        </div>

        {/* Contact Messages Tab */}
        {activeTab === "messages" && (
          <div className="space-y-4">
            {contactMessagesQuery.isLoading ? (
              <div className="text-center py-8">
                <span className="text-accent animate-pulse">LOADING_MESSAGES...</span>
              </div>
            ) : contactMessagesQuery.data?.length === 0 ? (
              <div className="border border-accent/30 p-4 text-center text-muted-foreground">
                NO_MESSAGES_FOUND
              </div>
            ) : (
              <div className="space-y-3">
                {contactMessagesQuery.data?.map((message) => (
                  <div
                    key={message.id}
                    className="border border-accent/30 p-4 hover:border-accent transition-all hover:shadow-[0_0_10px_rgba(255,0,85,0.1)]"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-accent font-bold">{message.name}</p>
                        <p className="text-xs text-muted-foreground">{message.email}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(message.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-primary text-sm whitespace-pre-wrap">{message.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Blog Posts Tab */}
        {activeTab === "blog" && (
          <BlogManager />
        )}

        {/* Newsletter Subscribers Tab */}
        {activeTab === "subscribers" && (
          <div className="space-y-4">
            {/* Bulk Actions Bar */}
            {subscribersQuery.data && subscribersQuery.data.length > 0 && (
              <div className="border border-accent/30 p-4 bg-black/50 flex gap-3 items-center flex-wrap">
                <span className="text-sm text-muted-foreground">
                  {selectedSubscribers.size > 0
                    ? `${selectedSubscribers.size} SELECTED`
                    : "SELECT_SUBSCRIBERS_FOR_BULK_ACTIONS"}
                </span>

                {selectedSubscribers.size > 0 && (
                  <>
                    <button
                      onClick={handleBulkUnsubscribe}
                      disabled={unsubscribeMutation.isPending}
                      className="flex items-center gap-2 px-3 py-1 text-xs border border-destructive text-destructive hover:bg-destructive hover:text-black transition-all disabled:opacity-50"
                    >
                      <Trash className="w-3 h-3" />
                      BULK_UNSUBSCRIBE
                    </button>

                    <button
                      onClick={handleExportCSV}
                      className="flex items-center gap-2 px-3 py-1 text-xs border border-primary text-primary hover:bg-primary hover:text-black transition-all"
                    >
                      <Download className="w-3 h-3" />
                      EXPORT_SELECTED
                    </button>
                  </>
                )}

                {selectedSubscribers.size === 0 && subscribersQuery.data.length > 0 && (
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-3 py-1 text-xs border border-primary text-primary hover:bg-primary hover:text-black transition-all"
                  >
                    <Download className="w-3 h-3" />
                    EXPORT_ALL
                  </button>
                )}
              </div>
            )}

            {/* Subscribers Table */}
            {subscribersQuery.isLoading ? (
              <div className="text-center py-8">
                <span className="text-accent animate-pulse">LOADING_SUBSCRIBERS...</span>
              </div>
            ) : subscribersQuery.data?.length === 0 ? (
              <div className="border border-accent/30 p-4 text-center text-muted-foreground">
                NO_SUBSCRIBERS_FOUND
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-accent/30">
                      <th className="text-left p-3 text-accent w-8">
                        <input
                          type="checkbox"
                          checked={
                            subscribersQuery.data && subscribersQuery.data.length > 0 &&
                            selectedSubscribers.size === subscribersQuery.data.length
                          }
                          onChange={toggleSelectAll}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </th>
                      <th className="text-left p-3 text-accent">EMAIL</th>
                      <th className="text-left p-3 text-accent">SUBSCRIBED_DATE</th>
                      <th className="text-left p-3 text-accent">STATUS</th>
                      <th className="text-left p-3 text-accent">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribersQuery.data?.map((subscriber) => (
                      <tr
                        key={subscriber.id}
                        className="border-b border-accent/20 hover:bg-accent/5 transition-all"
                      >
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedSubscribers.has(subscriber.id)}
                            onChange={() => toggleSubscriberSelection(subscriber.id)}
                            className="w-4 h-4 cursor-pointer"
                          />
                        </td>
                        <td className="p-3 text-primary">{subscriber.email}</td>
                        <td className="p-3 text-muted-foreground text-xs">
                          {new Date(subscriber.subscribedAt).toLocaleString()}
                        </td>
                        <td className="p-3">
                          <span className="text-primary font-bold">ACTIVE</span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleUnsubscribe(subscriber.email)}
                            disabled={unsubscribeMutation.isPending}
                            className="flex items-center gap-1 px-2 py-1 text-xs border border-destructive text-destructive hover:bg-destructive hover:text-black transition-all disabled:opacity-50"
                          >
                            <Trash2 className="w-3 h-3" />
                            UNSUBSCRIBE
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Status */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-accent/30 bg-black p-2 text-xs text-muted-foreground">
        <span className="text-accent">{">"}</span> SYSTEM_STATUS: ONLINE | LAST_REFRESH:{" "}
        {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}
