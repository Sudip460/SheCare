export default function DashboardCard({ icon, title, children, accent = "bg-health-blue" }) {
  return (
    <section className="rounded-3xl border border-white/80 bg-white/80 p-5 shadow-glass backdrop-blur transition dark:border-white/10 dark:bg-white/10">
      <div className="mb-4 flex items-center gap-3">
        <span className={`grid h-11 w-11 place-items-center rounded-2xl ${accent}`}>{icon}</span>
        <h2 className="text-lg font-bold text-ink dark:text-slate-100">{title}</h2>
      </div>
      {children}
    </section>
  );
}
