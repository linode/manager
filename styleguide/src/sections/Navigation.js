import React from 'react';

import { Tabs } from 'linode-components/tabs';
import { VerticalNav, VerticalNavSection } from 'linode-components/navigation';
import { StyleguideSection } from '../components';

export default function Navigation() {
  const tabs = [
    { name: 'Dashboard' },
    { name: 'Networking' },
    { name: 'Rebuild' },
  ];

  return (
    <StyleguideSection name="navigation" title="Navigation">
      <div className="StyleguideNavigation col-sm-12">
        <div className="StyleguideSubSection row">
          <div className="col-sm-12">
            <div className="StyleguideSubSection-header">
              <h3>Horizontal Navigation</h3>
              <p>
                Horizontal navigation switches between different sections on a page,
                and is commonly represented with tabs.
              </p>
            </div>
            <div>
              <h3>Example</h3>
              <Tabs
                tabs={tabs}
                selected={0}
              />
            </div>
          </div>
        </div>

        <div className="StyleguideSubSection row">
          <div className="col-sm-12">
            <div className="StyleguideSubSection-header">
              <h3>Vertical Navigation</h3>
              <p>
                Vertical navigation switches between different sections or pages,
                and is represented with a list.  Furthermore sections are grouped
                into similar categories.
              </p>
              <VerticalNav>
                <VerticalNavSection
                  title="Group 1"
                  path="/styleguide/navigation"
                  navItems={[
                    { label: 'Group 1 Nav Item 1', href: '/styleguide' },
                    { label: 'Group 1 Nav Item 2', href: '/styleguide' },
                    { label: 'Group 1 Nav Item 3', href: '/styleguide' },
                    { label: 'Group 1 Nav Item 4', href: '/styleguide' },
                    { label: 'Group 1 Nav Item 5', href: '/styleguide' },
                    { label: 'Group 1 Nav Item 6', href: '/styleguide' },
                  ]}
                />
                <VerticalNavSection
                  title="Group 2"
                  path="/styleguide/navigation"
                  navItems={[
                    { label: 'Group 2 Nav Item 1', href: '/styleguide' },
                    { label: 'Group 2 Nav Item 2', href: '/styleguide' },
                    { label: 'Group 2 Nav Item 3', href: '/styleguide' },
                    { label: 'Group 2 Nav Item 4', href: '/styleguide' },
                  ]}
                />
              </VerticalNav>
            </div>
          </div>
        </div>
      </div>
    </StyleguideSection>
  );
}
