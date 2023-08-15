import { fireEvent, getDefaultNormalizer } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

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
});
