"use client"
import Card from "./components/Card";
import { motion } from "framer-motion";
import Cookies from 'js-cookie';
import TextType from "./components/TextType";
import Footer from "./components/Footer";
import RollOutHeader from "./components/RollOutHeader";
import { useRouter } from "next/navigation";

export default function Home() {
  const userName = Cookies.get("userName")
  const router = useRouter()
  return (
    <>
      <div className="flex flex-col gap-8 h-120">
        <div className="flex flex-col items-center w-full justify-center self-center ">
          <RollOutHeader>
            <TextType
              text={["The ultimate random picker!", "More than just a Rolling-Site", "A fun way to decide whos next!"]}
              typingSpeed={75}
              pauseDuration={3500}
              showCursor
              cursorCharacter="|"
              deletingSpeed={70}
              cursorBlinkDuration={0.5}
              className="text-[#D4AF37] text-xl font-bold select-none "
            />

          </RollOutHeader>

        </div>
        <div className="flex flex-row gap-15 mt-15">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 250,
              damping: 20,
            }}
          >
            <Card href="/host" width="w-80" height="h-50" padding="p-6" justifyContent="center" alignItems="center" overflowAutoOn={false} className="group gap-6 text-white font-bold text-2xl shadow-black/20 shadow-sm  hover:border-2 hover:scale-102 hover:border-green-400 backdrop-blur-md bg-white/15 border border-white/30 rounded-3xl ">
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
            <Card href="/join" width="w-80" height="h-50" overflowAutoOn={false} padding="p-6" justifyContent="center" alignItems="center" className="group gap-6 text-white font-bold text-2xl shadow-black/20 shadow-sm  hover:border-2 hover:scale-102 hover:border-indigo-400 backdrop-blur-md bg-white/15 border border-white/30 rounded-3xl ">
              <span className="text-white/70 text-2xl font-bold self-center select-none">Join a Game</span>
              <img className="transition-all duration-200 ease-in-out group-hover:scale-125 w-20 h-20 self-center" src="/JoinImage.svg" alt="" />
            </Card>
          </motion.div>

        </div>
        <div className="flex justify-around gap-5">

          <span className="text-[10px] select-none w-fit self-center flex text-center text-white/50 backdrop-blur-md border-t-2 bg-white/5 border border-white/10 p-1 rounded-xl uppercase">
            <div className="self-center w-1.5 h-1.5 m-1 rounded-full bg-green-500 animate-pulse" />
            currently 0 rooms active 🔥
          </span>

        </div>
        {/* <div className="flex justify-around select-none text-gray-300">
          <span>📄 Host a Game</span>
          <span>🎲 Pick a Mode</span>
          <span>🎉 Start Rolling!</span>
        </div> */}
      </div>
      <Footer></Footer>
    </>

  );
}
