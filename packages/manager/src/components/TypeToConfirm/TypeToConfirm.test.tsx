import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { TypeToConfirm } from './TypeToConfirm';

import type { ManagerPreferences } from 'src/types/ManagerPreferences';

const props = { onClick: vi.fn() };

const preference: ManagerPreferences['type_to_confirm'] = true;

const queryMocks = vi.hoisted(() => ({
  usePreferences: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/profile/preferences', async () => {
  const actual = await vi.importActual('src/queries/profile/preferences');
  return {
    ...actual,
    usePreferences: queryMocks.usePreferences,
  };
});

queryMocks.usePreferences.mockReturnValue({
  data: preference,
});

describe('TypeToConfirm Component', () => {
  const labelText = 'Label';

  it('Should not show label when visible prop not provided', () => {
    const { queryByText } = renderWithTheme(
      <TypeToConfirm label={labelText} onChange={vi.fn()} {...props} />
    );
    expect(queryByText(labelText)).not.toBeInTheDocument();
  });

  it('Should not show input when visible prop not provided', () => {
    const { queryByLabelText } = renderWithTheme(
      <TypeToConfirm label={labelText} onChange={vi.fn()} {...props} />
    );
    expect(queryByLabelText(labelText)).not.toBeInTheDocument();
  });

  it('Should display label when visible is true', () => {
    queryMocks.usePreferences.mockReturnValue({
      data: preference,
    });
    const { getByText } = renderWithTheme(
      <TypeToConfirm label={labelText} onChange={vi.fn()} {...props} visible />
    );
    const label = getByText(labelText);
    expect(label).toHaveTextContent(labelText);
  });

  it('Should display input when visible is true', () => {
    queryMocks.usePreferences.mockReturnValue({
      data: preference,
    });
    const { getByLabelText } = renderWithTheme(
      <TypeToConfirm label={labelText} onChange={vi.fn()} {...props} visible />
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
