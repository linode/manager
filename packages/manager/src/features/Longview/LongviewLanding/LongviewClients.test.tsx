import { cleanup, fireEvent } from '@testing-library/react';
import { LongviewClient } from 'linode-js-sdk/lib/longview';
import * as React from 'react';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { longviewClientFactory } from 'src/factories/longviewClient';
import { renderWithTheme } from 'src/utilities/testHelpers';
import {
  filterLongviewClientsByQuery,
  LongviewClients
} from './LongviewClients';

afterEach(cleanup);

jest.mock('../request');

const clients = longviewClientFactory.buildList(5);

const arrayToData = (data: any[]): Record<string, LongviewClient> => {
  return data.reduce((accum, thisItem) => {
    accum[thisItem.id] = thisItem;
    return accum;
  }, {});
};

const props = {
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
  subscriptionsData: [],
  accountSettingsLoading: false,
  accountSettingsError: {},
  accountSettingsLastUpdated: 0,
  lvClientData: {},
  lvClientsLoading: false,
  ...reactRouterProps
};

describe('Utility Functions', () => {
  it('should properly filter longview clients by query', () => {
    const mockLongviewClients: Record<string, LongviewClient> = clients.reduce(
      (acc, eachClient) => {
        acc[eachClient.id] = eachClient;
        return acc;
      },
      {}
    );

    expect(filterLongviewClientsByQuery('1', mockLongviewClients)).toEqual({
      1: clients[1]
    }),
      expect(
        filterLongviewClientsByQuery('client', mockLongviewClients)
      ).toEqual(mockLongviewClients),
      expect(filterLongviewClientsByQuery('(', mockLongviewClients)).toEqual(
        {}
      ),
      expect(filterLongviewClientsByQuery(')', mockLongviewClients)).toEqual(
        {}
      ),
      expect(
        filterLongviewClientsByQuery('fdsafdsafsdf', mockLongviewClients)
      ).toEqual({});
  });
});

describe('Longview clients list view', () => {
  it('should request clients on load', () => {
    renderWithTheme(<LongviewClients {...props} />);
    expect(props.getLongviewClients).toHaveBeenCalledTimes(1);
  });

  it('should have an Add a Client button', () => {
    const { queryByText } = renderWithTheme(<LongviewClients {...props} />);
    expect(queryByText('Add a Client')).toBeInTheDocument();
  });

  it('should attempt to create a new client when the Add a Client button is clicked', () => {
    const { getByText } = renderWithTheme(<LongviewClients {...props} />);
    const button = getByText('Add a Client');
    fireEvent.click(button);
    expect(props.createLongviewClient).toHaveBeenCalledWith();
  });

  it('should render a row for each client', () => {
    const { queryAllByTestId } = renderWithTheme(
      <LongviewClients {...props} />
    );
    expect(queryAllByTestId('longview-client-row')).toHaveLength(
      clients.length
    );
  });
});
