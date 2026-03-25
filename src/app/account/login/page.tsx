"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, User, Lock, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function LoginPageContent() {
    const { login, register, user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [tab, setTab] = useState<"login" | "register">(
        searchParams.get("tab") === "register" ? "register" : "login"
    );
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [loginForm, setLoginForm] = useState({ email: "", password: "" });
    const [registerForm, setRegisterForm] = useState({
        name: "",
        email: "",
        password: "",
        confirm: "",
    });

    useEffect(() => {
        if (user) router.push("/account");
    }, [user, router]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        setTimeout(() => {
            const success = login(loginForm.email, loginForm.password);
            if (success) {
                router.push("/account");
            } else {
                setError("Invalid email or password. Try: jane@example.com / password123");
            }
            setLoading(false);
        }, 500);
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (registerForm.password !== registerForm.confirm) {
            setError("Passwords do not match.");
            return;
        }
        if (registerForm.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        setLoading(true);
        setTimeout(() => {
            const success = register(registerForm.name, registerForm.email, registerForm.password);
            if (success) {
                router.push("/account");
            } else {
                setError("An account with this email already exists.");
            }
            setLoading(false);
        }, 500);
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="text-4xl font-black text-hm-dark" style={{ fontFamily: "Georgia, serif", letterSpacing: "-2px" }}>
                        H&amp;M
                    </Link>
                    <p className="text-hm-gray text-sm mt-2">
                        {tab === "login" ? "Welcome back" : "Create your account"}
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-hm-border mb-6">
                    <button
                        onClick={() => { setTab("login"); setError(""); }}
                        className={`flex-1 py-3 text-sm font-semibold uppercase tracking-wider border-b-2 -mb-px transition-colors ${tab === "login" ? "border-hm-dark" : "border-transparent text-hm-gray"
                            }`}
                        aria-selected={tab === "login"}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => { setTab("register"); setError(""); }}
                        className={`flex-1 py-3 text-sm font-semibold uppercase tracking-wider border-b-2 -mb-px transition-colors ${tab === "register" ? "border-hm-dark" : "border-transparent text-hm-gray"
                            }`}
                        aria-selected={tab === "register"}
                    >
                        Create Account
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm mb-4 animate-fadeIn">
                        {error}
                    </div>
                )}

                {/* Login Form */}
                {tab === "login" && (
                    <form onSubmit={handleLogin} className="space-y-4 animate-fadeIn">
                        <div>
                            <label htmlFor="login-email" className="text-sm font-medium mb-1 block">Email Address</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-hm-gray" />
                                <input
                                    id="login-email"
                                    type="email"
                                    required
                                    className="input-field pl-10"
                                    placeholder="jane@example.com"
                                    value={loginForm.email}
                                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                                    autoComplete="email"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="login-password" className="text-sm font-medium mb-1 block">Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-hm-gray" />
                                <input
                                    id="login-password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="input-field pl-10 pr-10"
                                    placeholder="••••••••"
                                    value={loginForm.password}
                                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-hm-gray hover:text-hm-dark"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <div className="text-right">
                            <button
                                type="button"
                                onClick={() => alert("Password reset is not available in this demo. Use the demo credentials shown below.")}
                                className="text-xs text-hm-gray hover:text-hm-dark hover:underline"
                            >
                                Forgot your password?
                            </button>
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-sm disabled:opacity-50">
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                        <div className="text-center text-xs text-hm-gray">
                            <p className="mb-1">Demo credentials:</p>
                            <p><strong>jane@example.com</strong> / password123</p>
                            <p><strong>admin@hnm.com</strong> / admin123</p>
                        </div>
                    </form>
                )}

                {/* Register Form */}
                {tab === "register" && (
                    <form onSubmit={handleRegister} className="space-y-4 animate-fadeIn">
                        <div>
                            <label htmlFor="reg-name" className="text-sm font-medium mb-1 block">Full Name</label>
                            <div className="relative">
                                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-hm-gray" />
                                <input
                                    id="reg-name"
                                    required
                                    className="input-field pl-10"
                                    placeholder="Jane Doe"
                                    value={registerForm.name}
                                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                                    autoComplete="name"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="reg-email" className="text-sm font-medium mb-1 block">Email Address</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-hm-gray" />
                                <input
                                    id="reg-email"
                                    type="email"
                                    required
                                    className="input-field pl-10"
                                    placeholder="you@example.com"
                                    value={registerForm.email}
                                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                                    autoComplete="email"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="reg-password" className="text-sm font-medium mb-1 block">Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-hm-gray" />
                                <input
                                    id="reg-password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="input-field pl-10 pr-10"
                                    placeholder="Min. 6 characters"
                                    value={registerForm.password}
                                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                                    autoComplete="new-password"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-hm-gray" aria-label="Toggle password">
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="reg-confirm" className="text-sm font-medium mb-1 block">Confirm Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-hm-gray" />
                                <input
                                    id="reg-confirm"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="input-field pl-10"
                                    placeholder="Repeat password"
                                    value={registerForm.confirm}
                                    onChange={(e) => setRegisterForm({ ...registerForm, confirm: e.target.value })}
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-hm-gray">
                            By creating an account, you agree to our{" "}
                            <a href="https://www2.hm.com/en_gb/customer-service/legal-and-privacy/terms-and-conditions.html" target="_blank" rel="noopener noreferrer" className="underline">Terms & Conditions</a> and{" "}
                            <a href="https://www2.hm.com/en_gb/customer-service/legal-and-privacy/privacy-notice.html" target="_blank" rel="noopener noreferrer" className="underline">Privacy Policy</a>.
                        </p>
                        <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-sm disabled:opacity-50">
                            {loading ? "Creating account..." : "Create Account"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <React.Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center">Loading...</div>}>
            <LoginPageContent />
        </React.Suspense>
    );
}
