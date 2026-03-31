import { imageSharegroupFactory } from '@linode/utilities';
import { userEvent } from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { ShareGroupsCreate } from './ShareGroupsCreate';

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

describe('ShareGroupsCreate', () => {
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

    const submitButton = getByText('Create Share Group').closest('button');
    expect(submitButton).toBeVisible();
    expect(submitButton).toBeEnabled();
  });

  it('should submit the form with valid data', async () => {
    const shareGroup = imageSharegroupFactory.build();

    mockMutateAsync.mockResolvedValue(shareGroup);

    const { getByRole, getByText } = renderWithTheme(<ShareGroupsCreate />);

    const labelField = getByRole('textbox', { name: /Label/i });
    const descriptionField = getByRole('textbox', { name: /Description/i });
    const submitButton = getByText('Create Share Group').closest('button');

    await userEvent.type(labelField, 'My Share Group');
    await userEvent.type(descriptionField, 'Test Description');
    await userEvent.click(submitButton!);

    expect(mockMutateAsync).toHaveBeenCalledWith({
      label: 'My Share Group',
      description: 'Test Description',
    });

    expect(mockNavigate).toHaveBeenCalledWith({
      search: expect.any(Function),
      to: '/images/share-groups',
    });
  });

  it('should submit the form with only label (description is optional)', async () => {
    const shareGroup = imageSharegroupFactory.build();

    mockMutateAsync.mockResolvedValue(shareGroup);

    const { getByRole, getByText } = renderWithTheme(<ShareGroupsCreate />);

    const labelField = getByRole('textbox', { name: /Label/i });
    const submitButton = getByText('Create Share Group').closest('button');

    await userEvent.type(labelField, 'My Share Group');
    await userEvent.click(submitButton!);

    expect(mockMutateAsync).toHaveBeenCalledWith({
      label: 'My Share Group',
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
    const submitButton = getByText('Create Share Group').closest('button');

    await userEvent.type(labelField, 'Duplicate Label');
    await userEvent.click(submitButton!);

    expect(getByText('Label must be unique')).toBeVisible();
  });
});
