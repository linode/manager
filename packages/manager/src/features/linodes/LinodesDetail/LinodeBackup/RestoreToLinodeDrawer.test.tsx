import { vi } from 'vitest';
import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { CombinedProps, RestoreToLinodeDrawer } from './RestoreToLinodeDrawer';

describe('RestoreToLinodeDrawer', () => {
  const props: CombinedProps = {
    open: true,
    linodeID: 1234,
    linodeRegion: 'us-east',
    backupCreated: '12 hours ago',
    onClose: vi.fn(),
    onSubmit: vi.fn(),
    linodesData: [],
    linodesLastUpdated: 0,
    linodesLoading: false,
    getLinodes: vi.fn(),
    linodesResults: 0,
  };

  it('renders without crashing', async () => {
    const { findByText } = renderWithTheme(
      <RestoreToLinodeDrawer {...props} />
    );

    await findByText(/Restore Backup from/);
  });
});
