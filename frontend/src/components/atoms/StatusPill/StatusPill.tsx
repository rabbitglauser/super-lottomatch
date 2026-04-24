interface StatusPillProps {
  label: string;
}

export default function StatusPill({ label }: StatusPillProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-accent-red-soft px-3.5 py-1.5 text-xs font-semibold tracking-wide text-accent-red uppercase">
      <span className="relative flex size-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-red opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-accent-red" />
      </span>
      {label}
    </span>
  );
}
