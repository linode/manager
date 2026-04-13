import { imageSharegroupFactory } from '@linode/utilities';
import { userEvent } from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { ShareGroupsCreate } from './ShareGroupsCreate';

import type { Image } from '@linode/api-v4';

const queryMocks = vi.hoisted(() => ({
  useCreateShareGroupMutation: vi.fn().mockReturnValue({}),
  useNavigate: vi.fn().mockReturnValue(vi.fn()),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useCreateShareGroupMutation: queryMocks.useCreateShareGroupMutation,
  };
});

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
  };
});

const mockImageOne = {
  id: 'private/1001',
  label: 'Ubuntu Base',
  description: 'Base image description',
} as Image;

const mockImageTwo = {
  id: 'private/1002',
  label: 'Debian Golden',
  description: 'Debian image description',
} as Image;

vi.mock('src/components/ImageSelect/ImageSelectTable', () => ({
  ImageSelectTable: ({ onSelect, selectedImageIds }: any) => (
    <div>
      <p>Mock ImageSelectTable</p>
      <button onClick={() => onSelect(mockImageOne)} type="button">
        Toggle Ubuntu Base
      </button>
      <button onClick={() => onSelect(mockImageTwo)} type="button">
        Toggle Debian Golden
      </button>
      <p>Selected IDs: {selectedImageIds.join(',')}</p>
    </div>
  ),
}));

describe('ShareGroupsCreate', () => {
  const shareGroupLabel = 'My Share Group';
  const shareGroupDescription = 'Test Description';

  let mockNavigate: ReturnType<typeof vi.fn>;
  let mockMutateAsync: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockNavigate = vi.fn();
    mockMutateAsync = vi.fn();

    queryMocks.useNavigate.mockReturnValue(mockNavigate);
    queryMocks.useCreateShareGroupMutation.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isLoading: false,
      error: null,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the form with all fields, titles, and buttons in their default state', () => {
    const { getByRole, getByText } = renderWithTheme(<ShareGroupsCreate />);

    expect(getByText('Share group details')).toBeVisible();
    expect(getByText('Images')).toBeVisible();
    expect(getByText('Selected images (0)')).toBeVisible();

    expect(
      getByText(
        'Add a name and description for your share group. These details are visible to all group members.'
      )
    ).toBeVisible();

    const labelField = getByRole('textbox', { name: /Label/i });
    expect(labelField).toBeVisible();
    expect(labelField).toHaveValue('');

    const descriptionField = getByRole('textbox', { name: /Description/i });
    expect(descriptionField).toBeVisible();
    expect(descriptionField).toHaveValue('');

    const submitButton = getByRole('button', { name: /Create Share Group/i });
    expect(submitButton).toBeVisible();
    expect(submitButton).toBeEnabled();
  });

  it('should submit the form with valid data', async () => {
    const shareGroup = imageSharegroupFactory.build();

    mockMutateAsync.mockResolvedValue(shareGroup);

    const { getByRole } = renderWithTheme(<ShareGroupsCreate />);

    const labelField = getByRole('textbox', { name: /Label/i });
    const descriptionField = getByRole('textbox', { name: /Description/i });
    const submitButton = getByRole('button', { name: /Create Share Group/i });

    await userEvent.type(labelField, shareGroupLabel);
    await userEvent.type(descriptionField, shareGroupDescription);
    await userEvent.click(submitButton);

    expect(mockMutateAsync).toHaveBeenCalledWith({
      label: shareGroupLabel,
      description: shareGroupDescription,
    });

    expect(mockNavigate).toHaveBeenCalledWith({
      search: expect.any(Function),
      to: '/images/share-groups',
    });
  });

  it('should render the image selection table and default selected images state', () => {
    const { getByText } = renderWithTheme(<ShareGroupsCreate />);

    expect(getByText('Images')).toBeVisible();
    expect(getByText('Mock ImageSelectTable')).toBeVisible();
    expect(getByText(/Selected IDs:/i)).toBeVisible();
    expect(getByText('Selected images (0)')).toBeVisible();
  });

  it('should add and remove images from the selected images list', async () => {
    const { getByRole, getByText, queryByText } = renderWithTheme(
      <ShareGroupsCreate />
    );

    const toggleUbuntuButton = getByRole('button', { name: /Toggle Ubuntu Base/i });

    await userEvent.click(toggleUbuntuButton);

    expect(getByText('Selected images (1)')).toBeVisible();
    expect(getByText('1. Original image:')).toBeVisible();
    expect(getByText('Ubuntu Base')).toBeVisible();
    expect(getByText(/Use original label and description/i)).toBeVisible();
    expect(getByText('Selected IDs: private/1001')).toBeVisible();

    await userEvent.click(toggleUbuntuButton);

    expect(getByText('Selected images (0)')).toBeVisible();
    expect(queryByText('Ubuntu Base')).not.toBeInTheDocument();
    expect(getByText(/Selected IDs:/i)).toBeVisible();
  });

  it('should allow editing selected image label/description and submit overridden image payload', async () => {
    const shareGroup = imageSharegroupFactory.build();

    mockMutateAsync.mockResolvedValue(shareGroup);

    const { getByRole, getAllByRole, getByText } = renderWithTheme(
      <ShareGroupsCreate />
    );

    await userEvent.type(getByRole('textbox', { name: /Label/i }), shareGroupLabel);
    await userEvent.click(getByRole('button', { name: /Toggle Ubuntu Base/i }));

    expect(getByText('Selected images (1)')).toBeVisible();

    await userEvent.click(
      getByRole('checkbox', { name: /Use original label and description/i })
    );

    const textboxes = getAllByRole('textbox');

    await userEvent.type(textboxes[2], 'Shared Ubuntu Label');
    await userEvent.type(textboxes[3], 'Shared Ubuntu Description');

    await userEvent.click(getByRole('button', { name: /Create Share Group/i }));

    expect(mockMutateAsync).toHaveBeenCalledWith({
      images: [
        {
          id: 'private/1001',
          label: 'Shared Ubuntu Label',
          description: 'Shared Ubuntu Description',
        },
      ],
      label: shareGroupLabel,
    });

    expect(mockNavigate).toHaveBeenCalledWith({
      search: expect.any(Function),
      to: '/images/share-groups',
    });

    await userEvent.click(
      getByRole('checkbox', { name: /Use original label and description/i })
    );

    expect(getAllByRole('textbox', { name: /Label/i })).toHaveLength(1);
  });

  it('should submit the form with only label (description is optional)', async () => {
    const shareGroup = imageSharegroupFactory.build();

    mockMutateAsync.mockResolvedValue(shareGroup);

    const { getByRole } = renderWithTheme(<ShareGroupsCreate />);

    const labelField = getByRole('textbox', { name: /Label/i });
    const submitButton = getByRole('button', { name: /Create Share Group/i });

    await userEvent.type(labelField, shareGroupLabel);
    await userEvent.click(submitButton);

    expect(mockMutateAsync).toHaveBeenCalledWith({
      label: shareGroupLabel,
    });
  });

  it('should display field-specific errors from API', async () => {
    const apiError = [
      {
        field: 'label',
        reason: 'Label must be unique',
      },
    ];

    mockMutateAsync.mockRejectedValue(apiError);

    const { getByRole, getByText } = renderWithTheme(<ShareGroupsCreate />);

    const labelField = getByRole('textbox', { name: /Label/i });
    const submitButton = getByRole('button', { name: /Create Share Group/i });

    await userEvent.type(labelField, 'Duplicate Label');
    await userEvent.click(submitButton);

    expect(getByText('Label must be unique')).toBeVisible();
  });
});
