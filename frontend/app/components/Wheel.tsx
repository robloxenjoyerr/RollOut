import { useState, useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { Client } from "../lib/types";

export default function Wheel({
  clients,
  rotation,
}: {
  clients: Client[] | null;
  rotation: number;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const controls = useAnimation()
  const prevRotationRef = useRef(0)
  const radius = 150;
  const center = 175;
  const total = clients?.length ?? 0;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || rotation === prevRotationRef.current) return

    const prev = prevRotationRef.current
    const kickback = prev - Math.random() * 50 - 30

    const spins = 5
    const target = rotation + spins * 360

    controls.start({
      rotate: [prev, prev - 50, target + 8, target],
      transition: {
        duration: 5,
        times: [0, 0.08, 0.96, 1],
        ease: [0.08, 0.82, 0.17, 1]
      }
    })

    prevRotationRef.current = rotation
  }, [rotation, isMounted])

  const getPersonColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${Math.abs(hash) % 360}, 80%, 55%)`;
  };

  if (!isMounted) return <div className="w-87.5 h-87.5" />;
  if (total === 0) return <div className="text-white italic font-bold">No one left to roll!</div>;
  if (!clients || !total) return null

  return (
    <div className="relative select-none flex items-center justify-center" style={{ width: 450, height: 450 }}>

      {/* Outer glow ring */}
      <div className="absolute inset-0 rounded-full" style={{
        background: "radial-gradient(circle, rgba(99,179,255,0.15) 0%, transparent 70%)",
        filter: "blur(8px)"
      }} />

      {/* Pointer — diamond shape like in image */}
      <div className="absolute z-30" style={{ top: -2, left: "50%", transform: "translateX(-50%)" }}>
        <svg width="32" height="40" viewBox="0 0 32 40">
          <polygon points="16,38 2,8 16,14 30,8" fill="#c084fc" stroke="#a855f7" strokeWidth="1.5"
            style={{ filter: "drop-shadow(0 0 6px rgba(168,85,247,0.8))" }} />
          <polygon points="16,0 2,8 16,14 30,8" fill="#e9d5ff" stroke="#c084fc" strokeWidth="1" />
        </svg>
      </div>

      <motion.svg
        width="420"
        height="420"
        viewBox="-8 -8 365 365"
        animate={controls}
      >
        <defs>
          {/* Outer chrome ring gradient */}
          <linearGradient id="chromeRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="25%" stopColor="#e2e8f0" />
            <stop offset="50%" stopColor="#64748b" />
            <stop offset="75%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>

          {/* Inner chrome ring */}
          <linearGradient id="innerChrome" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="50%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>

          {/* Center hub gradient */}
          <radialGradient id="hubGradient" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="40%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#334155" />
          </radialGradient>

          {/* Segment shine overlay */}
          <radialGradient id="segmentShine" cx="30%" cy="30%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>

          {/* Outer glow filter */}
          <filter id="outerGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Text shadow */}
          <filter id="textShadow">
            <feDropShadow dx="1" dy="1" stdDeviation="2" floodColor="rgba(0,0,0,0.8)" />
          </filter>

          {/* Hub shine */}
          <filter id="hubGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer chrome bezel — thick ring */}
        <circle cx={center} cy={center} r={radius + 28} fill="url(#chromeRing)" />

        {/* Decorative studs on bezel */}
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i / 24) * 2 * Math.PI - Math.PI / 2;
          const r = radius + 28;
          const isMain = i % 2 === 0;
          return (
            <circle
              key={i}
              cx={center + r * Math.cos(a)}
              cy={center + r * Math.sin(a)}
              r={isMain ? 4 : 2.5}
              fill={isMain ? "#f1f5f9" : "#94a3b8"}
              style={{ filter: isMain ? "drop-shadow(0 0 3px rgba(255,255,255,0.9))" : undefined }}
            />
          );
        })}

        {/* Inner chrome ring border */}
        <circle cx={center} cy={center} r={radius + 6} fill="url(#innerChrome)" />

        {/* Wheel background base */}
        <circle cx={center} cy={center} r={radius} fill="#1e3a8a" />

        {/* Segments */}
        {total === 1 ? (
          <g>
            <circle cx={center} cy={center} r={radius} fill="#1d4ed8" />
            <text x={center} y={center} fill="white" fontSize="22" fontWeight="900"
              textAnchor="middle" dominantBaseline="middle" filter="url(#textShadow)"
              style={{ letterSpacing: "0.05em" }}>
              {clients[0].name}
            </text>
          </g>
        ) : (
          clients.map((client, i) => {
            const angle = 360 / total;
            const start = i * angle;
            const end = start + angle;
            const startRad = (Math.PI * start) / 180;
            const endRad = (Math.PI * end) / 180;

            const x1 = center + radius * Math.cos(startRad);
            const y1 = center + radius * Math.sin(startRad);
            const x2 = center + radius * Math.cos(endRad);
            const y2 = center + radius * Math.sin(endRad);
            const largeArc = angle > 180 ? 1 : 0;

            const d = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

            // Alternating blue shades like casino wheel
            const fillColor = i % 2 === 0 ? "#1e40af" : "#2563eb";

            // Text position
            const midAngle = (start + angle / 2) * Math.PI / 180;
            const textR = radius * 0.65;
            const tx = center + textR * Math.cos(midAngle);
            const ty = center + textR * Math.sin(midAngle);

            return (
              <g key={client.clientId}>
                <path d={d} fill={fillColor} stroke="rgba(148,163,255,0.4)" strokeWidth="1.5" />
                {/* Shine overlay per segment */}
                <path d={d} fill="url(#segmentShine)" />
                <text
                  x={tx}
                  y={ty}
                  fill="white"
                  fontSize={total < 6 ? "18" : total < 10 ? "14" : "11"}
                  fontWeight="800"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${start + angle / 2 + 90}, ${tx}, ${ty})`}
                  filter="url(#textShadow)"
                  style={{
                    pointerEvents: "none",
                    letterSpacing: "0.03em",
                    fontFamily: "system-ui, sans-serif"
                  }}
                >
                  {client.name}
                </text>
              </g>
            );
          })
        )}

        {/* Divider lines between segments — sharp white */}
        {clients.map((_, i) => {
          const angle = (360 / total) * i * Math.PI / 180;
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={center + radius * Math.cos(angle)}
              y2={center + radius * Math.sin(angle)}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1"
            />
          );
        })}

        {/* Center hub — metallic */}
        <circle cx={center} cy={center} r="22" fill="#1e293b" />
        <circle cx={center} cy={center} r="18" fill="url(#hubGradient)" filter="url(#hubGlow)" />
        <circle cx={center} cy={center} r="8" fill="#f1f5f9" opacity="0.9" />
        <circle cx={center - 3} cy={center - 3} r="3" fill="white" opacity="0.6" />
      </motion.svg>

      {/* Outer sparkle lights — outside SVG for extra glow */}
      <div
        className="absolute rounded-full -z-15"
        style={{
          width: 430,
          height: 430,
          background: "radial-gradient(circle at center, rgba(59,130,246,0.4) 50%, rgba(59,130,246,0.2) 70%, transparent 85%)",
          filter: "blur(18px)"
        }}
      />
    </div>
  );
}
