import { shallow } from 'enzyme';
import * as React from 'react';
import { LinodesWithBackups } from 'src/__data__/LinodesWithBackups';

import { CombinedProps, FromBackupsContent } from './FromBackupsContent';

const mockProps: CombinedProps = {
  typeDisplayInfo: undefined,
  classes: {
    root: '',
    main: '',
    sidebar: ''
  },
  updateDiskSize: jest.fn(),
  updateImageID: jest.fn(),
  updateLabel: jest.fn(),
  updateLinodeID: jest.fn(),
  updatePassword: jest.fn(),
  updateRegionID: jest.fn(),
  updateTags: jest.fn(),
  updateTypeID: jest.fn(),
  requestKeys: jest.fn(),
  formIsSubmitting: false,
  label: '',
  password: '',
  backupsEnabled: false,
  accountBackupsEnabled: false,
  toggleBackupsEnabled: jest.fn(),
  togglePrivateIPEnabled: jest.fn(),
  handleSubmitForm: jest.fn(),
  privateIPEnabled: false,
  resetCreationState: jest.fn(),
  resetSSHKeys: jest.fn(),
  imagesData: {},
  regionsData: [],
  typesData: [],
  userCannotCreateLinode: false,
  linodesData: [],
  setBackupID: jest.fn(),
  userSSHKeys: []
};

describe('FromBackupsContent', () => {
  const component = shallow(<FromBackupsContent {...mockProps} />);

  component.setState({ isGettingBackups: false }); // get rid of loading state

  it('should render Placeholder if no valid backups exist', () => {
    expect(component.find('WithStyles(Placeholder)')).toHaveLength(1);
  });

  describe('FromBackupsContent When Valid Backups Exist', () => {
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

    it('should render SelectPlan panel', () => {
      expect(
        component.find(
          'WithTheme(WithRenderGuard(WithStyles(SelectPlanPanel)))'
        )
      ).toHaveLength(1);
    });

    it('should render SelectLabel panel', () => {
      expect(
        component.find('WithTheme(WithRenderGuard(WithStyles(InfoPanel)))')
      ).toHaveLength(1);
    });

    it('should render SelectAddOns panel', () => {
      expect(
        component.find('WithTheme(WithRenderGuard(WithStyles(AddonsPanel)))')
      ).toHaveLength(1);
    });
  });
});
