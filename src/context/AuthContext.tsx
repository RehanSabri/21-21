"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface User {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin";
    joinedDate: string;
    addresses: Address[];
}

export interface Address {
    id: string;
    line1: string;
    line2?: string;
    city: string;
    postcode: string;
    country: string;
    isDefault: boolean;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => boolean;
    register: (name: string, email: string, password: string) => boolean;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
    addAddress: (address: Omit<Address, "id">) => void;
    removeAddress: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SEED_USERS: (User & { password: string })[] = [
    {
        id: "admin001",
        name: "Admin User",
        email: "admin@hnm.com",
        password: "admin123",
        role: "admin",
        joinedDate: "2024-01-01",
        addresses: [],
    },
    {
        id: "user001",
        name: "Jane Doe",
        email: "jane@example.com",
        password: "password123",
        role: "user",
        joinedDate: "2024-06-15",
        addresses: [
            {
                id: "addr001",
                line1: "42 Fashion Street",
                city: "London",
                postcode: "W1F 7QA",
                country: "United Kingdom",
                isDefault: true,
            },
        ],
    },
];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem("hm_user");
        if (saved) setUser(JSON.parse(saved));
        // seed if not already done
        if (!localStorage.getItem("hm_users")) {
            localStorage.setItem("hm_users", JSON.stringify(SEED_USERS));
        }
    }, []);

    const getUsers = (): (User & { password: string })[] => {
        const saved = localStorage.getItem("hm_users");
        return saved ? JSON.parse(saved) : SEED_USERS;
    };

    const login = (email: string, password: string): boolean => {
        const users = getUsers();
        const found = users.find(
            (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        if (found) {
            const { password: _, ...userData } = found;
            setUser(userData);
            localStorage.setItem("hm_user", JSON.stringify(userData));
            return true;
        }
        return false;
    };

    const register = (name: string, email: string, password: string): boolean => {
        const users = getUsers();
        if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) return false;
        const newUser: User & { password: string } = {
            id: `user_${Date.now()}`,
            name,
            email,
            password,
            role: "user",
            joinedDate: new Date().toISOString().split("T")[0],
            addresses: [],
        };
        const updatedUsers = [...users, newUser];
        localStorage.setItem("hm_users", JSON.stringify(updatedUsers));
        const { password: _, ...userData } = newUser;
        setUser(userData);
        localStorage.setItem("hm_user", JSON.stringify(userData));
        return true;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("hm_user");
    };

    const updateUser = (updates: Partial<User>) => {
        if (!user) return;
        const updated = { ...user, ...updates };
        setUser(updated);
        localStorage.setItem("hm_user", JSON.stringify(updated));
        // also update in users store
        const users = getUsers();
        const newUsers = users.map((u) =>
            u.id === user.id ? { ...u, ...updates } : u
        );
        localStorage.setItem("hm_users", JSON.stringify(newUsers));
    };

    const addAddress = (address: Omit<Address, "id">) => {
        if (!user) return;
        const newAddr: Address = { ...address, id: `addr_${Date.now()}` };
        const addresses = address.isDefault
            ? [...user.addresses.map((a) => ({ ...a, isDefault: false })), newAddr]
            : [...user.addresses, newAddr];
        updateUser({ addresses });
    };

    const removeAddress = (id: string) => {
        if (!user) return;
        updateUser({ addresses: user.addresses.filter((a) => a.id !== id) });
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateUser, addAddress, removeAddress }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};
