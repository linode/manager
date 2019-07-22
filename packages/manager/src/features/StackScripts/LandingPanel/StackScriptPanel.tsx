import * as React from 'react';

import TabbedPanel from 'src/components/TabbedPanel';

import PanelContent from './PanelContent';

const StackScriptPanel = (props: {}) => {
  const tabs = [
    {
      title: 'My StackScripts',
      render: () => {
        return <PanelContent type="own" key={0} />;
      }
    },
    {
      title: 'Linode StackScripts',
      render: () => {
        return <PanelContent type="linode" key={1} />;
      }
    },
    {
      title: 'Community StackScripts',
      render: () => {
        return <PanelContent type="community" key={2} />;
      }
    }
  ];

  return <TabbedPanel header="" tabs={tabs} />;
};

export default StackScriptPanel;
