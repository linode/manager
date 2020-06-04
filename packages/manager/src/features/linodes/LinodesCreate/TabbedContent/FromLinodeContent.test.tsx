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
  requestKeys: jest.fn(),
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
  imagesData: {},
  linodesData: linodes,
  regionsData: [],
  typesData: [],
  userSSHKeys: [],
  userCannotCreateLinode: false
};

describe('FromImageContent', () => {
  const component = shallow(<FromLinodeContent {...mockProps} />);

  const componentWithoutLinodes = shallow(
    <FromLinodeContent {...mockProps} linodesData={[]} />
  );

  it('should render a Placeholder when linodes prop has no length', () => {
    expect(componentWithoutLinodes.find('[data-qa-placeholder]')).toHaveLength(
      1
    );
  });

  it('should render SelectLinode panel', () => {
    expect(component.find('[data-qa-linode-panel]')).toHaveLength(1);
  });

  it('should render SelectRegion panel', () => {
    expect(component.find('[data-qa-region-panel]')).toHaveLength(1);
  });

  it('should render SelectPlan panel', () => {
    expect(component.find('[data-qa-select-plan-panel]')).toHaveLength(1);
  });

  it('should render SelectLabel panel', () => {
    expect(component.find('[data-qa-label-panel]')).toHaveLength(1);
  });

  it('should render SelectAddOns panel', () => {
    expect(component.find('[data-qa-addons-panel]')).toHaveLength(1);
  });
});
