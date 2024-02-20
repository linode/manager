import * as React from 'react';
import { linodeFactory } from 'src/factories';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CombinedProps, FromBackupsContent } from './FromBackupsContent';

const mockProps: CombinedProps = {
  accountBackupsEnabled: false,
  imagesData: {},
  linodesData: [],
  regionsData: [],
  setBackupID: vi.fn(),
  typesData: [],
  updateDiskSize: vi.fn(),
  updateImageID: vi.fn(),
  updateLinodeID: vi.fn(),
  updateRegionID: vi.fn(),
  updateTypeID: vi.fn(),
  userCannotCreateLinode: false,
};

describe('FromBackupsContent', () => {
  it('should render Placeholder if no valid backups exist', () => {
    const { getByText } = renderWithTheme(
      <FromBackupsContent {...mockProps} />
    );
    expect(
      getByText(
        'You do not have backups enabled for your Linodes. Please visit the Backups panel in the Linode Details view.'
      )
    ).toBeVisible();
  });

  it('should render a linode select if a user has linodes with backups', () => {
    const linodes = linodeFactory.buildList(1, {
      backups: { enabled: true },
      label: 'this-linode-should-show-up',
    });

    const { getByText } = renderWithTheme(
      <FromBackupsContent {...mockProps} linodesData={linodes} />
    );

    expect(getByText('this-linode-should-show-up')).toBeVisible();
  });
});
