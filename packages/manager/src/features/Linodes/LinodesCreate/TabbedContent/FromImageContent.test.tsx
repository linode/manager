import { shallow } from 'enzyme';
import * as React from 'react';
import { CombinedProps, FromImageContent } from './FromImageContent';
import { Provider } from 'react-redux';
import LinodeThemeWrapper from 'src/LinodeThemeWrapper';
import { storeFactory } from 'src/store';
import { queryClientFactory } from 'src/queries/base';

const store = storeFactory(queryClientFactory());

const mockProps: CombinedProps = {
  accountBackupsEnabled: false,
  imagesData: {},
  regionsData: [],
  typesData: [],
  updateImageID: jest.fn(),
  updateRegionID: jest.fn(),
  updateTypeID: jest.fn(),
  userCannotCreateLinode: false,
};

describe('FromImageContent', () => {
  const component = shallow(
    <Provider store={store}>
      <LinodeThemeWrapper>
        <FromImageContent {...mockProps} />
      </LinodeThemeWrapper>
    </Provider>
  );

  it('should render without crashing', () => {
    expect(component).toHaveLength(1);
  });

  it.skip('should render SelectImage panel', () => {
    expect(component.find('[data-qa-select-image-panel]')).toHaveLength(1);
  });
});
