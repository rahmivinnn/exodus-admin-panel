import React from 'react';

interface DatePickerProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  id,
  name,
  value,
  onChange,
  required = false,
  className = '',
}) => {
  return (
    <input
      type="date"
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ${className}`}
    />
  );
}; 