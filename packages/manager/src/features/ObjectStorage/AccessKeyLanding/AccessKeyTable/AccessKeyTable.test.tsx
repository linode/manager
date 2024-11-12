import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AccessKeyTable } from './AccessKeyTable';

import type { AccessKeyTableProps } from './AccessKeyTable';

describe('ObjectStorageKeyTable', () => {
  const props: AccessKeyTableProps = {
    data: [],
    error: undefined,
    isLoading: false,
    isRestrictedUser: false,
    openDrawer: vi.fn(),
    openRevokeDialog: vi.fn(),
  };

  it('it includes a header with "Label" and "Access Key" cells', () => {
    const { getByText } = renderWithTheme(<AccessKeyTable {...props} />);
    getByText('Label');
    getByText('Access Key');
  });

  it('returns a loading state when loading', () => {
    const { getByTestId } = renderWithTheme(
      <AccessKeyTable {...props} isLoading={true} />
    );
    getByTestId('table-row-loading');
  });

  it('returns an error state when there is an error', () => {
    const { getByText } = renderWithTheme(
      <AccessKeyTable {...props} error={[{ reason: 'oops' }]} />
    );
    getByText('We were unable to load your Access Keys.');
  });

  it('returns an empty state if there are no access keys', () => {
    const { getByText } = renderWithTheme(
      <AccessKeyTable {...props} data={[]} />
    );
    getByText('No items to display.');
  });
});
