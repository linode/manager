import { waitForElementToBeRemoved } from '@testing-library/react';
import * as React from 'react';
import { linodeTypeFactory, nodePoolFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { NodePoolsDisplay, Props } from './NodePoolsDisplay';

const props: Props = {
  clusterID: 123,
  clusterLabel: 'a cluster',
};

describe('NodeTable', () => {
  it('Includes the plan label', async () => {
    server.use(
      rest.get(`*/lke/clusters/${props.clusterID}/pools`, (req, res, ctx) => {
        const pools = nodePoolFactory.buildList(1, {
          count: 1,
          type: 'g6-standard-1',
        });
        return res(ctx.json(makeResourcePage(pools)));
      }),
      rest.get('*/linode/types', (req, res, ctx) => {
        return res(
          ctx.json(
            makeResourcePage(
              linodeTypeFactory.buildList(1, {
                label: 'Linode 2GB',
                id: 'g6-standard-1',
              })
            )
          )
        );
      })
    );

    const { getByText, getByTestId } = renderWithTheme(
      <NodePoolsDisplay {...props} />
    );

    await waitForElementToBeRemoved(getByTestId('circle-progress'));

    getByText('Linode 2GB');
  });
});
