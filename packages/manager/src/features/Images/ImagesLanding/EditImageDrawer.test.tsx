import { fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { imageFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { EditImageDrawer } from './EditImageDrawer';

const props = {
  image: imageFactory.build(),
  imageError: null,
  isFetching: false,
  onClose: vi.fn(),
  open: true,
};

const mockUpdateImage = vi.fn();
vi.mock('@linode/api-v4', async () => {
  return {
    ...(await vi.importActual<any>('@linode/api-v4')),
    updateImage: (imageId: any, data: any) => {
      mockUpdateImage(imageId, data);
      return Promise.resolve(props.image);
    },
  };
});

describe('EditImageDrawer', () => {
  it('should render', async () => {
    const { getByText } = renderWithTheme(<EditImageDrawer {...props} />);

    // Verify title renders
    getByText('Edit Image');
  });

  it('should allow editing image details', async () => {
    const { getByLabelText, getByRole, getByText } = renderWithTheme(
      <EditImageDrawer {...props} />
    );

    fireEvent.change(getByLabelText('Label'), {
      target: { value: 'test-image-label' },
    });

    fireEvent.change(getByLabelText('Description'), {
      target: { value: 'test description' },
    });

    const tagsInput = getByRole('combobox');

    await userEvent.type(tagsInput, 'new-tag');

    expect(tagsInput).toHaveValue('new-tag');

    fireEvent.click(getByText('Create "new-tag"'));

    fireEvent.click(getByText('Save Changes'));

    await waitFor(() => {
      expect(mockUpdateImage).toHaveBeenCalledWith('private/1', {
        description: 'test description',
        label: 'test-image-label',
        tags: ['new-tag'],
      });
    });
  });
});
