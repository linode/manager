import * as React from 'react';

import { Drawer } from 'src/components/Drawer';

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
