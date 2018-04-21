import * as React from 'react';
import { mount } from 'enzyme';
import { StaticRouter, withRouter } from 'react-router-dom';
import { PromiseLoaderResponse } from 'src/components/PromiseLoader/PromiseLoader';
import { ListLinodes } from './LinodesLanding';
import {
  linodes as mockLinodes,
  images as mockImages,
  types as mockTypes,
} from 'src/__data__';
import { setDocs, clearDocs } from 'src/store/reducers/documentation';

const RoutedListLinodes = withRouter(ListLinodes);

function promiseLoaderType(response: any, error?: Error) {
  return {
    error,
    response,
  };
}

function manyResourceState(data: any[], pages = 0, page = 0, results = 0) {
  return {
    pages,
    page,
    results,
    data,
  };
}

describe('ListLinodes', () => {
  let linodes: PromiseLoaderResponse<Linode.ManyResourceState<Linode.Linode>>;
  let images: PromiseLoaderResponse<Linode.ManyResourceState<Linode.Image>>;

  beforeEach(() => {
    linodes = promiseLoaderType(manyResourceState(mockLinodes));
    images = promiseLoaderType(manyResourceState(mockImages));

  });

  it('renders without error', () => {
    mount(
      <StaticRouter location="/" context={{}}>
        <RoutedListLinodes
          linodes={linodes}
          images={images}
          types={mockTypes}
          classes={{ root: '', title: '' }}
          setDocs={setDocs}
          clearDocs={clearDocs}
        />
      </StaticRouter>,
    );
  });

  it('renders an empty state with no linodes', () => {
    linodes = promiseLoaderType(manyResourceState([]));
    const component = mount(

      <StaticRouter location="/" context={{}}>
        <RoutedListLinodes
          linodes={linodes}
          images={images}
          types={mockTypes}
          classes={{ root: '', title: '' }}
          setDocs={setDocs}
          clearDocs={clearDocs}
        />
      </StaticRouter>,
    );

    const emptyState = component.find('ListLinodesEmptyState');

    expect(emptyState).toHaveLength(1);
  });

  it('renders menu actions when the kabob is clicked', () => {
    const component = mount(
      <StaticRouter location="/" context={{}}>
        <RoutedListLinodes
          linodes={linodes}
          images={images}
          types={mockTypes}
          classes={{ root: '', title: '' }}
          setDocs={setDocs}
          clearDocs={clearDocs}
        />
      </StaticRouter>,
    );

    const kabobButton = component.find('MoreHoriz').first();
    kabobButton.simulate('click');

    const menuItems = component.find('MenuItem');
    expect(menuItems.length).toBe(8);
  });
});
