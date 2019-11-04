import { cleanup, fireEvent } from '@testing-library/react';
import { LongviewClient } from 'linode-js-sdk/lib/longview';
import * as React from 'react';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { longviewClientFactory } from 'src/factories/longviewClient';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { LongviewClients } from './LongviewClients';

jest.genMockFromModule('../request');

afterEach(cleanup);

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
  ...reactRouterProps
};

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
    const { queryAllByText } = renderWithTheme(<LongviewClients {...props} />);
    expect(queryAllByText(/waiting/i)).toHaveLength(clients.length);
  });
});
