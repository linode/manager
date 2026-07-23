import { fireEvent, screen, waitFor } from '@testing-library/react';
import * as React from 'react';
import { act } from 'react';

import { objectStorageBucketFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { BucketDeletionDialogWithRef } from './BucketDeletionDialog';

const mocks = vi.hoisted(() => ({
  useObjectStorageBuckets: vi.fn(),
  useDeleteBucketMutation: vi.fn(),
  sendDeleteBucketEvent: vi.fn(),
  sendDeleteBucketFailedEvent: vi.fn(),
}));

vi.mock('../hooks/useObjectStorageBuckets', () => ({
  useObjectStorageBuckets: mocks.useObjectStorageBuckets,
}));

vi.mock('src/queries/object-storage/queries', () => ({
  useDeleteBucketMutation: mocks.useDeleteBucketMutation,
}));

vi.mock('src/utilities/analytics/customEventAnalytics', () => ({
  sendDeleteBucketEvent: mocks.sendDeleteBucketEvent,
  sendDeleteBucketFailedEvent: mocks.sendDeleteBucketFailedEvent,
}));

// Simplify the dialog so we can test the imperative API and onClick behavior.
vi.mock('src/components/TypeToConfirmDialog/TypeToConfirmDialog', () => ({
  TypeToConfirmDialog: (props: {
    children: React.ReactNode;
    errors?: unknown;
    loading: boolean;
    onClick: () => void;
    onClose: () => void;
    open: boolean;
    title: string;
  }) => {
    if (!props.open) {
      return null;
    }

    return (
      <div>
        <h1>{props.title}</h1>
        {props.errors ? <div data-testid="errors" /> : null}
        <button disabled={props.loading} onClick={props.onClick}>
          delete
        </button>
        <button onClick={props.onClose}>close</button>
        {props.children}
      </div>
    );
  },
}));

describe('BucketDeletionDialogWithRef', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.useObjectStorageBuckets.mockReturnValue({
      data: [
        objectStorageBucketFactory.build(),
        objectStorageBucketFactory.build(),
      ],
      failedRegionIds: [],
      isLoading: false,
    });

    mocks.useDeleteBucketMutation.mockReturnValue({
      mutate: vi.fn().mockImplementation((vars: any, options: any = {}) => {
        options.onSuccess?.({});
      }),
      reset: vi.fn(),
      status: 'idle',
      error: undefined,
    });
  });

  it('opens via ref and calls delete mutation + analytics on delete', async () => {
    const ref = React.createRef<{ open: (b: any) => void }>();
    renderWithTheme(<BucketDeletionDialogWithRef ref={ref as any} />);
    const bucket = objectStorageBucketFactory.build({
      label: 'my-bucket',
      region: 'us-east',
    });
    await act(async () => {
      ref.current!.open(bucket);
    });
    expect(screen.getByText('Delete Bucket my-bucket')).toBeVisible();
    fireEvent.click(screen.getByText('delete'));

    const { mutate } = mocks.useDeleteBucketMutation.mock.results[0].value;

    await waitFor(() => {
      // ensure the mutation was called with the expected variables
      expect(mutate).toHaveBeenCalled();
      expect(mutate.mock.calls[0][0]).toEqual({
        bucketName: 'my-bucket',
        regionId: 'us-east',
      });
      expect(mocks.sendDeleteBucketEvent).toHaveBeenCalledWith('us-east');
    });
  });

  it('shows CancelNotice when attempting to delete the last bucket', () => {
    mocks.useObjectStorageBuckets.mockReturnValue({
      data: [objectStorageBucketFactory.build()],
      failedRegionIds: [],
      isLoading: false,
    });
    const ref = React.createRef<{ open: (b: any) => void }>();
    renderWithTheme(<BucketDeletionDialogWithRef ref={ref as any} />);
    const bucket = objectStorageBucketFactory.build({
      label: 'last-bucket',
      region: 'us-east',
    });
    act(() => {
      ref.current!.open(bucket);
    });

    // Assert the CancelNotice text is present in the document, ignoring HTML formatting.
    const fullText = document.body.textContent || '';
    expect(fullText).toMatch(
      /Please note: you will still be billed for Object Storage unless you cancel it in your Account Settings\./i
    );
  });

  it('calls failed analytics and shows error when delete fails', async () => {
    // Make the mutate implementation call onError to simulate a failing mutation.
    mocks.useDeleteBucketMutation.mockReturnValue({
      mutate: vi.fn().mockImplementation((vars: any, options: any = {}) => {
        options.onError?.([{ reason: 'Nope' }]);
      }),
      reset: vi.fn(),
      status: 'idle',
      error: [{ reason: 'Nope' }],
    });

    const ref = React.createRef<{ open: (b: any) => void }>();
    renderWithTheme(<BucketDeletionDialogWithRef ref={ref as any} />);
    const bucket = objectStorageBucketFactory.build({
      label: 'bad-bucket',
      region: 'us-east',
    });
    await act(async () => {
      ref.current!.open(bucket);
    });
    fireEvent.click(screen.getByText('delete'));
    await waitFor(() => {
      expect(mocks.sendDeleteBucketFailedEvent).toHaveBeenCalledWith('us-east');
      expect(screen.getByTestId('errors')).toBeInTheDocument();
    });
  });
});
