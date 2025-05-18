import type { Request, Response } from "express";
import { createLinkSchema } from "../models/validations.ts";
import type { CreateLinkSchema, Link } from "../models/validations.ts";
import log from "../log.ts";
import crypto from 'node:crypto'
import { configDotenv } from "dotenv";
import { db, findLink, insertLink } from "./db.ts";

configDotenv()

const DOMAIN = process.env.DOMAIN || "definaseudominio.com.br"

export async function validateLink(req: Request, res: Response) {
    try {
        //Recebendo link e fazendo validação
        let link = req.body
        const valid = createLinkSchema.safeParse(link)
        if (!valid.success) { res.status(400).json({ message: valid.error.message }) }
        log.debug("Novo link válido recebido ✅")
        link = await createLink(link)

        res.status(201).json({ sucess: true, message: "Link criado com sucesso", link })
    } catch (error) {
        log.fatal(error)
        res.status(500).json({ message: "Erro interno no Servidor" })
    }
}

export const createLink = async (long: CreateLinkSchema, limitDate?: Date): Promise<any> => {
    try {
        // Montando o link
        const randomBytes = crypto.randomBytes(3)
        const path = randomBytes.toString('hex').substring(0, 6)
        const short = "https://" + DOMAIN + "/" + path
        const link: Link = {
            short: short,
            long: long.link,
            path: path
        }
        if (limitDate) {
            link.limitDate = limitDate
        }

        // Importando no Banco de dados
        await insertLink(link)
        // Devolvendo link na resposta
        return link
    } catch (error) {
        log.fatal(error)
        return error
    }
}

export async function returnLink(req: Request, res: Response) {
    try {
        // Verificando a requisição (url params)
        const { path } = req.params
        log.info("Verificando parametros: ", path)

        // Chamando consulta de banco de dados
        let redirect;
        let link = await findLink(path)
        if (typeof link === "boolean") {
            redirect = "false"
            res.status(404).json({ success: false, message: "Link não encontrado" })
        } else {
            redirect = link.long
        }

        
        // Fazendo redirect
        log.info("Fazendo redirect")
        res.redirect(301, `https://${redirect}/`)
    } catch (error) {
        res.status(500).json({ success: false, message: "Erro interno no servidor" })
    }
}