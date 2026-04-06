import { linodeFactory, regionFactory } from '@linode/utilities';
import { waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React from 'react';

import { imageFactory, linodeDiskFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CreateImageTab } from './CreateImageTab';

const queryMocks = vi.hoisted(() => ({
  useLinodeQuery: vi.fn().mockReturnValue({}),
  useAllLinodesQuery: vi.fn().mockReturnValue({}),
  useAllLinodeDisksQuery: vi.fn().mockReturnValue({}),
  useRegionsQuery: vi.fn().mockReturnValue({}),
  useCreateImageMutation: vi.fn().mockReturnValue({}),
  useSearch: vi.fn().mockReturnValue({ query: undefined }),
  usePermissions: vi.fn().mockReturnValue({}),
  useGetAllUserEntitiesByPermission: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useLinodeQuery: queryMocks.useLinodeQuery,
    useAllLinodesQuery: queryMocks.useAllLinodesQuery,
    useAllLinodeDisksQuery: queryMocks.useAllLinodeDisksQuery,
    useRegionsQuery: queryMocks.useRegionsQuery,
    useCreateImageMutation: queryMocks.useCreateImageMutation,
  };
});

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useSearch: queryMocks.useSearch,
  };
});

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.usePermissions,
}));

vi.mock('src/features/IAM/hooks/useGetAllUserEntitiesByPermission', () => ({
  useGetAllUserEntitiesByPermission:
    queryMocks.useGetAllUserEntitiesByPermission,
}));

