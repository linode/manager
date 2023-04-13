import React from 'react';
import { fireEvent } from '@testing-library/react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import UserDefinedSelect from './UserDefinedSelect';

describe('UserDefinedSelect', () => {
  it('renders select when oneof has more than 4 options', () => {
    const field = {
      name: 'selectField',
      label: 'Select Field',
      oneof: 'option1,option2,option3,option4,option5',
    };
    const { getByLabelText, getByText } = renderWithTheme(
      <UserDefinedSelect
        field={field}
        value=""
        updateFormState={() => {}}
        isOptional={false}
      />
    );

    const selectField = getByLabelText('Select Field');
    fireEvent.change(selectField, { target: { value: 'option3' } });

    expect(getByText('option3')).toBeInTheDocument();
  });

  it('renders radio when oneof has 4 or fewer options', () => {
    const field = {
      name: 'radioField',
      label: 'Radio Field',
      oneof: 'option1,option2,option3,option4',
    };
    const updateFormState = jest.fn();
    const { getAllByRole } = renderWithTheme(
      <UserDefinedSelect
        field={field}
        value=""
        updateFormState={updateFormState}
        isOptional={false}
      />
    );

    const radioElements = getAllByRole('radio');

    expect(radioElements.length).toEqual(4);
  });

  it('calls updateFormState when a new option is selected', () => {
    const field = {
      name: 'selectField',
      label: 'Select Field',
      oneof: 'option1,option2,option3,option4',
    };
    const updateFormState = jest.fn();
    const { getAllByRole } = renderWithTheme(
      <UserDefinedSelect
        field={field}
        value=""
        updateFormState={updateFormState}
        isOptional={false}
      />
    );

    const radioElements = getAllByRole('radio');

    fireEvent.click(radioElements[2]);

    expect(updateFormState).toHaveBeenCalledWith('selectField', 'option3');
  });
});
