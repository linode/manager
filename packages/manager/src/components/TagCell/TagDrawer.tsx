import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Drawer from 'src/components/Drawer';
import Notice from 'src/components/Notice';
import Tag from 'src/components/Tag/Tag_CMR';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import AddTag from './AddTag';

const useStyles = makeStyles((theme: Theme) => ({
  addTag: {
    marginTop: theme.spacing()
  },
  tag: {}
}));

export type OpenTagDrawer = (id: number, label: string, tags: string[]) => void;

interface Props {
  entityLabel: string;
  tags: string[];
  open: boolean;
  addTag: (newTag: string) => Promise<any>;
  deleteTag: (tag: string) => Promise<any>;
  onClose: () => void;
}

export interface TagDrawerProps {
  label: string;
  tags: string[];
  open: boolean;
  entityID: number;
}

export type CombinedProps = Props;

export const TagDrawer: React.FC<Props> = props => {
  const { addTag, entityLabel, deleteTag, onClose, open, tags } = props;
  // @todo the new tag component should have a loading state for when a tag is being deleted
  // const [loadingTag, setLoadingTag] = React.useState<string>('');
  const [tagError, setTagError] = React.useState<string | undefined>();

  const classes = useStyles();

  React.useEffect(() => {
    if (open) {
      setTagError(undefined);
    }
  }, [open]);

  const _addTag = (tag: string) => {
    setTagError(undefined);
    addTag(tag).catch(e =>
      setTagError(getAPIErrorOrDefault(e, 'Error adding tag.')[0].reason)
    );
  };

  const _deleteTag = (tag: string) => {
    setTagError(undefined);
    // setLoadingTag(tag);
    deleteTag(tag).catch(e =>
      setTagError(getAPIErrorOrDefault(e, 'Error deleting tag.')[0].reason)
    );
  };

  return (
    <Drawer open={open} title={`Tags (${entityLabel})`} onClose={onClose}>
      {tagError && <Notice error text={tagError} />}
      {tags.map(thisTag => (
        <Tag
          className={classes.tag}
          key={`tag-item-${thisTag}`}
          colorVariant="lightBlue"
          label={thisTag}
          onDelete={() => _deleteTag(thisTag)}
        />
      ))}
      <div className={classes.addTag}>
        <AddTag tags={tags} addTag={_addTag} label={'Add a tag'} />
      </div>
    </Drawer>
  );
};

export default TagDrawer;
