"use client";

import type { ChangeEvent } from "react";
import type { LucideIcon } from "lucide-react";

interface FormFieldProps {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  icon: LucideIcon;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export default function FormField({
  id,
  label,
  type,
  placeholder,
  icon: Icon,
  value,
  onChange,
}: FormFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-3 block text-center text-sm font-semibold uppercase tracking-[0.16em] text-muted"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="h-20 w-full rounded-3xl border border-transparent bg-input-bg px-7 pr-16 text-2xl text-input-text outline-none transition focus:border-brand/20 focus:ring-4 focus:ring-brand/10"
        />
        <div className="pointer-events-none absolute inset-y-0 right-6 flex items-center text-input-icon">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
