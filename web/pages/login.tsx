import { useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react'

export const login = () => {
    const searchParams = useSearchParams();
    useEffect(() => {
        console.log(searchParams)
    }, [])

    return (
        <div>login</div>
    )
}
