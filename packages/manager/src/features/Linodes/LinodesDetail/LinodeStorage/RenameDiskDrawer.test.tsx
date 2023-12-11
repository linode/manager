import React from 'react';

import { linodeDiskFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { RenameDiskDrawer } from './RenameDiskDrawer';

describe('RenameDiskDrawer', () => {
  it('should render', () => {
    const disk = linodeDiskFactory.build({
      label: 'My Alpine Disk',
    });

    const { getByDisplayValue, getByText } = renderWithTheme(
      <RenameDiskDrawer
        disk={disk}
        linodeId={1}
        onClose={vi.fn()}
        open={true}
      />
    );

    expect(getByText('Rename Disk')).toBeVisible();
    expect(getByDisplayValue('My Alpine Disk')).toBeVisible();
  });
});
