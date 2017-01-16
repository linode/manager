import React from 'react';

import { LinodeTabs } from '~/components/tabs';
import { StyleguideSection } from '~/styleguide/components';

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
              <LinodeTabs
                tabs={tabs}
                selected={tabs[0]}
              />
            </div>
          </div>
        </div>

        <div className="StyleguideSubSection row">
          <div className="col-sm-12">
            <div className="StyleguideSubSection-header">
              <h3>Vertical Navigation</h3>
            </div>
          </div>
        </div>
      </div>
    </StyleguideSection>
  );
}
