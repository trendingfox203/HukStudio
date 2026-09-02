export default function PlaceholderSection({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-serif text-4xl text-ink sm:text-5xl">{title}</h1>
      <p className="max-w-md text-sm font-light tracking-wide text-ink/60">{message}</p>
    </div>
  );
}
