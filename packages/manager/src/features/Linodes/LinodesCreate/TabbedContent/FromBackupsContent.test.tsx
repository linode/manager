import { shallow } from 'enzyme';
import * as React from 'react';

import { LinodesWithBackups } from 'src/__data__/LinodesWithBackups';

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
  const component = shallow(<FromBackupsContent {...mockProps} />);

  component.setState({ isGettingBackups: false }); // get rid of loading state

  it('should render Placeholder if no valid backups exist', () => {
    expect(component.find('Placeholder')).toHaveLength(1);
  });

  // @todo: Rewrite these tests with react-testing-library.
  describe.skip('FromBackupsContent When Valid Backups Exist', () => {
    beforeAll(async () => {
      component.setState({ linodesWithBackups: LinodesWithBackups });
      await component.update();
    });

    it('should render SelectLinode panel', () => {
      expect(
        component.find(
          'WithTheme(WithRenderGuard(WithStyles(SelectLinodePanel)))'
        )
      ).toHaveLength(1);
    });

    it('should render SelectBackup panel', () => {
      expect(
        component.find(
          'WithTheme(WithRenderGuard(WithStyles(SelectBackupPanel)))'
        )
      ).toHaveLength(1);
    });
  });
});
