import * as React from 'react';
import { useQueryClient } from 'react-query';

import Plus from 'src/assets/icons/plusSign.svg';
import { CircleProgress } from 'src/components/CircleProgress';
import Select from 'src/components/EnhancedSelect/Select';
import { Tag } from 'src/components/Tag/Tag';
import { Typography } from 'src/components/Typography';
import { useProfile } from 'src/queries/profile';
import { updateTagsSuggestionsData, useTagSuggestions } from 'src/queries/tags';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

import { useStyles } from './TagsPanel.styles';

interface Item {
  label: string;
  value: string;
}

interface Tag {
  label: string;
}

interface ActionMeta {
  action: string;
}

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

  const queryClient = useQueryClient();

  const [tagError, setTagError] = React.useState<string>('');
  const [isCreatingTag, setIsCreatingTag] = React.useState(false);
  const [tagsLoading, setTagsLoading] = React.useState(false);

  const { data: profile } = useProfile();

  const {
    data: userTags,
    error: userTagsError,
    isLoading: userTagsLoading,
  } = useTagSuggestions(!profile?.restricted);

  const tagsToSuggest = React.useMemo<Item[] | undefined>(
    () =>
      userTags
        ?.filter((tag) => !tags.some((appliedTag) => appliedTag === tag.label))
        .map((tag) => ({
          label: tag.label,
          value: tag.label,
        })),
    [userTags, tags]
  );

  React.useEffect(() => {
    setTagError('');
  }, [isCreatingTag]);

  const toggleTagInput = () => {
    if (!disabled) {
      setIsCreatingTag((prev) => !prev);
    }
  };

  const userTagsErrorDisplay = userTagsError
    ? 'There was an error retrieving your tags.'
    : '';

  const handleDeleteTag = (label: string) => {
    setTagsLoading(true);

    const tagsWithoutDeletedTag = tags.filter(
      (thisTag: string) => thisTag !== label
    );

    updateTags(tagsWithoutDeletedTag)
      .then(() => {
        setTagError('');
      })
      .catch((e) => {
        const tagError = getErrorStringOrDefault(e, 'Error while deleting tag');
        setTagError(tagError);
      })
      .finally(() => {
        setTagsLoading(false);
      });
  };

  const handleCreateTag = (value: Item, actionMeta: ActionMeta) => {
    const inputValue = value && value.value;

    /*
     * This comes from the react-select API
     * basically, we only want to make a request if the user is either
     * hitting the enter button or choosing a selection from the dropdown
     */
    if (
      actionMeta.action !== 'select-option' &&
      actionMeta.action !== 'create-option'
    ) {
      return;
    }

    const tagExists = (tag: string) => {
      return tags.some((el) => {
        return el === tag;
      });
    };

    toggleTagInput();

    if (inputValue.length < 3 || inputValue.length > 50) {
      setTagError(`Tag "${inputValue}" length must be 3-50 characters`);
    } else if (tagExists(inputValue)) {
      setTagError(`Tag "${inputValue}" is a duplicate`);
    } else {
      setTagError('');
      setTagsLoading(true);
      updateTags([...tags, value.label].sort())
        .then(() => {
          if (userTags) {
            updateTagsSuggestionsData([...userTags, value], queryClient);
          }
        })
        .catch((e) => {
          const tagError = getErrorStringOrDefault(
            e,
            'Error while creating tag'
          );
          setTagError(tagError);
        })
        .finally(() => {
          setTagsLoading(false);
        });
    }
  };

  return (
    <>
      {isCreatingTag ? (
        <Select
          // eslint-disable-next-line
          autoFocus
          blurInputOnSelect
          className={classes.selectTag}
          creatable
          createOptionPosition="first"
          escapeClearsValue
          hideLabel
          isLoading={userTagsLoading}
          label="Create or Select a Tag"
          onBlur={toggleTagInput}
          onChange={handleCreateTag}
          options={tagsToSuggest}
          placeholder="Create or Select a Tag"
        />
      ) : (
        <div
          className={cx({
            [classes.addButtonWrapper]: true,
            [classes.hasError]: tagError.length > 0,
          })}
        >
          <button
            className={classes.addTagButton}
            onClick={toggleTagInput}
            title="Add a tag"
          >
            Add a tag
            <Plus />
          </button>
        </div>
      )}
      <div className={classes.tagsPanelItemWrapper}>
        {tagsLoading && (
          <div className={classes.progress}>
            <CircleProgress mini />
          </div>
        )}
        {tags.map((thisTag) => {
          return (
            <Tag
              className={cx({
                [classes.loading]: tagsLoading,
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
        {(tagError.length > 0 || userTagsErrorDisplay.length > 0) && (
          <Typography className={classes.errorNotice}>
            {tagError.length > 0 ? tagError : userTagsErrorDisplay}
          </Typography>
        )}
      </div>
    </>
  );
};
