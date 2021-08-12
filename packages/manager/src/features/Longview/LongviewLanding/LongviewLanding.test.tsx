import { fireEvent, waitFor } from '@testing-library/react';
import { LongviewClient } from '@linode/api-v4/lib/longview';
import * as React from 'react';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import {
  longviewSubscriptionFactory,
  longviewClientFactory,
} from 'src/factories';

import { renderWithTheme } from 'src/utilities/testHelpers';
import {
  CombinedProps,
  filterLongviewClientsByQuery,
  LongviewClients,
  sortClientsBy,
  sortFunc,
} from './LongviewClients';
import { LongviewLanding } from './LongviewLanding';

jest.mock('../request');
jest.mock('./LongviewClientRow');

const clients = longviewClientFactory.buildList(5);

const arrayToData = (data: any[]): Record<string, LongviewClient> => {
  return data.reduce((accum, thisItem) => {
    accum[thisItem.id] = thisItem;
    return accum;
  }, {});
};

const props: CombinedProps = {
  longviewClientsData: arrayToData(clients),
  longviewClientsError: {},
  longviewClientsLastUpdated: 0,
  longviewClientsLoading: false,
  longviewClientsResults: clients.length,
  createLongviewClient: jest.fn().mockResolvedValue({}),
  deleteLongviewClient: jest.fn(),
  getLongviewClients: jest.fn().mockResolvedValue([]),
  updateLongviewClient: jest.fn(),
  enqueueSnackbar: jest.fn(),
  closeSnackbar: jest.fn(),
  activeSubscription: longviewSubscriptionFactory.build(),
  lvClientData: {},
  handleAddClient: jest.fn(),
  newClientLoading: false,
  ...reactRouterProps,
};

describe('Utility Functions', () => {
  it('should properly filter longview clients by query', () => {
    expect(filterLongviewClientsByQuery('client-1', clients, {})).toEqual([
      clients[1],
    ]),
      expect(filterLongviewClientsByQuery('client', clients, {})).toEqual(
        clients
      ),
      expect(filterLongviewClientsByQuery('(', clients, {})).toEqual([]),
      expect(filterLongviewClientsByQuery(')', clients, {})).toEqual([]),
      expect(filterLongviewClientsByQuery('fdsafdsafsdf', clients, {})).toEqual(
        []
      );
  });

  describe('Sorting helpers', () => {
    describe('sortFunc helper', () => {
      it('should handle basic sorting logic', () => {
        expect([4, 5, 3, 1, 2].sort(sortFunc)).toEqual([5, 4, 3, 2, 1]);
        expect(['d', 'c', 'a', 'e', 'b'].sort(sortFunc)).toEqual([
          'e',
          'd',
          'c',
          'b',
          'a',
        ]);
      });

      it('should respect the optional order argument', () => {
        expect([4, 3, 5, 1, 2].sort((a, b) => sortFunc(a, b, 'asc'))).toEqual([
          1,
          2,
          3,
          4,
          5,
        ]);

        expect(
          ['d', 'c', 'a', 'e', 'b'].sort((a, b) => sortFunc(a, b, 'desc'))
        ).toEqual(['e', 'd', 'c', 'b', 'a']);
      });
    });
    describe('sortClientsBy', () => {
      it('should sort correctly by CPU percentage', () => {
        expect(sortClientsBy('CPU' as any, [], {})).toEqual([]);
      });
    });
  });
});

describe('Longview clients list view', () => {
  it('should request clients on load', () => {
    renderWithTheme(<LongviewClients {...props} />);
    expect(props.getLongviewClients).toHaveBeenCalledTimes(1);
  });

  it('should have an Add Client button', () => {
    const { queryByText } = renderWithTheme(<LongviewLanding {...props} />);
    expect(queryByText('Add Client')).toBeInTheDocument();
  });

  it('should attempt to add a new client when the Add Client button is clicked', async () => {
    const { getByText } = renderWithTheme(<LongviewLanding {...props} />);
    const button = getByText('Add Client');
    fireEvent.click(button);
    await waitFor(() =>
      expect(props.createLongviewClient).toHaveBeenCalledWith()
    );
  });

  it('should render a row for each client', () => {
    const { queryAllByTestId } = renderWithTheme(
      <LongviewClients {...props} />
    );
    expect(queryAllByTestId('longview-client-row')).toHaveLength(
      clients.length
    );
  });

  it('should render a CTA for non-Pro subscribers', () => {
    const { getByText } = renderWithTheme(
      <LongviewClients {...props} activeSubscription={{}} />
    );

    getByText(/upgrade to longview pro/i);
  });

  it('should not render a CTA for LV Pro subscribers', () => {
    const { queryAllByText } = renderWithTheme(
      <LongviewClients
        {...props}
        activeSubscription={longviewSubscriptionFactory.build({
          id: 'longview-100',
        })}
      />
    );

    expect(queryAllByText(/upgrade to longview pro/i)).toHaveLength(0);
  });
});
