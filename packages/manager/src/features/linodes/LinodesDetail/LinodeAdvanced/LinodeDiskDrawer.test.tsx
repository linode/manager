import { fireEvent, render, waitFor } from '@testing-library/react';
import * as React from 'react';
import { linodeDiskFactory } from 'src/factories/disk';
import { wrapWithTheme } from 'src/utilities/testHelpers';

import LinodeDiskDrawer, { Props } from './LinodeDiskDrawer';

const disk = linodeDiskFactory.build();

afterEach(() => {
  jest.clearAllMocks();
});

const props: Props = {
  disk,
  mode: 'create' as any,
  maximumSize: 100,
  open: true,
  onClose: jest.fn(),
  onSubmit: jest.fn().mockResolvedValue({})
};

const EMPTY_DISK_RADIO_LABEL = new RegExp('create empty disk', 'i');
const DISK_FROM_IMAGE_RADIO_LABEL = new RegExp('create from image', 'i');

describe('Component', () => {
  it('should render a title based on the mode', () => {
    const { getByText, rerender } = render(
      wrapWithTheme(<LinodeDiskDrawer {...props} />)
    );
    // Create mode
    getByText('Add Disk');
    // Rename
    rerender(wrapWithTheme(<LinodeDiskDrawer {...props} mode={'rename'} />));
    getByText('Rename Disk');
    // Resize
    rerender(wrapWithTheme(<LinodeDiskDrawer {...props} mode={'resize'} />));
    getByText('Resize Disk');
  });
  it('should display the mode toggle when creating', () => {
    const { getByText } = render(
      wrapWithTheme(<LinodeDiskDrawer {...props} />)
    );
    getByText(EMPTY_DISK_RADIO_LABEL);
    getByText(DISK_FROM_IMAGE_RADIO_LABEL);
  });
  it('should not display the mode toggle when resizing', () => {
    const { queryByText } = render(
      wrapWithTheme(<LinodeDiskDrawer {...props} mode="resize" />)
    );
    expect(queryByText(EMPTY_DISK_RADIO_LABEL)).toBeNull();
  });
  it('should not display the mode toggle when renaming', () => {
    const { queryByText } = render(
      wrapWithTheme(<LinodeDiskDrawer {...props} mode="rename" />)
    );
    expect(queryByText(EMPTY_DISK_RADIO_LABEL)).toBeNull();
  });
  it('should call the submit handler when Submit is clicked', async () => {
    const { getByTestId } = render(
      wrapWithTheme(<LinodeDiskDrawer {...props} mode="rename" />)
    );
    fireEvent.click(getByTestId('submit-disk-form'));
    await waitFor(() => expect(props.onSubmit).toHaveBeenCalledTimes(1));
  });
  it('should call the cancel handler when Cancel is clicked', async () => {
    const { getByText } = render(
      wrapWithTheme(<LinodeDiskDrawer {...props} mode="resize" />)
    );
    fireEvent.click(getByText(/cancel/i));
    await waitFor(() => expect(props.onClose).toHaveBeenCalledTimes(1));
  });
});
