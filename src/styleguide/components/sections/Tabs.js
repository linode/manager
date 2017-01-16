import React from 'react';
import { Link } from 'react-router';

import { Tabs } from '~/components/tabs';
import { StyleguideSection } from '~/styleguide/components';

export default function StyleguideTabs() {
  const tabs = [
    { name: 'Design' },
    { name: 'Development' },
    { name: 'Support' },
  ];

  return (
    <StyleguideSection name="tabs" title="Tabs">
      <div className="StyleguideTabs col-sm-12">
        <div className="StyleguideSubSection row">
          <div className="col-sm-12">
            <div className="StyleguideSubSection-header">
              <p>Tabs are used for switching views within the same context.
                For tabs used as part of navigation,
                see <Link to="/styleguide/navigation">Navigation</Link>.
              </p>
              <p>

              </p>
            </div>
            <div className="StyleguideTabs-example">
              <h3>Example</h3>
              <Tabs
                tabs={tabs}
                selected={tabs[0]}
                className="sub-tabs"
              />
            </div>
          </div>
        </div>
      </div>
    </StyleguideSection>
  );
}
