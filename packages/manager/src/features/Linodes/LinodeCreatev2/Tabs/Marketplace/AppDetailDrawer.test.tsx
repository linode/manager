import { userEvent } from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AppDetailDrawerv2 } from './AppDetailDrawer';

describe('AppDetailDrawer', () => {
  it('should render an app', () => {
    const { getByText } = renderWithTheme(
      <AppDetailDrawerv2 onClose={vi.fn()} open stackScriptId={401697} />
    );

    // Verify title renders
    expect(getByText('WordPress')).toBeVisible();

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
      <AppDetailDrawerv2 onClose={onClose} open={true} stackScriptId={1} />
    );

    await userEvent.click(getByLabelText('Close drawer'));

    expect(onClose).toHaveBeenCalled();
  });

  it('should not render if open is false', async () => {
    const { container } = renderWithTheme(
      <AppDetailDrawerv2 onClose={vi.fn()} open={false} stackScriptId={1} />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
