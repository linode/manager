import { Tabs as ReachTabs } from '@reach/tabs';
import * as React from 'react';

export const Tabs = (props: React.ComponentProps<typeof ReachTabs>) => {
  const id = React.useId();
  return <ReachTabs {...props} id={id} />;
};
