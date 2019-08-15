import { shallow } from 'enzyme';
import * as React from 'react';
import { StaticRouter, withRouter } from 'react-router-dom';
import LinodeThemeWrapper from 'src/LinodeThemeWrapper';
import { clearDocs, setDocs } from 'src/store/documentation';
import { ListLinodes } from './LinodesLanding';

import { Provider } from 'react-redux';
import store from 'src/store';

const RoutedListLinodes = withRouter(ListLinodes);

describe('ListLinodes', () => {
  const classes = {
    title: '',
    tagGroup: '',
    CSVlinkContainer: '',
    CSVlink: '',
    addNewLink: ''
  };

  it('renders without error', () => {
    shallow(
      <Provider store={store}>
        <LinodeThemeWrapper theme="dark" spacing="normal">
          <StaticRouter location="/" context={{}}>
            <RoutedListLinodes
              imagesLoading={false}
              imagesError={undefined}
              userTimezone="GMT"
              userTimezoneLoading={false}
              someLinodesHaveScheduledMaintenance={true}
              linodesData={[]}
              classes={classes}
              clearDocs={clearDocs}
              enqueueSnackbar={jest.fn()}
              linodesCount={0}
              linodesRequestError={undefined}
              linodesRequestLoading={false}
              managed={false}
              closeSnackbar={jest.fn()}
              setDocs={setDocs}
              backupsCTA={false}
              deleteLinode={jest.fn()}
            />
          </StaticRouter>
        </LinodeThemeWrapper>
      </Provider>
    );
  });

  it.skip('renders an empty state with no linodes', () => {
    const component = shallow(
      <Provider store={store}>
        <LinodeThemeWrapper theme="dark" spacing="normal">
          <StaticRouter location="/" context={{}}>
            <RoutedListLinodes
              imagesLoading={false}
              imagesError={undefined}
              linodesData={[]}
              classes={classes}
              clearDocs={clearDocs}
              userTimezone="GMT"
              userTimezoneLoading={false}
              someLinodesHaveScheduledMaintenance={true}
              enqueueSnackbar={jest.fn()}
              linodesCount={0}
              linodesRequestError={undefined}
              linodesRequestLoading={false}
              managed={false}
              closeSnackbar={jest.fn()}
              setDocs={setDocs}
              backupsCTA={false}
              deleteLinode={jest.fn()}
            />
          </StaticRouter>
        </LinodeThemeWrapper>
      </Provider>
    );

    const emptyState = component.find('ListLinodesEmptyState');

    expect(emptyState).toHaveLength(1);
  });

  /** Test is not specific to the LinodesLanding Page */
  it.skip('renders menu actions when the kabob is clicked', () => {
    const component = shallow(
      <Provider store={store}>
        <LinodeThemeWrapper theme="dark" spacing="normal">
          <StaticRouter location="/" context={{}}>
            <RoutedListLinodes
              imagesLoading={false}
              imagesError={undefined}
              linodesData={[]}
              userTimezone="GMT"
              userTimezoneLoading={false}
              someLinodesHaveScheduledMaintenance={true}
              classes={classes}
              clearDocs={clearDocs}
              enqueueSnackbar={jest.fn()}
              linodesCount={0}
              linodesRequestError={undefined}
              linodesRequestLoading={false}
              managed={false}
              closeSnackbar={jest.fn()}
              setDocs={setDocs}
              backupsCTA={false}
              deleteLinode={jest.fn()}
            />
          </StaticRouter>
        </LinodeThemeWrapper>
      </Provider>
    );

    const kabobButton = component.find('MoreHoriz').first();
    kabobButton.simulate('click');

    const menuItems = component.find('MenuItem');
    expect(menuItems.length).toBe(8);
  });
});
