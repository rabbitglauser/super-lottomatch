"use client";

import type { ChangeEvent } from "react";
import type { LucideIcon } from "lucide-react";

import Input from "@/components/atoms/Input";
import Label from "@/components/atoms/Label";

interface FormFieldProps {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  icon: LucideIcon;
  required?: boolean;
  autoComplete?: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export default function FormField({
  id,
  label,
  type,
  placeholder,
  icon: Icon,
  required,
  autoComplete,
  value,
  onChange,
}: FormFieldProps) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
        />
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-input-icon sm:right-4 lg:right-5">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
      </div>
    </div>
  );
}
