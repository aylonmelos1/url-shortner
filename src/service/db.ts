import sqlite3 from 'sqlite3'
import log from '../log.ts';
import { createLinkSchema, dbIncludeSchema } from '../models/validations.ts';
import type { Link, Path } from '../models/validations.ts';


export const db = new sqlite3.Database('./database.db');

export const startDb = async () => {
    log.silly("Iniciando Banco de Dados")
    try {
        db.exec(`CREATE TABLE IF NOT EXISTS urls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  short TEXT NOT NULL,
  path TEXT NOT NULL UNIQUE,
  long TEXT NOT NULL,
  limitDate DATETIME NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);`)
        log.debug("Banco de Dados Iniciado ✅")
    } catch (error) {
        log.fatal("Falha ao iniciar banco de dados")
        log.fatal(error)
    }
}

export const insertLink = async (link: Link) => {
    try {
        log.info(link);
        const validLink = dbIncludeSchema.safeParse(link);
        if (!validLink.success) {
            log.warn(validLink);
            throw new Error("Formatação de link inválida, revise os dados");
        }

        // Inserindo no banco
        const banco = db.prepare(`
            INSERT INTO urls (short, long, path, limitDate)
            VALUES (?, ?, ?, ?)
        `);
        let formattedLimitDate
        if (!link.limitDate) {
            const limitDate = new Date(); // Cria uma data atual
            formattedLimitDate = limitDate.toISOString().slice(0, 19).replace("T", " ");
            log.info(formattedLimitDate); // Exemplo de saída: "2025-05-18 14:30:45"        }
        }
        const linkData = (await banco).run(link.short, link.long, link.path, formattedLimitDate ?? null);
        log.debug("Link salvo no banco de dados com Sucesso ✅", linkData)
        return linkData;
    } catch (error) {
        log.fatal(error);
    }
};

export const findLink = async (path: Path): Promise<Link | boolean> => {
    try {
        // Link recebido é validado na entrada, seguindo para consulta
        log.info("Buscando por link no banco de dados: ", path)
        const preparedb = db.prepare(`SELECT * FROM urls WHERE path = ?`);

        // Usar Promise para lidar com a natureza assíncrona de preparedb.all
        const linkDb: Link[] = await new Promise((resolve, reject) => {
            preparedb.all(path, (err: Error | null, rows: Link[]) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });

        preparedb.finalize(); // Liberar o statement

        log.info(linkDb)

        return linkDb[0]
    } catch (error) {
        log.fatal(error)
        return false
    }
}