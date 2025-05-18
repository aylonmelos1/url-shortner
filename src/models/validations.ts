// src/models/validations.ts
import { z } from 'zod'

// Schema de Inclusão de Links
export const dbIncludeSchema = z.object({
    short: z.string().min(2),
    long: z.string().min(3),
    path: z.string().min(6, "Caminho do novo link precisa ter 6 caracteres"),
    limitDate: z.date().nullable().optional()
})

export type Link = z.infer<typeof dbIncludeSchema>

// Schema que o body deve vir para ser aceito
export const createLinkSchema = z.object({
    link: z.string().min(3, "Link muito curto, reveja o link enviado e tente novamente")
})
export type CreateLinkSchema = z.infer<typeof createLinkSchema>


export const path = z.string().min(6, "Link desconhecido, menor que 6 caracteres").max(6, "Link desconhecido, maior que 6 caracteres")
export type Path = z.infer<typeof path>