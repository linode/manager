import * as React from 'react';
import { shallow } from 'enzyme';
import { FromBackupsContent } from './FromBackupsContent';
import { LinodesWithBackups } from 'src/__data__/LinodesWithBackups';

const mockProps = {
  updateFormState: jest.fn(),
  selectedLinodeID: 1,
  selectedBackupID: 1,
  selectedDiskSize: 100,
  selectedTypeID: '100',
  linodes: [],
  types: [],
  label: 'test',
  backups: true,
  privateIP: true,
  extendLinodes: jest.fn(),
  getBackupsMonthlyPrice: jest.fn(),
};

const mockPropsWithNotice = {
  notice: {
    text: 'example text',
    level: 'warning' as 'warning' | 'error',
  },
  updateFormState: jest.fn(),
  selectedLinodeID: 1,
  selectedBackupID: 1,
  selectedDiskSize: 100,
  selectedTypeID: '100',
  linodes: [],
  types: [],
  label: 'test',
  backups: true,
  privateIP: true,
  extendLinodes: jest.fn(),
  getBackupsMonthlyPrice: jest.fn(),
};

describe('FromBackupsContent', () => {
  const component = shallow(
    <FromBackupsContent
      classes={{ root: '' }}
      {...mockProps}
    />,
  );

  const componentWithNotice = shallow(
    <FromBackupsContent
      classes={{ root: '' }}
      {...mockPropsWithNotice}
    />,
  );

  component.setState({ isGettingBackups: false }); // get rid of loading state
  componentWithNotice.setState({ isGettingBackups: false }); // get rid of loading state

  it('should render Placeholder if no valid backups exist', () => {
    expect(component.find('WithStyles(Placeholder)')).toHaveLength(1);
  });

  describe('FromBackupsContent When Valid Backups Exist', () => {

    it('should render a notice when passed a Notice prop', () => {
      // give our components a Linode with a valid backup
      componentWithNotice.setState({ linodesWithBackups: LinodesWithBackups });
      component.setState({ linodesWithBackups: LinodesWithBackups });
      expect(componentWithNotice.find('WithStyles(Notice)')).toHaveLength(1);
    });

    it('should not render a notice when no notice prop passed', () => {
      expect(component.find('WithStyles(Notice)')).toHaveLength(0);
    });

    it('should render SelectLinode panel', () => {
      expect(component.find('WithStyles(SelectLinodePanel)')).toHaveLength(1);
    });

    it('should render SelectBackup panel', () => {
      expect(component.find('WithStyles(SelectBackupPanel)')).toHaveLength(1);
    });

    it('should render SelectPlan panel', () => {
      expect(component.find('WithStyles(SelectPlanPanel)')).toHaveLength(1);
    });

    it('should render SelectLabel panel', () => {
      expect(component.find('WithStyles(InfoPanel)')).toHaveLength(1);
    });

    it('should render SelectAddOns panel', () => {
      expect(component.find('WithStyles(AddonsPanel)')).toHaveLength(1);
    });
  });
});
