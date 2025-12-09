import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { TPAProviders } from './TPAProviders';

import type { Provider } from 'src/featureFlags';

const providers: Provider[] = [
  {
    displayName: 'Google',
    href: 'https://google.com',
    icon: 'GoogleIcon',
    name: 'google',
  },
  {
    displayName: 'GitHub',
    href: 'https://github.com',
    icon: 'GitHubIcon',
    name: 'github',
  },
];

const flags = { tpaProviders: providers };

describe('TPAProviders component', () => {
  it('Should render login method with Linode button', () => {
    renderWithTheme(<TPAProviders authType="password" />, { flags });

    const linodeButton = screen.getByTestId('Button-Cloud Manager');
    expect(linodeButton).toBeInTheDocument();
    expect(linodeButton).toBeDisabled();

    const enabledText = within(linodeButton).getByText('Enabled');
    expect(enabledText).toBeVisible();
  });
  it('Should render login method with Google button', () => {
    renderWithTheme(<TPAProviders authType="google" />, { flags });

    const googleButton = screen.getByTestId('Button-Google');
    expect(googleButton).toBeInTheDocument();
    expect(googleButton).toBeDisabled();

    const enabledText = within(googleButton).getByText('Enabled');
    expect(enabledText).toBeVisible();

    const noticeElement = screen.getByTestId('Notice-Google');
    expect(noticeElement).toBeInTheDocument();
  });
  it('Should render login method with GitHub button', () => {
    renderWithTheme(<TPAProviders authType="github" />, { flags });

    const githubButton = screen.getByTestId('Button-GitHub');
    expect(githubButton).toBeInTheDocument();
    expect(githubButton).toBeDisabled();

    const enabledText = within(githubButton).getByText('Enabled');
    expect(enabledText).toBeInTheDocument();

    const noticeElement = screen.getByTestId('Notice-GitHub');
    expect(noticeElement).toBeInTheDocument();
  });

  test('Should open the dialog when the button is clicked', async () => {
    const { getByTestId } = renderWithTheme(
      <TPAProviders authType="password" />,
      { flags }
    );

    const button = getByTestId('Button-Google');
    await userEvent.click(button);
    const dialog = getByTestId('drawer');
    expect(dialog).toBeInTheDocument();
  });
});
