import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { LOGIN_ROOT } from 'src/constants';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { TPADialog } from './TPADialog';

import type { TPADialogProps } from './TPADialog';

vi.mock('src/hooks/useFlags', () => ({
  __esModule: true,
  useFlags: vi.fn().mockReturnValue({
    tpaProviders: [
      {
        displayName: 'Google',
        href: 'https://google.com',
        icon: '"GoogleIcon"',
        name: 'google',
      },
      {
        displayName: 'GitHub',
        href: 'https://github.com',
        icon: 'GitHubIcon',
        name: 'github',
      },
    ],
  }),
}));

const props: TPADialogProps = {
  currentProvider: {
    displayName: 'Google',
    href: 'https://google.com',
    icon: 'GoogleIcon',
    name: 'google',
  },
  newProvider: 'password',
  onClose: vi.fn(),
  open: true,
};

describe('TPADialog', () => {
  it('Should render TPADialog change to Linode login', () => {
    renderWithTheme(<TPADialog {...props} />);
    const title = screen.getByText('Change login method to Linode?');
    expect(title).toBeInTheDocument();
  });
  it('Should render TPADialog change to Google login', () => {
    const newProps: TPADialogProps = {
      ...props,
      currentProvider: {
        displayName: 'Linode',
        href: 'https://linode.com',
        icon: 'LinodeIcon',
        name: 'password',
      },
      newProvider: 'google',
    };
    renderWithTheme(<TPADialog {...newProps} />);
    const title = screen.getByText('Change login method to Google?');
    expect(title).toBeInTheDocument();
  });
  it('Should render TPADialog change to GitHub login', () => {
    const newProps: TPADialogProps = {
      ...props,
      currentProvider: {
        displayName: 'Linode',
        href: 'https://linode.com',
        icon: 'LinodeIcon',
        name: 'password',
      },
      newProvider: 'github',
    };
    renderWithTheme(<TPADialog {...newProps} />);
    const title = screen.getByText('Change login method to GitHub?');
    expect(title).toBeInTheDocument();
  });
  it('Should close TPADialog upon clicking close button', () => {
    renderWithTheme(<TPADialog {...props} />);
    const cancelButton = screen.getByTestId('confirm-cancel');
    userEvent.click(cancelButton);
    expect(props.onClose).toBeCalled();
  });
  it('Should redirect to disable TPA', async () => {
    const expectedUrl = `${LOGIN_ROOT}/tpa/disable`;
    const mockWindow = vi.spyOn(window, 'open').mockReturnValue(null);
    renderWithTheme(<TPADialog {...props} />);

    const changeButton = screen.getByTestId('confirm-login-change');
    userEvent.click(changeButton);

    expect(props.onClose).toBeCalled();
    expect(mockWindow).toHaveBeenCalledWith(
      expectedUrl,
      '_blank',
      'noopener noreferrer'
    );
  });
  it('Should redirect to TPA(Google) login', async () => {
    const newProps: TPADialogProps = {
      ...props,
      currentProvider: {
        displayName: 'Linode',
        href: 'https://linode.com',
        icon: 'LinodeIcon',
        name: 'password',
      },
      newProvider: 'google',
    };
    const expectedUrl = `${LOGIN_ROOT}/tpa/enable/google`;
    const mockWindow = vi.spyOn(window, 'open').mockReturnValue(null);
    renderWithTheme(<TPADialog {...newProps} />);

    const changeButton = screen.getByTestId('confirm-login-change');
    userEvent.click(changeButton);

    expect(props.onClose).toBeCalled();
    expect(mockWindow).toHaveBeenCalledWith(
      expectedUrl,
      '_blank',
      'noopener noreferrer'
    );
  });
  it('Should redirect to TPA(Github) login', async () => {
    const newProps: TPADialogProps = {
      ...props,
      currentProvider: {
        displayName: 'Linode',
        href: 'https://linode.com',
        icon: 'LinodeIcon',
        name: 'password',
      },
      newProvider: 'github',
    };
    const expectedUrl = `${LOGIN_ROOT}/tpa/enable/github`;
    const mockWindow = vi.spyOn(window, 'open').mockReturnValue(null);
    renderWithTheme(<TPADialog {...newProps} />);

    const changeButton = screen.getByTestId('confirm-login-change');
    userEvent.click(changeButton);

    expect(props.onClose).toBeCalled();
    expect(mockWindow).toHaveBeenCalledWith(
      expectedUrl,
      '_blank',
      'noopener noreferrer'
    );
  });
});
