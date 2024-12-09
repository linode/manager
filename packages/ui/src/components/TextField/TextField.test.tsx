import { fireEvent, getDefaultNormalizer } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it } from 'vitest';

import { renderWithTheme } from '../../utilities/testHelpers';
import { InputAdornment } from '../InputAdornment';
import { TextField } from './TextField';

describe('TextField', () => {
  const props = {
    label: 'Username',
    value: 'jane-doe',
  };

  it('Renders a TextField with the given label and initial value', () => {
    const { getByDisplayValue, getByText } = renderWithTheme(
      <TextField {...props} />
    );
    expect(getByText('Username')).toBeInTheDocument();
    expect(getByDisplayValue('jane-doe')).toBeInTheDocument();
  });

  it('Trims leading and trailing whitespace from a TextField with a trimmed prop', async () => {
    const { getByDisplayValue, getByLabelText } = renderWithTheme(
      <TextField trimmed {...props} />
    );

    const input = getByLabelText('Username');

    fireEvent.change(input, { target: { value: ' test ' } });
    fireEvent.blur(input); // Triggers trim

    expect(
      getByDisplayValue('test', {
        normalizer: getDefaultNormalizer({ trim: false }), // Prevent default trim by DOM Testing Library
      })
    ).toBeInTheDocument();
  });

  it('Does not trim leading and trailing whitespace from a TextField without "trimmed" prop', async () => {
    const { getByDisplayValue, getByLabelText } = renderWithTheme(
      <TextField {...props} />
    );

    const input = getByLabelText('Username');

    fireEvent.change(input, { target: { value: ' test ' } });
    fireEvent.blur(input);

    expect(
      getByDisplayValue(' test ', {
        normalizer: getDefaultNormalizer({ trim: false }),
      })
    ).toBeInTheDocument();
  });

  it('Renders an error message on error', async () => {
    const { getByText } = renderWithTheme(
      <TextField error errorText="There was an error" {...props} />
    );
    expect(getByText(/There was an error/i)).toBeInTheDocument();
  });

  it('can change the input type and renders an input adornment', () => {
    const { getByDisplayValue, getByTestId, getByText } = renderWithTheme(
      <TextField
        InputProps={{
          startAdornment: <InputAdornment position="end">$</InputAdornment>,
        }}
        label={'Money'}
        type={'number'}
        value={'100'}
      />
    );

    expect(getByText('Money')).toBeInTheDocument();
    expect(getByDisplayValue('100')).toBeInTheDocument();
    expect(getByText('$')).toBeInTheDocument();
    const input = getByTestId('textfield-input');
    expect(input?.getAttribute('type')).toBe('number');
  });

  it('accepts a min and max value for a type of number and clamps the value within the range', () => {
    const { getByTestId } = renderWithTheme(
      <TextField label={'Money'} max={10} min={2} type={'number'} value={'5'} />
    );
    const input = getByTestId('textfield-input');
    expect(input?.getAttribute('value')).toBe('5');
    fireEvent.change(input, { target: { value: '50' } });
    expect(input?.getAttribute('value')).toBe('10');
    fireEvent.change(input, { target: { value: '1' } });
    expect(input?.getAttribute('value')).toBe('2');
  });

  it('renders a helper text with an input id', () => {
    const { getByText } = renderWithTheme(
      <TextField helperText="Helper text" inputId="input-id" label="" />
    );

    expect(getByText('Helper text')).toBeInTheDocument();
    const helperText = getByText('Helper text');
    expect(helperText.getAttribute('id')).toBe('input-id-helper-text');
  });

  it('renders a helper text with a label', () => {
    const { getByText } = renderWithTheme(
      <TextField helperText="Helper text" label="Label" />
    );

    const helperText = getByText('Helper text');

    expect(helperText).toBeInTheDocument();
    expect(helperText.getAttribute('id')).toBe('label-helper-text');
  });

  it('renders a helper text with a fallback id', () => {
    const { getByText } = renderWithTheme(
      <TextField helperText="Helper text" label="" />
    );

    const helperText = getByText('Helper text');

    // ':rg:' being the default react generated id
    expect(helperText.getAttribute('id')).toBe(':rg:-helper-text');
  });
});
