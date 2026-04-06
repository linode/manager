import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CaptureSnapshotConfirmationDialog } from './CaptureSnapshotConfirmationDialog';

const props = {
  error: undefined,
  loading: false,
  onClose: vi.fn(),
  onExited: vi.fn(),
  onSnapshot: vi.fn(),
  open: true,
};

describe('CaptureSnapshotConfirmationDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the dialog', () => {
    const { getByTestId, getByText } = renderWithTheme(
      <CaptureSnapshotConfirmationDialog {...props} />
    );

    const takeSnapshotButton = getByTestId('confirm');
    const cancelButton = getByText('Cancel');
    const title = getByText('Take a snapshot?');
    const body = getByText(
      'Taking a snapshot will back up your Linode in its current state, overriding your previous snapshot. Are you sure?'
    );

    expect(takeSnapshotButton).toBeVisible();
    expect(cancelButton).toBeVisible();
    expect(title).toBeVisible();
    expect(body).toBeVisible();
  });

  it('should send a request to create a snapshot if loading is false', () => {
    const { getByTestId } = renderWithTheme(
      <CaptureSnapshotConfirmationDialog {...props} />
    );

    const takeSnapshotButton = getByTestId('confirm');
    expect(takeSnapshotButton).toBeVisible();
    fireEvent.click(takeSnapshotButton);
    expect(props.onSnapshot).toHaveBeenCalled();
  });

  it('should not send a request to create a snapshot if loading is true', () => {
    const { getByTestId } = renderWithTheme(
      <CaptureSnapshotConfirmationDialog {...props} loading={true} />
    );

    const takeSnapshotButton = getByTestId('confirm');
    expect(takeSnapshotButton).toBeVisible();
    fireEvent.click(takeSnapshotButton);
    expect(props.onSnapshot).not.toHaveBeenCalled();
  });

  it('should close the dialog when the "Cancel" button is clicked', () => {
    const { getByText } = renderWithTheme(
      <CaptureSnapshotConfirmationDialog {...props} />
    );

    const cancelButton = getByText('Cancel');
    expect(cancelButton).toBeVisible();
    fireEvent.click(cancelButton);
    expect(props.onClose).toHaveBeenCalled();
  });

  it('should render the dialog with an error message', () => {
    const { getByText } = renderWithTheme(
      <CaptureSnapshotConfirmationDialog
        {...props}
        error={'mock error message'}
      />
    );

    const errorMessage = getByText('mock error message');
    expect(errorMessage).toBeVisible();
  });
});
