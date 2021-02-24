import { shallow } from 'enzyme';
import * as React from 'react';

import { linodes } from 'src/__data__/linodes';

import { CombinedProps, FromLinodeContent } from './FromLinodeContent';
import { Provider } from 'react-redux';
import store from 'src/store';
import LinodeThemeWrapper from 'src/LinodeThemeWrapper';

const mockProps: CombinedProps = {
  updateDiskSize: jest.fn(),
  updateImageID: jest.fn(),
  updateLinodeID: jest.fn(),
  updateRegionID: jest.fn(),
  updateTypeID: jest.fn(),
  accountBackupsEnabled: false,
  imagesData: {},
  linodesData: linodes,
  regionsData: [],
  typesData: [],
  userCannotCreateLinode: false,
};

describe('FromImageContent', () => {
  const component = shallow(
    <Provider store={store}>
      <LinodeThemeWrapper theme="dark">
        <FromLinodeContent {...mockProps} />
      </LinodeThemeWrapper>
    </Provider>
  );

  const componentWithoutLinodes = shallow(
    <Provider store={store}>
      <LinodeThemeWrapper theme="dark">
        <FromLinodeContent {...mockProps} linodesData={[]} />
      </LinodeThemeWrapper>
    </Provider>
  );

  it('should render without crashing', () => {
    expect(component).toHaveLength(1);
  });

  it.skip('should render a Placeholder when linodes prop has no length', () => {
    expect(componentWithoutLinodes.find('[data-qa-placeholder]')).toHaveLength(
      1
    );
  });

  it.skip('should render SelectLinode panel', () => {
    expect(component.find('[data-qa-linode-panel]')).toHaveLength(1);
  });
});
