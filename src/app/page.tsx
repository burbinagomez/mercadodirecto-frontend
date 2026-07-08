import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20 text-center">
      <h1 className="text-4xl font-bold text-brand">MercadoDirecto</h1>
      <p className="mt-4 text-lg text-neutral-600">
        Del campo a tu mesa. Conectamos agricultores colombianos directamente con los consumidores.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Link href="/marketplace" className="rounded bg-brand px-5 py-2 text-white">
          Explorar mercado
        </Link>
        <Link href="/signup" className="rounded border border-brand px-5 py-2 text-brand">
          Registrarse
        </Link>
      </div>
    </main>
  );
}
