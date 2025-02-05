"use client";

import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function Login() {
    const searchParams = useSearchParams();
    const [params, setParams] = useState({
        ga_srvr: "",
        ga_cmac: "",
    });

    useEffect(() => {
        setParams({
            ga_srvr: searchParams.get("ga_srvr") || "No definido",
            ga_cmac: searchParams.get("ga_cmac") || "No definido",
        });

        console.log("🚀 Parámetros obtenidos:", {
            ga_srvr: searchParams.get("ga_srvr"),
            ga_cmac: searchParams.get("ga_cmac"),
        });
    }, [searchParams]); // Se ejecuta cada vez que cambian los parámetros

    return (
        <div>
            <h1>Login del Portal Cautivo</h1>
            <p><strong>Servidor RADIUS:</strong> {params.ga_srvr}</p>
            <p><strong>MAC del Cliente:</strong> {params.ga_cmac}</p>
        </div>
    );
}
