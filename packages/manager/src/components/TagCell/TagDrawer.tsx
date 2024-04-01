import * as React from 'react';

import { Drawer } from 'src/components/Drawer';
import { TagsPanel } from 'src/components/TagsPanel/TagsPanel';

export type OpenTagDrawer = (id: number, label: string, tags: string[]) => void;

export interface TagDrawerProps {
  disabled?: boolean;
  entityLabel: string;
  onClose: () => void;
  open: boolean;
  tags: string[];
  updateTags: (tags: string[]) => Promise<any>;
}

const TagDrawer = (props: TagDrawerProps) => {
  const { disabled, entityLabel, onClose, open, tags, updateTags } = props;

  return (
    <Drawer onClose={onClose} open={open} title={`Tags (${entityLabel})`}>
      <TagsPanel disabled={disabled} tags={tags} updateTags={updateTags} />
    </Drawer>
  );
};

export { TagDrawer };
