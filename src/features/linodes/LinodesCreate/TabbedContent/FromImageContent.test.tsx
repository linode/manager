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

describe('FromImageContent', () => {
  const component = shallow<FromImageContent>(
    <FromImageContent {...mockProps} />
  );

  it('should render SelectImage panel', () => {
    expect(
      component.find('WithTheme(WithRenderGuard(CreateFromImage))')
    ).toHaveLength(1);
  });

  it('should render SelectRegion panel', () => {
    expect(
      component.find(
        'WithTheme(WithRenderGuard(WithStyles(SelectRegionPanel)))'
      )
    ).toHaveLength(1);
  });

  it('should render SelectPlan panel', () => {
    expect(
      component.find('WithTheme(WithRenderGuard(WithStyles(SelectPlanPanel)))')
    ).toHaveLength(1);
  });

  it('should render SelectLabel panel', () => {
    expect(
      component.find('WithTheme(WithRenderGuard(WithStyles(InfoPanel)))')
    ).toHaveLength(1);
  });

  it('should render SelectPassword panel', () => {
    expect(
      component.find('WithTheme(WithRenderGuard(WithStyles(AccessPanel)))')
    ).toHaveLength(1);
  });

  it('should render SelectAddOns panel', () => {
    expect(
      component.find('WithTheme(WithRenderGuard(WithStyles(AddonsPanel)))')
    ).toHaveLength(1);
  });
});
