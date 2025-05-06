import * as React from 'react';

import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';

export const RolesTableActionMenu = () => {
  const assignRole = () => {
    // TODO - implement the assign role functionality
    // console.log('Assigning role...');
  };

  // This menu has evolved over time to where it isn't much of a menu at all, but rather a single action.
  return <InlineMenuAction actionText={'Assign Role'} onClick={assignRole} />;
};
