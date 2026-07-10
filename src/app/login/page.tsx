"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { login } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { LoginInput } from "@/lib/types";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const input: LoginInput = { email, password };
      await login(input);
      await refresh();
      router.push("/marketplace");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-bold text-brand">Iniciar sesión</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <input className="w-full rounded border p-2" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} type="email" required />
        <input className="w-full rounded border p-2" placeholder="Contraseña" value={password}
          onChange={(e) => setPassword(e.target.value)} type="password" required />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading}
          className="w-full rounded bg-brand py-2 text-white disabled:opacity-50">
          {loading ? "..." : "Entrar"}
        </button>
      </form>
      <p className="mt-4 text-sm">
        ¿No tienes cuenta? <Link href="/signup" className="text-brand">Regístrate</Link>
      </p>
    </main>
  );
}
