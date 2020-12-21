import * as React from 'react';
import EntityHeader from 'src/components/EntityHeader';
import StackScriptActionMenu from './StackScriptPanel/StackScriptActionMenu_CMR';

import { StackScriptCategory } from './stackScriptUtils';

interface Props {
  stackScriptID: number;
  stackScriptUsername: string;
  stackScriptLabel: string;
  canModify: boolean;
  canAddLinodes: boolean;
  isPublic: boolean;
  // @todo: when we implement StackScripts pagination, we should remove "| string" in the type below.
  // Leaving this in as an escape hatch now, since there's a bunch of code in
  // /LandingPanel that uses different values for categories that we shouldn't
  // change until we're actually using it.
  category: StackScriptCategory | string;
  triggerDelete: (id: number, label: string) => void;
  triggerMakePublic: (id: number, label: string) => void;
}

type CombinedProps = Props;

const StackScriptDetailsHeader: React.FC<CombinedProps> = props => {
  const {
    stackScriptID,
    stackScriptUsername,
    stackScriptLabel,
    canModify,
    isPublic,
    category,
    canAddLinodes,
    triggerDelete,
    triggerMakePublic
  } = props;

  return (
    <EntityHeader
      title={stackScriptLabel}
      parentLink="/stackscripts"
      parentText="StackScripts"
      isSecondary
      actions={
        <StackScriptActionMenu
          stackScriptID={stackScriptID}
          stackScriptUsername={stackScriptUsername}
          stackScriptLabel={stackScriptLabel}
          triggerDelete={triggerDelete}
          triggerMakePublic={triggerMakePublic}
          canModify={canModify}
          canAddLinodes={canAddLinodes}
          isPublic={isPublic}
          category={category}
          isHeader={true}
        />
      }
    />
  );
};

export default StackScriptDetailsHeader;
