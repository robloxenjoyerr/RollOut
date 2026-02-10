import { useState, useEffect } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Person } from "../lib/types";

export default function Wheel({
  persons,
  rotation,
}: {
  persons: Person[];
  rotation: number;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const radius = 150;
  const center = 175;
  const total = persons.length;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getPersonColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${Math.abs(hash) % 360}, 80%, 55%)`;
  };

  if (!isMounted) return <div className="w-87.5 h-87.5" />;
  if (total === 0)
    return <div className="text-black italic">No one left to roll!</div>;

  return (
    <div className="relative select-none w-120 h-120 flex items-center justify-center">
      {/* Pointer */}
      <div className="absolute select-none top-0 z-20 w- h-0 border-l-15 border-l-transparent border-r-15 border-r-transparent border-t-30 border-t-yellow-400 drop-shadow-md" />

      <svg
        width="550"
        height="550"
        viewBox="0 0 350 350"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: "transform 3s cubic-bezier(0.1, 0, 0.1, 1)",
        }}
      >
        <defs>
          {/* Gold */}
          <radialGradient id="goldGradient">
            <stop offset="0%" stopColor="#fff2b0" />
            <stop offset="60%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#8b6b1f" />
          </radialGradient>

          {/* Center */}
          <radialGradient id="centerGradient">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#b8860b" />
          </radialGradient>

          {/* Glow */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Gold Ring */}
        <circle
          cx={center}
          cy={center}
          r={radius + 16}
          fill="url(#goldGradient)"
          filter="url(#glow)"
        />

        {/* Lights */}
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i / 24) * 2 * Math.PI;
          const r = radius + 22;
          return (
            <circle
              key={i}
              cx={center + r * Math.cos(a)}
              cy={center + r * Math.sin(a)}
              r="4"
              fill="#ffd966"
              filter="url(#glow)"
            />
          );
        })}

        {/* Segments */}
        {total === 1 ? (
          <g>
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill={getPersonColor(persons[0].name)}
            />
            <text
              x={center}
              y={center}
              fill="white"
              fontSize="26"
              fontWeight="900"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{
                filter: "drop-shadow(2px 2px 3px rgba(0,0,0,0.9))",
              }}
            >
              {persons[0].name}
            </text>
          </g>
        ) : (
          persons.map((person, i) => {
            const angle = 360 / total;
            const start = i * angle;
            const end = start + angle;

            const x1 =
              center + radius * Math.cos((Math.PI * start) / 180);
            const y1 =
              center + radius * Math.sin((Math.PI * start) / 180);
            const x2 =
              center + radius * Math.cos((Math.PI * end) / 180);
            const y2 =
              center + radius * Math.sin((Math.PI * end) / 180);

            const d = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;

            return (
              <g key={person.id}>
                <path
                  d={d}
                  fill={getPersonColor(person.name)}
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth="2"
                  filter="url(#glow)"
                />
                <text
                  x={center + radius / 1.5}
                  y={center}
                  fill="white"
                  fontSize={total < 6 ? "20" : "16"}
                  fontWeight="900"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${start + angle / 2}, ${center}, ${center})`}
                  style={{
                    pointerEvents: "none",
                    filter:
                      "drop-shadow(2px 2px 3px rgba(0,0,0,0.9))",
                  }}
                >
                  {person.name}
                </text>
              </g>
            );
          })
        )}

        {/* Center Button */}
        <circle
          cx={center}
          cy={center}
          r="14"
          fill="url(#centerGradient)"
          stroke="#6b4e00"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}
