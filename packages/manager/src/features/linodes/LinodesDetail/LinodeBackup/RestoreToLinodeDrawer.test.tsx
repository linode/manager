import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { CombinedProps, RestoreToLinodeDrawer } from './RestoreToLinodeDrawer';

describe('RestoreToLinodeDrawer', () => {
  const props: CombinedProps = {
    open: true,
    linodeID: 1234,
    linodeRegion: 'us-east',
    backupCreated: '12 hours ago',
    onClose: jest.fn(),
    onSubmit: jest.fn(),
    linodesData: [],
    linodesLastUpdated: 0,
    linodesLoading: false,
    getLinodes: jest.fn(),
    linodesResults: 0,
  };

  it('renders without crashing', async () => {
    const { findByText } = renderWithTheme(
      <RestoreToLinodeDrawer {...props} />
    );

    await findByText(/Restore Backup from/);
  });
});
