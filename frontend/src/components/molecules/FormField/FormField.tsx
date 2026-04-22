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
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
        <div className="pointer-events-none absolute inset-y-0 right-6 flex items-center text-input-icon">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
