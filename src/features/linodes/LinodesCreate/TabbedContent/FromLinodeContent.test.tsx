import { shallow } from 'enzyme';
import * as React from 'react';

import { linodes } from 'src/__data__/linodes';

import { FromLinodeContent } from './FromLinodeContent';

const mockProps = {
  regions: [],
  types: [],
  getBackupsMonthlyPrice: jest.fn(),
  extendLinodes: jest.fn(),
  linodes,
  getRegionInfo: jest.fn(),
  getTypeInfo: jest.fn(),
  history: null,
  accountBackups: false,
  enqueueSnackbar: jest.fn(),
  onPresentSnackbar: jest.fn(),
  upsertLinode: jest.fn(),
  updateCustomLabel: jest.fn(),
  getLabel: jest.fn(),
  customLabel: ''
};

describe('FromImageContent', () => {
  const componentWithNotice = shallow(
    <FromLinodeContent
      classes={{ root: '', main: '', sidebar: '' }}
      {...mockProps}
      notice={{
        text: 'hello world',
        level: 'warning' as 'warning' | 'error',
      }}
    />,
  );

  const component = shallow(
    <FromLinodeContent
      classes={{ root: '', main: '', sidebar: '' }}
      {...mockProps}
      linodes={[]}
    />,
  );

  const componentWithLinodes = shallow(
    <FromLinodeContent
      classes={{ root: '', main: '', sidebar: '' }}
      {...mockProps}
    />,
  );

  it('should render a notice when passed a Notice prop', () => {
    expect(componentWithNotice.find('WithStyles(Notice)')).toHaveLength(1);
  });

  it('should render a Placeholder when linodes prop has no length', () => {
    expect(component.find('WithStyles(Placeholder)')).toHaveLength(1);
  });

  it('should not render a notice when no notice prop passed', () => {
    expect(componentWithLinodes.find('WithStyles(Notice)')).toHaveLength(0);
  });

  it('should render SelectLinode panel', () => {
    expect(componentWithLinodes
      .find('WithStyles(WithTheme(WithRenderGuard(SelectLinodePanel)))')).toHaveLength(1);
    });

    it('should render SelectRegion panel', () => {
    expect(componentWithLinodes.
      find('WithStyles(WithTheme(WithRenderGuard(SelectRegionPanel)))')).toHaveLength(1);
  });

  it('should render SelectPlan panel', () => {
    expect(componentWithLinodes
      .find('WithStyles(WithTheme(WithRenderGuard(SelectPlanPanel)))')).toHaveLength(1);
  });

  it('should render SelectLabel panel', () => {
    expect(componentWithLinodes
      .find('WithStyles(WithTheme(WithRenderGuard(InfoPanel)))')).toHaveLength(1);
  });

  it('should render SelectAddOns panel', () => {
    expect(componentWithLinodes
      .find('WithStyles(withRouter(WithTheme(WithRenderGuard(AddonsPanel))))')).toHaveLength(1);
  });
});
