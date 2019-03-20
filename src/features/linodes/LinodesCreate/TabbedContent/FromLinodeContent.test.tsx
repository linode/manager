import { shallow } from 'enzyme';
import * as React from 'react';

import { linodes } from 'src/__data__/linodes';

import { CombinedProps, FromLinodeContent } from './FromLinodeContent';

const mockProps: CombinedProps = {
  typeDisplayInfo: undefined,
  classes: {
    root: '',
    main: '',
    sidebar: ''
  },
  updateDiskSize: jest.fn(),
  updateImageID: jest.fn(),
  updateLabel: jest.fn(),
  updateLinodeID: jest.fn(),
  updatePassword: jest.fn(),
  updateRegionID: jest.fn(),
  updateTags: jest.fn(),
  updateTypeID: jest.fn(),
  formIsSubmitting: false,
  label: '',
  password: '',
  backupsEnabled: false,
  accountBackupsEnabled: false,
  toggleBackupsEnabled: jest.fn(),
  togglePrivateIPEnabled: jest.fn(),
  handleSubmitForm: jest.fn(),
  privateIPEnabled: false,
  resetCreationState: jest.fn(),
  resetSSHKeys: jest.fn(),
  imagesData: [],
  linodesData: linodes,
  regionsData: [],
  typesData: [],
  userSSHKeys: [],
  userCannotCreateLinode: false
};

xdescribe('FromImageContent', () => {
  const componentWithNotice = shallow(<FromLinodeContent {...mockProps} />);

  const component = shallow(<FromLinodeContent {...mockProps} />);

  const componentWithLinodes = shallow(<FromLinodeContent {...mockProps} />);

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
    expect(
      componentWithLinodes.find(
        'WithStyles(WithTheme(WithRenderGuard(SelectLinodePanel)))'
      )
    ).toHaveLength(1);
  });

  it('should render SelectRegion panel', () => {
    expect(
      componentWithLinodes.find(
        'WithStyles(WithTheme(WithRenderGuard(SelectRegionPanel)))'
      )
    ).toHaveLength(1);
  });

  it('should render SelectPlan panel', () => {
    expect(
      componentWithLinodes.find(
        'WithStyles(WithTheme(WithRenderGuard(SelectPlanPanel)))'
      )
    ).toHaveLength(1);
  });

  it('should render SelectLabel panel', () => {
    expect(
      componentWithLinodes.find(
        'WithStyles(WithTheme(WithRenderGuard(InfoPanel)))'
      )
    ).toHaveLength(1);
  });

  it('should render SelectAddOns panel', () => {
    expect(
      componentWithLinodes.find(
        'WithStyles(withRouter(WithTheme(WithRenderGuard(AddonsPanel))))'
      )
    ).toHaveLength(1);
  });
});
