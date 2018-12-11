import { shallow } from 'enzyme';
import * as React from 'react';
import { StaticRouter, withRouter } from 'react-router-dom';
import LinodeThemeWrapper from 'src/LinodeThemeWrapper';
import { clearDocs, setDocs } from 'src/store/reducers/documentation';
import { ListLinodes } from './LinodesLanding';

const RoutedListLinodes = withRouter(ListLinodes);

const actions = {
  getLinodesWithoutBackups: jest.fn(),
  clearSidebar: jest.fn(),
  setSidebar: jest.fn(),
}

describe('ListLinodes', () => {

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
            actions={actions}
            linodesWithoutBackups={[]}
            managed={false}
            handleOrderChange={jest.fn()}
            handlePageChange={jest.fn()}
            handlePageSizeChange={jest.fn()}
            linodesCount={0}
            linodesData={[]}
            linodesRequestError={undefined}
            linodesRequestLoading={false}
            order={'asc'}
            orderBy={'label'}
            page={1}
            pageSize={25}

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
            classes={{ root: '', title: '' }}
            setDocs={setDocs}
            clearDocs={clearDocs}
            actions={actions}
            linodesWithoutBackups={[]}
            managed={false}
            handleOrderChange={jest.fn()}
            handlePageChange={jest.fn()}
            handlePageSizeChange={jest.fn()}
            linodesCount={0}
            linodesData={[]}
            linodesRequestError={undefined}
            linodesRequestLoading={false}
            order={'asc'}
            orderBy={'label'}
            page={1}
            pageSize={25}
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
            classes={{ root: '', title: '' }}
            setDocs={setDocs}
            clearDocs={clearDocs}
            actions={actions}
            linodesWithoutBackups={[]}
            managed={false}
            handleOrderChange={jest.fn()}
            handlePageChange={jest.fn()}
            handlePageSizeChange={jest.fn()}
            linodesCount={0}
            linodesData={[]}
            linodesRequestError={undefined}
            linodesRequestLoading={false}
            order={'asc'}
            orderBy={'label'}
            page={1}
            pageSize={25}
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
