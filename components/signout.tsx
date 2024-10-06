'use client'

import { signOut } from 'next-auth/react'

export function Signout() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-lg font-medium hover:underline"
        >
            Sign out
        </button>
    )
}
