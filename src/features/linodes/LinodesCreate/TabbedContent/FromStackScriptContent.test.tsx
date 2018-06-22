import * as React from 'react';
import { shallow } from 'enzyme';
import { FromStackScriptContent } from './FromStackScriptContent';
import { UserDefinedFields as mockUserDefinedFields } from 'src/__data__/UserDefinedFields';

const mockProps = {
  images: [],
  regions: [],
  types: [],
  getBackupsMonthlyPrice: jest.fn(),
  getRegionName: jest.fn(),
  getTypeInfo: jest.fn(),
  history: null,
};

describe('FromImageContent', () => {
  const componentWithNotice = shallow(
    <FromStackScriptContent
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
    expect(component.find('WithStyles(WithRenderGuard(SelectStackScriptPanel))')).toHaveLength(1);
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
    expect(component.find('WithStyles(WithRenderGuard(PasswordPanel))')).toHaveLength(1);
  });

  it('should render SelectAddOns panel', () => {
    expect(component.find('WithStyles(WithRenderGuard(AddonsPanel))')).toHaveLength(1);
  });
});
