import { shallow } from 'enzyme';
import * as React from 'react';
import { StaticRouter } from 'react-router-dom';

import { images, linodes } from 'src/__data__';
import LinodeThemeWrapper from 'src/LinodeThemeWrapper';

import LinodesGridView from './LinodesGridView';

describe('LinodesGridView', () => {
  it('renders without error', () => {
    shallow(
      <LinodeThemeWrapper>
        <StaticRouter location="/" context={{}}>
          <LinodesGridView
            linodes={linodes as Linode.Linode[]}
            images={images as Linode.Image[]}
            openConfigDrawer={e => null}
            toggleConfirmation={e => null}
          />
        </StaticRouter>
      </LinodeThemeWrapper>,
    );
  });
});
