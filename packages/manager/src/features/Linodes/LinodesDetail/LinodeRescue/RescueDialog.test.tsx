import { waitFor } from '@testing-library/react';
import * as React from 'react';
import { QueryClient } from 'react-query';

import { linodeFactory } from 'src/factories/linodes';
import { typeFactory } from 'src/factories/types';
import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { Props, RescueDialog } from './RescueDialog';

const standard = typeFactory.build({ id: 'g6-standard-1' });
const metal = typeFactory.build({ class: 'metal', id: 'g6-metal-alpha-2' });

const normalLinode = linodeFactory.build({ type: 'g6-standard-1' });
const metalLinode = linodeFactory.build({ type: 'g6-metal-alpha-2' });

const props: Props = {
  linodeId: normalLinode.id,
  onClose: vi.fn(),
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
