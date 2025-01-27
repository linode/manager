import { DateTime } from 'luxon';
import React, { useEffect, useState } from 'react';

import { TextField } from '../TextField/TextField';

interface DateFieldProps {
  errorText?: string;
  label: string;
  onChange: (date: DateTime | null) => void;
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  placeholder?: string;
  value: DateTime | null;
}

export const DateField = ({
  errorText,
  label,
  onChange,
  onClick,
  placeholder = 'YYYY-MM-DD',
  value,
}: DateFieldProps) => {
  const [inputValue, setInputValue] = useState(
    value ? value.toFormat('yyyy-LL-dd') : ''
  );

  useEffect(() => {
    setInputValue(value ? value.toFormat('yyyy-LL-dd') : '');
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (newValue.trim() === '') {
      onChange(null); // Clear value if input is empty
      return;
    }

    const parsedDate = DateTime.fromFormat(newValue, 'yyyy-LL-dd');
    if (parsedDate.isValid) {
      onChange(parsedDate);
    } else {
      onChange(null);
    }
  };

  const isValidFormat =
    inputValue.trim() === '' ||
    DateTime.fromFormat(inputValue, 'yyyy-LL-dd').isValid;

  return (
    <TextField
      errorText={
        errorText ||
        (!isValidFormat && inputValue.trim() !== ''
          ? 'Invalid date format'
          : '')
      }
      label={label}
      onChange={handleInputChange}
      onClick={onClick}
      placeholder={placeholder}
      value={inputValue}
    />
  );
};
