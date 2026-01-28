"use client"

import Button from "../components/Button";
import Loading from "../components/Loading";
import Card from "../components/Card";
import { AnimatePresence, motion } from "framer-motion";

import { useToasts } from "../hooks/useToasts";
import { useAuth } from "../hooks/useAuth";
import { useTemplates } from "../hooks/useTemplates";
import { useAvailableGames } from "../hooks/useAvailableGames";
import RollOutHeader from "../components/RollOutHeader";


export default function JoinPage() {
    const { toasts, addToast } = useToasts()
    const { liveGames, loading } = useAvailableGames()

    async function joinGame(){
        
    }

    console.log("Live Games: ", liveGames)
    return <>
        <div className=" flex flex-col w-[80vw] h-[80vh] gap-20">
            <RollOutHeader/>
            <div className="flex flex-col gap-2 relative top-0">
                <div className="flex flex-row gap-4">
                    <h1 className="text-black font-bold text-7xl top-0 select-none">Live Games</h1>
                </div>
                <h2 className="text-gray-500 font-light text-2xl select-none">Join Live Games here!</h2>
            </div>
            <div className="h-160 flex flex-row flex-wrap gap-5 items-start content-start ">
                <AnimatePresence>
                    {loading ? (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                            layout={true}
                            transition={{
                                type: "spring",
                                stiffness: 260,
                                damping: 20,
                            }}
                        >
                            <Loading />
                        </motion.div>
                    ) : liveGames && liveGames.length > 0 ? (
                        liveGames.map((game, index) => (
                            <motion.div
                                key={game.id}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                                layout={true}
                                transition={{
                                    type: "spring",
                                    stiffness: 260,
                                    damping: 20,
                                    delay: index * 0.1
                                }}
                            >
                                <Card
                                    height="h-30"
                                    flexDirection="flex-row"
                                    justifyContent="justify-between"
                                    gap="gap-4"
                                    autoMarginOn={false}
                                    padding="p-0"
                                    overflowAutoOn={false}
                                    width="w-75"
                                    className="group hover:cursor-pointer border-black/20 p-4"
                                    onClick={joinGame}
                                >
                                    <div className="flex flex-col gap-4">
                                        <div className="flex flex-row gap-3">
                                            <div className="flex flex-row gap-2 rounded-sm bg-blue-200 w-fit p-1">
                                                <span className="text-black">{game.name}</span>
                                            </div>
                                            <div className="rounded-sm bg-blue-200 w-fit p-1 select-none text-gray-500">
                                                {game.id}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))
                    ) : (
                        <>
                            <Loading />
                        </>
                    )}
                </AnimatePresence>


            </div >
        </div >
    </>
}