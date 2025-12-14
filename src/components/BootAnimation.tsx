import { useEffect, useState } from "react";

interface BootAnimationProps {
  onComplete: () => void;
}

export default function BootAnimation({ onComplete }: BootAnimationProps) {
  const [lines, setLines] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const bootSequence = [
    "INITIALIZING NEURAL_INTERFACE...",
    "LOADING KERNEL v2.1.4",
    "MOUNTING FILESYSTEM...",
    "CHECKING MEMORY: 16GB OK",
    "LOADING DRIVERS...",
    "AUDIO_DRIVER: INITIALIZED",
    "GRAPHICS_DRIVER: INITIALIZED",
    "NETWORK_DRIVER: INITIALIZED",
    "CONNECTING TO GLOBAL_NETWORK...",
    "VERIFYING CREDENTIALS...",
    "ACCESS_GRANTED: JOYDAO.Z",
    "LOADING CREATIVE_SUITE...",
    "INITIALIZING VISUAL_SYSTEMS...",
    "CALIBRATING GLITCH_EFFECTS...",
    "SYSTEM_READY",
    "",
    "WELCOME TO THE NETWORK, AGENT.",
    "PRESS_ANY_KEY_TO_CONTINUE...",
  ];

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < bootSequence.length) {
        setLines((prev) => [...prev, bootSequence[index]]);
        index++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
      }
    }, 150);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isComplete) {
        e.preventDefault();
        onComplete();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isComplete, onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden" onClick={() => isComplete && onComplete()}>
      {/* CRT Overlay */}
      <div className="absolute inset-0 crt-overlay opacity-50 pointer-events-none"></div>

      {/* Boot Screen */}
      <div className="w-full h-full max-w-4xl p-8 font-mono text-sm md:text-base text-primary flex flex-col justify-center">
        <div className="border-2 border-primary p-6 bg-black relative">
          {/* Terminal Header */}
          <div className="mb-4 pb-2 border-b border-primary/30">
            <div className="flex items-center justify-between">
              <span className="text-primary">JOYDAO.Z BOOT SEQUENCE</span>
              <span className="text-primary/70">KERNEL v2.1.4</span>
            </div>
          </div>

          {/* Terminal Body */}
          <div className="space-y-1 min-h-[240px]">
            {lines.map((line, idx) => (
              <div key={idx} className="leading-relaxed">
                <span className="text-accent">$</span> {line}
              </div>
            ))}
          </div>

          {/* Footer / Instructions */}
          <div className="mt-4 pt-2 border-t border-primary/30 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {isComplete ? "READY" : "RUNNING..."}
            </span>
            <span className="text-xs text-primary/70">
              {isComplete ? "CLICK OR PRESS ANY KEY TO CONTINUE" : "INITIALIZING"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
