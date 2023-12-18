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
  disabled,
  errorText,
  isMulti,
  label,
  onChange,
  options,
  placeholder,
  value,
}: any) => {
  const handleChange = (event: any) => {
    const option = _options.find(
      /* tslint:disable-next-line */
      (thisOption: any) => thisOption.value == event.target.value
    );
    if (isMulti) {
      onChange([option]);
    } else {
      onChange(option);
    }
  };

  const _options = groupsToItems(options);
  const _label = label.replace(/\W/g, '');
  return (
    <>
      <label htmlFor={_label} id={`${_label}-label`}>
        {_label}
      </label>
      <select
        aria-labelledby={`${_label}-label`}
        data-testid="select"
        disabled={disabled}
        multiple={isMulti}
        name={_label}
        onBlur={handleChange}
        onChange={handleChange}
        // placeholder={placeholder}
        value={value ?? ''}
      >
        {_options.map((thisOption: any) => (
          <option
            aria-selected={thisOption.value === value?.value}
            data-testid={`mock-option`}
            key={thisOption.value ?? ''}
            value={thisOption.value ?? ''}
          >
            {thisOption.label}
          </option>
        ))}
      </select>
      <p>{errorText}</p>
    </>
  );
};
