import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { appTokenFactory } from 'src/factories';
import { accountUserFactory } from 'src/factories/accountUsers';
import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CreateAPITokenDrawer } from './CreateAPITokenDrawer';

// Mock the useAccountUser hooks to immediately return the expected data, circumventing the HTTP request and loading state.
const queryMocks = vi.hoisted(() => ({
  useAccountUser: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/accountUsers', async () => {
  const actual = await vi.importActual<any>('src/queries/accountUsers');
  return {
    ...actual,
    useAccountUser: queryMocks.useAccountUser,
  };
});

const props = {
  onClose: vi.fn(),
  open: true,
  showSecret: vi.fn(),
};

describe('Create API Token Drawer', () => {
  it('checks API Token Drawer rendering', () => {
    const { getByTestId, getByText } = renderWithTheme(
      <CreateAPITokenDrawer {...props} />
    );
    const drawerTitle = getByText('Add Personal Access Token');
    expect(drawerTitle).toBeVisible();

    const labelTitle = getByText(/Label/);
    const labelField = getByTestId('textfield-input');
    expect(labelTitle).toBeVisible();
    expect(labelField).toBeEnabled();

    const expiry = getByText(/Expiry/);
    expect(expiry).toBeVisible();

    const submitBtn = getByTestId('create-button');
    expect(submitBtn).toBeVisible();
    expect(submitBtn).toBeEnabled();

    const cancelBtn = getByText(/Cancel/);
    expect(cancelBtn).toBeEnabled();
    expect(cancelBtn).toBeVisible();
  });

  it('Should see secret modal with secret when you type a label and submit the form successfully', async () => {
    server.use(
      rest.post('*/profile/tokens', (req, res, ctx) => {
        return res(ctx.json(appTokenFactory.build({ token: 'secret-value' })));
      })
    );

    const { getByTestId, getByText } = renderWithTheme(
      <CreateAPITokenDrawer {...props} />
    );

    const labelField = getByTestId('textfield-input');
    userEvent.type(labelField, 'my-test-token');
    const submit = getByText('Create Token');
    userEvent.click(submit);

    await waitFor(() =>
      expect(props.showSecret).toBeCalledWith('secret-value')
    );
  });

  // TODO: Parent/Child - remove this test when Parent/Child feature is released.
  it('Should default to read/write for all scopes', () => {
    const { getByLabelText } = renderWithTheme(
      <CreateAPITokenDrawer {...props} />
    );
    const selectAllReadWritePermRadioButton = getByLabelText(
      'Select read/write for all'
    );
    expect(selectAllReadWritePermRadioButton).toBeChecked();
  });

  it('Should default to None for all scopes with the parent/child feature flag on', () => {
    const { getByLabelText } = renderWithTheme(
      <CreateAPITokenDrawer {...props} />,
      { flags: { parentChildAccountAccess: true } }
    );
    const selectAllNonePermRadioButton = getByLabelText('Select none for all');
    expect(selectAllNonePermRadioButton).toBeChecked();
  });

  it('Should default to 6 months for expiration', () => {
    const { getByText } = renderWithTheme(<CreateAPITokenDrawer {...props} />);
    getByText('In 6 months');
  });

  it('Should show the Child Account Access scope for a parent user account with the parent/child feature flag on', () => {
    queryMocks.useAccountUser.mockReturnValue({
      data: accountUserFactory.build({ user_type: 'parent' }),
    });

    const { getByText } = renderWithTheme(<CreateAPITokenDrawer {...props} />, {
      flags: { parentChildAccountAccess: true },
    });
    const childScope = getByText('Child Account Access');
    expect(childScope).toBeInTheDocument();
  });

  it('Should not show the Child Account Access scope for a non-parent user account with the parent/child feature flag on', () => {
    queryMocks.useAccountUser.mockReturnValue({
      data: accountUserFactory.build({ user_type: null }),
    });

    const { queryByText } = renderWithTheme(
      <CreateAPITokenDrawer {...props} />,
      {
        flags: { parentChildAccountAccess: true },
      }
    );

    const childScope = queryByText('Child Account Access');
    expect(childScope).not.toBeInTheDocument();
  });

  it('Should close when Cancel is pressed', () => {
    const { getByText } = renderWithTheme(<CreateAPITokenDrawer {...props} />);
    const cancelButton = getByText(/Cancel/);
    userEvent.click(cancelButton);
    expect(props.onClose).toBeCalled();
  });
});
