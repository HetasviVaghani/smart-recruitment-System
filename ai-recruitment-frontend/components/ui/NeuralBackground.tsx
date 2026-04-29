"use client";

import { motion } from "framer-motion";

export default function NeuralBackground() {
  const nodes = Array.from({ length: 15 });

  return (
    <div className="absolute inset-0 overflow-hidden z-0">

      {/* Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(56,189,248,0.15),transparent)]" />

      {/* Lines */}
      <svg className="absolute w-full h-full opacity-20">
        {nodes.map((_, i) => (
          <line
            key={i}
            x1={`${(i * 7) % 100}%`}
            y1={`${(i * 13) % 100}%`}
            x2={`${(i * 17) % 100}%`}
            y2={`${(i * 19) % 100}%`}
            stroke="cyan"
            strokeWidth="0.5"
          />
        ))}
      </svg>

      {/* Nodes */}
      {nodes.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_cyan]"
          initial={{
            x: (i * 100) % 1200,
            y: (i * 70) % 800,
          }}
          animate={{
            x: [(i * 100) % 1200, (i * 150 + 200) % 1200],
            y: [(i * 70) % 800, (i * 120 + 100) % 800],
          }}
          transition={{
            duration: 12 + i,
            repeat: Infinity,
            repeatType: "mirror",
          }}
        />
      ))}
    </div>
  );
}