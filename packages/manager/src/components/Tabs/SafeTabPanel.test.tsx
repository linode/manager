import { render } from '@testing-library/react';
import * as React from 'react';

import { Tabs } from 'src/components/Tabs/Tabs';

import { SafeTabPanel } from './SafeTabPanel';

vi.mock('@reach/tabs', async () => {
  const actual = await vi.importActual<any>('@reach/tabs');
  return {
    ...actual,
    useTabsContext: vi.fn(() => ({ selectedIndex: 0 })),
  };
});

describe('SafeTabPanel', () => {
  it('renders children when the tab is selected', () => {
    const { getByText } = render(
      <Tabs>
        <SafeTabPanel index={0}>
          <div>Child Content</div>
        </SafeTabPanel>
      </Tabs>
    );

    expect(getByText('Child Content')).toBeInTheDocument();
  });

  it('does not render children when the tab is not selected', () => {
    const { queryByText } = render(
      <Tabs>
        <SafeTabPanel index={1}>
          <div>Child Content</div>
        </SafeTabPanel>
      </Tabs>
    );

    expect(queryByText('Child Content')).toBeNull();
  });

  it('renders empty when the index is null', () => {
    const { container } = render(
      <Tabs>
        <SafeTabPanel index={null}>
          <div>Child Content</div>
        </SafeTabPanel>
      </Tabs>
    );

    expect(container.firstChild?.firstChild).toBeEmptyDOMElement();
  });
});
