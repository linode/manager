import { waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

import { DatabaseCreate } from './DatabaseCreate';

const loadingTestId = 'circle-progress';

beforeAll(() => mockMatchMedia());

describe('database node selector', () => {
  const flags = {
    dbaasV2: {
      beta: false,
      enabled: true,
    },
  };
  it('should render 3 nodes for dedicated tab', async () => {
    const { getByTestId } = renderWithTheme(<DatabaseCreate />, { flags });
    expect(getByTestId(loadingTestId)).toBeInTheDocument();
    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    expect(getByTestId('database-nodes').childNodes.length).equal(3);
    expect(getByTestId('database-node-1')).toBeInTheDocument();
    expect(getByTestId('database-node-2')).toBeInTheDocument();
    expect(getByTestId('database-node-3')).toBeInTheDocument();
  });

  it('should render 2 nodes for shared tab', async () => {
    const { getAllByRole, getByTestId } = renderWithTheme(<DatabaseCreate />, {
      flags,
    });
    expect(getByTestId(loadingTestId)).toBeInTheDocument();
    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    const sharedTab = getAllByRole('tab')[1];
    await userEvent.click(sharedTab);

    expect(getByTestId('database-nodes').childNodes.length).equal(2);
    expect(getByTestId('database-node-1')).toBeInTheDocument();
    expect(getByTestId('database-node-3')).toBeInTheDocument();
  });
});
