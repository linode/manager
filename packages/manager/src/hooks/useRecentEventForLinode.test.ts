import { renderHook } from '@testing-library/react-hooks';

import { eventFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { rest, server } from 'src/mocks/testServer';
import { wrapWithTheme } from 'src/utilities/testHelpers';

import { useRecentEventForLinode } from './useRecentEventForLinode';

describe('recentEventForLinode selector', () => {
  beforeEach(() => {
    server.use(
      rest.get('*/events?page_size=25', (_, res, ctx) => {
        return res(
          ctx.json(
            makeResourcePage([
              eventFactory.build({
                action: 'lke_node_create',
                entity: { id: 999, label: 'linode-1', type: 'linode' },
                message:
                  'Rebooting this thing and showing an extremely long event message for no discernible reason other than the fairly obvious reason that we want to do some testing of whether or not these messages wrap.',
                percent_complete: 15,
              }),
            ])
          )
        );
      }),
      rest.post('*/events/*', (_, res, ctx) => {
        return res(ctx.json({}));
      })
    );
  });

  it('returns the most recent event relevant to a linode', async () => {
    const { result, waitFor } = renderHook(() => useRecentEventForLinode(999), {
      wrapper: wrapWithTheme,
    });

    await waitFor(() => expect(result.current?.action).toBe('lke_node_create'));
  });

  it('returns undefined when there are no relevant events', async () => {
    const { result, waitFor } = renderHook(() => useRecentEventForLinode(1), {
      wrapper: wrapWithTheme,
    });

    await waitFor(() => expect(result.current?.action).toBe(undefined));
  });
});
