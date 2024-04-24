import React from 'react';

import { Stack } from 'src/components/Stack';

import { StackScriptImages } from './StackScriptImages';
import { StackScriptSelection } from './StackScriptSelection';
import { UserDefinedFields } from './UserDefinedFields/UserDefinedFields';

export const StackScripts = () => {
  return (
    <Stack spacing={3}>
      <StackScriptSelection />
      <UserDefinedFields />
      <StackScriptImages />
    </Stack>
  );
};
