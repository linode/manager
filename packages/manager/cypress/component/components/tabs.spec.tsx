import { createRoute } from '@tanstack/react-router';
import * as React from 'react';
import { ui } from 'support/ui';
import { checkComponentA11y } from 'support/util/accessibility';
import { componentTests, visualTests } from 'support/util/components';

import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { useTabs } from 'src/hooks/useTabs';

const CustomTabs = () => {
  const { handleTabChange, tabIndex, tabs } = useTabs([
    {
      title: 'Tab 1',
      to: '/tab-1',
    },
    {
      title: 'Tab 2',
      to: '/tab-2',
    },
    {
      title: 'Tab 3',
      to: '/tab-3',
    },
  ]);

  return (
    <Tabs index={tabIndex} onChange={handleTabChange}>
      <TanStackTabLinkList tabs={tabs} />
      <React.Suspense fallback={<SuspenseLoader />}>
        <TabPanels>
          <SafeTabPanel index={0}>
            <div>Tab 1 content</div>
          </SafeTabPanel>
          <SafeTabPanel index={1}>
            <div>Tab 2 content</div>
          </SafeTabPanel>
          <SafeTabPanel index={2}>
            <div>Tab 3 content</div>
          </SafeTabPanel>
        </TabPanels>
      </React.Suspense>
    </Tabs>
  );
};

componentTests(
  'Tabs',
  (mount) => {
    describe('Tabs', () => {
      it('should render all tabs and default to the first tab', () => {
        mount(<CustomTabs />);
        ui.tabList
          .findTabByTitle('Tab 1')
          .should('exist')
          .should('have.attr', 'aria-selected', 'true');
        ui.tabList
          .findTabByTitle('Tab 2')
          .should('exist')
          .should('have.attr', 'aria-selected', 'false');
        ui.tabList
          .findTabByTitle('Tab 3')
          .should('exist')
          .should('have.attr', 'aria-selected', 'false');

        cy.get('[data-reach-tab-panels]').should('have.text', 'Tab 1 content');
      });

      it('should render the correct tab content when a tab is clicked', () => {
        mount(<CustomTabs />);

        ui.tabList.findTabByTitle('Tab 2').click();
        ui.tabList
          .findTabByTitle('Tab 2')
          .should('exist')
          .should('have.attr', 'aria-selected', 'true');
        cy.get('[data-reach-tab-panels]').should('have.text', 'Tab 2 content');

        ui.tabList.findTabByTitle('Tab 3').click();
        ui.tabList
          .findTabByTitle('Tab 3')
          .should('exist')
          .should('have.attr', 'aria-selected', 'true');
        cy.get('[data-reach-tab-panels]').should('have.text', 'Tab 3 content');
      });

      it('should handle keyboard navigation', () => {
        mount(<CustomTabs />);

        ui.tabList.findTabByTitle('Tab 1').focus();
        cy.get('body').type('{rightArrow}');
        ui.tabList
          .findTabByTitle('Tab 2')
          .should('exist')
          .should('have.attr', 'aria-selected', 'true');
        cy.get('[data-reach-tab-panels]').should('have.text', 'Tab 2 content');

        cy.get('body').type('{rightArrow}');
        ui.tabList
          .findTabByTitle('Tab 3')
          .should('exist')
          .should('have.attr', 'aria-selected', 'true');
        cy.get('[data-reach-tab-panels]').should('have.text', 'Tab 3 content');

        cy.get('body').type('{leftArrow}');
        ui.tabList
          .findTabByTitle('Tab 2')
          .should('exist')
          .should('have.attr', 'aria-selected', 'true');
        cy.get('[data-reach-tab-panels]').should('have.text', 'Tab 2 content');

        cy.get('body').type('{leftArrow}');
        ui.tabList
          .findTabByTitle('Tab 1')
          .should('exist')
          .should('have.attr', 'aria-selected', 'true');
        cy.get('[data-reach-tab-panels]').should('have.text', 'Tab 1 content');
      });
    });
  },
  {
    routeTree: (parentRoute) => [
      createRoute({
        getParentRoute: () => parentRoute,
        path: '/tab-1',
      }),
      createRoute({
        getParentRoute: () => parentRoute,
        path: '/tab-2',
      }),
      createRoute({
        getParentRoute: () => parentRoute,
        path: '/tab-3',
      }),
    ],
    useTanstackRouter: true,
  }
);

visualTests(
  (mount) => {
    describe('Accessibility checks', () => {
      it('passes aXe check when menu is closed without an item selected', () => {
        mount(<CustomTabs />);
        checkComponentA11y();
      });
    });
  },
  {
    useTanstackRouter: true,
  }
);
