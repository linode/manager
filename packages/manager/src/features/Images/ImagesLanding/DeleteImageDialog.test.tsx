import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { DeleteImageDialog } from './DeleteImageDialog';

const queryMocks = vi.hoisted(() => ({
  userPermissions: vi.fn(() => ({
    data: {
      delete_image: true,
    },
  })),
}));
vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

describe('Image Delete Dialog', () => {
  const props = {
    imageId: '1',
    onClose: vi.fn(),
    open: true,
  };

  it('renders a Image delete dialog correctly', async () => {
    const { findByText } = renderWithTheme(<DeleteImageDialog {...props} />);
    const cancelButton = await findByText('Cancel');
    expect(cancelButton).toBeVisible();

    const deleteButton = await findByText('Delete');
    expect(deleteButton).toBeVisible();
  });

  it('disables the Image Label input when user does not have permission', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        delete_image: false,
      },
    });
    const { findByLabelText } = renderWithTheme(
      <DeleteImageDialog {...props} />
    );
    const imageLabelInput = await findByLabelText('Image Label');
    expect(imageLabelInput).toBeDisabled();
  });

  it('enables the Image Label input when user has permission', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        delete_image: true,
      },
    });
    const { findByLabelText } = renderWithTheme(
      <DeleteImageDialog {...props} />
    );
    const imageLabelInput = await findByLabelText('Image Label');
    expect(imageLabelInput).not.toBeDisabled();
  });
});
