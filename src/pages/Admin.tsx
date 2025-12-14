import { useState } from "react";
import { trpc } from "../lib/trpc";

export default function Admin() {
  const [openId, setOpenId] = useState<string>(() => localStorage.getItem("admin-openid") || "");

  const contactQuery = trpc.admin.getContactMessages.useQuery(undefined, { enabled: false });
  const subsQuery = trpc.admin.getNewsletterSubscribers.useQuery(undefined, { enabled: false });

  const handleSave = () => {
    localStorage.setItem("admin-openid", openId.trim());
    alert("Admin OpenId saved. Reload admin data.");
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
              <button onClick={() => subsQuery.refetch()} className="border border-primary px-2 py-1 font-mono hover:bg-primary hover:text-black">Load</button>
            </div>
            {subsQuery.isFetching && <div className="text-xs font-mono">Loading...</div>}
            {subsQuery.error && <div className="text-xs text-accent font-mono">{String(subsQuery.error.message)}</div>}
            <ul className="space-y-2 text-sm font-mono">
              {(subsQuery.data || []).map((s: any) => (
                <li key={s.id} className="border border-primary/20 p-2">
                  <div className="text-accent">{s.email}</div>
                  <div className="text-primary/80">Active: {s.isActive ? "Yes" : "No"}</div>
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
