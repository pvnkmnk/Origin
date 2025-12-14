import { useState } from "react";
import { Send } from "lucide-react";
import { trpc } from "../lib/trpc";

interface FormData {
  name: string;
  email: string;
  message: string;
}

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  });
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [statusMessage, setStatusMessage] = useState("");

  const contactMutation = trpc.contact.submit.useMutation();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.message) {
      setSubmitStatus("error");
      setStatusMessage("ERROR: ALL_FIELDS_REQUIRED");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setSubmitStatus("error");
      setStatusMessage("ERROR: INVALID_EMAIL_FORMAT");
      return;
    }

    setSubmitStatus("idle");

    try {
      await contactMutation.mutateAsync({
        name: formData.name,
        email: formData.email,
        message: formData.message,
      });

      setSubmitStatus("success");
      setStatusMessage("✓ MESSAGE_TRANSMITTED_SUCCESSFULLY");
      setFormData({ name: "", email: "", message: "" });

      // Reset status after 3 seconds
      setTimeout(() => {
        setSubmitStatus("idle");
        setStatusMessage("");
      }, 3000);
    } catch (error) {
      setSubmitStatus("error");
      setStatusMessage("ERROR: TRANSMISSION_FAILED");
      console.error("Contact form error:", error);
    }
  };

  const isSubmitting = contactMutation.isPending;

  return (
    <section className="border border-accent bg-black p-1 shadow-[0_0_15px_rgba(255,0,85,0.2)]">
      <div className="bg-accent text-black px-2 py-1 flex justify-between items-center text-xs font-bold mb-2">
        <span>TERMINAL_04: CONTACT_PROTOCOL</span>
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-black"></div>
          <div className="w-2 h-2 bg-black"></div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="font-mono text-xs text-muted-foreground mb-4">
          <span className="text-accent">{">"}</span> SEND_MESSAGE_TO_AGENT
          <br />
          <span className="text-accent">{">"}</span> ENCRYPTION_ENABLED
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-accent uppercase tracking-widest">
              NAME_FIELD
            </label>
            <div className="border-b border-accent relative">
              <span className="text-accent text-sm">{">"}</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="ENTER_YOUR_NAME"
                disabled={isSubmitting}
                className="w-full bg-transparent text-primary placeholder-muted-foreground outline-none font-mono text-sm ml-2 py-2 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-accent uppercase tracking-widest">
              EMAIL_ADDRESS
            </label>
            <div className="border-b border-accent relative">
              <span className="text-accent text-sm">{">"}</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ENTER_EMAIL@DOMAIN.COM"
                disabled={isSubmitting}
                className="w-full bg-transparent text-primary placeholder-muted-foreground outline-none font-mono text-sm ml-2 py-2 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Message Field */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-accent uppercase tracking-widest">
              MESSAGE_CONTENT
            </label>
            <div className="border border-accent relative">
              <span className="text-accent text-sm absolute top-2 left-2">{">"}</span>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="TYPE_YOUR_MESSAGE_HERE..."
                disabled={isSubmitting}
                rows={5}
                className="w-full bg-transparent text-primary placeholder-muted-foreground outline-none font-mono text-sm p-2 pl-6 disabled:opacity-50 resize-none"
              />
            </div>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`text-xs font-mono p-2 border ${
                submitStatus === "success"
                  ? "border-primary text-primary bg-primary/10"
                  : "border-destructive text-destructive bg-destructive/10"
              }`}
            >
              {statusMessage}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 border-2 border-accent text-accent hover:bg-accent hover:text-black transition-all duration-300 py-2 font-bold uppercase tracking-widest text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin">⟳</span>
                  TRANSMITTING...
                </>
              ) : (
                <>
                  SEND_MESSAGE
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-xs text-muted-foreground font-mono border-t border-accent/30 pt-3 mt-4">
          <span className="text-accent">{">"}</span> ALL_MESSAGES_ENCRYPTED
          <br />
          <span className="text-accent">{">"}</span> RESPONSE_TIME: 24-48_HOURS
        </div>
      </div>
    </section>
  );
}
