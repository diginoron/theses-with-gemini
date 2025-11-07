import React from 'react';
import { DropdownOption } from '../types';

interface DropdownProps {
  label: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  id: string;
  disabled?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({ label, options, value, onChange, id, disabled = false }) => {
  return (
    <div className="flex flex-col w-full">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm transition-all duration-200 ${
          disabled ? 'bg-gray-200 cursor-not-allowed' : 'bg-white'
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Dropdown;