import * as React from 'react';
import { shallow } from 'enzyme';
import { FromImageContent } from './FromImageContent';

const mockProps = {
  updateFormState: jest.fn(),
  selectedImageID: '1',
  selectedRegionID: '1',
  selectedTypeID: '1',
  images: [],
  regions: [],
  types: [],
  backups: true,
  privateIP: true,
  getBackupsMonthlyPrice: jest.fn(),
  label: 'my label',
  password: 'helllo432.324',
};

describe('FromImageContent', () => {
  const componentWithNotice = shallow(
    <FromImageContent
      classes={{ root: '' }}
      {...mockProps}
      notice={{
        text: 'hello world',
        level: 'warning' as 'warning' | 'error',
      }}
    />,
  );

  const component = shallow(
    <FromImageContent
      classes={{ root: '' }}
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
