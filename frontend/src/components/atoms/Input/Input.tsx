"use client";

import type { ChangeEvent } from "react";

interface InputProps {
  id: string;
  name?: string;
  type: string;
  placeholder?: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export default function Input({
  id,
  name,
  type,
  placeholder,
  value,
  onChange,
}: InputProps) {
  return (
    <input
      id={id}
      name={name ?? id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="h-20 w-full rounded-3xl border border-transparent bg-input-bg px-7 pr-16 text-2xl text-input-text outline-none transition focus:border-brand/20 focus:ring-4 focus:ring-brand/10"
    />
  );
}
