import { shallow } from 'enzyme';
import * as React from 'react';

import { ExtendedType, images, LinodesWithBackups } from 'src/__data__/index';
import { reactRouterProps } from 'src/__data__/reactRouterProps';

import { LinodeCreate } from './LinodesCreate';

const dummyProps = {
  types: ExtendedType,
  regions: [],
  images: {
    response: images,
  },
  linodes: {
    response: LinodesWithBackups,
  },
};

describe('FromImageContent', () => {
  const component = shallow(
      <LinodeCreate
        classes={{
          root: '',
          main: '',
        }}
        {...dummyProps}
        {...reactRouterProps}
      />
  );

  it('should render create tabs', () => {
    expect(component.find('WithStyles(Tab)')).toHaveLength(4);
  });
});
