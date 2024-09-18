import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AddNewLink } from './AddNewLink';

const label = 'test-label';
const disabledReason = 'test disabled reason';
const testId = 'disabled-tooltip';

const props = {
  label,
  onClick: vi.fn(),
};

describe('AddNewLink', () => {
  it('renders the AddNewLink component', () => {
    const { getByText } = renderWithTheme(<AddNewLink {...props} />);

    expect(getByText(label)).toBeVisible();
  });
  it('renders the AddNewLink component without a tooltip if disabled is falsy', () => {
    const { queryByLabelText, queryByTestId } = renderWithTheme(
      <AddNewLink
        {...props}
        disabledReason={disabledReason}
        display="test-display"
      />
    );

    expect(queryByLabelText(disabledReason)).not.toBeInTheDocument();
    expect(queryByTestId(testId)).not.toBeInTheDocument();
  });

  it('renders the AddNewLink component without a tooltip if disabledReason is falsy', () => {
    const { queryByTestId } = renderWithTheme(
      <AddNewLink {...props} disabled />
    );

    expect(queryByTestId(testId)).not.toBeInTheDocument();
  });

  it('renders a tooltip if disabled and disabledReason are truthy', () => {
    const { getByLabelText, getByTestId } = renderWithTheme(
      <AddNewLink
        {...props}
        disabled
        disabledReason={disabledReason}
        display="test-display"
      />
    );

    expect(getByLabelText(disabledReason)).toBeVisible();
    expect(getByTestId(testId)).toBeInTheDocument();
  });

  it("displays the passed in 'display' value if it is given", () => {
    const { getByText, queryByText } = renderWithTheme(
      <AddNewLink {...props} display="test-display" />
    );

    expect(getByText('test-display')).toBeVisible();
    expect(queryByText(label)).not.toBeInTheDocument();
  });

  it('fires the onClick event if the button is clicked', async () => {
    const { getByText } = renderWithTheme(<AddNewLink {...props} />);

    const button = getByText(label);
    await userEvent.click(button);
    expect(props.onClick).toHaveBeenCalled();
  });
});
