import { screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React from 'react';

import { imageFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AddImages } from './AddImages';

const mockImages = [
  imageFactory.build({
    created_by: 'test-user',
    description: 'Ubuntu description',
    id: 'private/1001',
    is_public: false,
    label: 'Ubuntu Base',
    status: 'available',
  }),
  imageFactory.build({
    created_by: 'test-user',
    description: 'Debian description',
    id: 'private/1002',
    is_public: false,
    label: 'Debian Golden',
    status: 'available',
  }),
  imageFactory.build({
    created_by: null,
    description: 'Public image',
    id: 'linode/123',
    is_public: true,
    label: 'Public Image',
    status: 'available',
  }),
] as const;

const queryMocks = vi.hoisted(() => ({
  useAllImagesQuery: vi.fn(),
  useAllTagsQuery: vi.fn(),
  useNavigate: vi.fn().mockReturnValue(vi.fn()),
  useProfile: vi.fn(),
  useRegionsQuery: vi.fn(),
  useParams: vi.fn().mockReturnValue({ shareGroupId: '123' }),
  useShareGroupQuery: vi.fn().mockReturnValue({
    data: { label: 'My Share Group' },
    error: null,
    isLoading: false,
  }),
  useShareGroupsAddImagesMutation: vi.fn().mockReturnValue({
    mutateAsync: vi.fn(),
  }),
}));

const snackbarMocks = vi.hoisted(() => ({
  enqueueSnackbar: vi.fn(),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAllImagesQuery: queryMocks.useAllImagesQuery,
    useAllTagsQuery: queryMocks.useAllTagsQuery,
    useProfile: queryMocks.useProfile,
    useRegionsQuery: queryMocks.useRegionsQuery,
    useShareGroupQuery: queryMocks.useShareGroupQuery,
    useShareGroupsAddImagesMutation: queryMocks.useShareGroupsAddImagesMutation,
  };
});

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
    useParams: queryMocks.useParams,
  };
});

vi.mock('notistack', async () => {
  const actual = await vi.importActual('notistack');
  return {
    ...actual,
    enqueueSnackbar: snackbarMocks.enqueueSnackbar,
  };
});

vi.mock('src/components/ImageSelect/ImageSelectTableRow', () => ({
  ImageSelectTableRow: ({ image, onSelect }: any) => (
    <button onClick={onSelect} type="button">
      Toggle {image.label}
    </button>
  ),
}));

describe('AddImages', () => {
  const user = userEvent.setup();

  let mockNavigate: ReturnType<typeof vi.fn>;
  let mockMutateAsync: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockNavigate = vi.fn();
    mockMutateAsync = vi.fn().mockResolvedValue({});

    queryMocks.useNavigate.mockReturnValue(mockNavigate);
    queryMocks.useShareGroupsAddImagesMutation.mockReturnValue({
      mutateAsync: mockMutateAsync,
    });
    queryMocks.useShareGroupQuery.mockReturnValue({
      data: { label: 'My Share Group' },
      error: null,
      isLoading: false,
    });
    queryMocks.useAllImagesQuery.mockReturnValue({
      data: mockImages,
      error: null,
      isFetching: false,
      isLoading: false,
    });
    queryMocks.useAllTagsQuery.mockReturnValue({ data: [] });
    queryMocks.useRegionsQuery.mockReturnValue({
      data: [
        { id: 'us-east', label: 'US East' },
        { id: 'us-west', label: 'US West' },
      ],
    });
    queryMocks.useProfile.mockReturnValue({
      data: {
        timezone: 'UTC',
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('edits selected image label and description, then submits add-images payload', async () => {
    renderWithTheme(<AddImages />);

    expect(screen.queryByText('Public Image')).not.toBeInTheDocument();

    await user.click(
      await screen.findByRole('button', { name: /Toggle Ubuntu Base/i })
    );
    await user.click(
      screen.getByRole('checkbox', {
        name: /Use original label and description/i,
      })
    );

    const labelInput = within(
      screen.getByTestId('selected-image-0-label')
    ).getByRole('textbox');
    const descriptionInput = within(
      screen.getByTestId('selected-image-0-description')
    ).getByRole('textbox');

    await user.clear(labelInput);
    await user.clear(descriptionInput);
    await user.type(labelInput, 'Shared Ubuntu Label');
    await user.type(descriptionInput, 'Shared Ubuntu Description');

    await user.click(screen.getByRole('button', { name: /Add Images/i }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        data: {
          images: [
            {
              description: 'Shared Ubuntu Description',
              id: 'private/1001',
              label: 'Shared Ubuntu Label',
            },
          ],
        },
        sharegroupId: 123,
      });
    });

    expect(snackbarMocks.enqueueSnackbar).toHaveBeenCalledWith(
      'Image added successfully.',
      {
        variant: 'success',
      }
    );
    expect(mockNavigate).toHaveBeenCalledWith({
      params: { shareGroupId: '123' },
      search: expect.any(Function),
      to: '/images/share-groups/owned-groups/$shareGroupId',
    });
  });

  it('deselects a selected image and submits only the remaining image', async () => {
    renderWithTheme(<AddImages />);

    await user.click(
      await screen.findByRole('button', { name: /Toggle Ubuntu Base/i })
    );
    await user.click(
      await screen.findByRole('button', { name: /Toggle Debian Golden/i })
    );

    expect(screen.getByText('Selected images (2)')).toBeVisible();

    await user.click(
      await screen.findByRole('button', { name: /Toggle Debian Golden/i })
    );

    expect(screen.getByText('Selected images (1)')).toBeVisible();
    expect(screen.queryByText('2. Original image:')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Add Images/i }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        data: {
          images: [
            {
              description: 'Ubuntu description',
              id: 'private/1001',
              label: 'Ubuntu Base',
            },
          ],
        },
        sharegroupId: 123,
      });
    });
  });
});
