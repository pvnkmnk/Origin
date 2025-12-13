import { ExternalLink, Terminal, Wifi, Zap, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import TerminalNewsletter from "../components/TerminalNewsletter";
import PortfolioGallery from "../components/PortfolioGallery";
import BootAnimation from "../components/BootAnimation";
import ContactForm from "../components/ContactForm";
import AnimatedCyberpunkFooter from "../components/AnimatedCyberpunkFooter";
import { useLocation } from "wouter";

export default function Home() {
  const [showBoot, setShowBoot] = useState(true);
  const [glitchActive, setGlitchActive] = useState(false);
  const [bootSequence, setBootSequence] = useState<string[]>([]);

  // Simulate boot sequence
  useEffect(() => {
    const sequence = [
      "INITIALIZING KERNEL...",
      "LOADING ASSETS...",
      "CONNECTING TO NEURAL NET...",
      "BYPASSING FIREWALL...",
      "ACCESS GRANTED: JOYDAO.Z",
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < sequence.length) {
        setBootSequence((prev) => [...prev, sequence[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  // Random glitch trigger
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 200);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (showBoot) {
    return <BootAnimation onComplete={() => setShowBoot(false)} />;
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* CRT Overlay */}
      <div className="fixed inset-0 z-50 crt-overlay pointer-events-none opacity-50 mix-blend-overlay"></div>
      
      {/* Background Noise/Grid */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-luminosity"></div>

      <header className="relative z-10 border-b border-primary/50 bg-background/80 backdrop-blur-sm p-4 sticky top-0">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Terminal className="w-6 h-6 text-primary animate-pulse" />
            <h1 className="text-2xl md:text-4xl font-bold tracking-tighter glitch-text" data-text="JOYDAO.Z">
              JOYDAO.Z
            </h1>
          </div>
          <div className="flex items-center gap-4 text-xs md:text-sm font-mono text-muted-foreground">
            <span className="hidden md:inline-flex items-center gap-1">
              <Wifi className="w-3 h-3" /> NET_STATUS: ONLINE
            </span>
            <span className="animate-pulse text-accent">SYS_WARNING: UNSTABLE</span>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10 container py-8 md:py-12 space-y-12">
        
        {/* Hero Section */}
        <section className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="border border-primary p-4 bg-black/50 backdrop-blur-md relative group">
              <div className="absolute -top-1 -left-1 w-2 h-2 bg-primary"></div>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary"></div>
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-primary"></div>
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-primary"></div>
              
              <div className="font-mono text-xs text-primary/70 mb-2">
                {bootSequence.map((line, i) => (
                  <div key={i} className="leading-tight">
                    {">"} {line}
                  </div>
                ))}
                <span className="animate-pulse">_</span>
              </div>
              
              <h2 className={`text-4xl md:text-6xl font-bold leading-none mb-4 ${glitchActive ? 'translate-x-1 text-accent' : ''}`}>
                DIGITAL<br/>CREATIVE<br/>WORKS
              </h2>
              <p className="text-lg text-muted-foreground max-w-md font-mono">
                Exploring the boundaries of audio-visual chaos. 
                Cyberpunk aesthetics. Glitch art. Sonic warfare.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <a className="inline-flex items-center gap-2 border border-primary text-primary px-4 py-2 hover:bg-primary hover:text-black uppercase tracking-widest relative overflow-hidden" href="https://www.youtube.com/@joydao.z" target="_blank" rel="noopener noreferrer">
                  <span className="relative z-10 flex items-center gap-2">
                    YouTube <ExternalLink className="w-4 h-4" />
                  </span>
                  <div className="absolute inset-0 bg-primary translate-y-full hover:translate-y-0 transition-transform duration-300"></div>
                </a>
              <a className="inline-flex items-center gap-2 border border-accent text-accent px-4 py-2 hover:bg-accent hover:text-black uppercase tracking-widest relative overflow-hidden" href="https://soundcloud.com/lightoftransfer" target="_blank" rel="noopener noreferrer">
                  <span className="relative z-10 flex items-center gap-2">
                    SoundCloud <ExternalLink className="w-4 h-4" />
                  </span>
                  <div className="absolute inset-0 bg-accent translate-y-full hover:translate-y-0 transition-transform duration-300"></div>
                </a>
              <a className="inline-flex items-center gap-2 border border-green-500 text-green-500 px-4 py-2 hover:bg-green-500 hover:text-black uppercase tracking-widest relative overflow-hidden" href="https://open.spotify.com/artist/3z9wVpo6YllEc7qzzRrh0w" target="_blank" rel="noopener noreferrer">
                  <span className="relative z-10 flex items-center gap-2">
                    Spotify <ExternalLink className="w-4 h-4" />
                  </span>
                  <div className="absolute inset-0 bg-green-500 translate-y-full hover:translate-y-0 transition-transform duration-300"></div>
                </a>
              <BlogNavLink />
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-xl animate-pulse"></div>
            <div className="border-2 border-primary bg-black p-1 relative z-10 shadow-[0_0_20px_rgba(0,255,65,0.3)]">
              <div className="aspect-video w-full bg-black relative overflow-hidden group">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src="https://www.youtube.com/embed/0wxbt3Rkiks?autoplay=0&controls=1&rel=0&modestbranding=1" 
                  title="YouTube video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  className="w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500"
                ></iframe>
                <div className="absolute inset-0 pointer-events-none bg-scanlines opacity-20"></div>
              </div>
              <div className="bg-primary text-black text-xs font-bold p-1 flex justify-between">
                <span>LATEST_TRANSMISSION</span>
                <span>REC_DATE: 2025-10-12</span>
              </div>
            </div>
          </div>
        </section>

        <Separator className="bg-primary/30" />

        {/* Events Terminal Section */}
        <section className="border border-primary bg-black p-1 shadow-[0_0_10px_rgba(0,255,65,0.1)]">
          <div className="bg-primary text-black px-2 py-1 flex justify-between items-center text-xs font-bold mb-2">
            <span>TERMINAL_02: LIVE_EXECUTIONS</span>
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-black"></div>
              <div className="w-2 h-2 bg-black"></div>
            </div>
          </div>
          <div className="p-4 font-mono text-sm md:text-base space-y-4 min-h-[300px]">
            <div className="text-muted-foreground mb-4">
              {">"} QUERYING DATABASE FOR UPCOMING GIGS...<br/>
              {">"} 3 RECORDS FOUND.
            </div>
            
            <div className="space-y-2">
              {[
                { date: "2025-11-05", loc: "NEO_TOKYO_VR", event: "GLITCH_FEST_25", status: "CONFIRMED" },
                { date: "2025-12-12", loc: "UNDERGROUND_BUNKER", event: "NOISE_PROTOCOL", status: "SOLD_OUT" },
                { date: "2026-01-20", loc: "THE_VOID_CLUB", event: "SYSTEM_RESET_PARTY", status: "PENDING" }
              ].map((gig, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-[120px_1fr_1fr_100px] gap-2 hover:bg-primary/10 p-1 transition-colors border-b border-primary/10 pb-2 last:border-0">
                  <span className="text-accent">{gig.date}</span>
                  <span className="text-primary font-bold">{gig.event}</span>
                  <span className="text-muted-foreground">@{gig.loc}</span>
                  <span className={`text-xs px-1 self-start justify-self-start md:justify-self-end ${
                    gig.status === 'CONFIRMED' ? 'bg-primary text-black' : 
                    gig.status === 'SOLD_OUT' ? 'bg-accent text-black' : 
                    'border border-primary text-primary'
                  }`}>
                    [{gig.status}]
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-8 animate-pulse">
              {">"} _
            </div>
          </div>
        </section>

        <Separator className="bg-primary/30" />

        {/* Audio Section */}
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <Zap className="w-8 h-8 text-accent" />
            <h2 className="text-3xl font-bold text-primary">AUDIO_LOGS</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* SoundCloud Embed */}
            <div className="bg-black/80 border border-accent rounded-none overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-2 z-10">
                <div className="w-3 h-3 bg-accent rounded-full animate-ping"></div>
              </div>
              <div className="border-b border-accent/30 pb-2 p-3">
                <div className="text-accent font-mono text-xl flex items-center gap-2">
                  <span className="text-xs bg-accent text-black px-1">SC</span>
                  LIGHTOFTRANSFER
                </div>
              </div>
              <div className="p-0">
                <iframe 
                  width="100%" 
                  height="400" 
                  scrolling="no" 
                  frameBorder="no" 
                  allow="autoplay" 
                  src="https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/lightoftransfer&color=%23ff0055&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"
                ></iframe>
              </div>
            </div>

            {/* Spotify Embed */}
            <div className="bg-black/80 border border-green-500 rounded-none overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-2 z-10">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-ping delay-75"></div>
              </div>
              <div className="border-b border-green-500/30 pb-2 p-3">
                <div className="text-green-500 font-mono text-xl flex items-center gap-2">
                  <span className="text-xs bg-green-500 text-black px-1">SP</span>
                  JOYDAO.Z
                </div>
              </div>
              <div className="p-0 h-[400px]">
                <iframe 
                  style={{borderRadius: "0px"}} 
                  src="https://open.spotify.com/embed/artist/3z9wVpo6YllEc7qzzRrh0w?utm_source=generator&theme=0" 
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  allowFullScreen 
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </div>
        </section>

        <Separator className="bg-primary/30" />

        {/* Portfolio Section */}
        <PortfolioGallery />

        <Separator className="bg-primary/30" />

        {/* Contact Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 bg-accent animate-pulse"></div>
            <h2 className="text-3xl font-bold text-accent">SEND_TRANSMISSION</h2>
          </div>
          <ContactForm />
        </section>

        <Separator className="bg-primary/30" />

        {/* Newsletter Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 bg-accent animate-pulse"></div>
            <h2 className="text-3xl font-bold text-accent">JOIN_THE_NETWORK</h2>
          </div>
          <TerminalNewsletter />
        </section>

        <AnimatedCyberpunkFooter />
      </main>
    </div>
  );
}

function BlogNavLink() {
  const [, setLocation] = useLocation();
  return (
    <button 
      className="border border-purple-500 text-purple-500 px-4 py-2 hover:bg-purple-500 hover:text-black rounded-none uppercase tracking-widest relative overflow-hidden"
      onClick={() => setLocation("/blog")}
    >
      <span className="relative z-10 flex items-center gap-2">
        Blog <FileText className="w-4 h-4" />
      </span>
      <div className="absolute inset-0 bg-purple-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
    </button>
  );
}
