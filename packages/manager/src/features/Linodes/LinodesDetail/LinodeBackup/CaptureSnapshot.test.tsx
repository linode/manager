import { linodeFactory } from '@linode/utilities';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CaptureSnapshot } from './CaptureSnapshot';

describe('CaptureSnapshot', () => {
  it('renders heading and copy', async () => {
    server.use(
      http.get('*/linode/instances/1', () => {
        return HttpResponse.json(
          linodeFactory.build({ backups: { enabled: true }, id: 1 })
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
      http.get('*/linode/instances/1', () => {
        return HttpResponse.json(
          linodeFactory.build({ backups: { enabled: true }, id: 1 })
        );
      })
    );

    const { getByLabelText, getByText } = renderWithTheme(
      <CaptureSnapshot isReadOnly={false} linodeId={1} />
    );

    await userEvent.type(getByLabelText('Name Snapshot'), 'my-linode-snapshot');

    await userEvent.click(getByText('Take Snapshot'));

    expect(
      getByText(
        /Taking a snapshot will back up your Linode in its current state, overriding your previous snapshot. Are you sure?/
      )
    ).toBeVisible();
  });
});
