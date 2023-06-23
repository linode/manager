import * as React from 'react';
import { waitFor } from '@testing-library/react';
import { linodeFactory } from 'src/factories/linodes';
import { rest, server } from 'src/mocks/testServer';
import { typeFactory } from 'src/factories/types';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { RescueDialog, Props } from './RescueDialog';
import { QueryClient } from 'react-query';

const standard = typeFactory.build({ id: 'g6-standard-1' });
const metal = typeFactory.build({ class: 'metal', id: 'g6-metal-alpha-2' });

const normalLinode = linodeFactory.build({ type: 'g6-standard-1' });
const metalLinode = linodeFactory.build({ type: 'g6-metal-alpha-2' });

const props: Props = {
  linodeId: normalLinode.id,
  onClose: jest.fn(),
  open: true,
};

describe('RescueDialog', () => {
  it('should render the rescue modal for a normal instance', async () => {
    server.use(
      rest.get(`*/linode/types/${standard.id}`, (_, res, ctx) => {
        return res(ctx.json(standard));
      }),
      rest.get(`*/linode/instances/${normalLinode.id}`, (_, res, ctx) => {
        return res(ctx.json(normalLinode));
      })
    );
    const { getByText, queryByTestId } = renderWithTheme(
      <RescueDialog {...props} />,
      {
        queryClient: new QueryClient(),
      }
    );

    expect(getByText(/Rescue Linode/)).toBeInTheDocument();

    await waitFor(() =>
      expect(queryByTestId('device-select')).toBeInTheDocument()
    );
  });

  it('should render a confirmation modal for a bare metal instance', async () => {
    server.use(
      rest.get(`*/linode/types/${metal.id}`, (_, res, ctx) => {
        return res(ctx.json(metal));
      }),
      rest.get(`*/linode/instances/${metalLinode.id}`, (_, res, ctx) => {
        return res(ctx.json(metalLinode));
      })
    );
    const { getByText, queryByTestId } = renderWithTheme(
      <RescueDialog {...props} linodeId={metalLinode.id} />,
      {
        queryClient: new QueryClient(),
      }
    );

    expect(getByText(/Rescue Linode/)).toBeInTheDocument();
    await waitFor(() => expect(queryByTestId('device-select')).toBeNull());
  });
});
