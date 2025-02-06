import prisma from "@/lib/prisma";
import dayjs from "dayjs";
import { NextApiRequest, NextApiResponse } from "next";

async function getAge(fecha: string): Promise<number> {
    if (!fecha) throw new Error("La fecha de nacimiento es requerida");

    // 📌 Convertir la fecha a un objeto Day.js
    const birthDate = dayjs(fecha);

    // 📌 Verificar si la fecha es válida
    if (!birthDate.isValid()) throw new Error("Fecha de nacimiento no válida");

    // 📌 Calcular la edad restando el año actual menos el año de nacimiento
    const age = dayjs().diff(birthDate, "year");

    return age;
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

    const { username, nombres, apellidos, genero, nacimiento, correo } = req.body;

    // 📌 Validar datos requeridos
    if (!username || !nombres || !apellidos || !genero || !nacimiento || !nacimiento || !correo) {
        return res.status(400).json({ error: "Todos los campos son obligatorios, excepto el correo." });
    }

    const edad = await getAge(nacimiento)

    try {
        // 📌 Verificar si el usuario ya existe en radcheck
        const existingUser = await prisma.radcheck.findUnique({ where: { username } });
        if (existingUser) return res.status(409).json({ error: "El usuario ya existe." });

        // 📌 Insertar usuario en radcheck
        await prisma.radcheck.create({
            data: {
                username,
                attribute: "Cleartext-Password",
                op: ":=",
                value: username,
                apellidos: apellidos,
                edad: edad,
                genero: genero,
                nacimiento: nacimiento,
                nombres: nombres,
                correo: correo
            },
        });

        return res.status(201).json({ message: "Usuario registrado correctamente" });
    } catch (error) {
        console.error("❌ Error al registrar usuario:", error);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
}
