import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Tab } from './Tab'; // Adjust the import path based on your project structure
import { TabList } from './TabList';
import { Tabs } from './Tabs'; // Adjust the import path based on your project structure
import { wrapWithTheme } from '../../utilities/testHelpers';

describe('TabList component', () => {
  it('renders TabList correctly', () => {
    const { container } = render(
      wrapWithTheme(
        <Tabs>
          <TabList />
        </Tabs>,
        {
          MemoryRouter: {
            initialEntries: [{ pathname: '/tab-1' }],
          },
        }
      )
    );

    expect(container).toMatchSnapshot();
  });

  it('handles className prop', () => {
    const { container } = render(
      wrapWithTheme(
        <Tabs>
          <TabList className="custom-class" />
        </Tabs>,
        {
          MemoryRouter: {
            initialEntries: [{ pathname: '/tab-1' }],
          },
        }
      )
    );

    const tabListElement = container.querySelector('.custom-class');
    expect(tabListElement).toBeInTheDocument();
  });

  it('handles click events on tabs', () => {
    const { getByText } = render(
      wrapWithTheme(
        <Tabs>
          <TabList>
            <Tab>Tab 1</Tab>
            <Tab>Tab 2</Tab>
          </TabList>
        </Tabs>,
        {
          MemoryRouter: {
            initialEntries: [{ pathname: '/tab-1' }],
          },
        }
      )
    );

    const tab1 = getByText('Tab 1');
    fireEvent.click(tab1);

    expect(tab1).toHaveAttribute('aria-selected', 'true');
  });
});
