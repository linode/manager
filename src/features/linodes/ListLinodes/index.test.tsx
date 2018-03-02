import * as React from 'react';
import { mount } from 'enzyme';
import { StaticRouter } from 'react-router-dom';

import { RoutedListLinodes } from './index';
import { linodes, images, types } from 'src/__data__';

describe('ListLinodes', () => {
  it('renders without error', () => {
    mount(
      <StaticRouter location="/" context={{}}>
        <RoutedListLinodes
          linodes={linodes as Linode.Linode[]}
          images={images as Linode.Image[]}
          types={types as Linode.LinodeType[]}
        />
      </StaticRouter>,
    );
  });
});
