import { vi } from 'vitest';
import { shallow } from 'enzyme';
import * as React from 'react';

import { linodes } from 'src/__data__/linodes';

import { CombinedProps, FromLinodeContent } from './FromLinodeContent';
import { Provider } from 'react-redux';
import LinodeThemeWrapper from 'src/LinodeThemeWrapper';
import { storeFactory } from 'src/store';
import { queryClientFactory } from 'src/queries/base';

const store = storeFactory(queryClientFactory());

const mockProps: CombinedProps = {
  updateDiskSize: vi.fn(),
  updateImageID: vi.fn(),
  updateLinodeID: vi.fn(),
  updateRegionID: vi.fn(),
  updateTypeID: vi.fn(),
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
      <LinodeThemeWrapper>
        <FromLinodeContent {...mockProps} />
      </LinodeThemeWrapper>
    </Provider>
  );

  const componentWithoutLinodes = shallow(
    <Provider store={store}>
      <LinodeThemeWrapper>
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
