import { useState, useEffect } from "react";

export default function Wheel({ persons, rotation }: { persons: any[], rotation: number }) {
    // 1. Mount-State hinzufügen
    const [isMounted, setIsMounted] = useState(false);

    const radius = 150;
    const center = 175;
    const total = persons.length;

    // 2. Erst nach dem Mounten auf true setzen
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const getPersonColor = (name: string) => {
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
        return `hsl(${Math.abs(hash) % 360}, 70%, 50%)`;
    };

    if (!isMounted) {
        return <div className="w-87.5 h-87.5" />; 
    }

    if (total === 0) return <div className="text-black italic">No one left to roll!</div>;

    return (
        <div className="relative w-87.5 h-87.5 flex items-center justify-center">
            {/* ... Rest deines SVG Codes wie zuvor ... */}
            <div className="absolute top-0 z-20 w-0 h-0 border-l-15 border-l-transparent border-r-15 border-r-transparent border-t-30 border-t-red-600 drop-shadow-md" />

            <svg
                width="350" height="350" viewBox="0 0 350 350"
                style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: 'transform 3s cubic-bezier(0.1, 0, 0.1, 1)'
                }}
            >
                {total === 1 ? (
                    <g>
                        <circle cx={center} cy={center} r={radius} fill={getPersonColor(persons[0].name)} stroke="white" strokeWidth="2" />
                        <text x={center} y={center} fill="white" fontSize="24" fontWeight="black" textAnchor="middle" dominantBaseline="central" style={{ filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.8))" }}>
                            {persons[0].name}
                        </text>
                    </g>
                ) : (
                    persons.map((person, i) => {
                        const angle = 360 / total;
                        const startAngle = i * angle;
                        const endAngle = (i + 1) * angle;

                        const x1 = center + radius * Math.cos((Math.PI * startAngle) / 180);
                        const y1 = center + radius * Math.sin((Math.PI * startAngle) / 180);
                        const x2 = center + radius * Math.cos((Math.PI * endAngle) / 180);
                        const y2 = center + radius * Math.sin((Math.PI * endAngle) / 180);

                        const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;

                        return (
                            <g key={person.id}>
                                <path d={pathData} fill={getPersonColor(person.name)} stroke="white" strokeWidth="2" />
                                <text
                                    x={center + (radius / 1.5)} y={center} fill="white" fontSize={total < 5 ? "20" : "14"} fontWeight="black" textAnchor="end" dominantBaseline="central"
                                    transform={`rotate(${startAngle + angle / 2}, ${center}, ${center})`}
                                    style={{ filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.8))", pointerEvents: "none" }}
                                >
                                    {person.name}
                                </text>
                            </g>
                        );
                    })
                )}
                <circle cx={center} cy={center} r="10" fill="white" />
            </svg>
        </div>
    );
}