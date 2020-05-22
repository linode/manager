import * as React from 'react';
import TabPanel from 'src/components/core/ReachTabPanel';
import { useTabsContext } from '@reach/tabs';

const SafeTabPanel: React.FC<{ index: number | null }> = props => {
  const { index, ...tabPanelProps } = props;

  const { selectedIndex } = useTabsContext();
  const isSelected = selectedIndex === index;

  return (
    <TabPanel {...tabPanelProps}>{isSelected ? props.children : null}</TabPanel>
  );
};

export default SafeTabPanel;
