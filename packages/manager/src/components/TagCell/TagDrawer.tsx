import * as React from 'react';

import { Drawer } from 'src/components/Drawer';

import { TagCell } from './TagCell';

export type OpenTagDrawer = (id: number, label: string, tags: string[]) => void;

export interface TagDrawerProps {
  entityID: number;
  entityLabel: string;
  onClose: () => void;
  open: boolean;
  tags: string[];
  updateTags: (tags: string[]) => Promise<any>;
}

const TagDrawer = (props: TagDrawerProps) => {
  const { entityLabel, onClose, open, tags, updateTags } = props;

  return (
    <Drawer onClose={onClose} open={open} title={`Tags (${entityLabel})`}>
      <TagCell tags={tags} updateTags={updateTags} />
    </Drawer>
  );
};

export { TagDrawer };
