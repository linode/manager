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

  it('renders an empty state with no linodes', () => {
    const component = mount(
      <StaticRouter location="/" context={{}}>
        <RoutedListLinodes
          linodes={[]}
          images={images as Linode.Image[]}
          types={types as Linode.LinodeType[]}
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
          linodes={linodes as Linode.Linode[]}
          images={images as Linode.Image[]}
          types={types as Linode.LinodeType[]}
        />
      </StaticRouter>,
    );

    const kabobButton = component.find('MoreHoriz').first();
    kabobButton.simulate('click');

    const menuItems = component.find('MenuItem');
    expect(menuItems.length).toBe(7);
  });
});
