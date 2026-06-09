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
      className="h-10 w-full rounded-xl border border-transparent bg-input-bg px-3.5 pr-10 text-sm text-input-text outline-none transition focus:border-brand/20 focus:ring-4 focus:ring-brand/10 sm:h-11 sm:rounded-2xl sm:px-4 sm:pr-11 sm:text-base lg:h-12 lg:px-5 lg:pr-12 lg:text-lg"
    />
  );
}
