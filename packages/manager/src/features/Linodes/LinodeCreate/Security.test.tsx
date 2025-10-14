import { regionFactory } from '@linode/utilities';
import { waitFor } from '@testing-library/react';
import React from 'react';

import { accountFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import {
  renderWithTheme,
  renderWithThemeAndHookFormContext,
  wrapWithFormContext,
} from 'src/utilities/testHelpers';

import { Security } from './Security';

import type { LinodeCreateFormValues } from './utilities';

const queryMocks = vi.hoisted(() => ({
  useNavigate: vi.fn(),
  useParams: vi.fn().mockReturnValue({ type: undefined }),
  useLocation: vi.fn().mockReturnValue({
    search: '',
  }),
  useSearch: vi.fn().mockReturnValue({}),

  userPermissions: vi.fn(() => ({
    data: {
      create_linode: false,
    },
  })),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
    useLocation: queryMocks.useLocation,
    useSearch: queryMocks.useSearch,
    useParams: queryMocks.useParams,
  };
});

describe('Security', () => {
  // TODO: Unskip once M3-8559 is addressed.
  it('should disable the root password input if the user does not have create_linode permission', async () => {
    const { getByLabelText } = renderWithThemeAndHookFormContext({
      component: <Security />,
    });

    await waitFor(
      () => {
        const rootPasswordInput = getByLabelText('Root Password');

        expect(rootPasswordInput).toBeVisible();
        expect(rootPasswordInput).toBeDisabled();
      },
      { timeout: 5_000 }
    );
  });

  it('should enable the root password input if the user does has create_linode permission', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        create_linode: true,
      },
    });
    const { getByLabelText } = renderWithThemeAndHookFormContext({
      component: <Security />,
    });

    await waitFor(() => {
      const rootPasswordInput = getByLabelText('Root Password');

      expect(rootPasswordInput).toBeVisible();
      expect(rootPasswordInput).toBeEnabled();
    });
  });

  it('should render a SSH Keys heading', async () => {
    const component = wrapWithFormContext({
      component: <Security />,
    });
    const { getAllByText } = renderWithTheme(component);

    const heading = getAllByText('SSH Keys')[0];

    expect(heading).toBeVisible();
    expect(heading.tagName).toBe('H2');
  });

  it('should disable an "Add An SSH Key" button if the user does not have create_linode permission', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        create_linode: false,
      },
    });
    const component = wrapWithFormContext({
      component: <Security />,
    });
    const { getByText } = renderWithTheme(component);

    const addSSHKeyButton = getByText('Add an SSH Key');

    expect(addSSHKeyButton).toBeVisible();
    expect(addSSHKeyButton).toBeDisabled();
  });

  it('should enable an "Add An SSH Key" button if the user has create_linode permission', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        create_linode: true,
      },
    });
    const component = wrapWithFormContext({
      component: <Security />,
    });
    const { getByText } = renderWithTheme(component);

    const addSSHKeyButton = getByText('Add an SSH Key');

    expect(addSSHKeyButton).toBeVisible();
    expect(addSSHKeyButton).toBeEnabled();
  });

  it('should show Linode disk encryption if the flag is on and the account has the capability', async () => {
    server.use(
      http.get('*/v4*/account', () => {
        return HttpResponse.json(
          accountFactory.build({ capabilities: ['Disk Encryption'] })
        );
      })
    );

    const component = wrapWithFormContext({
      component: <Security />,
    });
    const { findByText } = renderWithTheme(component, {
      flags: { linodeDiskEncryption: true },
    });

    const heading = await findByText('Disk Encryption');

    expect(heading).toBeVisible();
    expect(heading.tagName).toBe('H3');
  });

  it('should disable disk encryption if the selected core region does not support it', async () => {
    const region = regionFactory.build({
      capabilities: [],
      site_type: 'core',
    });

    const account = accountFactory.build({ capabilities: ['Disk Encryption'] });

    server.use(
      http.get('*/v4*/account', () => {
        return HttpResponse.json(account);
      }),
      http.get('*/v4*/regions', () => {
        return HttpResponse.json(makeResourcePage([region]));
      })
    );

    const component = wrapWithFormContext<LinodeCreateFormValues>({
      component: <Security />,
      useFormOptions: { defaultValues: { region: region.id } },
    });
    const { findByLabelText } = renderWithTheme(component, {
      flags: { linodeDiskEncryption: true },
    });

    await findByLabelText(
      'Disk encryption is not available in the selected region. Select another region to use Disk Encryption.'
    );
  });

  it('should disable the disk encryption checkbox (but show it as enabled) if the selected region is a distributed region', async () => {
    const region = regionFactory.build({
      capabilities: ['Disk Encryption'],
      site_type: 'distributed',
    });

    const account = accountFactory.build({ capabilities: ['Disk Encryption'] });

    server.use(
      http.get('*/v4*/account', () => {
        return HttpResponse.json(account);
      }),
      http.get('*/v4*/regions', () => {
        return HttpResponse.json(makeResourcePage([region]));
      })
    );

    const component = wrapWithFormContext<LinodeCreateFormValues>({
      component: <Security />,
      useFormOptions: { defaultValues: { region: region.id } },
    });
    const { findByLabelText, getByLabelText } = renderWithTheme(component, {
      flags: { linodeDiskEncryption: true },
    });

    await findByLabelText(
      'Distributed Compute Instances are encrypted. This setting can not be changed.'
    );

    const checkbox = getByLabelText('Encrypt Disk');

    expect(checkbox).toBeChecked();
    expect(checkbox).toBeDisabled();
  });
});
