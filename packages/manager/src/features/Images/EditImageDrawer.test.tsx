import { fireEvent } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { EditImageDrawer } from './EditImageDrawer';

const props = {
  changeDescription: vi.fn(),
  changeDisk: vi.fn(),
  changeLabel: vi.fn(),
  changeLinode: vi.fn(),
  changeTags: vi.fn(),
  description: 'Example description',
  imageID: '0',
  label: 'Test Image',
  onClose: vi.fn(),
  open: true,
  selectedLinode: null,
  tags: [],
};

describe('EditImageDrawer', () => {
  it('should render', async () => {
    const { getByText } = renderWithTheme(<EditImageDrawer {...props} />);

    // Verify title renders
    getByText('Edit Image');
  });

  it('should allow editing image details', async () => {
    const { getByLabelText, getByText } = renderWithTheme(
      <EditImageDrawer {...props} />
    );

    fireEvent.change(getByLabelText('Label'), {
      target: { value: 'test-image-label' },
    });

    fireEvent.change(getByLabelText('Description'), {
      target: { value: 'test description' },
    });

    fireEvent.change(getByLabelText('Tags'), {
      target: { value: 'new-tag' },
    });
    fireEvent.click(getByText('Create "new-tag"'));

    fireEvent.click(getByText('Save Changes'));

    expect(props.changeLabel).toBeCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ value: 'test-image-label' }),
      })
    );

    expect(props.changeDescription).toBeCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ value: 'test description' }),
      })
    );

    expect(props.changeTags).toBeCalledWith(['new-tag']);
  });
});
