type FieldProps = { label: string; hint?: string };

const controlClass =
  "rounded-md border border-black/10 bg-[#fafaf9] px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ink/40 focus:bg-white";

export function TextInput({
  label,
  hint,
  ...props
}: FieldProps & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium tracking-wide text-ink/60 uppercase">{label}</span>
      <input className={controlClass} {...props} />
      {hint && <span className="text-xs text-ink/40">{hint}</span>}
    </label>
  );
}

export function TextArea({
  label,
  hint,
  ...props
}: FieldProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium tracking-wide text-ink/60 uppercase">{label}</span>
      <textarea className={`${controlClass} min-h-24 resize-y`} {...props} />
      {hint && <span className="text-xs text-ink/40">{hint}</span>}
    </label>
  );
}

export function SelectInput({
  label,
  hint,
  children,
  ...props
}: FieldProps & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium tracking-wide text-ink/60 uppercase">{label}</span>
      <select className={controlClass} {...props}>
        {children}
      </select>
      {hint && <span className="text-xs text-ink/40">{hint}</span>}
    </label>
  );
}

export function SubmitButton({
  children,
  variant = "primary",
  className = "",
  disabled,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
  disabled?: boolean;
}) {
  const base = "inline-flex items-center gap-2 self-start rounded-md px-5 py-2.5 text-xs font-medium tracking-wide uppercase transition-colors disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "bg-ink text-paper hover:bg-ink/85"
      : "border border-ink/20 text-ink hover:bg-ink/5";
  return (
    <button type="submit" disabled={disabled} className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  );
}
