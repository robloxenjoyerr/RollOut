"use client"

import Button from "../components/Button";
import Input from "../components/Input";
import Loading from "../components/Loading";
import Card from "../components/Card";
import Overlay from "../components/Overlay";
import SwitchMode from "../components/SwitchMode";
import ToastContainer from "../components/ToastContainer";
import { useEffect, useState } from 'react'
import { apiFetch } from "../lib/api";
import { useRouter } from "next/navigation";
import { Person, Template } from "../lib/types";
import { AnimatePresence, motion } from "framer-motion";
import { Mode } from "../lib/types";
import { randomBytes } from "crypto";
import { useToasts } from "../hooks/useToasts";
import { useAuth } from "../hooks/useAuth";
import { useTemplates } from "../hooks/useTemplates";
import { create } from "domain";

type Modal =
    | { type: "create" }
    | { type: "edit"; template: Template | null }
    | { type: "delete"; template: Template | null }
    | null

export default function Home() {
    const [isStartingTemplate, setIsStartingTemplate] = useState<Template | null>(null)
    const [draftTemplate, setDraftTemplate] = useState<Template | null>(null)
    const [modal, setModal] = useState<Modal>(null)
    const { toasts, addToast } = useToasts()
    const { state, user, token } = useAuth()
    const { templates, loading, fetchTemplates, createTemplate, updateTemplate } = useTemplates(user?.id, addToast)
    const router = useRouter()

    // Fetch templates all 10s
    useEffect(() => {
        fetchTemplates()
    }, [])

   
    function openCreateModal() {
        setDraftTemplate({
            id: "",
            owner_id: user!.id,
            name: "",
            persons: [],
            mode: "random",
            state: "unstarted"
        })
        setModal({ type: "create" })
    }

    function openEditModal(template: Template | null) {
        if (!template) return
        setDraftTemplate(structuredClone(template))
        setModal({ type: "edit", template })
        console.log("Modal set to Edit")
    }

    function openDeleteModal(template: Template | null) {
        if (!template) return
        setModal({ type: "delete", template })
    }


    function handleTemplateNameChange(newName: string, isNewTemplate: boolean = false) {
        if (isNewTemplate) {
            setDraftTemplate((prev) => {
                if (!prev) return null;
                return { ...prev, name: newName };
            })

            addToast(`Template name updated to ${newName}`, "info")
        } else {
            if (!draftTemplate) return;
            setDraftTemplate((prev) => {
                if (!prev) return null;
                return { ...prev, name: newName };
            })

            addToast(`Template name updated to ${newName}`, "info")
        }

    }

    function deletePersonFromTemplate(index: Number, isNewTemplate: boolean = false) {
        if (!isNewTemplate) {
            setDraftTemplate((prev) => {
                if (!prev) return null;
                const updatedPersons = prev.persons.filter((_, i) => i !== index);
                return { ...prev, persons: updatedPersons };
            })

            addToast("Person deleted from template", "info")
        }
        else {
            console.log("Deleting from new template.")
            setDraftTemplate((prev) => {
                if (!prev) return null;
                const updatedPersons = prev.persons.filter((_, i) => i !== index);
                return { ...prev, persons: updatedPersons };
            })

            addToast("Person deleted from template", "info")
        }


    }

    function addPersonToTemplate(newName: string) {

        setDraftTemplate((prev) => {
            if (!prev) return null

            const newPerson: Person = { id: randomBytes(4).toString("hex"), name: newName, state: "unrolled" }
            const updatedPersons = [...prev.persons, newPerson]
            return {
                ...prev,
                persons: updatedPersons
            }
        })

        addToast(`Person ${newName} added to template`, "success")

    }

    function handlePersonNameChange(index: number, newName: string) {
        setDraftTemplate(prev => {
            if (!prev) return null
            const persons = [...prev.persons]
            persons[index] = { ...persons[index], name: newName }
            return { ...prev, persons }
        })
    }

    function handleUpdateTemplateMode(newMode: Mode, isNewTemplate: boolean = false) {
        if (!isNewTemplate) {
            if (!draftTemplate) return

            setDraftTemplate((prev) => {
                if (!prev) return null
                return {
                    ...prev,
                    mode: newMode
                }
            })

            addToast(`Template mode updated to ${newMode}`, "info")
        }
        else {
            setDraftTemplate((prev) => {
                if (!prev) return null

                return {
                    ...prev,
                    mode: newMode
                }
            })

            addToast(`Template mode updated to ${newMode}`, "info")
        }
    }

    function startGame(template: Template | null) {
        if (!template) return
        window.location.href = `/game/${template.id}`
    }

    function logOut() {
        localStorage.setItem("login_token", "")
        if (!token) window.location.href = "/login"
    }

    async function deleteTemplate() {
        if (!(modal?.type === "delete") || !modal.template) return null

        console.log("Is deleting", modal?.type === "delete")
        if (!token || !user.id) return null
        try {
            const res = await apiFetch("/api/templates/delete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ template_id: modal?.template.id, owner_id: user.id })
            })

            if (res.success) {
                setModal(null)
                fetchTemplates()
                addToast("Template deleted successfully!", "success")
            }
            else if (!res.success) return console.error("Error: ", res.message)
        } catch (err) {
            console.error(err)
        }
    }

    if (state === "loading") return <Loading className="bg-white "></Loading>
    if (state === "unauthenticated") {
        window.location.href = "/login"
    }
    if (state === "authenticated") {
        return <>
            <span onClick={() => window.location.href = "/"} className="hover:cursor-pointer absolute rounded-xs top-5 self-center select-none text-6xl hover:scale-110 transition-all duration-200 ease-in-out bg-gradient-to-r from-pink-500 via-yellow-500 to-blue-500 bg-[length:200%_200%] animate-gradient text-transparent bg-clip-text font-extrabold">RollOut</span>
            <Button onClick={logOut} className="flex hover:bg-red-300 text-black hover:cursor-pointer absolute rounded-xl border-2 p-0! border-black/30 top-5 bg-red-200 right-5 h-fit w-fit items-center justify-center ">
                <img className="w-7 h-7 " src="/logout.svg" alt="" />
            </Button>
            <div className=" flex flex-col w-[80vw] h-[80vh] gap-20">
                <div className="flex flex-col gap-2 relative top-0">
                    <div className="flex flex-row gap-4">
                        <h1 className="text-black font-bold text-7xl top-0 select-none">Your Templates</h1>
                        <Button className="group w-15 h-15 self-center bg-blue-200 rounded-3xl" onClick={() => setModal({ type: "create" })}>
                            <img className="group-hover:rotate-90 transition-all duration-150" src="/PlusImage.svg" alt="" />
                        </Button>
                    </div>
                    <h2 className="text-gray-500 font-light text-2xl select-none">Create and Manage your game templates here - To Edit an existing Template simply click on it!</h2>
                </div>

                {/* Toast Message Container */}
                <AnimatePresence>

                    <ToastContainer toasts={toasts}></ToastContainer>
                </AnimatePresence>

                {/* Create new Template */}
                <Overlay isOpen={modal?.type === "create"} onClose={() => setModal(null)} className="z-50 w-100 h-100">
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-row gap-2 h-fit">
                            <Input onChangeValue={(e: React.ChangeEvent<HTMLInputElement>) => handleTemplateNameChange(e.target.value, true)} name="templateName" placeholder="New Template Name" className="hover:bg-black/10" />
                            <SwitchMode onChange={(e) => handleUpdateTemplateMode(e)} className="bg-blue-200"></SwitchMode>
                        </div>
                        <Input onButtonClick={(name: string) => addPersonToTemplate(name)} buttonText="Add" placeholder="Person Name" className="hover:bg-black/10" />
                        <div className="flex flex-col border-2 border-black/20 rounded-2xl h-40 overflow-y-scroll">
                            {
                                <AnimatePresence>
                                    {draftTemplate ? draftTemplate.persons.map((person, index) => (
                                        <motion.div
                                            key={person.id}
                                            className="flex items-center text-black m-1 hover:bg-black/30 text-center select-none hover:cursor-pointer bg-black/20 p-1.5 rounded-xl"
                                            onClick={() => ""}
                                            layout={true}
                                            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                                            initial={{ opacity: 0, scale: 0.8 }} // Start-Zustand: Klein und unsichtbar
                                            whileInView={{ opacity: 1, scale: 1 }} // Zustand, wenn es in den sichtbaren Bereich gescrollt wird
                                            viewport={{ once: false, margin: "-5px" }}  // Verhindert, dass die Animation jedes Mal neu triggert (optional)
                                            transition={{ type: "spring", stiffness: 200, damping: 25 }}
                                        >
                                            <input
                                                className="flex-1 text-center focus:outline-none focus:cursor-pointer hover:cursor-pointer"
                                                value={person.name}
                                                onChange={(e) => handlePersonNameChange(index, e.target.value)}
                                            />
                                            <div onClick={() => deletePersonFromTemplate(index, true)} className="flex rounded-xl hover:bg-red-300 active:bg-red-400 active:scale-95 transition-all duration-100 ease-in-out hover:scale-105 right-0">
                                                <img className="h-5 w-5 rounded-2xl p-0 m-1 " src="/Bin.svg" alt="" />
                                            </div>
                                        </motion.div>
                                    ))
                                        :
                                        <span className="text-black/70 self-center justify-self-center mt-17">No Person added...</span>
                                    }
                                </AnimatePresence>
                            }
                        </div>
                        <Button onClick={() => { draftTemplate && createTemplate(draftTemplate); setModal(null) }}>Create Template</Button>
                    </div>
                </Overlay>

                {/* Edit existing Templates */}
                <Overlay isOpen={modal?.type === "edit"} onClose={() => { setModal(null) }} className="z-50 w-100 h-100">
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-row gap-2 h-fit">
                            <Input onChangeValue={(e: React.ChangeEvent<HTMLInputElement>) => handleTemplateNameChange(e.target.value)} name="templateName" placeholder="New Template Name" className="hover:bg-black/10" />
                            <SwitchMode onChange={(e) => handleUpdateTemplateMode(e)} className="bg-blue-200"></SwitchMode>
                        </div>
                        <Input onButtonClick={(name: string) => addPersonToTemplate(name)} buttonText="Add" placeholder="Person Name" className="hover:bg-black/10" />
                        <div className="flex flex-col border-2 border-black/20 rounded-2xl h-40 overflow-y-scroll">
                            {
                                <AnimatePresence>
                                    {draftTemplate ? draftTemplate.persons.map((person, index) => (
                                        <motion.div
                                            key={person.id}
                                            className="flex items-center text-black m-1 hover:bg-black/30 text-center select-none hover:cursor-pointer bg-black/20 p-1.5 rounded-xl"
                                            onClick={() => ""}
                                            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                                            layout={true}
                                            initial={{ opacity: 0, scale: 0.8 }} // Start-Zustand: Klein und unsichtbar
                                            whileInView={{ opacity: 1, scale: 1 }} // Zustand, wenn es in den sichtbaren Bereich gescrollt wird
                                            viewport={{ once: false, margin: "-5px" }}  // Verhindert, dass die Animation jedes Mal neu triggert (optional)
                                            transition={{ type: "spring", stiffness: 200, damping: 25 }}
                                        >
                                            <input
                                                className="flex-1 text-center focus:outline-none focus:cursor-pointer hover:cursor-pointer"
                                                value={person.name}
                                                onChange={(e) => handlePersonNameChange(index, e.target.value)}
                                            />
                                            <div onClick={() => deletePersonFromTemplate(index)} className="flex rounded-xl hover:bg-red-300 active:bg-red-400 active:scale-95 transition-all duration-100 ease-in-out hover:scale-105 right-0">
                                                <img className="h-5 w-5 rounded-2xl p-0 m-1 " src="/Bin.svg" alt="" />
                                            </div>
                                        </motion.div>

                                    ))
                                        :

                                        <Loading></Loading>
                                    }
                                </AnimatePresence>

                            }
                        </div>
                        <Button onClick={() => { updateTemplate(draftTemplate); setModal(null) }}>Update</Button>
                    </div>
                </Overlay>

                {/* Delete confirmation */}
                <Overlay isOpen={modal?.type === "delete"} onClose={() => setModal(null)} className="z-50 flex flex-col gap-2 ">
                    <span className="text-black">Delete permanently?</span>
                    <div className="flex gap-3 justify-between">
                        <Button onClick={() => deleteTemplate()}>Yes</Button>
                        <Button onClick={() => setModal(null)}>No</Button>
                    </div>
                </Overlay>

                {/* Start confirmation */}
                <Overlay isOpen={isStartingTemplate ? true : false} onClose={() => setIsStartingTemplate(null)} className="z-50 flex flex-col gap-2 ">
                    <span className="text-black">Start game with selected template?</span>
                    <div className="flex gap-3 justify-center">
                        <Button className="bg-green-400" onClick={() => startGame(isStartingTemplate)}>Yes</Button>
                        <Button className="bg-red-400" onClick={() => setIsStartingTemplate(null)}>No</Button>
                    </div>
                </Overlay>

                <div className="h-160 flex flex-row flex-wrap gap-5 items-start content-start ">
                    <AnimatePresence>
                        {templates ? templates.map((template, index) => (
                            <motion.div
                                key={template.id}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                                layout={true}
                                transition={{
                                    type: "spring",
                                    stiffness: 260,
                                    damping: 20,
                                    delay: index * 0.1 // Stagger-Effekt (nacheinander aufploppen)
                                }}
                            >
                                <Card onClick={() => { openEditModal(template) }} height="h-30" flexDirection="flex-row" justifyContent="justify-between" gap="gap-4" autoMarginOn={false} padding="p-0" overflowAutoOn={false} width="w-75" className={`group hover:cursor-pointer ${modal?.type === "edit" ? "" : "hover:border-blue-400 border-3 hover:scale-105 hover:bg-blue-50"}   border-black/20 p-4`}>
                                    <div className="flex flex-col gap-4">
                                        <span className="font-bold select-none">{template.name}</span>
                                        <div className="flex flex-row gap-3">
                                            <div className="flex flex-row gap-2 rounded-sm bg-blue-200 w-fit p-1">
                                                <img className="w-5 h-5" src="/Persons.svg" alt="" />
                                                <p className="text-gray-500 select-none">{template.persons.length} {template.persons.length > 1 ? "persons" : "person"}</p>
                                            </div>
                                            <div className="rounded-sm bg-blue-200 w-fit p-1 select-none text-gray-500">
                                                {template.mode}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col h-fit self-center gap-1">
                                        <Button onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); setModal({ type: "delete", template: template }) }} className={`${modal?.type === "create" || modal?.type === "edit" || modal?.type === "delete" ? "hidden" : "block"} h-fit w-fit p-0 bg-transparent shadow-none opacity-0  hover:bg-red-300 active:bg-red-400 group-hover:opacity-100`}>
                                            <img className="w-4 h-4 p-0" src="/Bin.svg" alt="" />
                                        </Button>
                                        <Button onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); setIsStartingTemplate(template) }} className={`${modal?.type === "create" || modal?.type === "edit" || modal?.type === "delete" ? "hidden" : "block"} bg-transparent shadow-none opacity-0 hover:bg-green-300 active:bg-green-400 group-hover:opacity-100`}>
                                            <img className="w-4 h-4 " src="/play-svgrepo-com.svg" alt="" />
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        )) : <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                            layout={true}
                            transition={{
                                type: "spring",
                                stiffness: 260,
                                damping: 20,

                            }}>
                            <Loading></Loading>
                        </motion.div>}
                    </AnimatePresence>


                </div>
                <dialog>
                    Test
                </dialog>
            </div>
        </>
    }
    else {
        return <Loading className="bg-black"></Loading>
    }
}