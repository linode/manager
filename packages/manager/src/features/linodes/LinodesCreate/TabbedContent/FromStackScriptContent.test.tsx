import { shallow } from 'enzyme';
import * as React from 'react';
import { images as mockImages } from 'src/__data__/images';
import { UserDefinedFields as mockUserDefinedFields } from 'src/__data__/UserDefinedFields';
import {
  CombinedProps,
  FromStackScriptContent
} from './FromStackScriptContent';

const mockProps: CombinedProps = {
  category: 'community',
  typeDisplayInfo: undefined,
  classes: {
    main: '',
    sidebar: '',
    emptyImagePanel: '',
    emptyImagePanelText: ''
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
  imagesData: {},
  regionsData: [],
  typesData: [],
  userCannotCreateLinode: false,
  userSSHKeys: [],
  request: jest.fn(),
  header: '',
  updateStackScript: jest.fn(),
  handleSelectUDFs: jest.fn()
};

describe('FromImageContent', () => {
  const component = shallow(<FromStackScriptContent {...mockProps} />);

  const componentWithUDFs = shallow(
    <FromStackScriptContent
      {...mockProps}
      availableUserDefinedFields={mockUserDefinedFields}
      availableStackScriptImages={mockImages}
    />
  );

  it('should render SelectStackScript panel', () => {
    expect(component.find('[data-qa-select-stackscript]')).toHaveLength(1);
  });

  it('should render UserDefinedFields panel', () => {
    expect(componentWithUDFs.find('[data-qa-udf-panel]')).toHaveLength(1);
  });

  it('should not render UserDefinedFields panel if no UDFs', () => {
    expect(component.find('[data-qa-udf-panel]')).toHaveLength(0);
  });

  it('should not render SelectImage panel if no compatibleImages', () => {
    expect(component.find('[data-qa-select-image-panel]')).toHaveLength(0);
  });

  it('should render SelectImage panel there are compatibleImages', () => {
    expect(componentWithUDFs.find('[data-qa-select-image-panel]')).toHaveLength(
      1
    );
  });

  it('should render SelectRegion panel', () => {
    expect(component.find('[data-qa-select-region-panel]')).toHaveLength(1);
  });

  it('should render SelectPlan panel', () => {
    expect(component.find('[data-qa-select-plan]')).toHaveLength(1);
  });

  it('should render SelectLabel panel', () => {
    expect(component.find('[data-qa-label-panel]')).toHaveLength(1);
  });

  it('should render SelectPassword panel', () => {
    expect(component.find('[data-qa-access-panel]')).toHaveLength(1);
  });

  it('should render SelectAddOns panel', () => {
    expect(component.find('[data-qa-addons-panel]')).toHaveLength(1);
  });
});
