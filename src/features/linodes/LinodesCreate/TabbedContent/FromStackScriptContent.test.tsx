import { shallow } from 'enzyme';
import * as React from 'react';

import { UserDefinedFields as mockUserDefinedFields } from 'src/__data__/UserDefinedFields';

import { FromStackScriptContent } from './FromStackScriptContent';

const mockProps = {
  images: [],
  regions: [],
  types: [],
  getBackupsMonthlyPrice: jest.fn(),
  getRegionInfo: jest.fn(),
  getTypeInfo: jest.fn(),
  history: null,
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
    <FromStackScriptContent
      handleDisablePasswordField={jest.fn()}
      classes={{
        root: '',
        main: '',
        sidebar: '',
        emptyImagePanel: '',
        emptyImagePanelText: '',
      }}
      {...mockProps}
      notice={{
        text: 'hello world',
        level: 'warning' as 'warning' | 'error',
      }}
    />,
  );

  const component = shallow(
    <FromStackScriptContent
      handleDisablePasswordField={jest.fn()}
      classes={{
        root: '',
        main: '',
        sidebar: '',
        emptyImagePanel: '',
        emptyImagePanelText: '',
      }}
      {...mockProps}
    />,
  );

  it('should render a notice when passed a Notice prop', () => {
    expect(componentWithNotice.find('WithStyles(Notice)')).toHaveLength(1);
  });

  it('should not render a notice when no notice prop passed', () => {
    expect(component.find('WithStyles(Notice)')).toHaveLength(0);
  });

  it('should render SelectStackScript panel', () => {
    expect(component.find('Connect(WithRenderGuard(WithStyles(SelectStackScriptPanel)))')).toHaveLength(1);
  });

  it('should render UserDefinedFields panel', () => {
    component.setState({ userDefinedFields: mockUserDefinedFields }); // give us some dummy fields
    expect(component.find('WithStyles(WithRenderGuard(UserDefinedFieldsPanel))')).toHaveLength(1);
  });

  it('should not render UserDefinedFields panel if no UDFs', () => {
    component.setState({ userDefinedFields: [] }); // give us some dummy fields
    expect(component.find('WithStyles(WithRenderGuard(UserDefinedFieldsPanel))')).toHaveLength(0);
  });

  it('should render SelectImage panel if no compatibleImages', () => {
    expect(component.find('WithRenderGuard(WithStyles(CreateFromImage))')).toHaveLength(0);
  });

  it('should render SelectImage panel if no compatibleImages', () => {
    component.setState({ compatibleImages: [{label: 'linode/centos7', is_public: true}] });
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
