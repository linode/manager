import { shallow } from 'enzyme';
import * as React from 'react';
import { StaticRouter, withRouter } from 'react-router-dom';

import { linodes as mockLinodes } from 'src/__data__';
import LinodeThemeWrapper from 'src/LinodeThemeWrapper';
import { clearDocs, setDocs } from 'src/store/reducers/documentation';

import { ListLinodes } from './LinodesLanding';

import { pageyProps } from 'src/__data__/pageyProps';

const RoutedListLinodes = withRouter(ListLinodes);

const actions = {
  getLinodesWithoutBackups: jest.fn(),
  clearSidebar: jest.fn(),
  setSidebar: jest.fn(),
}

describe('ListLinodes', () => {
  let linodes: Linode.Linode[];

  beforeEach(() => {
    linodes = mockLinodes;
  });

  it('renders without error', () => {
    shallow(
      <LinodeThemeWrapper>
        <StaticRouter location="/" context={{}}>
          <RoutedListLinodes
            enqueueSnackbar={jest.fn()}
            onPresentSnackbar={jest.fn()}
            /** Pagination */
            classes={{ root: '', title: '' }}
            setDocs={setDocs}
            clearDocs={clearDocs}
            typesRequest={jest.fn}
            typesLoading={false}
            typesLastUpdated={1}
            actions={actions}
            linodesWithoutBackups={[]}
            managed={false}
            data={linodes}
            {...pageyProps}
          />
        </StaticRouter>
      </LinodeThemeWrapper>,
    );
  });

  it.skip('renders an empty state with no linodes', () => {

    const component = shallow(
      <LinodeThemeWrapper>
        <StaticRouter location="/" context={{}}>
          <RoutedListLinodes
            enqueueSnackbar={jest.fn()}
            onPresentSnackbar={jest.fn()}
            /** Pagination Props */
            {...pageyProps}
            data={[]}
            classes={{ root: '', title: '' }}
            setDocs={setDocs}
            clearDocs={clearDocs}
            typesRequest={jest.fn}
            typesLoading={false}
            typesLastUpdated={1}
            actions={actions}
            linodesWithoutBackups={[]}
            managed={false}
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
            enqueueSnackbar={jest.fn()}
            onPresentSnackbar={jest.fn()}
            /** Pagination Props */
            {...pageyProps}
            count={linodes.length}
            data={linodes}
            classes={{ root: '', title: '' }}
            setDocs={setDocs}
            clearDocs={clearDocs}
            typesRequest={jest.fn}
            typesLoading={false}
            typesLastUpdated={1}
            actions={actions}
            linodesWithoutBackups={[]}
            managed={false}
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
