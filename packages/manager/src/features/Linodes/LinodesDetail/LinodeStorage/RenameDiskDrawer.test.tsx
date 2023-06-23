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
        open={true}
        onClose={jest.fn()}
        linodeId={1}
        disk={disk}
      />
    );

    expect(getByText('Rename Disk')).toBeVisible();
    expect(getByDisplayValue('My Alpine Disk')).toBeVisible();
  });
});
