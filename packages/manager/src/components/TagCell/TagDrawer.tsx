import { Drawer } from '@linode/ui';
import * as React from 'react';

import { NotFound } from '../NotFound';
import { TagCell } from './TagCell';

export interface TagDrawerProps {
  disabled?: boolean;
  entityLabel?: string;
  onClose: () => void;
  open: boolean;
  tags: string[];
  updateTags: (tags: string[]) => Promise<any>;
}

export const TagDrawer = (props: TagDrawerProps) => {
  const { disabled, entityLabel, onClose, open, tags, updateTags } = props;

  return (
    <Drawer
      NotFoundComponent={NotFound}
      onClose={onClose}
      open={open}
      title={'Tags' + (entityLabel ? ` (${entityLabel})` : '')}
    >
      <TagCell
        disabled={disabled}
        tags={tags}
        updateTags={updateTags}
        view="panel"
      />
    </Drawer>
  );
};
