import { shallow } from 'enzyme';
import * as React from 'react';
import { CombinedProps, FromImageContent } from './FromImageContent';

const mockProps: CombinedProps = {
  typeDisplayInfo: undefined,
  classes: {
    root: '',
    main: '',
    sidebarPrivate: '',
    sidebarPublic: ''
  },
  updateImageID: jest.fn(),
  updateLabel: jest.fn(),
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
  regionsData: [],
  typesData: [],
  userCannotCreateLinode: false,
  userSSHKeys: []
};

xdescribe('FromImageContent', () => {
  const componentWithNotice = shallow(<FromImageContent {...mockProps} />);

  const component = shallow<FromImageContent>(
    <FromImageContent {...mockProps} />
  );

  const componentWithImages = shallow<FromImageContent>(
    <FromImageContent {...mockProps} />
  );

  it('should default to Debian 9 as the selected image', () => {
    expect(componentWithImages.prop('selectedImageID')).toBe('linode/debian9');
  });

  it('should set selectedImageID to null when initial state (from history or default) is not in images', () => {
    expect(component.prop('selectedImageID')).toBe(null);
  });

  it('should render a notice when passed a Notice prop', () => {
    expect(componentWithNotice.find('WithStyles(Notice)')).toHaveLength(1);
  });

  it('should not render a notice when no notice prop passed', () => {
    expect(component.find('WithStyles(Notice)')).toHaveLength(0);
  });

  it('should render SelectImage panel', () => {
    expect(
      component.find('WithStyles(WithTheme(WithRenderGuard(CreateFromImage)))')
    ).toHaveLength(1);
  });

  it('should render SelectRegion panel', () => {
    expect(
      component.find(
        'WithStyles(WithTheme(WithRenderGuard(SelectRegionPanel)))'
      )
    ).toHaveLength(1);
  });

  it('should render SelectPlan panel', () => {
    expect(
      component.find('WithStyles(WithTheme(WithRenderGuard(SelectPlanPanel)))')
    ).toHaveLength(1);
  });

  it('should render SelectLabel panel', () => {
    expect(
      component.find('WithStyles(WithTheme(WithRenderGuard(InfoPanel)))')
    ).toHaveLength(1);
  });

  it('should render SelectPassword panel', () => {
    expect(
      component.find('WithStyles(WithTheme(WithRenderGuard(AccessPanel)))')
    ).toHaveLength(1);
  });

  it('should render SelectAddOns panel', () => {
    expect(
      component.find(
        'WithStyles(withRouter(WithTheme(WithRenderGuard(AddonsPanel))))'
      )
    ).toHaveLength(1);
  });
});
