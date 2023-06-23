import * as React from 'react';
import Drawer from 'src/components/Drawer';
import { TagsPanel } from 'src/components/TagsPanel/TagsPanel';

export type OpenTagDrawer = (id: number, label: string, tags: string[]) => void;

export interface TagDrawerProps {
  entityLabel: string;
  tags: string[];
  open: boolean;
  entityID: number;
  updateTags: (tags: string[]) => Promise<any>;
  onClose: () => void;
}

const TagDrawer = (props: TagDrawerProps) => {
  const { entityLabel, onClose, open, tags, updateTags } = props;

  return (
    <Drawer open={open} title={`Tags (${entityLabel})`} onClose={onClose}>
      <TagsPanel tags={tags} updateTags={updateTags} />
    </Drawer>
  );
};

export { TagDrawer };
