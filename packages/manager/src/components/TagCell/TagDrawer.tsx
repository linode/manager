import * as React from 'react';
import Drawer from 'src/components/Drawer';
import TagsPanel from '../TagsPanel';

export type OpenTagDrawer = (id: number, label: string, tags: string[]) => void;

interface Props {
  entityLabel: string;
  tags: string[];
  open: boolean;
  updateTags: (tags: string[]) => Promise<any>;
  onClose: () => void;
}

export interface TagDrawerProps {
  label: string;
  tags: string[];
  open: boolean;
  entityID: number;
}

export type CombinedProps = Props;

export const TagDrawer: React.FC<Props> = (props) => {
  const { updateTags, entityLabel, onClose, open, tags } = props;

  return (
    <Drawer open={open} title={`Tags (${entityLabel})`} onClose={onClose}>
      <TagsPanel tags={tags} updateTags={updateTags} />
    </Drawer>
  );
};

export default TagDrawer;
