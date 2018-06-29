import * as React from 'react';
import { shallow } from 'enzyme';
import { FromImageContent } from './FromImageContent';

const mockProps = {
  images: [],
  regions: [],
  types: [],
  getBackupsMonthlyPrice: jest.fn(),
  history: null,
  getTypeInfo: jest.fn(),
  getRegionName: jest.fn(),
};

describe('FromImageContent', () => {
  const componentWithNotice = shallow(
    <FromImageContent
      classes={{ root: '', main: '', sidebar: '' }}
      {...mockProps}
      notice={{
        text: 'hello world',
        level: 'warning' as 'warning' | 'error',
      }}
    />,
  );

  const component = shallow(
    <FromImageContent
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

  it('should render SelectImage panel', () => {
    expect(component.find('WithRenderGuard(WithStyles(CreateFromImage))')).toHaveLength(1);
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

  it('should render SelectPassword panel', () => {
    expect(component.find('WithStyles(WithRenderGuard(PasswordPanel))')).toHaveLength(1);
  });

  it('should render SelectAddOns panel', () => {
    expect(component.find('WithStyles(WithRenderGuard(AddonsPanel))')).toHaveLength(1);
  });
});
