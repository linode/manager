import React, { useState } from 'react';

import { Stack } from 'src/components/Stack';

import { StackScriptImages } from '../StackScripts/StackScriptImages';
import { UserDefinedFields } from '../StackScripts/UserDefinedFields/UserDefinedFields';
import { AppDetailDrawerv2 } from './AppDetailDrawer';
import { AppSelect } from './AppSelect';

export const Marketplace = () => {
  const [drawerStackScriptId, setDrawerStackScriptId] = useState<number>();

  const onOpenDetailsDrawer = (stackscriptId: number) => {
    setDrawerStackScriptId(stackscriptId);
  };

  return (
    <Stack spacing={2}>
      <AppSelect onOpenDetailsDrawer={onOpenDetailsDrawer} />
      <UserDefinedFields onOpenDetailsDrawer={onOpenDetailsDrawer} />
      <StackScriptImages />
      <AppDetailDrawerv2
        onClose={() => setDrawerStackScriptId(undefined)}
        open={drawerStackScriptId !== undefined}
        stackScriptId={drawerStackScriptId}
      />
    </Stack>
  );
};