describe('CreateImageTab', () => {
  beforeEach(() => {
    queryMocks.usePermissions.mockReturnValue({
      data: { create_image: true },
      isLoading: false,
      error: null,
    });
    queryMocks.useGetAllUserEntitiesByPermission.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });
  });

  it('should render fields, titles, and buttons in their default state', async () => {
    const { getByLabelText, getByText } = renderWithTheme(<CreateImageTab />);

    expect(getByText('Select Linode & Disk')).toBeVisible();

    expect(getByLabelText('Linode')).toBeVisible();

    const diskSelect = getByLabelText('Disk');

    expect(diskSelect).toBeVisible();
    expect(diskSelect).toBeDisabled();

    expect(getByText('Select a Linode to see available disks')).toBeVisible();

    expect(getByText('Image Details')).toBeVisible();

    expect(getByLabelText('Label')).toBeVisible();
    expect(getByLabelText('Add Tags')).toBeVisible();
    expect(getByLabelText('Description')).toBeVisible();

    const submitButton = getByText('Create Image').closest('button');

    expect(submitButton).toBeVisible();
    expect(submitButton).toBeEnabled();
  });

  it('should pre-fill Linode and Disk from search params', async () => {
    const linode = linodeFactory.build();
    const disk = linodeDiskFactory.build();

    queryMocks.useGetAllUserEntitiesByPermission.mockReturnValue({
      data: [linode],
      isLoading: false,
      error: null,
    });
    queryMocks.useAllLinodesQuery.mockReturnValue({
      data: [linode],
      isLoading: false,
      error: null,
    });
    queryMocks.useLinodeQuery.mockReturnValue({
      data: linode,
      isLoading: false,
      error: null,
    });
    queryMocks.useAllLinodeDisksQuery.mockReturnValue({
      data: [disk],
      isFetching: false,
      error: null,
    });
    queryMocks.useSearch.mockReturnValue({
      selectedDisk: disk.id,
      selectedLinode: linode.id,
    });

    const { getByLabelText } = renderWithTheme(<CreateImageTab />);

    await waitFor(() => {
      expect(getByLabelText('Linode')).toHaveValue(linode.label);
      expect(getByLabelText('Disk')).toHaveValue(disk.label);
    });
  });

  it('should render client side validation errors', async () => {
    queryMocks.useSearch.mockReturnValue({
      selectedDisk: undefined,
      selectedLinode: undefined,
    });
    const { getByText } = renderWithTheme(<CreateImageTab />);

    const submitButton = getByText('Create Image').closest('button');

    await userEvent.click(submitButton!);

    expect(getByText('Disk is required.')).toBeVisible();
  });

  it('should allow the user to select a disk and submit the form', async () => {
    const linode = linodeFactory.build();
    const disk = linodeDiskFactory.build();
    const image = imageFactory.build();

    queryMocks.useGetAllUserEntitiesByPermission.mockReturnValue({
      data: [linode],
      isLoading: false,
      error: null,
    });
    queryMocks.useAllLinodesQuery.mockReturnValue({
      data: [linode],
      isLoading: false,
      error: null,
    });
    queryMocks.useLinodeQuery.mockReturnValue({
      data: linode,
      isLoading: false,
      error: null,
    });
    queryMocks.useAllLinodeDisksQuery.mockReturnValue({
      data: [disk],
      isFetching: false,
      error: null,
    });
    queryMocks.useCreateImageMutation.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(image),
      isLoading: false,
      error: null,
    });

    const { findByText, getByLabelText, getByText, queryByText } =
      renderWithTheme(<CreateImageTab />);

    const linodeSelect = getByLabelText('Linode');

    await userEvent.click(linodeSelect);

    const linodeOption = await findByText(linode.label);

    await userEvent.click(linodeOption);

    const diskSelect = getByLabelText('Disk');

    // Once a Linode is selected, the Disk select should become enabled
    expect(diskSelect).toBeEnabled();
    expect(queryByText('Select a Linode to see available disks')).toBeNull();

    await userEvent.click(diskSelect);

    const diskOption = await findByText(disk.label);

    await userEvent.click(diskOption);

    const submitButton = getByText('Create Image').closest('button');

    await userEvent.click(submitButton!);

    // Verify success toast shows
    await findByText('Image scheduled for creation.');
  });

  it('should render a notice if the user selects a Linode in a region that does not support image storage', async () => {
    const region = regionFactory.build({ capabilities: [] });
    const linode = linodeFactory.build({ region: region.id });

    queryMocks.useGetAllUserEntitiesByPermission.mockReturnValue({
      data: [linode],
      isLoading: false,
      error: null,
    });
    queryMocks.useAllLinodesQuery.mockReturnValue({
      data: [linode],
      isLoading: false,
      error: null,
    });
    queryMocks.useLinodeQuery.mockReturnValue({
      data: linode,
      isLoading: false,
      error: null,
    });
    queryMocks.useAllLinodeDisksQuery.mockReturnValue({
      data: [linode],
      isFetching: false,
      error: null,
    });
    queryMocks.useRegionsQuery.mockReturnValue({
      data: [region],
      isLoading: false,
      error: null,
    });

    const { findByText, getByLabelText } = renderWithTheme(<CreateImageTab />);

    const linodeSelect = getByLabelText('Linode');

    await userEvent.click(linodeSelect);

    const linodeOption = await findByText(linode.label);

    await userEvent.click(linodeOption);

    await findByText(
      'This Linode’s region doesn’t support local image storage.',
      { exact: false }
    );
  });

  it('should auto-populate image label based on linode and disk', async () => {
    const linode = linodeFactory.build();
    const disk1 = linodeDiskFactory.build();
    const disk2 = linodeDiskFactory.build();
    const image = imageFactory.build();

    queryMocks.useGetAllUserEntitiesByPermission.mockReturnValue({
      data: [linode],
      isLoading: false,
      error: null,
    });
    queryMocks.useAllLinodesQuery.mockReturnValue({
      data: [linode],
      isLoading: false,
      error: null,
    });
    queryMocks.useLinodeQuery.mockReturnValue({
      data: linode,
      isLoading: false,
      error: null,
    });
    queryMocks.useAllLinodeDisksQuery.mockReturnValue({
      data: [disk1, disk2],
      isFetching: false,
      error: null,
    });
    queryMocks.useCreateImageMutation.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(image),
      isLoading: false,
      error: null,
    });

    const { findByText, getByLabelText, queryByText } = renderWithTheme(
      <CreateImageTab />
    );

    const linodeSelect = getByLabelText('Linode');

    await userEvent.click(linodeSelect);

    const linodeOption = await findByText(linode.label);

    await userEvent.click(linodeOption);

    const diskSelect = getByLabelText('Disk');

    // Once a Linode is selected, the Disk select should become enabled
    expect(diskSelect).toBeEnabled();
    expect(queryByText('Select a Linode to see available disks')).toBeNull();

    await userEvent.click(diskSelect);

    const diskOption = await findByText(disk1.label);

    await userEvent.click(diskOption);

    // Image label should auto-populate
    const imageLabel = getByLabelText('Label');
    expect(imageLabel).toHaveValue(`${linode.label}-${disk1.label}`);

    // Image label should update
    await userEvent.click(diskSelect);

    const disk2Option = await findByText(disk2.label);
    await userEvent.click(disk2Option);

    expect(imageLabel).toHaveValue(`${linode.label}-${disk2.label}`);

    // Image label should not override user input
    const customLabel = 'custom-label';
    await userEvent.clear(imageLabel);
    await userEvent.type(imageLabel, customLabel);
    expect(imageLabel).toHaveValue(customLabel);
    await userEvent.click(diskSelect);
    await userEvent.click(diskOption);
    expect(imageLabel).toHaveValue(customLabel);
  });
});
