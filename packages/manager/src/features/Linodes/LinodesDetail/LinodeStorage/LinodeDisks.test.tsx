import { screen } from '@testing-library/react';
import React from 'react';

import { linodeDiskFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { LinodeDisks } from './LinodeDisks';

const mockDisks = [{ id: 1, label: 'Disk 1', size: 5000 }];

const mockLinode = {
  id: 123,
  specs: { disk: 10000 },
};

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAllLinodeDisksQuery: queryMocks.useAllLinodeDisksQuery,
    useLinodeQuery: queryMocks.useLinodeQuery,
  };
});

const queryMocks = vi.hoisted(() => ({
  userPermissions: vi.fn(() => ({
    data: {
      create_linode_disk: false,
    },
  })),
  useAllLinodeDisksQuery: vi.fn(() => ({
    data: mockDisks,
    isLoading: false,
    error: null,
  })),
  useLinodeQuery: vi.fn(() => ({
    data: mockLinode,
    isLoading: false,
    error: null,
  })),
  useNavigate: vi.fn(),
  useParams: vi.fn(),
  useSearch: vi.fn(),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
    useSearch: queryMocks.useSearch,
    useParams: queryMocks.useParams,
  };
});

describe('LinodeDisks', () => {
  beforeEach(() => {
    queryMocks.useNavigate.mockReturnValue(vi.fn());
    queryMocks.useSearch.mockReturnValue({});
    queryMocks.useParams.mockReturnValue({});
  });

  it('should render', async () => {
    const disks = linodeDiskFactory.buildList(5);

    queryMocks.useAllLinodeDisksQuery.mockReturnValue({
      data: disks,
      isLoading: false,
      error: null,
    });

    const { findByText, getByText } = renderWithTheme(<LinodeDisks />);

    // Verify heading renders
    expect(getByText('Disks')).toBeVisible();

    // Verify all 5 disks returned by the API render
    for (const disk of disks) {
      await findByText(disk.label);
    }
  });

  it('should disable "add a disk" button if the user does not have a create_linode_disk permissions and has free disk space', async () => {
    renderWithTheme(<LinodeDisks />);

    const addDiskBtn = screen.getByText('Add a Disk');
    expect(addDiskBtn).toHaveAttribute('aria-disabled', 'true');
  });

  it('should enable "add a disk" button if the user has a create_linode_disk permissions and has free disk space', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        create_linode_disk: true,
      },
    });

    renderWithTheme(<LinodeDisks />);

    const addDiskBtn = screen.getByText('Add a Disk');
    expect(addDiskBtn).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('should disable the "Add a Disk" button when there is no free disk space', () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        create_linode_disk: true,
      },
    });

    queryMocks.useAllLinodeDisksQuery.mockReturnValue({
      data: [{ id: 1, label: 'Disk 1', size: 15000 }],
      isLoading: false,
      error: null,
    });

    renderWithTheme(<LinodeDisks />);

    const addDiskBtn = screen.getByText('Add a Disk');
    expect(addDiskBtn).toHaveAttribute('aria-disabled', 'true');
  });

  it('should enable the "Add a Disk" button when there is free disk space', () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        create_linode_disk: true,
      },
    });

    queryMocks.useAllLinodeDisksQuery.mockReturnValue({
      data: [{ id: 1, label: 'Disk 1', size: 5000 }],
      isLoading: false,
      error: null,
    });

    renderWithTheme(<LinodeDisks />);

    const addDiskBtn = screen.getByText('Add a Disk');
    expect(addDiskBtn).not.toHaveAttribute('aria-disabled', 'true');
  });
});
