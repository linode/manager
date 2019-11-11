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

export default ({ options, value, onChange, errorText }: any) => {
  const handleChange = (event: any) => {
    const option = _options.find(
      (thisOption: any) => thisOption.value === event.currentTarget.value
    );
    onChange(option);
  };

  const _options = groupsToItems(options);
  return (
    <>
      <select
        data-testid="select"
        value={value || ''}
        onBlur={handleChange}
        onChange={() => null}
      >
        {_options.map((thisOption: any) => (
          <option
            key={thisOption.value || ''}
            value={thisOption.value || ''}
            aria-selected={thisOption.value === value}
          >
            {thisOption.label}
          </option>
        ))}
      </select>
      <p>{errorText}</p>
    </>
  );
};
