import * as React from 'react';

import { accountUserFactory } from 'src/factories/accountUsers';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import {
  renderWithTheme,
  wrapWithFormContext,
} from 'src/utilities/testHelpers';

import { ImageAndPassword } from './ImageAndPassword';

const props = {
  authorizedUsers: [],
  disabled: false,
  imageFieldError: undefined,
  linodeId: 0,
  onImageChange: vi.fn(),
  onPasswordChange: vi.fn(),
  password: '',
  passwordError: undefined,
  selectedImage: '',
  setAuthorizedUsers: vi.fn(),
};

describe('ImageAndPassword', () => {
  it('should render an Image Select', async () => {
    const component = wrapWithFormContext({
      component: <ImageAndPassword {...props} />,
    });
    const { getByRole } = renderWithTheme(component);

    expect(getByRole('combobox')).toBeVisible();
    expect(getByRole('combobox')).toBeEnabled();
  });
  it('should render a password error if defined', async () => {
    const errorMessage = 'Unable to set password.';
    const component = wrapWithFormContext({
      component: <ImageAndPassword {...props} passwordError={errorMessage} />,
    });
    const { findByText } = renderWithTheme(component);

    const passwordError = await findByText(errorMessage, undefined, {
      timeout: 2500,
    });
    expect(passwordError).toBeVisible();
  });
  it('should render an SSH Keys section', async () => {
    const component = wrapWithFormContext({
      component: <ImageAndPassword {...props} />,
    });
    const { getByText } = renderWithTheme(component);

    expect(getByText('SSH Keys', { selector: 'h2' })).toBeVisible();
  });

  it('should render ssh keys for each user on the account', async () => {
    const users = accountUserFactory.buildList(3, { ssh_keys: ['my-ssh-key'] });

    server.use(
      http.get('*/account/users', () => {
        return HttpResponse.json(makeResourcePage(users));
      })
    );

    const component = wrapWithFormContext({
      component: <ImageAndPassword {...props} />,
    });
    const { findByText } = renderWithTheme(component);

    for (const user of users) {
      const username = await findByText(user.username);
      const tableRow = username.closest('tr');

      expect(username).toBeVisible();
      expect(tableRow).toHaveTextContent(user.ssh_keys[0]);
    }
  });
});
