"use client"
import Button from "./components/Button";
import Card from "./components/Card";
import { motion } from "framer-motion";
import Cookies from 'js-cookie';
import Shuffle from "./components/Shuffle";
import GradientText from "./components/GradientText";
import TextType from "./components/TextType";

export default function Home() {
  const userName = Cookies.get("userName")
  return (
    <div className="flex flex-col gap-8 h-120">
      {/* <span className=" font-bold left-5 text-black/40 top-5 text-3xl absolute">Welcome {userName && userName}!</span> */}
      <div className="flex flex-col items-center gap-4 w-full justify-center self-center ">
        <Shuffle
          className="self-center select-none text-7xl font-extrabold text-blue-300 drop-shadow-lg tracking-tight hover:scale-105 transition-all duration-300 ease-out"
          text="RollOut"
          shuffleDirection="right"
          duration={0.35}
          animationMode="evenodd"
          shuffleTimes={1}
          ease="power3.out"
          stagger={0.03}
          threshold={0.1}
          triggerOnce={true}
          triggerOnHover
          respectReducedMotion={true}
          loop={true}
          loopDelay={2}
        />
        <TextType
          text={["The ultimate random picker!", "More than just a Rolling-Site", "A fun way to decide whos next!"]}
          typingSpeed={75}
          pauseDuration={1500}
          showCursor
          cursorCharacter="|"
          deletingSpeed={50}
          cursorBlinkDuration={0.5}
          className="text-white/80 text-xl font-bold select-none "
        />
      </div>
      <div className="flex flex-row gap-15">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 250,
            damping: 20,
          }}
        >
          <Card href="/host" width="w-80" height="h-50" padding="p-6" justifyContent="center" alignItems="center" overflowAutoOn={false} className="group gap-6 text-white font-bold text-2xl shadow-black/20 shadow-sm  hover:border-2 hover:scale-102 hover:border-white/70 backdrop-blur-md bg-white/15 border border-white/30 rounded-3xl ">
            <span className="text-white/70 text-2xl font-bold self-center select-none">Host a Game</span>
            <img className="transition-all duration-200 ease-in-out group-hover:scale-125 w-20 h-20 self-center" src="/PlayImage.svg" alt="" />
          </Card>
        </motion.div>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 250,
            damping: 20,
          }}
        >
          <Card href="/join" width="w-80" height="h-50" overflowAutoOn={false} padding="p-6" justifyContent="center" alignItems="center" className="group text-white font-bold text-2xl shadow-black/20 shadow-sm  hover:border-2 hover:scale-102 hover:border-white/70 backdrop-blur-md bg-white/15 border border-white/30 rounded-3xl ">
            <span className="text-white/70 text-2xl font-bold self-center select-none">Join a Game</span>
            <img className="transition-all duration-200 ease-in-out group-hover:scale-125 w-20 h-20 self-center" src="/JoinImage.svg" alt="" />
          </Card>
        </motion.div>
      </div>

    </div>
  );
}
