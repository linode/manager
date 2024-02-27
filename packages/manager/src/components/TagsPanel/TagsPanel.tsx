import * as React from 'react';

import {
  StyledPlusIcon,
  StyledTagButton,
} from 'src/components/Button/StyledTagButton';
import { Tag } from 'src/components/Tag/Tag';
import { Typography } from 'src/components/Typography';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

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
  const { disabled, tags, updateTags } = props;

  const [tagError, setTagError] = React.useState<string>('');
  const [isCreatingTag, setIsCreatingTag] = React.useState(false);
  const [deletingTags, setDeletingTags] = React.useState(
    () => new Set<string>()
  );

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
    const tagsWithoutDeletedTag = tags.filter(
      (thisTag: string) => thisTag !== label
    );
    setDeletingTags(new Set(deletingTags.add(label)));
    updateTags(tagsWithoutDeletedTag)
      .then(() => {
        setTagError('');
      })
      .catch((e) => {
        const tagError = getErrorStringOrDefault(e, 'Error while deleting tag');
        setTagError(tagError);
      })
      .finally(() => {
        deletingTags.delete(label);
        setDeletingTags(new Set(deletingTags));
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
        await updateTags([...tags, tag].sort());
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
