import { shallow } from 'enzyme';
import * as React from 'react';
import { StaticRouter, withRouter } from 'react-router-dom';

import { images as mockImages, linodes as mockLinodes } from 'src/__data__';
import { PromiseLoaderResponse } from 'src/components/PromiseLoader/PromiseLoader';
import LinodeThemeWrapper from 'src/LinodeThemeWrapper';
import { clearDocs, setDocs } from 'src/store/reducers/documentation';

import { ListLinodes } from './LinodesLanding';

const RoutedListLinodes = withRouter(ListLinodes);

function promiseLoaderType(response: any, error?: Error) {
  return {
    error,
    response,
  };
}

function resourcePage(data: any[], pages = 0, page = 0, results = 0) {
  return {
    pages,
    page,
    results,
    data,
  };
}

describe('ListLinodes', () => {
  let linodes: PromiseLoaderResponse<Linode.ResourcePage<Linode.Linode>>;
  let images: PromiseLoaderResponse<Linode.ResourcePage<Linode.Image>>;

  beforeEach(() => {
    linodes = promiseLoaderType(resourcePage(mockLinodes));
    images = promiseLoaderType(resourcePage(mockImages));
  });

  it('renders without error', () => {
    shallow(
      <LinodeThemeWrapper>
        <StaticRouter location="/" context={{}}>
          <RoutedListLinodes
            linodes={linodes}
            images={images}
            classes={{ root: '', title: '' }}
            setDocs={setDocs}
            clearDocs={clearDocs}
            typesRequest={jest.fn}
            typesLoading={false}
            typesLastUpdated={1}
          />
        </StaticRouter>
      </LinodeThemeWrapper>,
    );
  });

  it.skip('renders an empty state with no linodes', () => {
    linodes = promiseLoaderType(resourcePage([]));
    const component = shallow(
      <LinodeThemeWrapper>
        <StaticRouter location="/" context={{}}>
          <RoutedListLinodes
            linodes={linodes}
            images={images}
            classes={{ root: '', title: '' }}
            setDocs={setDocs}
            clearDocs={clearDocs}
            typesRequest={jest.fn}
            typesLoading={false}
            typesLastUpdated={1}
          />
        </StaticRouter>
      </LinodeThemeWrapper>,
    );

    const emptyState = component.find('ListLinodesEmptyState');

    expect(emptyState).toHaveLength(1);
  });

  /** Test is not specific to the LinodesLanding Page */
  it.skip('renders menu actions when the kabob is clicked', () => {
    const component = shallow(
      <LinodeThemeWrapper>
        <StaticRouter location="/" context={{}}>
          <RoutedListLinodes
            linodes={linodes}
            images={images}
            classes={{ root: '', title: '' }}
            setDocs={setDocs}
            clearDocs={clearDocs}
            typesRequest={jest.fn}
            typesLoading={false}
            typesLastUpdated={1}
          />
        </StaticRouter>
      </LinodeThemeWrapper>,
    );

    const kabobButton = component.find('MoreHoriz').first();
    kabobButton.simulate('click');

    const menuItems = component.find('MenuItem');
    expect(menuItems.length).toBe(8);
  });
});
