"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/../lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

type AuthContextType = {
    user: User | null;
    session: Session | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    login: async (email: string, password: string) => {},
    logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    const router = useRouter();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        })

        return () => subscription.unsubscribe();
    }, [])

    async function login(email: string, password: string) {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password
            }),
        });

        if (!response.ok) {
            console.error("Error to login:", response.statusText);
            return;
        }

        const data = await response.json();
        setUser(data.data.user);
        setSession(data.data.session);
        router.push("/admin");
        router.refresh();
    }

    function logout() {
        setLoading(true);
        supabase.auth.signOut().then(() => {
            setUser(null);
            setSession(null);
            setLoading(false);
            router.push("/login");
            router.refresh();
        })
    }

    return (
        <AuthContext.Provider value={{ user, session, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}