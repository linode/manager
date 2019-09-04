import * as React from 'react';

export default ({ options, value, onChange }: any) => {
  const handleChange = (event: any) => {
    const option = options.find(
      (thisOption: any) => thisOption.value === event.currentTarget.value
    );
    onChange(option);
  };
  return (
    <select data-testid="select" value={value || ''} onChange={handleChange}>
      {options.map((thisOption: any) => (
        <option key={thisOption.value || ''} value={thisOption.value || ''}>
          {thisOption.label}
        </option>
      ))}
    </select>
  );
};
