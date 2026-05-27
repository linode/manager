import { Chip } from '@linode/ui';
import React from 'react';

import type { ChipProps } from '@linode/ui';

export type LiveChatChipProps = Omit<ChipProps, 'label'>;

export const LiveChatChip = (props: LiveChatChipProps) => {
  return <Chip color="info" label="Live Chat" {...props} />;
};
