import { userEvent } from '@testing-library/user-event';
import React from 'react';

import { stackScriptFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AppDetailDrawer } from './AppDetailDrawer';

describe('AppDetailDrawer', () => {
  it('should render an app', async () => {
    const stackscript = stackScriptFactory.build({ id: 401697 });

    server.use(
      http.get('*/v4/linode/stackscripts', () => {
        return HttpResponse.json(makeResourcePage([stackscript]));
      })
    );

    const { findByText, getByText } = renderWithTheme(
      <AppDetailDrawer onClose={vi.fn()} open stackScriptId={401697} />
    );

    // Verify title renders
    expect(await findByText(stackscript.label)).toBeVisible();

    // Verify description renders
    expect(
      getByText(
        'Flexible, open source content management system (CMS) for content-focused websites of any kind.'
      )
    ).toBeVisible();

    // Verify website renders with link
    const website = getByText('https://wordpress.org/');
    expect(website).toBeVisible();
    expect(website).toHaveAttribute('href', 'https://wordpress.org/');

    // Verify guide renders with link
    const guide = getByText('Deploy WordPress through the Linode Marketplace');
    expect(guide).toBeVisible();
    expect(guide).toHaveAttribute(
      'href',
      'https://www.linode.com/docs/products/tools/marketplace/guides/wordpress/'
    );
  });

  it('should call onClose if the close button is clicked', async () => {
    const onClose = vi.fn();
    const { getByLabelText } = renderWithTheme(
      <AppDetailDrawer onClose={onClose} open={true} stackScriptId={1} />
    );

    await userEvent.click(getByLabelText('Close drawer'));

    expect(onClose).toHaveBeenCalled();
  });

  it('should not render if open is false', async () => {
    const { container } = renderWithTheme(
      <AppDetailDrawer onClose={vi.fn()} open={false} stackScriptId={1} />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
