import { shallow } from 'enzyme';
import * as React from 'react';
import { StaticRouter, withRouter } from 'react-router-dom';
import LinodeThemeWrapper from 'src/LinodeThemeWrapper';
import { clearDocs, setDocs } from 'src/store/documentation';
import { ListLinodes } from './LinodesLanding';

const RoutedListLinodes = withRouter(ListLinodes);

describe('ListLinodes', () => {
  const classes = {
    title: '',
    tagGroup: '',
    CSVlinkContainer: '',
    CSVlink: ''
  };

  it('renders without error', () => {
    shallow(
      <LinodeThemeWrapper>
        <StaticRouter location="/" context={{}}>
          <RoutedListLinodes
            imagesLoading={false}
            imagesError={undefined}
            linodesData={[]}
            width={'lg'}
            classes={classes}
            clearDocs={clearDocs}
            enqueueSnackbar={jest.fn()}
            groupByTags={false}
            linodesCount={0}
            linodesRequestError={undefined}
            linodesRequestLoading={false}
            managed={false}
            onPresentSnackbar={jest.fn()}
            setDocs={setDocs}
            toggleGroupByTag={jest.fn()}
            backupsCTA={false}
            deleteLinode={jest.fn()}
          />
        </StaticRouter>
      </LinodeThemeWrapper>
    );
  });

  it.skip('renders an empty state with no linodes', () => {
    const component = shallow(
      <LinodeThemeWrapper>
        <StaticRouter location="/" context={{}}>
          <RoutedListLinodes
            imagesLoading={false}
            imagesError={undefined}
            linodesData={[]}
            width={'lg'}
            classes={classes}
            clearDocs={clearDocs}
            enqueueSnackbar={jest.fn()}
            groupByTags={false}
            linodesCount={0}
            linodesRequestError={undefined}
            linodesRequestLoading={false}
            managed={false}
            onPresentSnackbar={jest.fn()}
            setDocs={setDocs}
            toggleGroupByTag={jest.fn()}
            backupsCTA={false}
            deleteLinode={jest.fn()}
          />
        </StaticRouter>
      </LinodeThemeWrapper>
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
            imagesLoading={false}
            imagesError={undefined}
            linodesData={[]}
            width={'lg'}
            classes={classes}
            clearDocs={clearDocs}
            enqueueSnackbar={jest.fn()}
            groupByTags={false}
            linodesCount={0}
            linodesRequestError={undefined}
            linodesRequestLoading={false}
            managed={false}
            onPresentSnackbar={jest.fn()}
            setDocs={setDocs}
            toggleGroupByTag={jest.fn()}
            backupsCTA={false}
            deleteLinode={jest.fn()}
          />
        </StaticRouter>
      </LinodeThemeWrapper>
    );

    const kabobButton = component.find('MoreHoriz').first();
    kabobButton.simulate('click');

    const menuItems = component.find('MenuItem');
    expect(menuItems.length).toBe(8);
  });
});
