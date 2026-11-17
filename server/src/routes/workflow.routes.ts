import { Router } from "express"
import Controllers from "../controllers/index.js"
import { auth } from "../middlewares/auth.js"
import { validate } from "../middlewares/validate.js"
import { createWorkflowSchema, updateWorkflowSchema } from "../types/workflow.types.js"

export const WORKFLOWS_BASE_PATH = "/api/v1/workflows"

const WorkflowRouter = Router()
const { WorkflowController } = Controllers

WorkflowRouter.use(auth)

// before /:id, or Express reads "dashboard" as an id
WorkflowRouter.get("/dashboard", WorkflowController.dashboard)

WorkflowRouter.get("/", WorkflowController.list)

WorkflowRouter.post("/", validate(createWorkflowSchema), WorkflowController.create)

WorkflowRouter.get("/:id", WorkflowController.getById)

WorkflowRouter.put("/:id", validate(updateWorkflowSchema), WorkflowController.update)

WorkflowRouter.post("/:id/duplicate", WorkflowController.duplicate)

WorkflowRouter.delete("/:id", WorkflowController.remove)

export default WorkflowRouter
