export default function Card({ children, className = "", ...props }) {
  return (
    <section className={`glass-card rounded-3xl p-6 text-ink dark:text-slate-100 ${className}`} {...props}>
      {children}
    </section>
  );
}
