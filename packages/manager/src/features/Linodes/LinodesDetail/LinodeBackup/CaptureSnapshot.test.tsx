import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { linodeFactory } from 'src/factories/linodes';
import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { CaptureSnapshot } from './CaptureSnapshot';

describe('CaptureSnapshot', () => {
  it('renders heading and copy', async () => {
    server.use(
      rest.get('*/linode/instances/1', (req, res, ctx) => {
        return res(
          ctx.json(linodeFactory.build({ id: 1, backups: { enabled: true } }))
        );
      })
    );

    const { getByText } = renderWithTheme(
      <CaptureSnapshot linodeId={1} isReadOnly={false} />
    );

    getByText('Manual Snapshot');
    getByText(
      /You can make a manual backup of your Linode by taking a snapshot./
    );
  });
  it('a confirmation dialog should open when you attempt to take a snapshot', async () => {
    server.use(
      rest.get('*/linode/instances/1', (req, res, ctx) => {
        return res(
          ctx.json(linodeFactory.build({ id: 1, backups: { enabled: true } }))
        );
      })
    );

    const { getByLabelText, getByText } = renderWithTheme(
      <CaptureSnapshot linodeId={1} isReadOnly={false} />
    );

    userEvent.type(getByLabelText('Name Snapshot'), 'my-linode-snapshot');

    userEvent.click(getByText('Take Snapshot'));

    expect(
      getByText(
        /Taking a snapshot will back up your Linode in its current state, overriding your previous snapshot. Are you sure?/
      )
    ).toBeVisible();
  });
});
