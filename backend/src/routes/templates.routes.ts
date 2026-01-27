import { Router } from "express";
import { loginAuthentication } from "../middleware/secureMiddleware";
import { fetchAllTemplates } from "../services/db-actions";
import { randomBytes } from "node:crypto";
import { updateUserTemplate } from "../services/db-actions";
import { createNewUserTemplate } from "../services/db-actions";
import { deleteTemplateById } from "../services/db-actions";

const templateRouter = Router()

templateRouter.post("/all", loginAuthentication, async (req, res) => {
  const { owner_id } = req.body
  const result = await fetchAllTemplates(owner_id)
  console.log("Owner templates: ", result)
  return res.json(result)
})


templateRouter.post("/update", loginAuthentication, async (req, res) => {
  try {
    const { updatedTemplate, owner_id } = req.body

    console.log("Template to be updated: ", updatedTemplate)

    if (!updatedTemplate) return res.send({ success: false, message: "Error: Template given to API is either empty or damaged." })

    const template = await updateUserTemplate(owner_id, updatedTemplate.id, updatedTemplate)

    if (template) return res.send({ success: true, message: "Template has been updated.", template })
    else return res.send({ success: false, message: "Error: Could not update the template." })

  } catch (err) {
    console.log(err)
  }
})

templateRouter.post("/create", loginAuthentication, async (req, res) => {
  const { newTemplate, owner_id } = req.body
  console.log("new template: ", newTemplate, "owner id: ", owner_id)
  if (!newTemplate || !owner_id) return res.send({ success: false, message: "New Template or ownerId is missing." })

  newTemplate.id = randomBytes(8).toString("hex")

  try {
    console.log("Template ID: ", newTemplate.id)
    const success = await createNewUserTemplate(owner_id, newTemplate)
    if (success) return res.send({ success: true, message: "New user template successfully created.", template: success.template })
    else return res.send({ success: false, message: "Error: Could not create new user template." })
  } catch (err) {
    console.log(err)
  }

})

templateRouter.post("/delete", loginAuthentication, async (req, res) => {
  const { template_id, owner_id } = req.body
  if (!template_id || !owner_id) return res.send({ success: false, message: "Error: Could not delete requested template." })

  try {
    const success = await deleteTemplateById(template_id, owner_id)
    if (success) {
      return res.send({ success: true, message: "Template has been deleted successfully." })
    } else return res.send({ success: false, message: "Failed to delete Template. Error with DB function." })
  } catch (err) {
    return res.send({ error: err })
  }
})



export default templateRouter