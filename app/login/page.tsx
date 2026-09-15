import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function login(formData: FormData) {
  "use server";
  const password = formData.get("password");
  const from = formData.get("from")?.toString() || "/";
  const token = process.env.COCKPIT_AUTH_TOKEN;

  if (token && password === token) {
    (await cookies()).set("cockpit_auth", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    redirect(from);
  }

  redirect(`/login?erro=1&from=${encodeURIComponent(from)}`);
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; erro?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-6">
      <h1 className="text-xl font-semibold text-pwr-dark-blue">Cockpit SPWR</h1>
      <p className="mt-1 text-sm text-pwr-blue/60">Acesso restrito — digite a senha.</p>
      <form action={login} className="mt-6 flex flex-col gap-3">
        <input type="hidden" name="from" value={params.from ?? "/"} />
        <input
          type="password"
          name="password"
          placeholder="Senha"
          autoFocus
          className="rounded-lg border border-pwr-dark-blue/15 px-3 py-2 text-sm outline-none focus:border-pwr-orange"
        />
        <button
          type="submit"
          className="rounded-lg bg-pwr-orange px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Entrar
        </button>
        {params.erro && <p className="text-sm text-red-600">Senha incorreta.</p>}
      </form>
    </div>
  );
}
