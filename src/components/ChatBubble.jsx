export default function ChatBubble({ role, children }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[82%] rounded-3xl px-5 py-3 text-sm leading-6 shadow-sm md:max-w-[68%] ${
          isUser
            ? "rounded-br-md bg-ink text-white dark:bg-white dark:text-slate-950"
            : "rounded-bl-md border border-slate-200 bg-white text-slate-800 dark:border-white/10 dark:bg-white/10 dark:text-slate-100"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
