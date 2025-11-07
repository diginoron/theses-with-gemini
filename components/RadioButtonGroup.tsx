import React from 'react';
import { DropdownOption } from '../types';

interface RadioButtonGroupProps {
  label: string;
  name: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const RadioButtonGroup: React.FC<RadioButtonGroupProps> = ({ label, name, options, value, onChange, disabled = false }) => {
  return (
    <fieldset className="w-full">
      <legend className="text-sm font-medium text-gray-700 mb-2">{label}</legend>
      <div className="mt-1 flex flex-wrap gap-4">
        {options.map((option) => (
          <div key={option.value} className="flex items-center">
            <input
              id={`${name}-${option.value}`}
              name={name}
              type="radio"
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className={`focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 transition-all duration-200 ${
                disabled ? 'bg-gray-200 cursor-not-allowed' : 'bg-white'
              }`}
            />
            <label htmlFor={`${name}-${option.value}`} className={`ml-2 block text-sm font-medium ${disabled ? 'text-gray-500' : 'text-gray-700'} cursor-pointer`}>
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </fieldset>
  );
};

export default RadioButtonGroup;