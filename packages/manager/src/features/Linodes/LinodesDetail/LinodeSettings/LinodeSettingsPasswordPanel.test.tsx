import 'src/mocks/testServer';

import { linodeFactory } from '@linode/utilities';
import React from 'react';

import { typeFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { LinodeSettingsPasswordPanel } from './LinodeSettingsPasswordPanel';

const standard = typeFactory.build({ id: 'g6-standard-1' });
const metal = typeFactory.build({ class: 'metal', id: 'g6-metal-alpha-2' });

const mockPoweredOnLinode = linodeFactory.build({ status: 'running' });
const mockPoweredOffLinode = linodeFactory.build({ status: 'offline' });

const queryMocks = vi.hoisted(() => ({
  userPermissions: vi.fn(() => ({
    data: {
      password_reset_linode: false,
    },
  })),
  useTypeQuery: vi.fn().mockReturnValue({
    data: null,
  }),
  useLinodeQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useTypeQuery: queryMocks.useTypeQuery,
    useLinodeQuery: queryMocks.useLinodeQuery,
  };
});

describe('LinodeSettingsPasswordPanel', () => {
  it('should render component', async () => {
    const { getByText } = renderWithTheme(
      <LinodeSettingsPasswordPanel linodeId={1} />
    );

    expect(getByText('Reset Root Password')).toBeVisible();
  });

  it('should disable "Save" button for Reset Root Password if the user does not have password_reset_linode permission for a bare metal instance', async () => {
    queryMocks.useTypeQuery.mockReturnValue({
      data: metal,
    });

    const { getByTestId } = renderWithTheme(
      <LinodeSettingsPasswordPanel linodeId={1} />
    );

    const saveLabelBtn = getByTestId('password - save');
    expect(saveLabelBtn).toBeInTheDocument();
    expect(saveLabelBtn).toHaveAttribute('aria-disabled', 'true');
  });

  it('should disable "Save" button for Reset Root Password if the user has password_reset_linode permission for a bare metal instance, but linode is running', async () => {
    queryMocks.useTypeQuery.mockReturnValue({
      data: metal,
    });

    queryMocks.useLinodeQuery.mockReturnValue({
      data: mockPoweredOnLinode,
    });

    queryMocks.userPermissions.mockReturnValue({
      data: {
        password_reset_linode: true,
      },
    });

    const { getByTestId } = renderWithTheme(
      <LinodeSettingsPasswordPanel linodeId={1} />
    );

    const saveLabelBtn = getByTestId('password - save');
    expect(saveLabelBtn).toBeInTheDocument();
    expect(saveLabelBtn).toHaveAttribute('aria-disabled', 'true');
  });

  it('should disable "Save" button for Reset Root Password if the user does not have password_reset_linode permission for a normal instance', async () => {
    queryMocks.useTypeQuery.mockReturnValue({
      data: standard,
    });

    queryMocks.userPermissions.mockReturnValue({
      data: {
        password_reset_linode: false,
      },
    });

    const { getByTestId, getByPlaceholderText } = renderWithTheme(
      <LinodeSettingsPasswordPanel linodeId={1} />
    );

    const saveLabelBtn = getByTestId('password - save');
    expect(saveLabelBtn).toBeInTheDocument();
    expect(saveLabelBtn).toHaveAttribute('aria-disabled', 'true');

    const selectDisk = getByPlaceholderText('Select a Disk');
    expect(selectDisk).toBeInTheDocument();
    expect(selectDisk).toBeDisabled();
  });

  it('should disable "Save" button for Reset Root Password if the user has password_reset_linode permission for a normal instance, but linode is running', async () => {
    queryMocks.useTypeQuery.mockReturnValue({
      data: standard,
    });

    queryMocks.useLinodeQuery.mockReturnValue({
      data: mockPoweredOnLinode,
    });

    queryMocks.userPermissions.mockReturnValue({
      data: {
        password_reset_linode: false,
      },
    });

    const { getByTestId, getByPlaceholderText } = renderWithTheme(
      <LinodeSettingsPasswordPanel linodeId={1} />
    );

    const saveLabelBtn = getByTestId('password - save');
    expect(saveLabelBtn).toBeInTheDocument();
    expect(saveLabelBtn).toHaveAttribute('aria-disabled', 'true');

    const selectDisk = getByPlaceholderText('Select a Disk');
    expect(selectDisk).toBeInTheDocument();
    expect(selectDisk).toBeDisabled();
  });

  it('should enable "Save" button for Reset Root Password if the user has password_reset_linode permission for a bare metal instance, and linode is offline', async () => {
    queryMocks.useTypeQuery.mockReturnValue({
      data: metal,
    });

    queryMocks.useLinodeQuery.mockReturnValue({
      data: mockPoweredOffLinode,
    });

    queryMocks.userPermissions.mockReturnValue({
      data: {
        password_reset_linode: true,
      },
    });

    const { getByTestId } = renderWithTheme(
      <LinodeSettingsPasswordPanel linodeId={1} />
    );

    const saveLabelBtn = getByTestId('password - save');
    expect(saveLabelBtn).toBeInTheDocument();
    expect(saveLabelBtn).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('should enable "Save" button for Reset Root Password if the user has password_reset_linode permission for a normal instance, and linode is offline', async () => {
    queryMocks.useTypeQuery.mockReturnValue({
      data: standard,
    });

    queryMocks.useLinodeQuery.mockReturnValue({
      data: mockPoweredOffLinode,
    });

    queryMocks.userPermissions.mockReturnValue({
      data: {
        password_reset_linode: true,
      },
    });

    const { getByTestId, getByPlaceholderText } = renderWithTheme(
      <LinodeSettingsPasswordPanel linodeId={1} />
    );

    const saveLabelBtn = getByTestId('password - save');
    expect(saveLabelBtn).toBeInTheDocument();
    expect(saveLabelBtn).not.toHaveAttribute('aria-disabled', 'true');

    const selectDisk = getByPlaceholderText('Select a Disk');
    expect(selectDisk).toBeInTheDocument();
    expect(selectDisk).toBeEnabled();
  });
});
