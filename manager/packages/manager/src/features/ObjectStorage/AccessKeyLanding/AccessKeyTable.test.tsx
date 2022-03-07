import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { pageyProps } from 'src/__data__/pageyProps';
import { AccessKeyTable, CombinedProps } from './AccessKeyTable';

describe('ObjectStorageKeyTable', () => {
  const props: CombinedProps = {
    openDrawer: jest.fn(),
    openRevokeDialog: jest.fn(),
    isRestrictedUser: false,
    ...pageyProps,
  };

  it('it includes a header with "Label" and "Access Key" cells', () => {
    const { getByText } = renderWithTheme(<AccessKeyTable {...props} />);
    getByText('Label');
    getByText('Access Key');
  });

  it('returns a loading state when loading', () => {
    const { getByTestId } = renderWithTheme(
      <AccessKeyTable {...props} loading={true} />
    );
    getByTestId('table-row-loading');
  });

  it('returns an error state when there is an error', () => {
    const { getByText } = renderWithTheme(
      <AccessKeyTable {...props} error={[{ reason: 'oops' }]} />
    );
    getByText('We were unable to load your Access Keys.');
  });

  it('returns an empty state if there is no data', () => {
    const { getByText } = renderWithTheme(
      <AccessKeyTable {...props} data={undefined} />
    );
    getByText('No items to display.');
  });
});
