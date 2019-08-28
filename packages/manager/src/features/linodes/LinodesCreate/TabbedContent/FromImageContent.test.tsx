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
  requestKeys: jest.fn(),
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

  it.skip('should render SelectImage panel', () => {
    expect(component.find('[data-qa-select-image-panel]')).toHaveLength(1);
  });

  it('should render SelectRegion panel', () => {
    expect(component.find('[data-qa-select-region-panel]')).toHaveLength(1);
  });

  it('should render SelectPlan panel', () => {
    expect(component.find('[data-qa-select-plan-panel]')).toHaveLength(1);
  });

  it('should render SelectLabelAndTags panel', () => {
    expect(component.find('[data-qa-label-and-tags-panel]')).toHaveLength(1);
  });

  it('should render AccessPanel panel', () => {
    expect(component.find('[data-qa-access-panel]')).toHaveLength(1);
  });

  it('should render SelectAddOns panel', () => {
    expect(component.find('[data-qa-addons-panel]')).toHaveLength(1);
  });
});
