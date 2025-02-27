import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { TextWithExtraInfo } from './TextWithExtraInfo';

describe('TextWithExtraInfo Component', () => {
  it('renders a dash when no values are provided', () => {
    const { getByText } = renderWithTheme(<TextWithExtraInfo values={[]} />);
    expect(getByText('-')).toBeInTheDocument();
  });

  it('renders a single chip when one value is provided', () => {
    const { getByText } = renderWithTheme(
      <TextWithExtraInfo values={['Test Value']} />
    );
    expect(getByText('Test Value')).toBeInTheDocument();
  });

  it('renders a chip and a tooltip when multiple values are provided', async () => {
    const { findByText, getByText } = renderWithTheme(
      <TextWithExtraInfo values={['First', 'Second', 'Third']} />
    );

    expect(getByText('First')).toBeInTheDocument();
    expect(getByText('+2')).toBeInTheDocument();

    // Simulate hover to show tooltip
    await userEvent.hover(getByText('+2'));
    expect(await findByText('Second')).toBeInTheDocument();
    expect(await findByText('Third')).toBeInTheDocument();
  });

  it('does not render a tooltip when only one value is provided', async () => {
    const { getByText, queryByText } = renderWithTheme(
      <TextWithExtraInfo values={['Only One']} />
    );

    expect(getByText('Only One')).toBeInTheDocument();
    expect(queryByText('+1')).not.toBeInTheDocument();
  });
});
