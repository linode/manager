import { shallow } from 'enzyme';
import * as React from 'react';

import { LinodesWithBackups } from 'src/__data__/LinodesWithBackups';

import { FromBackupsContent } from './FromBackupsContent';

const mockProps = {
  linodes: [],
  types: [],
  extendLinodes: jest.fn(),
  getBackupsMonthlyPrice: jest.fn(),
  getTypeInfo: jest.fn(),
  getRegionInfo: jest.fn(),
  history: null,
};

const mockPropsWithNotice = {
  notice: {
    text: 'example text',
    level: 'warning' as 'warning' | 'error',
  },
  linodes: [],
  types: [],
  extendLinodes: jest.fn(),
  getBackupsMonthlyPrice: jest.fn(),
  getTypeInfo: jest.fn(),
  getRegionInfo: jest.fn(),
  history: null,
};

describe('FromBackupsContent', () => {
  const component = shallow(
    <FromBackupsContent
      classes={{ root: '', main: '', sidebar: '' }}
      {...mockProps}
    />,
  );

  const componentWithNotice = shallow(
    <FromBackupsContent
      classes={{ root: '', main: '', sidebar: '' }}
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
      expect(component.find('WithStyles(WithRenderGuard(SelectLinodePanel))')).toHaveLength(1);
    });

    it('should render SelectBackup panel', () => {
      expect(component.find('WithStyles(WithRenderGuard(SelectBackupPanel))')).toHaveLength(1);
    });

    it('should render SelectPlan panel', () => {
      expect(component.find('WithStyles(WithRenderGuard(SelectPlanPanel))')).toHaveLength(1);
    });

    it('should render SelectLabel panel', () => {
      expect(component.find('WithStyles(WithRenderGuard(InfoPanel))')).toHaveLength(1);
    });

    it('should render SelectAddOns panel', () => {
      expect(component.find('WithStyles(WithRenderGuard(AddonsPanel))')).toHaveLength(1);
    });
  });
});
