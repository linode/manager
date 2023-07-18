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
          ctx.json(linodeFactory.build({ backups: { enabled: true }, id: 1 }))
        );
      })
    );

    const { getByText } = renderWithTheme(
      <CaptureSnapshot isReadOnly={false} linodeId={1} />
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
          ctx.json(linodeFactory.build({ backups: { enabled: true }, id: 1 }))
        );
      })
    );

    const { getByLabelText, getByText } = renderWithTheme(
      <CaptureSnapshot isReadOnly={false} linodeId={1} />
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
