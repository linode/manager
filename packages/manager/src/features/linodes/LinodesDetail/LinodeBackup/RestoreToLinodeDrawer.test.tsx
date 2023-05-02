import * as React from 'react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { RestoreToLinodeDrawer } from './RestoreToLinodeDrawer';

describe('RestoreToLinodeDrawer', () => {
  it('renders without crashing', async () => {
    const { getByText } = renderWithTheme(
      <RestoreToLinodeDrawer
        open={true}
        linodeId={1}
        backup={undefined}
        onClose={jest.fn()}
      />
    );

    getByText(/Restore Backup from/);
  });
});
