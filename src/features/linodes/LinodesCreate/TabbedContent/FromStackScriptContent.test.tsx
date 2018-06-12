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
      classes={{ root: '', main: '', sidebar: '' }}
      {...mockProps}
      notice={{
        text: 'hello world',
        level: 'warning' as 'warning' | 'error',
      }}
    />,
  );

  const component = shallow(
    <FromStackScriptContent
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

  // it('should render SelectStackScript panel', () => {
  //   expect(component.find('WithStyles(SelectStackScriptPanel)')).toHaveLength(1);
  // });

  it('should render UserDefinedFields panel', () => {
    component.setState({ userDefinedFields: mockUserDefinedFields }); // give us some dummy fields
    expect(component.find('WithStyles(UserDefinedFieldsPanel)')).toHaveLength(1);
  });

  it('should render SelectImage panel', () => {
    expect(component.find('CreateFromImage')).toHaveLength(1);
  });

  it('should render SelectRegion panel', () => {
    expect(component.find('WithStyles(SelectRegionPanel)')).toHaveLength(1);
  });

  it('should render SelectPlan panel', () => {
    expect(component.find('WithStyles(SelectPlanPanel)')).toHaveLength(1);
  });

  it('should render SelectLabel panel', () => {
    expect(component.find('WithStyles(InfoPanel)')).toHaveLength(1);
  });

  it('should render SelectPassword panel', () => {
    expect(component.find('WithStyles(PasswordPanel)')).toHaveLength(1);
  });

  it('should render SelectAddOns panel', () => {
    expect(component.find('WithStyles(AddonsPanel)')).toHaveLength(1);
  });
});
