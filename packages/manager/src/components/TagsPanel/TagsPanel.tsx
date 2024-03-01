import * as React from 'react';

import {
  StyledPlusIcon,
  StyledTagButton,
} from 'src/components/Button/StyledTagButton';
import { Tag } from 'src/components/Tag/Tag';
import { Typography } from 'src/components/Typography';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import { useAtomic } from 'src/utilities/useAtomic';

import { AddTag } from '../TagCell/AddTag';
import { useStyles } from './TagsPanel.styles';

export interface TagsPanelProps {
  /**
   * If true, the input will be disabled and no tags can be added or removed.
   */
  disabled?: boolean;
  /**
   * The tags to display.
   */
  tags: string[];
  /**
   * Callback fired when the tags are updated.
   */
  updateTags: (tags: string[]) => Promise<any>;
}

export const TagsPanel = (props: TagsPanelProps) => {
  const { classes, cx } = useStyles();
  const { disabled, tags } = props;

  const [tagError, setTagError] = React.useState<string>('');
  const [isCreatingTag, setIsCreatingTag] = React.useState(false);
  const [deletingTags, setDeletingTags] = React.useState(
    () => new Set<string>()
  );

  const updateTagsAtomic = useAtomic(tags, props.updateTags);

  React.useEffect(() => {
    if (isCreatingTag) {
      setTagError('');
    }
  }, [isCreatingTag]);

  const toggleTagInput = () => {
    if (!disabled) {
      setIsCreatingTag((prev) => !prev);
    }
  };

  const handleDeleteTag = (label: string) => {
    setDeletingTags((prev) => new Set(prev.add(label)));
    updateTagsAtomic((tags) => tags.filter((tag) => tag != label))
      .then(() => {
        setTagError('');
      })
      .catch((e) => {
        const tagError = getErrorStringOrDefault(e, 'Error while deleting tag');
        setTagError(tagError);
      })
      .finally(() => {
        setDeletingTags((prev) => (prev.delete(label), new Set(prev)));
      });
  };

  const handleCreateTag = async (tag: string) => {
    const tagExists = (tag: string) => {
      return tags.some((el) => {
        return el === tag;
      });
    };

    if (tag.length < 3 || tag.length > 50) {
      setTagError(`Tag "${tag}" length must be 3-50 characters`);
    } else if (tagExists(tag)) {
      setTagError(`Tag "${tag}" is a duplicate`);
    } else {
      setTagError('');
      try {
        await updateTagsAtomic((tags) => [...tags, tag].sort());
      } catch (e) {
        const tagError = getErrorStringOrDefault(e, 'Error while creating tag');
        setTagError(tagError);
      }
    }
  };

  return (
    <>
      {isCreatingTag ? (
        <AddTag
          addTag={handleCreateTag}
          existingTags={tags}
          onClose={toggleTagInput}
        />
      ) : (
        <div
          className={cx({
            [classes.addButtonWrapper]: true,
            [classes.hasError]: tagError.length > 0,
          })}
        >
          <StyledTagButton
            buttonType="outlined"
            disabled={disabled}
            endIcon={<StyledPlusIcon disabled={disabled} />}
            onClick={toggleTagInput}
            sx={{ height: 34 }}
          >
            Add a tag
          </StyledTagButton>
        </div>
      )}
      <div className={classes.tagsPanelItemWrapper}>
        {tags.map((thisTag) => {
          return (
            <Tag
              className={cx({
                [classes.loading]: deletingTags.has(thisTag),
                [classes.tag]: true,
              })}
              colorVariant="lightBlue"
              key={`tag-item-${thisTag}`}
              label={thisTag}
              maxLength={30}
              onDelete={disabled ? undefined : () => handleDeleteTag(thisTag)}
            />
          );
        })}
        {tagError.length > 0 && (
          <Typography className={classes.errorNotice}>{tagError}</Typography>
        )}
      </div>
    </>
  );
};
