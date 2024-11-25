import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { wrapWithTheme } from '../../utilities/testHelpers';
import { TabLinkList } from './TabLinkList';
import { Tabs } from './Tabs';

import type { TabProps } from './TabLinkList';

describe('TabLinkList', () => {
  const tabs: TabProps[] = [
    { routeName: '/tab-1', title: 'Tab 1' },
    { routeName: '/tab-2', title: 'Tab 2' },
    { routeName: '/tab-3', title: 'Tab 3' },
  ];

  it('renders TabLinkList with links when noLink is not provided', () => {
    const { getAllByRole } = render(
      wrapWithTheme(
        <Tabs>
          <TabLinkList tabs={tabs} />
        </Tabs>,
        {
          MemoryRouter: {
            initialEntries: [{ pathname: '/tab-1' }],
          },
        }
      )
    );

    const tabLinks = getAllByRole('tab');
    expect(tabLinks).toHaveLength(tabs.length);
  });

  it('renders TabLinkList without links when noLink is provided', () => {
    const { getAllByRole } = render(
      wrapWithTheme(
        <Tabs>
          <TabLinkList noLink tabs={tabs} />
        </Tabs>,
        {
          MemoryRouter: {
            initialEntries: [{ pathname: '/tab-1' }],
          },
        }
      )
    );

    const tabLinks = getAllByRole('tab');
    expect(
      tabLinks.forEach((tabLink) => expect(tabLink).not.toHaveAttribute('href'))
    );
  });

  it('renders TabLinkList with the correct tab titles', () => {
    const { getByText } = render(
      wrapWithTheme(
        <Tabs>
          <TabLinkList tabs={tabs} />
        </Tabs>,
        {
          MemoryRouter: {
            initialEntries: [{ pathname: '/tab-1' }],
          },
        }
      )
    );

    tabs.forEach((tab) => {
      const tabElement = getByText(tab.title);
      expect(tabElement).toBeInTheDocument();
    });
  });
});
