import * as React from 'react';
import { shallow } from 'enzyme';
import { FromLinodeContent } from './FromLinodeContent';

const mockProps = {
  regions: [],
  types: [],
  getBackupsMonthlyPrice: jest.fn(),
  extendLinodes: jest.fn(),
  linodes: [],
  getRegionName: jest.fn(),
  getTypeInfo: jest.fn(),
  history: null,
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
    />,
  );

  it('should render a notice when passed a Notice prop', () => {
    expect(componentWithNotice.find('WithStyles(Notice)')).toHaveLength(1);
  });

  it('should not render a notice when no notice prop passed', () => {
    expect(component.find('WithStyles(Notice)')).toHaveLength(0);
  });

  it('should render SelectLinode panel', () => {
    expect(component.find('WithStyles(WithRenderGuard(SelectLinodePanel))')).toHaveLength(1);
  });

  it('should render SelectRegion panel', () => {
    expect(component.find('WithStyles(WithRenderGuard(SelectRegionPanel))')).toHaveLength(1);
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
