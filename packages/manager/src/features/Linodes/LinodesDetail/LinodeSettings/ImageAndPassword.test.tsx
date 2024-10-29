import { screen } from '@testing-library/react';
import * as React from 'react';

import { accountUserFactory } from 'src/factories/accountUsers';
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
  selectedImage: '',
  setAuthorizedUsers: vi.fn(),
};

describe('ImageAndPassword', () => {
  it('should render an Image Select', () => {
    renderWithTheme(<ImageAndPassword {...props} />);

    expect(screen.getByRole('combobox'));
    expect(screen.getByRole('combobox')).toBeEnabled();
  });
  it('should render a password error if defined', async () => {
    const errorMessage = 'Unable to set password.';
    const { findByText } = renderWithTheme(
      <ImageAndPassword {...props} passwordError={errorMessage} />
    );

    const passwordError = await findByText(errorMessage, undefined, {
      timeout: 2500,
    });
    expect(passwordError).toBeVisible();
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
});
