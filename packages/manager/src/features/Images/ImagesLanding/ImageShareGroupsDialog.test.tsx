import { imageSharegroupFactory } from '@linode/utilities';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { ImageShareGroupsDialog } from './ImageShareGroupsDialog';

const queryMocks = vi.hoisted(() => ({
  useImageShareGroupsQuery: vi.fn(),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useImageShareGroupsQuery: queryMocks.useImageShareGroupsQuery,
  };
});

describe('ImageShareGroupsDialog', () => {
  const onClose = vi.fn();

  const props = {
    imageId: 'private/12345',
    onClose,
    open: true,
    title: 'Image Share Groups',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    queryMocks.useImageShareGroupsQuery.mockReturnValue({
      data: {
        data: imageSharegroupFactory.buildList(2),
      },
      error: undefined,
      isLoading: false,
    });
  });

  it('renders the share groups returned by the query', () => {
    const sharegroups = imageSharegroupFactory.buildList(2);

    queryMocks.useImageShareGroupsQuery.mockReturnValue({
      data: { data: sharegroups },
      error: undefined,
      isLoading: false,
    });

    const { getByText, getByRole } = renderWithTheme(
      <ImageShareGroupsDialog {...props} />
    );

    expect(queryMocks.useImageShareGroupsQuery).toHaveBeenCalledWith(
      'private/12345',
      {},
      {},
      true
    );
    expect(
      getByText('This Image is shared within the following share groups:')
    ).toBeVisible();

    for (const sharegroup of sharegroups) {
      expect(getByRole('link', { name: sharegroup.label })).toHaveAttribute(
        'href',
        `/images/share-groups/owned-groups/${sharegroup.id}`
      );
    }
  });

  it('shows the loading state while share groups are being fetched', () => {
    queryMocks.useImageShareGroupsQuery.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
    });

    const { getByTestId, queryByText } = renderWithTheme(
      <ImageShareGroupsDialog {...props} />
    );

    expect(getByTestId('circle-progress')).toBeVisible();
    expect(
      queryByText('This Image is shared within the following share groups:')
    ).not.toBeInTheDocument();
  });

  it('display error state when the query fails', () => {
    queryMocks.useImageShareGroupsQuery.mockReturnValue({
      data: undefined,
      error: [{ reason: 'Unable to load share groups.' }],
      isLoading: false,
    });

    const { getByText, queryByText } = renderWithTheme(
      <ImageShareGroupsDialog {...props} />
    );

    expect(getByText('Unable to load share groups.')).toBeVisible();
    expect(
      queryByText('This Image is shared within the following share groups:')
    ).not.toBeInTheDocument();
  });
});
