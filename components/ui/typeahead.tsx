'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { SelectContent, SelectItem } from '@/components/ui/select';

type TypeaheadProps = {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  theme?: string;
};

export function Typeahead({
  value,
  onChange,
  options,
  placeholder,
  theme,
}: TypeaheadProps) {
  const [query, setQuery] = useState(value);

  const filtered = options.filter((role) =>
    role.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className='relative'>
      <Input
        value={query}
        placeholder={placeholder}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
        }}
      />
      {query && (
        <div
          className={`absolute z-10 w-full mt-1 max-h-48 overflow-auto rounded-md border shadow-lg ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          } ${filtered.length === 0 ? 'hidden' : ''}`}
        >
          {filtered.length > 0 &&
            filtered.map((role) => (
              <div
                key={role}
                className={`cursor-pointer px-3 py-2 text-xs ${
                  theme === 'dark'
                    ? 'text-gray-200 hover:bg-gray-700'
                    : 'text-gray-800 hover:bg-gray-100'
                }`}
                onClick={() => {
                  setQuery(role);
                  onChange(role);
                }}
              >
                {role}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
