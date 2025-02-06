import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Método no permitido" });
    }

    const { username } = req.body;

    // 📌 Validar que se haya enviado el username
    if (!username) {
        return res.status(400).json({ error: "El username es obligatorio" });
    }

    try {
        // 📌 Paso 1: Verificar si el usuario existe en radcheck
        const user = await prisma.radcheck.findFirst({
            where: { username }
        });

        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        // 📌 Paso 2: Verificar si el usuario tiene una sesión activa en radacct
        const activeSession = await prisma.radacct.findFirst({
            where: {
                username,
                acctstoptime: null // Si acctstoptime es NULL, significa que sigue conectado
            }
        });

        if (activeSession) {
            return res.status(409).json({ error: "El usuario ya tiene una conexión activa" });
        }

        // 📌 Paso 3: Si no tiene sesión activa, retornar OK
        return res.status(200).json({ message: "No hay conexión activa para este usuario", username });

    } catch (error) {
        console.error("❌ Error al validar conexión:", error);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
}
