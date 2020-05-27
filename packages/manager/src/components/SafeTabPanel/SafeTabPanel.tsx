import * as React from 'react';
import TabPanel from 'src/components/core/ReachTabPanel';
import { useTabsContext } from '@reach/tabs';

/**
 * SafeTabPanel only renders its children when it is currently selected. This is helpful when a
 * child component of SafeTabPanel requests data when it is mounted. In this case, we may want to
 * avoid mounting the component until the tab is actually selected/visible.
 */
const SafeTabPanel: React.FC<{ index: number | null }> = props => {
  const { index, ...tabPanelProps } = props;

  const { selectedIndex } = useTabsContext();
  const isSelected = selectedIndex === index;

  return (
    <TabPanel {...tabPanelProps}>{isSelected ? props.children : null}</TabPanel>
  );
};

export default SafeTabPanel;
