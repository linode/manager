import { waitForElementToBeRemoved } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { imageFactory } from 'src/factories';
import { linodeFactory } from 'src/factories/linodes';
import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme, wrapWithTableBody } from 'src/utilities/testHelpers';

import { SelectLinodeRow } from './SelectLinodeRow';

const loadingTestId = 'circle-progress';

describe('SelectLinodeRow', () => {
  const handlePowerOff = vi.fn();
  const handleSelection = vi.fn();

  it('should display linode label, status, image, plan and region', async () => {
    const linode1 = linodeFactory.build({ id: 1, label: 'linode-1' });
    const image1 = imageFactory.build({
      id: 'linode/debian10',
      label: 'Debian 10',
    });

    server.use(
      rest.get('*/linode/instances/:linodeId', (req, res, ctx) => {
        return res(ctx.json(linode1));
      }),
      rest.get('*/images/:imageId', (req, res, ctx) => {
        return res(ctx.json(image1));
      })
    );

    const {
      findByText,
      getAllByRole,
      getByTestId,
      getByText,
    } = renderWithTheme(
      wrapWithTableBody(
        <SelectLinodeRow
          handlePowerOff={handlePowerOff}
          handleSelection={handleSelection}
          linodeId={linode1.id}
          selected
          showPowerActions
        />
      )
    );

    // Loading state should render
    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    getByText(linode1.label);
    getByText('Running');
    await findByText('Debian 10');
    await findByText('Linode 1 GB');
    await findByText('Newark, NJ');

    const selectButton = getAllByRole('button')[0];
    fireEvent.click(selectButton);
    expect(handleSelection).toHaveBeenCalled();

    const powerOffButton = getByText('Power Off');
    fireEvent.click(powerOffButton);
    expect(handlePowerOff).toHaveBeenCalled();
  });

  it('should not display power off linode button if linode is not running', async () => {
    const linode1 = linodeFactory.build({
      id: 1,
      label: 'linode-1',
      status: 'offline',
    });
    const image1 = imageFactory.build({
      id: 'linode/debian10',
      label: 'Debian 10',
    });
    server.use(
      rest.get('*/linode/instances/:linodeId', (req, res, ctx) => {
        return res(ctx.json(linode1));
      }),
      rest.get('*/images/:imageId', (req, res, ctx) => {
        return res(ctx.json(image1));
      })
    );

    const { findByText, getByTestId, getByText, queryByText } = renderWithTheme(
      wrapWithTableBody(
        <SelectLinodeRow
          handlePowerOff={handlePowerOff}
          handleSelection={handleSelection}
          linodeId={linode1.id}
          selected
          showPowerActions
        />
      )
    );

    // Loading state should render
    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    getByText(linode1.label);
    getByText('Offline');
    await findByText('Debian 10');
    await findByText('Linode 1 GB');
    await findByText('Newark, NJ');

    expect(queryByText('Power Off')).not.toBeInTheDocument();
  });

  it('should not display power off linode button if not enabled', async () => {
    const linode1 = linodeFactory.build({
      id: 1,
      label: 'linode-1',
    });
    const image1 = imageFactory.build({
      id: 'linode/debian10',
      label: 'Debian 10',
    });
    server.use(
      rest.get('*/linode/instances/:linodeId', (req, res, ctx) => {
        return res(ctx.json(linode1));
      }),
      rest.get('*/images/:imageId', (req, res, ctx) => {
        return res(ctx.json(image1));
      })
    );

    const { findByText, getByTestId, getByText, queryByText } = renderWithTheme(
      wrapWithTableBody(
        <SelectLinodeRow
          handlePowerOff={handlePowerOff}
          handleSelection={handleSelection}
          linodeId={linode1.id}
          selected
          showPowerActions={false}
        />
      )
    );

    // Loading state should render
    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    getByText(linode1.label);
    getByText('Running');
    await findByText('Debian 10');
    await findByText('Linode 1 GB');
    await findByText('Newark, NJ');

    expect(queryByText('Power Off')).not.toBeInTheDocument();
  });
});
