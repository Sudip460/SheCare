export default function InputField({ label, className = "", inputClassName = "", rightElement = null, ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</span>
      <span className="relative block">
        <input
          className={`w-full rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 text-ink outline-none transition placeholder:text-slate-400 focus:border-health-sky focus:ring-4 focus:ring-health-blue dark:border-white/10 dark:bg-white/10 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-500/20 ${
            rightElement ? "pr-12" : ""
          } ${inputClassName}`}
          {...props}
        />
        {rightElement && <span className="absolute inset-y-0 right-0 flex items-center pr-4">{rightElement}</span>}
      </span>
    </label>
  );
}
