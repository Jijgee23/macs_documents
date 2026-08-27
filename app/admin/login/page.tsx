import { loginAction } from "@/lib/actions";
import { Logo } from "@/components/Logo";
import { PasswordInput } from "@/components/admin/PasswordInput";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center" style={{ background: "var(--bg)" }}>
      <form
        action={loginAction}
        className="w-full max-w-sm space-y-4 p-6"
        style={{ border: "1px solid var(--br)", borderRadius: 10, background: "var(--top)", boxShadow: "var(--shadow-sm)" }}
      >
        <div className="mb-2 flex items-center gap-2.5">
          <Logo />
          <div>
            <div className="text-[13px] font-bold" style={{ color: "var(--tx)" }}>
              Admin нэвтрэх
            </div>
            <div className="text-[10.5px]" style={{ color: "var(--mu)" }}>
              MACS ERP Баримт бичиг
            </div>
          </div>
        </div>
        {error && (
          <p
            className="rounded p-2 text-sm"
            style={{ background: "var(--brd-l)", color: "var(--brd)" }}
          >
            {error}
          </p>
        )}
        <div>
          <label className="block text-sm font-medium" style={{ color: "var(--tx)" }}>
            И-мэйл
          </label>
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded px-3 py-2 outline-none"
            style={{ border: "1px solid var(--br)", background: "var(--inp)", color: "var(--tx)" }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium" style={{ color: "var(--tx)" }}>
            Нууц үг
          </label>
          <div className="mt-1">
            <PasswordInput name="password" required />
          </div>
        </div>
        <button
          type="submit"
          className="w-full rounded px-4 py-2 text-sm font-medium text-white"
          style={{ background: "var(--brd)" }}
        >
          Нэвтрэх
        </button>
      </form>
    </div>
  );
}
