"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export interface Address {
    id: string;
    line1: string;
    line2?: string;
    city: string;
    postcode: string;
    country: string;
    is_default: boolean;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin";
    phone?: string;
    joinedDate: string;
    addresses: Address[];
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ error: string | null }>;
    register: (name: string, email: string, password: string) => Promise<{ error: string | null; needsConfirmation: boolean }>;
    logout: () => Promise<void>;
    updateUser: (updates: Partial<Pick<User, "name" | "phone">>) => Promise<void>;
    addAddress: (address: Omit<Address, "id">) => Promise<void>;
    removeAddress: (id: string) => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function fetchProfile(
    supabase: ReturnType<typeof createClient>,
    sbUser: SupabaseUser
): Promise<User | null> {
    const [{ data: profile }, { data: addresses }] = await Promise.all([
        supabase.from("profiles").select("name, role, phone, created_at").eq("id", sbUser.id).single(),
        supabase.from("addresses").select("*").eq("user_id", sbUser.id).order("created_at"),
    ]);

    if (!profile) {
        // Profile might not exist yet (race condition after sign-up).
        // Try to create it via the API and retry once.
        try {
            await fetch("/api/user/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: sbUser.user_metadata?.name || sbUser.email?.split("@")[0] || "User" }),
            });
            const { data: retryProfile } = await supabase
                .from("profiles")
                .select("name, role, phone, created_at")
                .eq("id", sbUser.id)
                .single();
            if (!retryProfile) return null;
            return {
                id: sbUser.id,
                email: sbUser.email ?? "",
                name: retryProfile.name,
                role: retryProfile.role as "user" | "admin",
                phone: retryProfile.phone ?? undefined,
                joinedDate: (retryProfile.created_at as string).split("T")[0],
                addresses: [],
            };
        } catch {
            return null;
        }
    }

    return {
        id: sbUser.id,
        email: sbUser.email ?? "",
        name: profile.name,
        role: profile.role as "user" | "admin",
        phone: profile.phone ?? undefined,
        joinedDate: (profile.created_at as string).split("T")[0],
        addresses: (addresses ?? []) as Address[],
    };
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Memoize — one client instance for the lifetime of the provider
    const supabase = useMemo(() => createClient(), []);

    const refreshUser = async () => {
        const { data: { user: sbUser } } = await supabase.auth.getUser();
        if (sbUser) {
            const profile = await fetchProfile(supabase, sbUser);
            setUser(profile);
        } else {
            setUser(null);
        }
    };

    useEffect(() => {
        // Initial session check
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (session?.user) {
                const profile = await fetchProfile(supabase, session.user);
                setUser(profile);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        // Listen for auth state changes (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session?.user) {
                    const profile = await fetchProfile(supabase, session.user);
                    setUser(profile);
                } else {
                    setUser(null);
                }
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    // supabase is memoized — safe to include
    }, [supabase]);

    const login = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { error: error.message };
        return { error: null };
    };

    const register = async (name: string, email: string, password: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name } },
        });
        if (error) return { error: error.message, needsConfirmation: false };
        if (!data.session) return { error: null, needsConfirmation: true };
        return { error: null, needsConfirmation: false };
    };

    const logout = async () => {
        setUser(null);
        await fetch("/api/auth/signout", { method: "POST" });
        // Full page reload so middleware clears the session cookie and resets all state
        window.location.href = "/";
    };

    const updateUser = async (updates: Partial<Pick<User, "name" | "phone">>) => {
        if (!user) return;
        const res = await fetch("/api/user/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
        });
        if (res.ok) await refreshUser();
    };

    const addAddress = async (address: Omit<Address, "id">) => {
        if (!user) return;
        await fetch("/api/user/addresses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(address),
        });
        await refreshUser();
    };

    const removeAddress = async (id: string) => {
        if (!user) return;
        await fetch(`/api/user/addresses?id=${id}`, { method: "DELETE" });
        await refreshUser();
    };

    return (
        <AuthContext.Provider
            value={{ user, loading, login, register, logout, updateUser, addAddress, removeAddress, refreshUser }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};
