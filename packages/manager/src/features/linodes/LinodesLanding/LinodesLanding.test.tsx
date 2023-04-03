import { render } from '@testing-library/react';
import * as React from 'react';
import { wrapWithTheme } from 'src/utilities/testHelpers';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { ListLinodes } from './LinodesLanding';

describe('ListLinodes', () => {
  const classes = {
    root: '',
    CSVlinkContainer: '',
    CSVlink: '',
    CSVwrapper: '',
  };

  it('renders without error', () => {
    const { getByText } = render(
      wrapWithTheme(
        <ListLinodes
          someLinodesHaveScheduledMaintenance={true}
          linodesData={[]}
          classes={classes}
          enqueueSnackbar={jest.fn()}
          linodesCount={0}
          linodesRequestError={undefined}
          linodesRequestLoading={false}
          closeSnackbar={jest.fn()}
          deleteLinode={jest.fn()}
          {...reactRouterProps}
          linodesInTransition={new Set<number>()}
        />
      )
    );

    expect(getByText('Create Linode')).toBeInTheDocument();
  });
});
