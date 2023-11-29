import { act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import DeleteSSHKeyDialog from './DeleteSSHKeyDialog';

const props = {
  id: 0,
  onClose: vi.fn(),
  open: true,
};

describe('DeleteSSHKeyDialog', () => {
  it('should display all expected dialog titles, primary, and secondary buttons', async () => {
    const { getByText } = renderWithTheme(<DeleteSSHKeyDialog {...props} />);
    // Check for title
    getByText('Delete SSH Key');

    // Check for buttons
    getByText('Delete');
    getByText('Cancel');
  });

  it('should include the SSH key label when provided', () => {
    const { getByText } = renderWithTheme(
      <DeleteSSHKeyDialog {...props} label="my-ssh-key" />
    );

    getByText(/my-ssh-key/);
  });

  it('should submit and call onClose', async () => {
    server.use(
      rest.delete('*/profile/sshkeys/0', (req, res, ctx) => {
        return res(ctx.json({}));
      })
    );

    const { getByTestId } = renderWithTheme(<DeleteSSHKeyDialog {...props} />);

    const submitButton = getByTestId('confirm-delete');

    act(() => {
      userEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(props.onClose).toBeCalled();
    });
  });

  it('should Cancel and call onClose', async () => {
    const { getByTestId } = renderWithTheme(<DeleteSSHKeyDialog {...props} />);

    const cancelButton = getByTestId('cancel-delete');

    act(() => {
      userEvent.click(cancelButton);
    });

    await waitFor(() => {
      expect(props.onClose).toBeCalled();
    });
  });
});
