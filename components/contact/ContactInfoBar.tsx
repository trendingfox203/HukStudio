import type { ContactInfoColumn } from "@/lib/site-settings";

export default function ContactInfoBar({ infoColumns }: { infoColumns: ContactInfoColumn[] }) {
  return (
    <div className="font-gilroy mt-16 flex flex-col gap-8 border-t border-ink/10 px-6 py-10 text-base sm:mt-20 sm:flex-row sm:flex-wrap sm:justify-between sm:px-10 lg:px-20">
      {infoColumns.map((column) => (
        <div key={column.label} className="flex flex-col gap-1">
          <p className="font-bold text-lg text-black">{column.label}</p>
          {column.lines.map((line, index) => (
            <p key={index} className="text-ink/80">
              {line}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}
