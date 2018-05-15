import * as React from 'react';
import { mount } from 'enzyme';
import { StaticRouter } from 'react-router-dom';

import LinodeThemeWrapper from 'src/LinodeThemeWrapper';

import { linodes, images, types } from 'src/__data__';

import LinodesGridView from './LinodesGridView';

describe('LinodesGridView', () => {
  it('renders without error', () => {
    mount(
      <LinodeThemeWrapper>
        <StaticRouter location="/" context={{}}>
          <LinodesGridView
            linodes={linodes as Linode.Linode[]}
            images={images as Linode.Image[]}
            types={types as Linode.LinodeType[]}
            openConfigDrawer={e => null}
            toggleConfirmation={e => null}
          />
        </StaticRouter>
      </LinodeThemeWrapper>,
    );
  });
});
