import { fireEvent } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { UserDefinedSelect } from './UserDefinedSelect';

describe('UserDefinedSelect', () => {
  it('renders select when oneof has more than 4 options', () => {
    const field = {
      label: 'Select Field',
      name: 'selectField',
      oneof: 'option1,option2,option3,option4,option5',
    };
    const { getByLabelText, getByText } = renderWithTheme(
      <UserDefinedSelect
        field={field}
        isOptional={false}
        updateFormState={() => {}}
        value=""
      />
    );

    const selectField = getByLabelText('Select Field');
    fireEvent.change(selectField, { target: { value: 'option3' } });

    expect(getByText('option3')).toBeInTheDocument();
  });

  it('renders radio when oneof has 4 or fewer options', () => {
    const field = {
      label: 'Radio Field',
      name: 'radioField',
      oneof: 'option1,option2,option3,option4',
    };
    const updateFormState = vi.fn();
    const { getAllByRole } = renderWithTheme(
      <UserDefinedSelect
        field={field}
        isOptional={false}
        updateFormState={updateFormState}
        value=""
      />
    );

    const radioElements = getAllByRole('radio');

    expect(radioElements.length).toEqual(4);
  });

  it('calls updateFormState when a new option is selected', () => {
    const field = {
      label: 'Select Field',
      name: 'selectField',
      oneof: 'option1,option2,option3,option4',
    };
    const updateFormState = vi.fn();
    const { getAllByRole } = renderWithTheme(
      <UserDefinedSelect
        field={field}
        isOptional={false}
        updateFormState={updateFormState}
        value=""
      />
    );

    const radioElements = getAllByRole('radio');

    fireEvent.click(radioElements[2]);

    expect(updateFormState).toHaveBeenCalledWith('selectField', 'option3');
  });
});
