import Button from "../components/Button"


export default function Host() {
    return (
        <div>
            <div className="h-15 items-center justify-center flex flex-row ">
                <Button href="/my-templates" className="group shadow-black/20 shadow-sm text-black flex flex-row gap-2 w-fit justify-center items-center h-15 self-center hover:scale-105 bg-blue-200 justify-self-center" >
                    {<img className="w-5 h-10 self-center group-hover:rotate-180 transition-all duration-200 ease-in-out" src="/PlusImage.svg" alt="" />}
                    <span className="text-black">Manage Templates</span>
                </Button>
            </div>
        </div>
    )
}