export default function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...props
}) {
  const styles = {
    primary:
      "bg-ink text-white shadow-soft hover:-translate-y-0.5 hover:bg-slate-800 focus-visible:ring-ink dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 dark:focus-visible:ring-white",
    secondary:
      "bg-white/80 text-ink border border-slate-200 hover:-translate-y-0.5 hover:border-slate-300 focus-visible:ring-health-sky dark:border-white/10 dark:bg-white/10 dark:text-slate-100 dark:hover:border-white/20 dark:hover:bg-white/15",
    ghost:
      "text-ink hover:bg-white/70 focus-visible:ring-health-sky dark:text-slate-100 dark:hover:bg-white/10",
  };

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-slate-950 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
