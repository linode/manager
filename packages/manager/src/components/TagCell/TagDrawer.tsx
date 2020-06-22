import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Drawer from 'src/components/Drawer';
import Tag from 'src/components/Tag';

const useStyles = makeStyles((theme: Theme) => ({ tag: {} }));

interface Props {
  entityLabel: string;
  tags: string[];
  open: boolean;
  deleteTag: (tag: string) => void;
  onClose: () => void;
}

export type CombinedProps = Props;

export const TagDrawer: React.FC<Props> = props => {
  const { entityLabel, deleteTag, onClose, open, tags } = props;
  const classes = useStyles();
  return (
    <Drawer open={open} title={`Tags (${entityLabel})`} onClose={onClose}>
      {tags.map(thisTag => (
        <Tag
          className={classes.tag}
          key={`tag-item-${thisTag}`}
          colorVariant="lightBlue"
          label={thisTag}
          onDelete={() => deleteTag(thisTag)}
        />
      ))}
    </Drawer>
  );
};

export default TagDrawer;
