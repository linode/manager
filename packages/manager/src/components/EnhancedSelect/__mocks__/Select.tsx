import { path } from 'ramda';
import * as React from 'react';

const groupsToItems = (groups: any[]) => {
  if (path([0, 'value'], groups)) {
    // This is a normal list of Item[]
    return groups;
  }

  // This must be an array of grouped options
  return groups.reduce((accum, thisGroup) => {
    return [...accum, ...thisGroup.options];
  }, []);
};

export default ({
  options,
  value,
  label,
  onChange,
  errorText,
  placeholder,
  isMulti
}: any) => {
  const handleChange = (event: any) => {
    const option = _options.find(
      /* tslint:disable-next-line */
      (thisOption: any) => thisOption.value == event.target.value
    );
    isMulti ? onChange([option]) : onChange(option);
  };

  const _options = groupsToItems(options);
  return (
    <>
      <label htmlFor={label} id={`${label}-label`}>
        {label}
      </label>
      <select
        placeholder={placeholder}
        name={label}
        data-testid="select"
        aria-labelledby={`${label}-label`}
        value={value ?? ''}
        onBlur={handleChange}
        onChange={handleChange}
        multiple={isMulti}
      >
        {_options.map((thisOption: any) => (
          <option
            key={thisOption.value ?? ''}
            value={thisOption.value ?? ''}
            aria-selected={thisOption.value === value}
            data-testid={`mock-option`}
          >
            {thisOption.label}
          </option>
        ))}
      </select>
      <p>{errorText}</p>
    </>
  );
};
