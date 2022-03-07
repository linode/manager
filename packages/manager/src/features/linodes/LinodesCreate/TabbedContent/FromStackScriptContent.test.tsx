import { shallow } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import { imageFactory } from 'src/factories/images';
import LinodeThemeWrapper from 'src/LinodeThemeWrapper';
import store from 'src/store';
import { UserDefinedFields as mockUserDefinedFields } from 'src/__data__/UserDefinedFields';
import {
  CombinedProps,
  FromStackScriptContent,
} from './FromStackScriptContent';

const mockImages = imageFactory.buildList(10);

const mockProps: CombinedProps = {
  category: 'community',
  classes: {
    main: '',
    emptyImagePanel: '',
    emptyImagePanelText: '',
  },
  accountBackupsEnabled: false,
  updateImageID: jest.fn(),
  updateRegionID: jest.fn(),
  updateTypeID: jest.fn(),
  imagesData: {},
  regionsData: [],
  typesData: [],
  userCannotCreateLinode: false,
  request: jest.fn(),
  header: '',
  updateStackScript: jest.fn(),
  handleSelectUDFs: jest.fn(),
};

describe('FromImageContent', () => {
  const component = shallow(
    <Provider store={store}>
      <LinodeThemeWrapper theme="dark">
        <FromStackScriptContent {...mockProps} />
      </LinodeThemeWrapper>
    </Provider>
  );

  const componentWithUDFs = shallow(
    <Provider store={store}>
      <LinodeThemeWrapper theme="dark">
        <FromStackScriptContent
          {...mockProps}
          availableUserDefinedFields={mockUserDefinedFields}
          availableStackScriptImages={mockImages}
        />
      </LinodeThemeWrapper>
    </Provider>
  );

  it('should render without crashing', () => {
    expect(component).toHaveLength(1);
  });

  it.skip('should render SelectStackScript panel', () => {
    expect(component.find('[data-qa-select-stackscript]')).toHaveLength(1);
  });

  it.skip('should render UserDefinedFields panel', () => {
    expect(componentWithUDFs.find('[data-qa-udf-panel]')).toHaveLength(1);
  });

  it.skip('should not render UserDefinedFields panel if no UDFs', () => {
    expect(component.find('[data-qa-udf-panel]')).toHaveLength(0);
  });

  it.skip('should not render SelectImage panel if no compatibleImages', () => {
    expect(component.find('[data-qa-select-image-panel]')).toHaveLength(0);
  });

  it.skip('should render SelectImage panel there are compatibleImages', () => {
    expect(componentWithUDFs.find('[data-qa-select-image-panel]')).toHaveLength(
      1
    );
  });
});
