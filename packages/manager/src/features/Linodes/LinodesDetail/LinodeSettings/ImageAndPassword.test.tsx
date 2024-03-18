import * as React from 'react';

import { profileFactory } from 'src/factories';
import { accountUserFactory } from 'src/factories/accountUsers';
import { grantsFactory } from 'src/factories/grants';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ImageAndPassword } from './ImageAndPassword';

const props = {
  authorizedUsers: [],
  linodeId: 0,
  onImageChange: vi.fn(),
  onPasswordChange: vi.fn(),
  password: '',
  setAuthorizedUsers: vi.fn(),
};

describe('ImageAndPassword', () => {
  it('should render an Image Select', () => {
    const { getByLabelText } = renderWithTheme(<ImageAndPassword {...props} />);

    expect(getByLabelText('Image')).toBeVisible();
    expect(getByLabelText('Image')).toBeEnabled();
  });
  it('should render a password error if defined', async () => {
    const passwordError = 'Unable to set password.';
    const { findByText } = renderWithTheme(
      <ImageAndPassword {...props} passwordError={passwordError} />
    );

    expect(await findByText(passwordError)).toBeVisible();
  });
  it('should render an SSH Keys section', async () => {
    const { getByText } = renderWithTheme(<ImageAndPassword {...props} />);

    expect(getByText('SSH Keys', { selector: 'h2' })).toBeVisible();
  });
  it('should render ssh keys for each user on the account', async () => {
    const users = accountUserFactory.buildList(3, { ssh_keys: ['my-ssh-key'] });

    server.use(
      http.get('*/account/users', () => {
        return HttpResponse.json(makeResourcePage(users));
      })
    );

    const { findByText } = renderWithTheme(<ImageAndPassword {...props} />);

    for (const user of users) {
      // eslint-disable-next-line no-await-in-loop
      const username = await findByText(user.username);
      const tableRow = username.closest('tr');

      expect(username).toBeVisible();
      expect(tableRow).toHaveTextContent(user.ssh_keys[0]);
    }
  });
  it('should be disabled for a restricted user with read only access', async () => {
    server.use(
      http.get('*/profile', () => {
        return HttpResponse.json(profileFactory.build({ restricted: true }));
      }),
      http.get('*/profile/grants', () => {
        return HttpResponse.json(
          grantsFactory.build({
            linode: [{ id: 0, permissions: 'read_only' }],
          })
        );
      })
    );

    const { findByText, getByLabelText } = renderWithTheme(
      <ImageAndPassword {...props} />
    );

    await findByText(`You don't have permissions to edit this Linode.`, {
      exact: false,
    });

    expect(getByLabelText('Image')).toBeDisabled();
  });
  it('should be disabled for a restricted user with no access', async () => {
    server.use(
      http.get('*/profile', () => {
        return HttpResponse.json(profileFactory.build({ restricted: true }));
      }),
      http.get('*/profile/grants', () => {
        return HttpResponse.json(grantsFactory.build({ linode: [] }));
      })
    );

    const { findByText, getByLabelText } = renderWithTheme(
      <ImageAndPassword {...props} />
    );

    await findByText(`You don't have permissions to edit this Linode.`, {
      exact: false,
    });

    expect(getByLabelText('Image')).toBeDisabled();
  });
});
