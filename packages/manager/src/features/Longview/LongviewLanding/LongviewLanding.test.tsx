import { fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';

import { reactRouterProps } from 'src/__data__/reactRouterProps';
import {
  longviewClientFactory,
  longviewSubscriptionFactory,
} from 'src/factories';
import { renderWithThemeAndRouter } from 'src/utilities/testHelpers';

import {
  LongviewClients,
  filterLongviewClientsByQuery,
  sortClientsBy,
  sortFunc,
} from './LongviewClients';
import { LongviewLanding } from './LongviewLanding';

import type { LongviewClientsCombinedProps } from './LongviewClients';
import type { LongviewClient } from '@linode/api-v4/lib/longview';

afterEach(() => {
  vi.clearAllMocks();
});

vi.mock('../request');
vi.mock('./LongviewClientRow');

const clients = longviewClientFactory.buildList(5);

const arrayToData = (data: any[]): Record<string, LongviewClient> => {
  return data.reduce((accum, thisItem) => {
    accum[thisItem.id] = thisItem;
    return accum;
  }, {});
};

const props: LongviewClientsCombinedProps = {
  activeSubscription: longviewSubscriptionFactory.build(),
  createLongviewClient: vi.fn().mockResolvedValue({}),
  deleteLongviewClient: vi.fn(),
  getLongviewClients: vi.fn().mockResolvedValue([]),
  handleAddClient: vi.fn(),
  longviewClientsData: arrayToData(clients),
  longviewClientsError: {},
  longviewClientsLastUpdated: 0,
  longviewClientsLoading: false,
  longviewClientsResults: clients.length,
  lvClientData: {},
  newClientLoading: false,
  updateLongviewClient: vi.fn(),
  ...reactRouterProps,
};

describe('Utility Functions', () => {
  it('should properly filter longview clients by query', () => {
    expect(filterLongviewClientsByQuery('client-1', clients, {})).toEqual([
      clients[0],
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
  it('should request clients on load', async () => {
    await renderWithThemeAndRouter(<LongviewClients {...props} />);
    expect(props.getLongviewClients).toHaveBeenCalledTimes(1);
  });

  it('should have an Add Client button', async () => {
    const { findByText } = await renderWithThemeAndRouter(
      <LongviewLanding {...props} />
    );
    const addButton = await findByText('Add Client');
    expect(addButton).toBeInTheDocument();
  });

  it('should attempt to add a new client when the Add Client button is clicked', async () => {
    const { getByText } = await renderWithThemeAndRouter(
      <LongviewLanding {...props} />
    );
    const button = getByText('Add Client');
    fireEvent.click(button);
    await waitFor(() =>
      expect(props.createLongviewClient).toHaveBeenCalledWith()
    );
  });

  it('should render a row for each client', async () => {
    const { queryAllByTestId } = await renderWithThemeAndRouter(
      <LongviewClients {...props} />
    );

    expect(queryAllByTestId('longview-client-row')).toHaveLength(
      clients.length
    );
  });

  it('should render a CTA for non-Pro subscribers', async () => {
    const { getByText } = await renderWithThemeAndRouter(
      <LongviewClients {...props} activeSubscription={{}} />
    );

    getByText(/upgrade to longview pro/i);
  });

  it('should not render a CTA for LV Pro subscribers', async () => {
    const { queryAllByText } = await renderWithThemeAndRouter(
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
