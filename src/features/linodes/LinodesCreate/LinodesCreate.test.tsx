import * as React from 'react';
import { shallow } from 'enzyme';
import { LinodeCreate } from './LinodesCreate';

import { images, ExtendedType, LinodesWithBackups } from 'src/__data__/index';

import { reactRouterProps } from 'src/__data__/reactRouterProps';

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
