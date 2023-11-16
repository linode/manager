import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { TypeToConfirm } from './TypeToConfirm';

const props = { onClick: vi.fn() };

describe('TypeToConfirm Component', () => {
  const labelText = 'Label';

  it('Should have a label', () => {
    const { getByText } = renderWithTheme(
      <TypeToConfirm label={labelText} onChange={vi.fn()} {...props} />
    );
    const label = getByText(labelText);
    expect(label).toHaveTextContent(labelText);
  });

  it('Should have a text input field associated with label', () => {
    const { getByLabelText } = renderWithTheme(
      <TypeToConfirm label={labelText} onChange={vi.fn()} {...props} />
    );
    const input = getByLabelText(labelText, { selector: 'input' });
    expect(input).toBeInTheDocument();
  });

  it("Should default to displaying instructions with a link to a user's account settings", () => {
    const { getByRole, queryByTestId } = renderWithTheme(
      <TypeToConfirm label={labelText} onChange={vi.fn()} {...props} />
    );
    expect(
      queryByTestId('instructions-to-enable-or-disable')
    ).toBeInTheDocument();
    expect(getByRole('link')).toHaveAttribute('href', '/profile/settings');
  });

  it('Should not display instructions when toggled to hidden', () => {
    const { queryByTestId } = renderWithTheme(
      <TypeToConfirm
        hideInstructions={true}
        label={labelText}
        onChange={vi.fn()}
        {...props}
      />
    );
    expect(
      queryByTestId('instructions-to-enable-or-disable')
    ).not.toBeInTheDocument();
  });
});
