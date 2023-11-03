import { shallow } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';

import { UserDefinedFields as mockUserDefinedFields } from 'src/__data__/UserDefinedFields';
import { LinodeThemeWrapper } from 'src/LinodeThemeWrapper';
import { imageFactory } from 'src/factories/images';
import { queryClientFactory } from 'src/queries/base';
import { storeFactory } from 'src/store';

import {
  CombinedProps,
  FromStackScriptContent,
} from './FromStackScriptContent';

const store = storeFactory(queryClientFactory());

const mockImages = imageFactory.buildList(10);

const mockProps: CombinedProps = {
  accountBackupsEnabled: false,
  category: 'community',
  handleSelectUDFs: jest.fn(),
  header: '',
  imagesData: {},
  regionsData: [],
  request: jest.fn(),
  updateImageID: jest.fn(),
  updateRegionID: jest.fn(),
  updateStackScript: jest.fn(),
  updateTypeID: jest.fn(),
  userCannotCreateLinode: false,
};

describe('FromImageContent', () => {
  const component = shallow(
    <Provider store={store}>
      <LinodeThemeWrapper>
        <FromStackScriptContent {...mockProps} />
      </LinodeThemeWrapper>
    </Provider>
  );

  const componentWithUDFs = shallow(
    <Provider store={store}>
      <LinodeThemeWrapper>
        <FromStackScriptContent
          {...mockProps}
          availableStackScriptImages={mockImages}
          availableUserDefinedFields={mockUserDefinedFields}
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
