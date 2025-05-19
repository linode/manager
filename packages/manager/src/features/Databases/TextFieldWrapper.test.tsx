import * as React from 'react';
import { describe, expect, it } from 'vitest';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { TextFieldWrapper } from './TextFieldWrapper';

describe('TextFieldWrapper', () => {
  const props = {
    label: 'Cluster Label',
    value: 'test',
  };

  it('Renders a TextField with the given label and initial value', async () => {
    const { getByTestId, getByText } = renderWithTheme(
      <TextFieldWrapper {...props} />
    );
    const textFieldHost = await getByTestId('textfield-input');
    const shadowTextField = textFieldHost?.shadowRoot?.querySelector('input');

    expect(getByText('Cluster Label')).toBeInTheDocument();
    expect(shadowTextField).toHaveValue('test');
  });

  it('Renders an error message on error', async () => {
    const { getByText } = renderWithTheme(
      <TextFieldWrapper errorText="There was an error" {...props} />
    );
    expect(getByText(/There was an error/i)).toBeInTheDocument();
  });

  it('text field should be disabled on disable', async () => {
    const { getByTestId } = renderWithTheme(
      <TextFieldWrapper disabled {...props} />
    );
    const textFieldHost = await getByTestId('textfield-input');

    expect(textFieldHost).toBeDisabled();
  });
});
