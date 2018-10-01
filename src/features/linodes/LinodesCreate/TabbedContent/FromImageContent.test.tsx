import { shallow } from 'enzyme';
import * as React from 'react';

import { FromImageContent } from './FromImageContent';

const mockProps = {
  images: [],
  regions: [],
  types: [],
  getBackupsMonthlyPrice: jest.fn(),
  history: null,
  getTypeInfo: jest.fn(),
  getRegionInfo: jest.fn(),
  userSSHKeys: [],
  tagObject: {
    accountTags: [],
    selectedTags: [],
    newTags: [],
    errors: [],
    actions: {
      addTag: jest.fn(),
      createTag: jest.fn(),
      getLinodeTagList: jest.fn(),
    }
  }
};

describe('FromImageContent', () => {
  const componentWithNotice = shallow(
    <FromImageContent
      handleDisablePasswordField={jest.fn()}
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
      handleDisablePasswordField={jest.fn()}
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
    expect(component.find('WithStyles(WithRenderGuard(AccessPanel))')).toHaveLength(1);
  });

  it('should render SelectAddOns panel', () => {
    expect(component.find('WithStyles(WithRenderGuard(AddonsPanel))')).toHaveLength(1);
  });
});
