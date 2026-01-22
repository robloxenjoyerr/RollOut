"use client"

import React from "react"
import Card from "../../components/Card";
import Button from "../../components/Button";
import { useState } from "react";
import { Mode } from "../../lib/types";

const isHost = true

export default function GamePage() {
    const [currentGameMode, setCurrentGameMode] = useState<Mode>("random")
    const persons = ["A", "B", "C"]

    const segmentAngle = 360 / persons.length

    if (isHost) {
        return <div className="flex flex-col gap-5">
            <Card width="w-100" height="h-100">
                <svg className="justify-center self-center" width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                    <path d="M 10 10 H 90 V 90 H 10 L 10 10" />
                </svg>
                
            </Card>

            <Card width="w-50" height="h-50">
                <Button>Roll Next</Button>
            </Card>
        </div>

    }
}
