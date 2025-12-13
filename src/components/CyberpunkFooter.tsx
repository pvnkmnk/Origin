import { Github, Mail, Music, Radio, Tv, ExternalLink } from "lucide-react";

interface SocialLink {
  name: string;
  url: string;
  icon: React.ReactNode;
  color: "primary" | "accent" | "secondary";
}

const socialLinks: SocialLink[] = [
  {
    name: "YouTube",
    url: "https://www.youtube.com/@joydao.z",
    icon: <Tv className="w-4 h-4" />,
    color: "primary",
  },
  {
    name: "SoundCloud",
    url: "https://soundcloud.com/lightoftransfer",
    icon: <Radio className="w-4 h-4" />,
    color: "accent",
  },
  {
    name: "Spotify",
    url: "https://open.spotify.com/artist/3z9wVpo6YllEc7qzzRrh0w",
    icon: <Music className="w-4 h-4" />,
    color: "secondary",
  },
];

const colorMap = {
  primary: "text-primary hover:text-black hover:bg-primary",
  accent: "text-accent hover:text-black hover:bg-accent",
  secondary: "text-green-500 hover:text-black hover:bg-green-500",
};

export default function CyberpunkFooter() {
  return (
    <footer className="border-t border-primary/30 pt-12 pb-8 relative overflow-hidden">
      {/* ASCII Art Banner */}
      <div className="mb-8 font-mono text-xs text-primary/50 leading-tight overflow-x-auto whitespace-pre">
        {`
  ╔════════════════════════════════════════════════════════════╗
  ║                    JOYDAO.Z TRANSMISSION                   ║
  ║                    END_OF_BROADCAST                        ║
  ╚════════════════════════════════════════════════════════════╝
        `}
      </div>

      {/* Social Links Grid */}
      <div className="container space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {socialLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group border-2 p-4 transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,255,65,0.2)] ${
                link.color === "primary"
                  ? "border-primary hover:border-primary"
                  : link.color === "accent"
                  ? "border-accent hover:border-accent"
                  : "border-green-500 hover:border-green-500"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-bold uppercase tracking-widest">
                  {link.name}
                </span>
                <div className={`${colorMap[link.color]} p-2 transition-all`}>
                  {link.icon}
                </div>
              </div>
              <p className="text-xs text-muted-foreground font-mono mb-2">
                CLICK_TO_CONNECT
              </p>
              <div className="flex items-center gap-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                <span>OPEN_LINK</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            </a>
          ))}
        </div>

        {/* Terminal Info Section */}
        <div className="border border-primary/30 bg-black/50 p-4 font-mono text-xs space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-primary">{">"}</span> SYSTEM_INFO
              <div className="ml-4 text-muted-foreground mt-1 space-y-1">
                <div>ARTIST: JOYDAO.Z</div>
                <div>ALIAS: LIGHTOFTRANSFER</div>
                <div>STATUS: ACTIVE</div>
              </div>
            </div>
            <div>
              <span className="text-primary">{">"}</span> NETWORK_STATUS
              <div className="ml-4 text-muted-foreground mt-1 space-y-1">
                <div>UPTIME: 99.9%</div>
                <div>SIGNAL: STRONG</div>
                <div>ENCRYPTION: ENABLED</div>
              </div>
            </div>
          </div>
        </div>

        {/* ASCII Art Footer */}
        <div className="font-mono text-xs text-primary/40 leading-tight text-center space-y-2">
          <div className="overflow-x-auto whitespace-pre">
            {`
    ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
    █ DIGITAL DECAY AESTHETIC v2.1.4                    █
    █ CYBERPUNK PORTFOLIO GENERATOR                     █
    ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
            `}
          </div>
          <div>© 2025 JOYDAO.Z // ALL RIGHTS RESERVED // SYSTEM_SHUTDOWN_IMMINENT</div>
        </div>

        {/* Blinking Cursor */}
        <div className="text-center">
          <span className="text-primary font-mono text-lg animate-pulse">_</span>
        </div>
      </div>
    </footer>
  );
}
