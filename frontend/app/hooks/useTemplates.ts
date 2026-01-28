import { useState } from "react";
import { Template } from "../lib/types";
import { apiFetch } from "../lib/api";
import { useAuth } from "./useAuth";

export function useTemplates(owner_id: string | null, addToast: Function) {
    const [templates, setTemplates] = useState<Template[]>([])
    const [loading, setLoading] = useState(false)
    const { state, user, token } = useAuth()

    async function fetchTemplates() {
        if (!owner_id) return
        setLoading(true)
        const res = await apiFetch("/api/templates/all", {
            method: "POST",
            body: JSON.stringify({ owner_id: owner_id }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
        })

        setTemplates(res)
        setLoading(false)
    }

    async function createTemplate(template: Template | null) {
        if (!template) return
        const res = await apiFetch("/api/templates/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ newTemplate: template, owner_id: user?.id })
        })

        if (res.success) {
            addToast("Template has been created successfully!", "success")
            setTemplates(prev => [...prev, res.template])
            fetchTemplates()
        }
        else if (!res.success) {
            addToast("Template could not be created.", "error")
        }
    }

    async function updateTemplate(template: Template | null){
        if(!template) return
        const res = await apiFetch("/api/templates/update", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({updatedTemplate: template, owner_id: user?.id })
            })
        
        if(res.success) {
            setTemplates((prev) => {
                if (!prev) return prev

                return prev.map((t) => (template.id === t.id ? template : t))
            })

            fetchTemplates()
        }
    }

    return {
        templates,
        loading,
        fetchTemplates,
        createTemplate,
        updateTemplate
    }
}