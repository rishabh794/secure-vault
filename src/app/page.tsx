import Link from "next/link";

const useCases = [
  {
    title: "Agencies and consultants",
    description: "Keep client credentials separate, tagged, and ready for handoff without sharing raw notes.",
  },
  {
    title: "Engineering and DevOps",
    description: "Store production and staging access with clear ownership and quick lookup for incidents.",
  },
  {
    title: "Finance and legal",
    description: "Protect sensitive portals and vendor access with strict master password control.",
  },
  {
    title: "Freelancers and founders",
    description: "A clean vault for all the logins you juggle, without compromise or clutter.",
  },
];

const features = [
  {
    title: "Zero knowledge encryption",
    description: "Your master password never leaves your device. Encrypted data stays encrypted.",
  },
  {
    title: "Two factor ready",
    description: "Add a second layer of protection with built in 2FA flows.",
  },
  {
    title: "Smart search and tags",
    description: "Filter, tag, and find what you need in seconds, even in large vaults.",
  },
  {
    title: "Edit with confidence",
    description: "Open, update, and re encrypt entries safely with clear unlock states.",
  },
  {
    title: "Portable exports",
    description: "Export or import vault data with a workflow that respects encryption.",
  },
  {
    title: "Audit friendly",
    description: "Clear item structure makes reviews and inventory painless.",
  },
];

const steps = [
  {
    title: "Set a master password",
    description: "Choose a master password that only you know. It unlocks everything.",
  },
  {
    title: "Add your vault items",
    description: "Save logins, notes, and URLs with tags for fast retrieval.",
  },
  {
    title: "Unlock on demand",
    description: "Decrypt when you need it. Your data stays protected otherwise.",
  },
];

export default function Home() {
  return (
    <div className="relative overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 right-0 h-96 w-96 rounded-full bg-sky-700/20 blur-3xl animate-[float-slow_18s_ease-in-out_infinite]"></div>
        <div className="absolute top-64 -left-20 h-80 w-80 rounded-full bg-amber-600/20 blur-3xl animate-[float-slow_22s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-emerald-700/20 blur-3xl animate-[float-slow_20s_ease-in-out_infinite]"></div>
      </div>

      <section className="relative mx-auto max-w-6xl px-6 pt-20 pb-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1 text-xs uppercase tracking-wide text-slate-300 animate-[fade-in_700ms_ease-out]">
          <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
          Built for serious credential workflows
        </div>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="animate-[fade-up_900ms_ease-out]">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-50 md:text-5xl lg:text-6xl">
              SecureVault keeps access clean, controlled, and always in reach.
            </h1>
            <p className="mt-6 text-lg text-slate-300 md:text-xl">
              A professional password vault that gives teams and individuals a reliable home
              for credentials, notes, and critical links without the noise.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/register"
                className="rounded-full bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white"
              >
                Create your vault
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-slate-700/70 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500"
              >
                Sign in
              </Link>
            </div>
            <div className="mt-10 grid gap-4 text-sm text-slate-300 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4">
                <p className="text-slate-400">Master key only</p>
                <p className="mt-2 text-base font-semibold text-slate-100">Zero knowledge by design</p>
              </div>
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4">
                <p className="text-slate-400">Structured vaults</p>
                <p className="mt-2 text-base font-semibold text-slate-100">Tags and search built in</p>
              </div>
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4">
                <p className="text-slate-400">Security defaults</p>
                <p className="mt-2 text-base font-semibold text-slate-100">2FA ready accounts</p>
              </div>
            </div>
          </div>

          <div className="animate-[fade-up_900ms_ease-out]" style={{ animationDelay: "140ms" }}>
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-8 shadow-xl">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm uppercase tracking-wide text-slate-400">Live snapshot</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-50">Your vault, clearly organized</h2>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                  Encrypted
                </span>
              </div>
              <div className="mt-6 space-y-4">
                {["Primary domain login", "Payment processor", "Client staging site"].map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-xl border border-slate-800/70 bg-slate-950/60 px-4 py-3 text-sm animate-[fade-up_800ms_ease-out]"
                    style={{ animationDelay: `${200 + index * 120}ms` }}
                  >
                    <div>
                      <p className="font-medium text-slate-100">{item}</p>
                      <p className="text-slate-400">Tagged: ops, shared</p>
                    </div>
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">Locked</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-xl border border-dashed border-slate-700/70 bg-slate-950/30 px-4 py-3 text-sm text-slate-400">
                Unlock the vault to reveal usernames, passwords, and notes.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-400">Use cases</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-50">Built for the work you actually do</h2>
          </div>
          <p className="max-w-xl text-slate-300">
            SecureVault adapts to individual workflows or shared operations without sacrificing
            control or clarity.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {useCases.map((useCase, index) => (
            <div
              key={useCase.title}
              className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-lg animate-[fade-up_900ms_ease-out]"
              style={{ animationDelay: `${120 + index * 120}ms` }}
            >
              <h3 className="text-xl font-semibold text-slate-50">{useCase.title}</h3>
              <p className="mt-3 text-slate-300">{useCase.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-400">Why SecureVault</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-50">Professional grade security with a calm UI</h2>
            <p className="mt-4 text-slate-300">
              SecureVault focuses on the essentials: encryption, structure, and speed. No noisy
              dashboards or gimmicks, just clarity and control.
            </p>
            <div className="mt-6 space-y-3 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400"></span>
                <p>Master password derived keys with AES encryption.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400"></span>
                <p>Optional 2FA for every account session.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400"></span>
                <p>Scoped exports and imports for trusted migrations.</p>
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 animate-[fade-up_900ms_ease-out]"
                style={{ animationDelay: `${100 + index * 100}ms` }}
              >
                <h3 className="text-lg font-semibold text-slate-50">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-slate-400">How it works</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-50">A vault flow that feels effortless</h2>
            </div>
            <p className="max-w-xl text-slate-300">
              Set your master password once, then manage access in a clean workflow that keeps
              everything encrypted until you unlock it.
            </p>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-6">
                <p className="text-sm font-semibold text-slate-400">Step {index + 1}</p>
                <h3 className="mt-3 text-xl font-semibold text-slate-50">{step.title}</h3>
                <p className="mt-3 text-sm text-slate-300">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-3xl border border-slate-800/80 bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-slate-950/80 p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-slate-400">Ready to start</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-50">Build your vault with confidence</h2>
              <p className="mt-3 text-slate-300">Professional access control without the bloat.</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/register"
                className="rounded-full bg-emerald-400/90 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
              >
                Start free
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-slate-700/70 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
