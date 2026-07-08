"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"farmer" | "consumer">("consumer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await apiFetch("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email, password, role }),
      });
      router.push("/login");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-bold text-brand">Crear cuenta</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <input className="w-full rounded border p-2" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} type="email" required />
        <input className="w-full rounded border p-2" placeholder="Contraseña" value={password}
          onChange={(e) => setPassword(e.target.value)} type="password" required />
        <select className="w-full rounded border p-2" value={role}
          onChange={(e) => setRole(e.target.value as "farmer" | "consumer")}>
          <option value="consumer">Soy consumidor</option>
          <option value="farmer">Soy agricultor</option>
        </select>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading}
          className="w-full rounded bg-brand py-2 text-white disabled:opacity-50">
          {loading ? "..." : "Registrarse"}
        </button>
      </form>
      <p className="mt-4 text-sm">
        ¿Ya tienes cuenta? <Link href="/login" className="text-brand">Inicia sesión</Link>
      </p>
    </main>
  );
}
