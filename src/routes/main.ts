import { Router } from "express";
import { returnLink, validateLink } from "../service/linkService.ts";

const router = Router()

router.post('/createLink', validateLink)

export default router