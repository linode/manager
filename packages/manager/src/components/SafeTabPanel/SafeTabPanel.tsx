import * as React from 'react';

interface SafeTabPanelProps {
  children: React.ReactNode | null;
  index: number | null;
  value: number;
}

/**
 * SafeTabPanel only renders its children when it is currently selected. This is helpful when a
 * child component of SafeTabPanel requests data when it is mounted. In this case, we may want to
 * avoid mounting the component until the tab is actually selected/visible.
 */
export const SafeTabPanel = (props: SafeTabPanelProps) => {
  const { index, value, children } = props;

  const isSelected = value === index;

  if (!isSelected) {
    return null;
  }

  return <>{children}</>;
};
