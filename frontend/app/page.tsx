"use client"
import Card from "./components/Card";
import { motion } from "framer-motion";
import Cookies from 'js-cookie';
import TextType from "./components/TextType";
import Footer from "./components/Footer";
import RollOutHeader from "./components/RollOutHeader";
import { useRouter } from "next/navigation";
import Header from "./components/Header";
import FloatingActionButton from "./components/FloatingActionButton";

export default function Home() {
  const userName = Cookies.get("userName")
  const router = useRouter()
  return (
    <>
      <Header></Header>
      <div className="flex flex-col gap-8 h-120">
        <div className="flex flex-col items-center  w-full justify-center self-center ">
          <TextType
            className="uppercase text-xl font-bold absolute top-25 "
            text={["The ultimate random picker.", "Don't choose. RollOut.", "Stop arguing, start rolling.", "Fair. Fast. Random.", "Who's next? Roll it out.", "Pure RNG magic.", "Let the algorithm decide."]}
            typingSpeed={70}
            pauseDuration={2500}
            showCursor
            cursorCharacter="|"
            cursorClassName="text-blue-300 inline-flex items-center translate-y-[-2px]"
            deletingSpeed={70}
            cursorBlinkDuration={0.55}
          />

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
            <Card href="/host" width="w-80" height="h-50" padding="p-6" justifyContent="center" alignItems="center" overflowAutoOn={false} className="group gap-6 hover:drop-shadow-[0_0_20px_rgba(34,197,94,0.3)]  text-white font-bold text-2xl shadow-black/20 shadow-sm  hover:border-2 hover:scale-102 transition-all ease-in-out hover:border-green-400 backdrop-blur-md bg-white/15 border border-white/30 rounded-3xl ">
              <span className="text-white/70 text-2xl font-bold self-center select-none">Host a Game</span>
              <img className="transition-all duration-200 ease-in-out group-hover:scale-125 w-15 h-15 self-center" src="/PlayImage.svg" alt="" />
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
            <Card href="/join" width="w-80" height="h-50" overflowAutoOn={false} padding="p-6" justifyContent="center" alignItems="center" className="group gap-6 hover:drop-shadow-[0_0_20px_rgba(99,102,241,0.3)] text-white font-bold text-2xl shadow-black/20 shadow-sm  hover:border-2 hover:scale-102 transition-all ease-in-out hover:border-indigo-400 backdrop-blur-md bg-white/15 border border-white/30 rounded-3xl ">
              <span className="text-white/70 text-2xl font-bold self-center select-none">Join a Game</span>
              <img className="transition-all duration-200 ease-in-out group-hover:scale-125 w-15 h-15 self-center" src="/JoinImage.svg" alt="" />
            </Card>
          </motion.div>

        </div>
        {/* <div className="flex justify-around select-none text-gray-300">
          <span>📄 Host a Game</span>
          <span>🎲 Pick a Mode</span>
          <span>🎉 Start Rolling!</span>
        </div> */}
      </div>
      <FloatingActionButton></FloatingActionButton>
      <Footer></Footer>
    </>

  );
}
