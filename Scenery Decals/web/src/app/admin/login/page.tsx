import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_SESSION_COOKIE,
  isAdminAuthConfigured,
  verifyAdminSession,
} from "@/backend/auth/adminAuth";
import { loginAdmin } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const cookieStore = await cookies();
  if (verifyAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
    redirect("/admin");
  }
  const { error } = await searchParams;
  const configured = isAdminAuthConfigured();

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-5 py-10 text-slate-900">
      <section className="w-full max-w-sm rounded-md border border-slate-200 bg-white p-7 shadow-sm">
        <div className="flex items-center justify-center gap-3">
          <img
            alt="Pangpangshop"
            className="h-12 w-36 object-contain object-left"
            src="/assets/aistudio/Pangpangshop________32585569.png"
          />
          <div className="h-9 w-px bg-slate-200" />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">管理后台</h1>
        </div>
        {!configured ? (
          <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
            登录服务尚未完成配置，请检查 <code>ADMIN_SESSION_SECRET</code>、<code>INITIAL_ADMIN_EMAIL</code> 和 <code>INITIAL_ADMIN_PASSWORD</code> 后重启服务。
          </div>
        ) : (
          <form action={loginAdmin} className="mt-6 space-y-4">
            <fieldset className="group rounded-md border border-slate-300 px-3 pb-2 pt-0 transition focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500">
              <legend className="bg-white px-1 text-sm font-medium leading-none text-slate-700 transition group-focus-within:font-bold group-focus-within:text-violet-600">管理员账号</legend>
              <input
                className="w-full appearance-none border-0 bg-transparent py-1.5 outline-none focus:border-0 focus:ring-0"
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                required
              />
            </fieldset>
            <fieldset className="group rounded-md border border-slate-300 px-3 pb-2 pt-0 transition focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500">
              <legend className="bg-white px-1 text-sm font-medium leading-none text-slate-700 transition group-focus-within:font-bold group-focus-within:text-violet-600">后台密码</legend>
              <input
                className="w-full appearance-none border-0 bg-transparent py-1.5 outline-none focus:border-0 focus:ring-0"
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </fieldset>
            {error === "invalid" && <p className="text-sm text-rose-600">密码不正确，请重试。</p>}
            <button className="w-full rounded-md bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700" type="submit">
              登录后台
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
