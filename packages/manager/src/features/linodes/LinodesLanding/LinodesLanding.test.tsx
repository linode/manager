import { cleanup, render } from '@testing-library/react';
import * as React from 'react';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { clearDocs, setDocs } from 'src/store/documentation';
import { wrapWithTheme } from 'src/utilities/testHelpers';
import { ListLinodes } from './LinodesLanding';

afterEach(cleanup);

describe('ListLinodes', () => {
  const classes = {
    title: '',
    tagGroup: '',
    CSVlinkContainer: '',
    CSVlink: '',
    addNewLink: ''
  };

  it('renders without error', () => {
    const { getByText } = render(
      wrapWithTheme(
        <ListLinodes
          imagesLoading={false}
          imagesError={{}}
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
          {...reactRouterProps}
        />
      )
    );

    expect(getByText('Add your first Linode!')).toBeInTheDocument();
  });
});
