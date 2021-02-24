import { shallow } from 'enzyme';
import * as React from 'react';
import { CombinedProps, FromImageContent } from './FromImageContent';
import { Provider } from 'react-redux';
import store from 'src/store';
import LinodeThemeWrapper from 'src/LinodeThemeWrapper';

const mockProps: CombinedProps = {
  updateImageID: jest.fn(),
  updateRegionID: jest.fn(),
  updateTypeID: jest.fn(),
  imagesData: {},
  regionsData: [],
  typesData: [],
  accountBackupsEnabled: false,
  userCannotCreateLinode: false,
};

describe('FromImageContent', () => {
  const component = shallow(
    <Provider store={store}>
      <LinodeThemeWrapper theme="dark">
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
