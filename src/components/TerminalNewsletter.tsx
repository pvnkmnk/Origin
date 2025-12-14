import { useEffect, useRef, useState } from "react";
import { Mail, Send } from "lucide-react";
import { trpc } from "../lib/trpc";

interface TerminalLine {
  type: "input" | "output" | "command";
  text: string;
  timestamp?: string;
}

export default function TerminalNewsletter() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([
    { type: "output", text: "NEURAL_MAIL_PROTOCOL v2.1.4" },
    { type: "output", text: "TYPE 'SUBSCRIBE' TO JOIN THE NETWORK" },
    { type: "output", text: "" },
  ]);
  const terminalRef = useRef<HTMLDivElement>(null);

  const newsletterMutation = trpc.newsletter.subscribe.useMutation();

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines]);

  const addTerminalLine = (type: TerminalLine["type"], text: string) => {
    setTerminalLines((prev) => [...prev, { type, text }]);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      addTerminalLine("output", "ERROR: EMAIL_FIELD_EMPTY");
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      addTerminalLine("output", "ERROR: INVALID_EMAIL_FORMAT");
      return;
    }

    addTerminalLine("input", `SUBSCRIBE ${email}`);
    addTerminalLine("output", "PROCESSING REQUEST...");

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    addTerminalLine("output", "VERIFYING CREDENTIALS...");
    await new Promise((resolve) => setTimeout(resolve, 800));

    addTerminalLine("output", "ENCRYPTION_PROTOCOL: ENABLED");
    await new Promise((resolve) => setTimeout(resolve, 600));

    try {
      await newsletterMutation.mutateAsync({ email });

      addTerminalLine("output", "");
      addTerminalLine("output", "✓ SUBSCRIPTION_CONFIRMED");
      addTerminalLine("output", `✓ EMAIL_REGISTERED: ${email}`);
      addTerminalLine("output", "✓ ACCESS_GRANTED_TO_INNER_CIRCLE");
      addTerminalLine("output", "");
      addTerminalLine("output", "YOU WILL RECEIVE UPDATES ON:");
      addTerminalLine("output", "• NEW_RELEASES");
      addTerminalLine("output", "• LIVE_EVENTS");
      addTerminalLine("output", "• EXCLUSIVE_CONTENT");
      addTerminalLine("output", "");
      addTerminalLine("output", "WELCOME_TO_THE_NETWORK, AGENT.");

      setIsSubscribed(true);
      setEmail("");
    } catch (error) {
      addTerminalLine("output", "ERROR: SUBSCRIPTION_FAILED");
      addTerminalLine("output", "PLEASE_TRY_AGAIN_LATER");
      console.error("Newsletter subscription error:", error);
    }
  };

  const isSubmitting = newsletterMutation.isPending;

  return (
    <section className="border border-accent bg-black p-1 shadow-[0_0_15px_rgba(255,0,85,0.2)]">
      <div className="bg-accent text-black px-2 py-1 flex justify-between items-center text-xs font-bold mb-2">
        <span className="flex items-center gap-2">
          <Mail className="w-3 h-3" /> TERMINAL_03: NEURAL_MAIL
        </span>
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-black"></div>
          <div className="w-2 h-2 bg-black"></div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="text-xs font-mono p-2 border border-primary/30 bg-black/50 text-muted-foreground">
          NOTE: Demo mode active. Subscriptions are simulated. In Phase B, emails will be stored internally in MySQL.
        </div>
        {/* Terminal Display */}
        <div
          ref={terminalRef}
          className="bg-black border border-accent/30 p-3 font-mono text-xs md:text-sm h-64 overflow-y-auto space-y-1 relative"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255, 0, 85, 0.03) 1px, transparent 1px)",
            backgroundSize: "100% 1.5em",
          }}
        >
          {terminalLines.map((line, i) => (
            <div key={i} className={`leading-relaxed ${
              line.type === "input"
                ? "text-primary font-bold"
                : line.type === "command"
                ? "text-accent"
                : "text-muted-foreground"
            }`}>
              {line.type === "input" && <span className="text-accent">{">"} </span>}
              {line.type === "output" && <span className="text-accent">{"$"} </span>}
              {line.text}
            </div>
          ))}

          {/* CRT Overlay */}
          <div className="absolute inset-0 pointer-events-none bg-scanlines opacity-10"></div>
        </div>

        {/* Input Form */}
        {!isSubscribed ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-2">
              <span className="text-accent font-bold">{">"}</span>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="ENTER_EMAIL_ADDRESS"
                disabled={isSubmitting}
                className="flex-1 bg-transparent border-b border-accent text-primary placeholder-muted-foreground outline-none font-mono text-sm focus:border-primary transition-colors disabled:opacity-50"
                autoComplete="email"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="text-accent hover:text-primary transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              PRESS ENTER OR CLICK SEND TO EXECUTE SUBSCRIPTION PROTOCOL
            </p>
          </form>
        ) : (
          <div className="space-y-2">
            <button
              onClick={() => {
                setIsSubscribed(false);
                setEmail("");
                setTerminalLines([
                  { type: "output", text: "NEURAL_MAIL_PROTOCOL v2.1.4" },
                  { type: "output", text: "TYPE 'SUBSCRIBE' TO JOIN THE NETWORK" },
                  { type: "output", text: "" },
                ]);
              }}
              className="w-full text-accent hover:text-primary transition-colors font-mono text-sm border border-accent p-2 hover:bg-accent/10"
            >
              RESET_FORM
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
