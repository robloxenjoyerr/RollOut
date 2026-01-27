import { db } from "../db/database"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const JWT_SECRET = "c426a049b495b92e2fa250961d99ef62b36f8c97fd99d742e105c2141e08388bb81f8dd4a5a4ecd0864dd05760dff2944cb1e71e9802b013f958ea62b8f651a5"

export type GamePhase = "unstarted" | "waiting-lobby" | "in-progress" | "finished";
export type Mode = "random" | "wheel" | "plinko" | "casino";
export type PersonState = "unrolled" | "rolled";
export type Person = {
    id: string,
    name: string,
    state: PersonState
}


export type Template = {
    id: string,
    owner_id: string,
    name: string,
    persons: Person[],
    mode: Mode
}

export async function createNewUserTemplate(owner_id: string, template: Template) {
    const stmt = db.prepare(`
            INSERT INTO templates (id, owner_id, name, persons, mode)
            VALUES (?, ?, ?, ?, ?)
        `)
    const info = stmt.run(template.id, owner_id, template.name, JSON.stringify(template.persons), template.mode)

    if (info.changes > 0) return {template}
    return null
}

export async function getTemplateByUserId(userId: string) {
    const stmt = db.prepare("SELECT * FROM templates WHERE owner_id = ?")
    const rows = stmt.all(userId) as Template[]

    return rows.map(row => ({ ...row }))
}

export async function getTemplateById(id: string) {
    const stmt = db.prepare("SELECT * FROM templates WHERE id = ?")
    const row = stmt.get(id) as Template | undefined

    if (!row) return null

    return { ...row }
}

export async function deleteTemplateById(id: string, owner_id: string) {
    console.log("Deleting template with id: ", id, " for owner: ", owner_id)
    const stmt = db.prepare("DELETE FROM templates WHERE id = ? AND owner_id = ?")
    const info = stmt.run(id, owner_id)

    return info.changes > 0 ? true : false
}


export interface UserResponse {
    success: boolean,
    message: string,
    token?: string
}


export async function createNewUser(id: string, username: string, password: string): Promise<UserResponse>  {
    const checkUser = db.prepare("SELECT id FROM users WHERE username = ?").get(username.trim())
    if (checkUser) {
        console.log("Error: User with this username already exists.")
        return { success: false, message: "User with this username already exists."}
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    
    try {
        const stmt = db.prepare(`
                INSERT INTO users (id, username, hashed_password, created_at)
                VALUES (?, ?, ?, ?)
            `)
        
        const date = new Date().toISOString()
        const info = stmt.run(id, username.trim(), hashedPassword, date)
        const token = jwt.sign({id: id, name: username}, JWT_SECRET, { expiresIn: '1h'})

        return {
            success: true,
            message: "User successfully created!",
            token: token
        }
    } catch(err:any) {
        console.log(err)
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE'){
            throw new Error("Username existiert bereits.")
        }

        throw new Error("Fehler beim Erstellen des User-Accounts.")
    }
}

export async function checkLogin(username: string, password: string) {
    const user = db.prepare(`
            SELECT id, username, hashed_password
            FROM users
            WHERE username = ?
        `).get(username.trim()) as any
        
    if(!user) {
        console.log("User not found.")
        return { success: false, message: "Wrong Login-Credentials"}
    }

    const isMatch = await bcrypt.compare(password, user.hashed_password)

    if (isMatch) {
        const token = jwt.sign({ id: user.id.toString(), name: user.username}, JWT_SECRET, { expiresIn: "7d"})
        return { success: true, token: token}
    } else {
        return { success: false, message: "Wrong password."}
    }
}

export async function deleteAllUsers() {
    const stmt = db.prepare(`
            DELETE FROM users 
        `)

    const info = stmt.run()

    return console.log(info.changes)
}

export async function fetchAllTemplates(owner_id: string) {
    const stmt = db.prepare(`
            SELECT * FROM templates where owner_id = ?
        `)
    
    const templates = stmt.all(owner_id) as any[]

    return templates.map(template => ({
        ...template,
        persons: JSON.parse(template.persons)
    }))
}

export async function updateUserTemplate(owner_id: string, templateId: string, updatedtemplate: Template) {
    const stmt = db.prepare(`
            UPDATE templates 
            SET name = ?, mode = ?, persons = ?
            WHERE id = ? AND owner_id = ?        
        `)

    const result = stmt.run(updatedtemplate.name, updatedtemplate.mode, JSON.stringify(updatedtemplate.persons), templateId, owner_id)

    if (result.changes > 0) {
        console.log("Template updated succesfully.")
        return updatedtemplate
    } else {
        console.error("Template couldnt be updated.")
        return null
    }
}



