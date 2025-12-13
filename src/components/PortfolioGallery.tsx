import { useState } from "react";
import { ExternalLink } from "lucide-react";

interface WorkItem {
  id: string;
  title: string;
  description: string;
  category: string;
  link: string;
  color: "primary" | "accent" | "secondary";
}

const works: WorkItem[] = [
  {
    id: "1",
    title: "CRASH OUT CORE DOUBLE DELUXXX MIXTAPE",
    description: "2h 14m high-energy riddim & dubstep compilation",
    category: "AUDIO_MIX",
    link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    color: "primary",
  },
  {
    id: "2",
    title: "FOOL'S SPRING PARTY MIX",
    description: "57m seasonal audio journey through chaos",
    category: "AUDIO_MIX",
    link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    color: "accent",
  },
  {
    id: "3",
    title: "WINTER ANTIFASCIST WONDERLAND",
    description: "1h 30m political & sonic resistance",
    category: "AUDIO_MIX",
    link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    color: "primary",
  },
  {
    id: "4",
    title: "D.D.T.S. 2: ADVENTURES IN SPECTACLE",
    description: "58m experimental audio-visual experience",
    category: "AUDIO_MIX",
    link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    color: "secondary",
  },
  {
    id: "5",
    title: "DEEP DUBSOUND TRENCH STEPPA",
    description: "1h 30m birthday mix for lions",
    category: "AUDIO_MIX",
    link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    color: "accent",
  },
  {
    id: "6",
    title: "EC²W² 2: TERRORDOME",
    description: "1h 20m industrial noise warfare",
    category: "AUDIO_MIX",
    link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    color: "primary",
  },
];

const colorMap = {
  primary: "border-primary text-primary hover:bg-primary hover:text-black",
  accent: "border-accent text-accent hover:bg-accent hover:text-black",
  secondary: "border-green-500 text-green-500 hover:bg-green-500 hover:text-black",
};

export default function PortfolioGallery() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [glitchOffset, setGlitchOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Create subtle glitch offset based on mouse position
    const offsetX = (x / rect.width - 0.5) * 4;
    const offsetY = (y / rect.height - 0.5) * 4;

    setGlitchOffset({ x: offsetX, y: offsetY });
  };

  return (
    <section className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-3 h-3 bg-primary animate-pulse"></div>
        <h2 className="text-3xl font-bold text-primary">ARCHIVED_WORKS</h2>
        <div className="flex-1 border-t border-primary/30"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {works.map((work) => (
          <div
            key={work.id}
            onMouseEnter={() => setHoveredId(work.id)}
            onMouseLeave={() => setHoveredId(null)}
            onMouseMove={handleMouseMove}
            className="group relative"
          >
            {/* Glitch Background Layer */}
            {hoveredId === work.id && (
              <>
                <div
                  className={`absolute inset-0 border-2 ${colorMap[work.color as keyof typeof colorMap]} opacity-50 blur-sm`}
                  style={{
                    transform: `translate(${glitchOffset.x}px, ${glitchOffset.y}px)`,
                  }}
                ></div>
                <div
                  className={`absolute inset-0 border-2 ${colorMap[work.color as keyof typeof colorMap]} opacity-30`}
                  style={{
                    transform: `translate(${-glitchOffset.x * 1.5}px, ${-glitchOffset.y * 1.5}px)`,
                  }}
                ></div>
              </>
            )}

            {/* Main Card */}
            <a
              href={work.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`relative block border-2 p-4 transition-all duration-300 overflow-hidden group ${colorMap[work.color as keyof typeof colorMap]} ${
                hoveredId === work.id ? "shadow-[0_0_20px_rgba(0,255,65,0.3)]" : ""
              }`}
            >
              {/* Scanline Effect on Hover */}
              {hoveredId === work.id && (
                <div className="absolute inset-0 bg-scanlines opacity-20 pointer-events-none"></div>
              )}

              {/* Content */}
              <div className="relative z-10 space-y-3">
                {/* Category Badge */}
                <div className="inline-block text-xs font-bold px-2 py-1 border border-current">
                  [{work.category}]
                </div>

                {/* Title */}
                <h3 className="text-sm md:text-base font-bold uppercase leading-tight tracking-wide line-clamp-2 group-hover:tracking-widest transition-all">
                  {work.title}
                </h3>

                {/* Description */}
                <p className="text-xs md:text-sm opacity-80 leading-relaxed">
                  {work.description}
                </p>

                {/* Link Indicator */}
                <div className="flex items-center gap-2 text-xs font-mono pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>OPEN_ARCHIVE</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>

              {/* Glitch Text Overlay on Hover */}
              {hoveredId === work.id && (
                <>
                  <div
                    className="absolute top-2 left-2 text-xs font-bold opacity-30 pointer-events-none text-accent"
                    style={{
                      transform: `translate(${glitchOffset.x * 2}px, ${glitchOffset.y * 2}px)`,
                    }}
                  >
                    ERR_LOAD
                  </div>
                  <div
                    className="absolute bottom-2 right-2 text-xs font-bold opacity-30 pointer-events-none text-primary"
                    style={{
                      transform: `translate(${-glitchOffset.x * 2}px, ${-glitchOffset.y * 2}px)`,
                    }}
                  >
                    SYS_OK
                  </div>
                </>
              )}
            </a>
          </div>
        ))}
      </div>

      {/* Terminal Info */}
      <div className="border border-primary/30 p-4 bg-black/50 font-mono text-xs text-muted-foreground space-y-2">
        <div>
          <span className="text-primary">{">"}</span> TOTAL_WORKS: {works.length}
        </div>
        <div>
          <span className="text-primary">{">"}</span> ARCHIVE_STATUS: ACCESSIBLE
        </div>
        <div>
          <span className="text-primary">{">"}</span> HOVER_FOR_DETAILS
        </div>
      </div>
    </section>
  );
}
