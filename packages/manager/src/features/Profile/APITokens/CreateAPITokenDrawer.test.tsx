import { grantsFactory, profileFactory } from '@linode/utilities';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { appTokenFactory } from 'src/factories';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CreateAPITokenDrawer } from './CreateAPITokenDrawer';

// Mock the useProfile and useGrants hooks to immediately return the expected data, circumventing the HTTP request and loading state.
const queryMocks = vi.hoisted(() => ({
  useGrants: vi.fn().mockReturnValue({}),
  useProfile: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual<any>('@linode/queries');
  return {
    ...actual,
    useProfile: queryMocks.useProfile,
  };
});

const props = {
  onClose: vi.fn(),
  open: true,
  showSecret: vi.fn(),
};

describe('Create API Token Drawer', () => {
  it('checks API Token Drawer rendering', () => {
    const { getAllByTestId, getByTestId, getByText } = renderWithTheme(
      <CreateAPITokenDrawer {...props} />
    );
    const drawerTitle = getByText('Add Personal Access Token');
    expect(drawerTitle).toBeVisible();

    const labelTitle = getByText(/Label/);
    const labelField = getAllByTestId('textfield-input');
    expect(labelTitle).toBeVisible();
    expect(labelField[0]).toBeEnabled();

    const expiry = getByText(/Expiry/);
    expect(expiry).toBeVisible();

    // Submit button will be disabled until scope selection is made.
    const submitBtn = getByTestId('create-button');
    expect(submitBtn).toBeVisible();
    expect(submitBtn).toHaveAttribute('aria-disabled', 'true');

    const cancelBtn = getByText(/Cancel/);
    expect(cancelBtn).not.toHaveAttribute('aria-disabled', 'true');
    expect(cancelBtn).toBeVisible();
  });

  it(
    'Should see secret modal with secret when you type a label and submit the form successfully',
    async () => {
      server.use(
        http.post('*/profile/tokens', () => {
          return HttpResponse.json(
            appTokenFactory.build({ token: 'secret-value' })
          );
        })
      );

      const { getAllByTestId, getByLabelText, getByText } = renderWithTheme(
        <CreateAPITokenDrawer {...props} />
      );

      const labelField = getAllByTestId('textfield-input');
      await userEvent.type(labelField[0], 'my-test-token');

      const selectAllNoAccessPermRadioButton = getByLabelText(
        'Select no access for all'
      );
      const submitBtn = getByText('Create Token');

      expect(submitBtn).toHaveAttribute('aria-disabled', 'true');
      await userEvent.click(selectAllNoAccessPermRadioButton);
      await userEvent.click(submitBtn);

      await waitFor(() =>
        expect(props.showSecret).toBeCalledWith('secret-value')
      );
    },
    { timeout: 15000 }
  );

  it('Should default to no selection for all scopes', () => {
    const { getByLabelText } = renderWithTheme(
      <CreateAPITokenDrawer {...props} />
    );
    const selectAllNoAccessPermRadioButton = getByLabelText(
      'Select no access for all'
    );
    const selectAllReadOnlyPermRadioButton = getByLabelText(
      'Select read-only for all'
    );
    const selectAllReadWritePermRadioButton = getByLabelText(
      'Select read/write for all'
    );

    expect(selectAllNoAccessPermRadioButton).not.toBeChecked();
    expect(selectAllReadOnlyPermRadioButton).not.toBeChecked();
    expect(selectAllReadWritePermRadioButton).not.toBeChecked();
  });

  it('Should default to 6 months for expiration', () => {
    const { getAllByRole } = renderWithTheme(
      <CreateAPITokenDrawer {...props} />
    );
    expect(getAllByRole('combobox')[0]).toHaveDisplayValue('In 6 months');
  });

  it('Should show the Child Account Access scope for a parent user account with the parent/child feature flag on', () => {
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ user_type: 'parent' }),
    });

    const { getByText } = renderWithTheme(<CreateAPITokenDrawer {...props} />);
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
      <CreateAPITokenDrawer {...props} />
    );
    const childScope = queryByText('Child Account Access');
    expect(childScope).not.toBeInTheDocument();
  });

  it('Should not show the Child Account Access scope for a non-parent user account with the parent/child feature flag on', () => {
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ user_type: 'default' }),
    });

    const { queryByText } = renderWithTheme(
      <CreateAPITokenDrawer {...props} />
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
    const vpcNoAccessPermRadioButton = vpcPermRadioButtons[0].firstChild;
    const vpcReadOnlyPermRadioButton = vpcPermRadioButtons[1].firstChild;

    const selectAllReadOnlyPermRadioButton = getByLabelText(
      'Select read-only for all'
    );
    await userEvent.click(selectAllReadOnlyPermRadioButton);
    expect(selectAllReadOnlyPermRadioButton).toBeChecked();

    expect(vpcNoAccessPermRadioButton).toBeChecked();
    expect(vpcReadOnlyPermRadioButton).not.toBeChecked();
    expect(vpcReadOnlyPermRadioButton).toBeDisabled();
  });
});
