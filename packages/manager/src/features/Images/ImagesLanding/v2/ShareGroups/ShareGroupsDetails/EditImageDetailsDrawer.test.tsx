import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { EditImageDetailsDrawer } from './EditImageDetailsDrawer';

import type { Image } from '@linode/api-v4';

const mockEditShareGroupImage = vi.fn().mockResolvedValue({});

const queryMocks = vi.hoisted(() => ({
  useUpdateShareGroupImageMutation: vi.fn(() => ({
    error: null,
    mutateAsync: mockEditShareGroupImage,
  })),
}));

const snackbarMocks = vi.hoisted(() => ({
  enqueueSnackbar: vi.fn(),
}));

vi.mock('@linode/queries', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as Record<string, unknown>),
    useUpdateShareGroupImageMutation:
      queryMocks.useUpdateShareGroupImageMutation,
  };
});

vi.mock('notistack', async () => {
  const actual = await vi.importActual('notistack');
  return {
    ...actual,
    enqueueSnackbar: snackbarMocks.enqueueSnackbar,
  };
});

describe('EditImageDetailsDrawer', () => {
  const SAVE_TEXT = 'Save';

  const mockImage: Image = {
    capabilities: ['cloud-init'],
    created: '2024-01-01T00:00:00',
    created_by: 'test-user',
    deprecated: false,
    description: 'Initial description',
    eol: null,
    expiry: null,
    id: 'private/123',
    is_public: false,
    label: 'Initial shared image label',
    regions: [
      {
        region: 'us-east',
        status: 'available',
      },
    ],
    size: 2500,
    status: 'available',
    tags: [],
    total_size: 2500,
    type: 'manual',
    updated: '2024-01-01T00:00:00',
    vendor: null,
  };

  const props = {
    image: mockImage,
    onClose: vi.fn(),
    open: true,
    shareGroupId: '1',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    queryMocks.useUpdateShareGroupImageMutation.mockReturnValue({
      error: null,
      mutateAsync: mockEditShareGroupImage,
    });
    mockEditShareGroupImage.mockResolvedValue({});
  });

  it('should render drawer content with original values and action buttons', () => {
    renderWithTheme(<EditImageDetailsDrawer {...props} />);

    expect(screen.getByText('Edit Shared Image Details')).toBeVisible();

    const sharedImageLabelInput = screen.getByRole('textbox', {
      name: /Shared image label/i,
    });
    expect(sharedImageLabelInput).toBeVisible();
    expect(sharedImageLabelInput).toHaveValue(mockImage.label);

    const descriptionInput = screen.getByRole('textbox', {
      name: /Description/i,
    });
    expect(descriptionInput).toBeVisible();
    expect(descriptionInput).toHaveValue(mockImage.description);

    expect(screen.getByRole('button', { name: SAVE_TEXT })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  it('should disable Save until the form becomes dirty', async () => {
    renderWithTheme(<EditImageDetailsDrawer {...props} />);

    const saveButton = screen.getByRole('button', { name: SAVE_TEXT });
    expect(saveButton).toBeDisabled();

    await userEvent.type(
      screen.getByRole('textbox', { name: /Description/i }),
      'Updated description'
    );

    expect(saveButton).toBeEnabled();
  });

  it('should submit updated values, show a success toast, and close the drawer', async () => {
    const onClose = vi.fn();

    renderWithTheme(<EditImageDetailsDrawer {...props} onClose={onClose} />);

    const sharedImageLabelInput = screen.getByRole('textbox', {
      name: /Shared image label/i,
    });
    const descriptionInput = screen.getByRole('textbox', {
      name: /Description/i,
    });

    await userEvent.clear(sharedImageLabelInput);
    await userEvent.clear(descriptionInput);

    await userEvent.type(sharedImageLabelInput, 'Updated shared image label');
    await userEvent.type(descriptionInput, 'Updated description');

    await userEvent.click(screen.getByRole('button', { name: SAVE_TEXT }));

    await waitFor(() => {
      expect(mockEditShareGroupImage).toHaveBeenCalledWith({
        imageId: 'private/123',
        sharegroupId: '1',
        data: {
          description: 'Updated description',
          label: 'Updated shared image label',
        },
      });
    });

    expect(snackbarMocks.enqueueSnackbar).toHaveBeenCalledWith(
      'Shared image details updated successfully',
      { variant: 'success' }
    );
    expect(onClose).toHaveBeenCalled();
  });

  it('should reset the form and call onClose when Cancel is clicked', async () => {
    const onClose = vi.fn();

    renderWithTheme(<EditImageDetailsDrawer {...props} onClose={onClose} />);

    await userEvent.type(
      screen.getByRole('textbox', { name: /Shared image label/i }),
      'Temporary label'
    );

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onClose).toHaveBeenCalled();
  });

  it('should show a field error when the API returns a label error', async () => {
    mockEditShareGroupImage.mockRejectedValueOnce([
      { field: 'label', reason: 'Label is invalid' },
    ]);

    renderWithTheme(<EditImageDetailsDrawer {...props} />);

    await userEvent.type(
      screen.getByRole('textbox', { name: /Shared image label/i }),
      'Bad label'
    );

    await userEvent.click(screen.getByRole('button', { name: SAVE_TEXT }));

    expect(await screen.findByText('Label is invalid')).toBeVisible();
  });
});
