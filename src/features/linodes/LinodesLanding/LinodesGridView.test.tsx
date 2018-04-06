import * as React from 'react';
import { mount } from 'enzyme';
import { StaticRouter } from 'react-router-dom';

import LinodesGridView from './LinodesGridView';
import { linodes, images, types } from 'src/__data__';

describe('LinodesGridView', () => {
  it('renders without error', () => {
    mount(
      <StaticRouter location="/" context={{}}>
        <LinodesGridView
          linodes={linodes as Linode.Linode[]}
          images={images as Linode.Image[]}
          types={types as Linode.LinodeType[]}
          openConfigDrawer={e => null}
        />
      </StaticRouter>,
    );
  });
});
