import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { appTokenFactory } from 'src/factories';
import { grantsFactory } from 'src/factories/grants';
import { profileFactory } from 'src/factories/profile';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CreateAPITokenDrawer } from './CreateAPITokenDrawer';

// Mock the useProfile and useGrants hooks to immediately return the expected data, circumventing the HTTP request and loading state.
const queryMocks = vi.hoisted(() => ({
  useGrants: vi.fn().mockReturnValue({}),
  useProfile: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/profile', async () => {
  const actual = await vi.importActual<any>('src/queries/profile');
  return {
    ...actual,
    useProfile: queryMocks.useProfile,
  };
});

vi.mock('src/queries/grants', async () => {
  const actual = await vi.importActual<any>('src/queries/grants');
  return {
    ...actual,
    useGrants: queryMocks.useGrants,
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
    expect(submitBtn).not.toHaveAttribute('aria-disabled', 'true');

    const cancelBtn = getByText(/Cancel/);
    expect(cancelBtn).not.toHaveAttribute('aria-disabled', 'true');
    expect(cancelBtn).toBeVisible();
  });

  it('Should see secret modal with secret when you type a label and submit the form successfully', async () => {
    server.use(
      http.post('*/profile/tokens', () => {
        return HttpResponse.json(
          appTokenFactory.build({ token: 'secret-value' })
        );
      })
    );

    const { getByTestId, getByText } = renderWithTheme(
      <CreateAPITokenDrawer {...props} />
    );

    const labelField = getByTestId('textfield-input');
    await userEvent.type(labelField, 'my-test-token');
    const submit = getByText('Create Token');
    await userEvent.click(submit);

    await waitFor(() =>
      expect(props.showSecret).toBeCalledWith('secret-value')
    );
  });

  it('Should default to None for all scopes', () => {
    const { getByLabelText } = renderWithTheme(
      <CreateAPITokenDrawer {...props} />
    );
    const selectAllNonePermRadioButton = getByLabelText('Select none for all');
    expect(selectAllNonePermRadioButton).toBeChecked();
  });

  it('Should default to 6 months for expiration', () => {
    const { getByText } = renderWithTheme(<CreateAPITokenDrawer {...props} />);
    getByText('In 6 months');
  });

  it('Should show the Child Account Access scope for a parent user account with the parent/child feature flag on', () => {
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ user_type: 'parent' }),
    });

    const { getByText } = renderWithTheme(<CreateAPITokenDrawer {...props} />, {
      flags: { parentChildAccountAccess: true },
    });
    const childScope = getByText('Child Account Access');
    expect(childScope).toBeInTheDocument();
  });

  it('Should not the Child Account Access scope for a restricted parent user account without the child_account_access grant', () => {
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ user_type: 'parent' }),
    });
    queryMocks.useProfile.mockReturnValue({
      data: grantsFactory.build({ global: { child_account_access: false } }),
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

  it('Should not show the Child Account Access scope for a non-parent user account with the parent/child feature flag on', () => {
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ user_type: 'default' }),
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

  it('Should close when Cancel is pressed', async () => {
    const { getByText } = renderWithTheme(<CreateAPITokenDrawer {...props} />);
    const cancelButton = getByText(/Cancel/);
    await userEvent.click(cancelButton);
    expect(props.onClose).toBeCalled();
  });

  it('Should not select Read Only for VPC scope when Select All > Read Only is clicked', async () => {
    const { getAllByTestId, getByLabelText } = renderWithTheme(
      <CreateAPITokenDrawer {...props} />
    );
    const vpcPermRadioButtons = getAllByTestId('perm-vpc-radio');
    const vpcNonePermRadioButton = vpcPermRadioButtons[0].firstChild;
    const vpcReadOnlyPermRadioButton = vpcPermRadioButtons[1].firstChild;

    const selectAllReadOnlyPermRadioButton = getByLabelText(
      'Select read-only for all'
    );
    await userEvent.click(selectAllReadOnlyPermRadioButton);
    expect(selectAllReadOnlyPermRadioButton).toBeChecked();

    expect(vpcNonePermRadioButton).toBeChecked();
    expect(vpcReadOnlyPermRadioButton).not.toBeChecked();
    expect(vpcReadOnlyPermRadioButton).toBeDisabled();
  });
});
