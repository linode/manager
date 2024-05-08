import React from 'react';

import { Stack } from 'src/components/Stack';

import { StackScriptImages } from '../StackScripts/StackScriptImages';
import { UserDefinedFields } from '../StackScripts/UserDefinedFields/UserDefinedFields';
import { AppSelect } from './AppSelect';

export const Marketplace = () => {
  return (
    <Stack spacing={2}>
      <AppSelect />
      <UserDefinedFields />
      <StackScriptImages />
    </Stack>
  );
};
