import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { appTokenFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { Props, RevokeTokenDialog } from './RevokeTokenDialog';

const token = appTokenFactory.build({ label: 'my-token' });

const props: Props = {
  onClose: vi.fn(),
  open: true,
  token,
  type: 'Personal Access Token',
};

describe('Revoke API Token Dialog', () => {
  it('The token label should be in the dialog title', () => {
    const { getByText } = renderWithTheme(<RevokeTokenDialog {...props} />);

    expect(getByText(token.label, { exact: false })).toBeVisible();
  });
  it('Should close on successful revoke', async () => {
    // This test expects a succesfull response for a DELETE */profile/tokens/:id
    const { getByTestId } = renderWithTheme(<RevokeTokenDialog {...props} />);

    const revokeButton = getByTestId('revoke-button');

    userEvent.click(revokeButton);

    // We must wait because an API call (to the MSW) is made
    await waitFor(() => expect(props.onClose).toBeCalled());
  });
  it('Should close when Cancel is pressed', () => {
    const { getByTestId } = renderWithTheme(<RevokeTokenDialog {...props} />);

    const cancelButton = getByTestId('cancel-button');

    userEvent.click(cancelButton);

    expect(props.onClose).toBeCalled();
  });
});
