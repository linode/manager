import { act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { sshKeyFactory } from 'src/factories';
import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CreateSSHKeyDrawer } from './CreateSSHKeyDrawer';

const props = {
  onClose: vi.fn(),
  open: true,
};

describe('SSHKeyCreationDrawer', () => {
  it('should have an input field for label', () => {
    const { getByText } = renderWithTheme(<CreateSSHKeyDrawer {...props} />);
    // Check for inputs
    getByText('Label');
    getByText('SSH Public Key');

    // Check for buttons
    getByText('Add Key');
    getByText('Cancel');
  });

  it('should be submittable and should show client side validation errors', async () => {
    const { getAllByRole, getByTestId, getByText } = renderWithTheme(
      <CreateSSHKeyDrawer {...props} />
    );

    const inputs = getAllByRole('textbox');

    const labelInput = inputs[0];
    const sskKeyInput = inputs[1];
    const submitButton = getByTestId('submit');

    act(() => {
      userEvent.type(labelInput, '');
      userEvent.type(sskKeyInput, 'invalid ssh key');
      userEvent.click(submitButton);
    });

    await waitFor(() => {
      getByText('Label is required.');
    });
  });

  it('should submit and call onClose', async () => {
    server.use(
      rest.post('*/profile/sshkeys', (req, res, ctx) => {
        return res(ctx.json(sshKeyFactory.build()));
      })
    );

    const { getAllByRole, getByTestId } = renderWithTheme(
      <CreateSSHKeyDrawer {...props} />
    );

    const inputs = getAllByRole('textbox');

    const labelInput = inputs[0];
    const sskKeyInput = inputs[1];
    const submitButton = getByTestId('submit');

    act(() => {
      userEvent.type(labelInput, 'my-ssh-key');
      userEvent.type(sskKeyInput, 'pretend this is a valid ssh key');
      userEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(props.onClose).toBeCalled();
    });
  });
});
