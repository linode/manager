import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithProviders } from '../utilities/testHelpers';
import { DelegatedUsersList } from './DelegatedUsersList';

const getVisibleEllipsis = (container: HTMLElement) =>
  container.querySelector('[data-slrtl-visible-ellipsis]');

describe('DelegatedUsersList', () => {
  it('renders comma-separated usernames when all fit', () => {
    const { container } = renderWithProviders(
      <DelegatedUsersList
        onViewAll={vi.fn()}
        users={['user-a', 'user-b', 'user-c']}
      />
    );

    expect(screen.getByText('user-a')).toBeVisible();
    expect(screen.getByText(', user-b')).toBeVisible();
    expect(screen.getByText(', user-c')).toBeVisible();
    expect(getVisibleEllipsis(container)).toBeNull();
  });

  it('shows the overflow pill and ellipsis when totalCount exceeds the render cap', () => {
    const users = Array.from({ length: 30 }, (_, index) => `user-${index + 1}`);

    const { container } = renderWithProviders(
      <DelegatedUsersList onViewAll={vi.fn()} users={users} />
    );

    expect(screen.getByText('+5')).toBeVisible();
    expect(getVisibleEllipsis(container)).toHaveTextContent(', ...');
  });

  it('calls onViewAll when the overflow pill is clicked', async () => {
    const onViewAll = vi.fn();
    const users = Array.from({ length: 30 }, (_, index) => `user-${index + 1}`);

    renderWithProviders(
      <DelegatedUsersList onViewAll={onViewAll} users={users} />
    );

    await userEvent.click(screen.getByText('+5'));

    expect(onViewAll).toHaveBeenCalledTimes(1);
  });

  it('shows the overflow pill and ellipsis when layout truncation occurs', () => {
    const users = Array.from({ length: 10 }, (_, index) => `user-${index + 1}`);

    const clientWidthDescriptor = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      'clientWidth'
    );
    const offsetWidthDescriptor = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      'offsetWidth'
    );

    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      get: () => 100,
    });
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      get: () => 40,
    });

    const { container } = renderWithProviders(
      <DelegatedUsersList onViewAll={vi.fn()} users={users} />
    );

    if (clientWidthDescriptor) {
      Object.defineProperty(
        HTMLElement.prototype,
        'clientWidth',
        clientWidthDescriptor
      );
    }
    if (offsetWidthDescriptor) {
      Object.defineProperty(
        HTMLElement.prototype,
        'offsetWidth',
        offsetWidthDescriptor
      );
    }

    expect(getVisibleEllipsis(container)).toHaveTextContent(', ...');

    const overflowPill = container.querySelector(
      '[data-slrtl-visible-ellipsis] + div'
    );
    expect(overflowPill).toHaveTextContent('+10');
  });
});
