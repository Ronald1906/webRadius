import prisma from "@/lib/prisma";
import dayjs from "dayjs";
import { NextApiRequest, NextApiResponse } from "next";

async function getAge(fecha: string): Promise<number> {
    if (!fecha) throw new Error("La fecha de nacimiento es requerida");

    const birthDate = dayjs(fecha);
    if (!birthDate.isValid()) throw new Error("Fecha de nacimiento no válida");

    return dayjs().diff(birthDate, "year");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Método no permitido" });
    }

    const { username, nombres, apellidos, genero, nacimiento, correo } = req.body;

    // 📌 Validar datos requeridos
    if (!username || !nombres || !apellidos || !genero || !nacimiento) {
        return res.status(400).json({ error: "Todos los campos son obligatorios, excepto el correo." });
    }

    try {
        // 📌 Verificar si el usuario ya existe en radcheck
        const existingUser = await prisma.radcheck.findFirst({ where: { username } });
        if (existingUser) return res.status(409).json({ error: "El usuario ya existe." });

        // 📌 Calcular la edad
        const edad = await getAge(nacimiento);

        // 📌 Insertar credenciales en radcheck (contraseña = username por defecto)
        await prisma.radcheck.create({
            data: {
                username,
                attribute: "Cleartext-Password",
                op: ":=",
                value: username,
                apellidos:apellidos,
                edad:edad,
                genero: genero,
                nacimiento: new Date(nacimiento),
                nombres: nombres,
                correo: correo,
            },
        });

        return res.status(201).json({ message: "Usuario registrado correctamente" });
    } catch (error) {
        console.error("❌ Error al registrar usuario:", error);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
}
