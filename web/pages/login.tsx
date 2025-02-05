import { useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react';

export default function Login() { // ✅ Debe ser una exportación por defecto
    const searchParams = useSearchParams();

    useEffect(() => {
        console.log(searchParams)
    }, [])

    return (
        <div>login</div>
    );
}
