import { shallow } from 'enzyme';
import * as React from 'react';
import { UserDefinedFields as mockUserDefinedFields } from 'src/__data__/UserDefinedFields';
import {
  CombinedProps,
  FromStackScriptContent
} from './FromStackScriptContent';

const mockProps: CombinedProps = {
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
  imagesLoading: false,
  regionsData: [],
  regionsLoading: false,
  typesData: [],
  userCannotCreateLinode: false,
  userSSHKeys: [],
  request: jest.fn(),
  header: '',
  updateStackScript: jest.fn(),
  handleSelectUDFs: jest.fn()
};

xdescribe('FromImageContent', () => {
  const componentWithNotice = shallow(
    <FromStackScriptContent {...mockProps} />
  );

  const component = shallow(<FromStackScriptContent {...mockProps} />);

  it('should render a notice when passed a Notice prop', () => {
    expect(componentWithNotice.find('WithStyles(Notice)')).toHaveLength(1);
  });

  it('should not render a notice when no notice prop passed', () => {
    expect(component.find('WithStyles(Notice)')).toHaveLength(0);
  });

  it('should render SelectStackScript panel', () => {
    expect(
      component.find(
        'Connect(WithTheme(WithRenderGuard(WithStyles(SelectStackScriptPanel))))'
      )
    ).toHaveLength(1);
  });

  it('should render UserDefinedFields panel', () => {
    component.setState({ userDefinedFields: mockUserDefinedFields }); // give us some dummy fields
    expect(
      component.find(
        'WithStyles(WithTheme(WithRenderGuard(UserDefinedFieldsPanel)))'
      )
    ).toHaveLength(1);
  });

  it('should not render UserDefinedFields panel if no UDFs', () => {
    component.setState({ userDefinedFields: [] }); // give us some dummy fields
    expect(
      component.find(
        'WithStyles(WithTheme(WithRenderGuard(UserDefinedFieldsPanel)))'
      )
    ).toHaveLength(0);
  });

  it('should render SelectImage panel if no compatibleImages', () => {
    expect(
      component.find('WithTheme(WithRenderGuard(WithStyles(CreateFromImage)))')
    ).toHaveLength(0);
  });

  it('should render SelectImage panel if no compatibleImages', () => {
    component.setState({
      compatibleImages: [{ label: 'linode/centos7', is_public: true }]
    });
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
