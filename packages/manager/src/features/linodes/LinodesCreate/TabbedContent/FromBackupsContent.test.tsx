import { shallow } from 'enzyme';
import * as React from 'react';
import { LinodesWithBackups } from 'src/__data__/LinodesWithBackups';

import { CombinedProps, FromBackupsContent } from './FromBackupsContent';

const mockProps: CombinedProps = {
  classes: {
    main: '',
  },
  updateDiskSize: jest.fn(),
  updateImageID: jest.fn(),
  updateLinodeID: jest.fn(),
  updateRegionID: jest.fn(),
  updateTypeID: jest.fn(),
  accountBackupsEnabled: false,
  imagesData: {},
  regionsData: [],
  typesData: [],
  userCannotCreateLinode: false,
  linodesData: [],
  setBackupID: jest.fn(),
};

describe('FromBackupsContent', () => {
  const component = shallow(<FromBackupsContent {...mockProps} />);

  component.setState({ isGettingBackups: false }); // get rid of loading state

  it('should render Placeholder if no valid backups exist', () => {
    expect(component.find('WithStyles(Placeholder)')).toHaveLength(1);
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
