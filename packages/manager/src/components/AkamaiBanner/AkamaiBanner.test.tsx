import { Button } from '@linode/ui';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AkamaiBanner } from './AkamaiBanner';

import type { Flags } from 'src/featureFlags';

describe('AkamaiBanner', () => {
  it('should display text without a link', () => {
    const props = {
      text: 'Example text',
    };

    const { getByText, queryByRole } = renderWithTheme(
      <AkamaiBanner {...props} />
    );

    expect(getByText(props.text)).toBeVisible();

    expect(queryByRole('link')).not.toBeInTheDocument();
  });

  it('should display text and link', () => {
    const props = {
      link: { text: 'Link text', url: 'https://example.com/' },
      text: 'Example text',
    };

    const { getByRole, getByText } = renderWithTheme(
      <AkamaiBanner {...props} />
    );

    expect(getByText('Example text')).toBeVisible();

    const link = getByRole('link');
    expect(link).toHaveTextContent(props.link.text);
    expect(link).toHaveAttribute('href', props.link.url);
  });

  it('should display action button', async () => {
    const cb = vi.fn();
    const text = 'Test Button';
    const props = {
      action: <Button onClick={cb}>{text}</Button>,
      text: 'Example text',
    };

    const { getByRole, getByText } = renderWithTheme(
      <AkamaiBanner {...props} />
    );

    expect(getByText('Example text')).toBeVisible();

    const action = getByRole('button');
    expect(action).toHaveTextContent(text);
    await userEvent.click(action);
    expect(cb).toHaveBeenCalled();
  });

  it('pull banner label from LD', async () => {
    const props = {
      text: 'Example text',
    };

    const { findByText } = renderWithTheme(<AkamaiBanner {...props} />, {
      flags: { secureVmCopy: { bannerLabel: 'Banner Label' } } as Flags,
    });

    expect(await findByText('Banner Label')).toBeVisible();
  });
});
