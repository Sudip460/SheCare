export default function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-2 rounded-3xl rounded-bl-md border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-white/10 dark:bg-white/10">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}
