import { Stack } from '@linode/ui';
import React, { useState } from 'react';

import { Region } from '../../Region';
import { StackScriptImages } from '../StackScripts/StackScriptImages';
import { UserDefinedFields } from '../StackScripts/UserDefinedFields/UserDefinedFields';
import { AppDetailDrawer } from './AppDetailDrawer';
import { AppSelect } from './AppSelect';

export const Marketplace = () => {
  const [drawerStackScriptId, setDrawerStackScriptId] = useState<number>();

  const onOpenDetailsDrawer = (stackscriptId: number) => {
    setDrawerStackScriptId(stackscriptId);
  };

  return (
    <Stack data-testid="one-click-apps-container" spacing={2}>
      <AppSelect onOpenDetailsDrawer={onOpenDetailsDrawer} />
      <UserDefinedFields onOpenDetailsDrawer={onOpenDetailsDrawer} />
      <Region />
      <StackScriptImages />
      <AppDetailDrawer
        onClose={() => setDrawerStackScriptId(undefined)}
        open={drawerStackScriptId !== undefined}
        stackScriptId={drawerStackScriptId}
      />
    </Stack>
  );
};
