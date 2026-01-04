import Button from "./components/Button";
import Card from "./components/Card";

export default function Home() {
  return (
    <div className="flex flex-col gap-8 h-120">
      <span className="select-none self-center text-6xl hover:scale-110 transition-all duration-200 ease-in-out hover:rotate-1 bg-gradient-to-r from-pink-500 via-yellow-500 to-blue-500 bg-[length:200%_200%] animate-gradient text-transparent bg-clip-text font-extrabold">RollOut</span>
      <div className="flex flex-row gap-5">
        <Card href="/host" width="w-120" height="h-70" padding="p-6" justifyContent="center" alignItems="center" className="group border-gray-200 shadow-black/20 shadow-sm hover:bg-blue-100 hover:border-2 hover:border-blue-400 ">
          <span className="relative text-black text-2xl font-bold self-center select-none">Host a Game</span>
          <p className="text-gray-500 self-center select-none h-15">Create a room, share the code and start rolling people from your pool!</p>
          <img className="transition-all duration-200 ease-in-out group-hover:scale-125 w-20 h-20 self-center" src="/PlayImage.svg" alt="" />

        </Card>
        <Card href="/join" width="w-120" height="h-70" padding="p-6" justifyContent="center" alignItems="center" className="group border-gray-200 shadow-black/20 shadow-sm hover:bg-green-100 hover:border-2 hover:border-green-400 ">
          <span className="text-black text-2xl font-bold self-center select-none">Join a Game</span>
          <p className="text-gray-500 self-center select-none h-15">Join a room, and watch who gets rolled first!</p>
          <img className="transition-all duration-200 ease-in-out group-hover:scale-125 w-20 h-20 self-center" src="/JoinImage.svg" alt="" />
        </Card>
      </div>
      
    </div>
  );
}
