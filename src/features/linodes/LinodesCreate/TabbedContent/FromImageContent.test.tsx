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
  accountBackups: false,
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
  },
  enqueueSnackbar: jest.fn(),
  onPresentSnackbar: jest.fn(),
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

  const componentWithImages = shallow(
    <FromImageContent
      handleDisablePasswordField={jest.fn()}
      classes={{ root: '', main: '', sidebar: '' }}
      {...mockProps}
      images={[{
        id: 'linode/ubuntu18.10',
        label: '',
        description: null,
        created: '',
        type: '',
        is_public: true,
        size: 1,
        created_by: null,
        vendor: null,
        deprecated: false }
      ]}
    />,
  );

  it('should default to Ubuntu 18.10 as the selected image', () => {
    expect(componentWithImages.state().selectedImageID).toBe('linode/ubuntu18.10');
  });

  it('should set selectedImageID to null when initial state (from history or default) is not in images', () => {
    expect(component.state().selectedImageID).toBe(null);
  });

  it('should render a notice when passed a Notice prop', () => {
    expect(componentWithNotice.find('WithStyles(Notice)')).toHaveLength(1);
  });

  it('should not render a notice when no notice prop passed', () => {
    expect(component.find('WithStyles(Notice)')).toHaveLength(0);
  });

  it('should render SelectImage panel', () => {
    expect(component.find('WithStyles(WithTheme(WithRenderGuard(CreateFromImage)))')).toHaveLength(1);
  });

  it('should render SelectRegion panel', () => {
    expect(component.find('WithStyles(WithTheme(WithRenderGuard(SelectRegionPanel)))')).toHaveLength(1);
  });

  it('should render SelectPlan panel', () => {
    expect(component.find('WithStyles(WithTheme(WithRenderGuard(SelectPlanPanel)))')).toHaveLength(1);
  });

  it('should render SelectLabel panel', () => {
    expect(component.find('WithStyles(WithTheme(WithRenderGuard(InfoPanel)))')).toHaveLength(1);
  });

  it('should render SelectPassword panel', () => {
    expect(component.find('WithStyles(WithTheme(WithRenderGuard(AccessPanel)))')).toHaveLength(1);
  });

  it('should render SelectAddOns panel', () => {
    expect(component.find('WithStyles(withRouter(WithTheme(WithRenderGuard(AddonsPanel))))')).toHaveLength(1);
  });
});
