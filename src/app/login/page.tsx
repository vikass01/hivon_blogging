import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="scale-[0.8] origin-center">
    <div className="flex items-center justify-center px-3">
      
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {/* Left: Sign in */}
        <div className="p-6 md:p-8 flex flex-col justify-center">

          <div className="flex items-center gap-2 mb-5">
            <div className="h-8 w-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold">
              H
            </div>
            <span className="font-semibold text-zinc-900 text-sm">
              Hivon Blog
            </span>
          </div>

          <h1 className="text-xl font-bold text-zinc-800 mb-1">
            Sign in
          </h1>

          <p className="text-zinc-500 text-xs mb-5">
            Enter your credentials to access your account
          </p>

          <LoginForm />

        </div>

        {/* Right: Gradient Section */}
        <div className="p-6 md:p-8 bg-gradient-to-br from-brand-600 to-brand-700 text-white flex flex-col justify-center">

          <h2 className="text-xl font-semibold mb-2">
            Welcome Back 👋
          </h2>

          <p className="text-xs text-white/80 mb-5 leading-relaxed">
            Login quickly using demo accounts to explore different roles and features of the platform.
          </p>

          <div className="space-y-2">
            <DemoButton role="Admin" email="admin@demo.com" description="Manage users & system" />
            <DemoButton role="Author" email="author@demo.com" description="Create & edit posts" />
            <DemoButton role="Viewer" email="viewer@demo.com" description="Read-only access" />
          </div>

          <div className="mt-5 text-[10px] text-white/70">
            Password:{" "}
            <span className="bg-white/20 px-2 py-0.5 rounded">
              demo1234
            </span>
          </div>

        </div>

      </div>
      
    </div>
    </div>
  );
}

type DemoButtonProps = {
  role: string;
  email: string;
  description: string;
};

function DemoButton({ role, email, description }: DemoButtonProps) {
  return (
    <form action="/api/demo-login" method="post">
      <input type="hidden" name="email" value={email} />

      <button
        type="submit"
        className="w-full rounded-md bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-2 text-left transition duration-200"
      >
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold">{role}</span>
          <span className="text-[10px] text-white/70">{email}</span>
        </div>

        <div className="text-[11px] text-white/80 mt-0.5">
          {description}
        </div>
      </button>
    </form>
  );
}