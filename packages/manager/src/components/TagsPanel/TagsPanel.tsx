import classNames from 'classnames';
import * as React from 'react';
import Plus from 'src/assets/icons/plusSign.svg';
import CircleProgress from 'src/components/CircleProgress';
import Typography from 'src/components/core/Typography';
import Select from 'src/components/EnhancedSelect/Select';
import Tag from 'src/components/Tag';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { updateTagsSuggestionsData, useTagSuggestions } from 'src/queries/tags';
import { useProfile } from 'src/queries/profile';

const useStyles = makeStyles((theme: Theme) => ({
  '@keyframes fadeIn': {
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
  },
  tag: {
    marginTop: theme.spacing(0.5),
    marginRight: 4,
  },
  addButtonWrapper: {
    display: 'flex',
    justifyContent: 'flex-start',
    width: '100%',
  },
  hasError: {
    marginTop: 0,
  },
  errorNotice: {
    animation: '$fadeIn 225ms linear forwards',
    borderLeft: `5px solid ${theme.palette.error.dark}`,
    '& .noticeText': {
      ...theme.typography.body1,
      fontFamily: '"LatoWeb", sans-serif',
    },
    marginTop: 20,
    paddingLeft: 10,
    textAlign: 'left',
  },
  addTagButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.color.tagButton,
    border: 'none',
    borderRadius: 3,
    color: theme.textColors.linkActiveLight,
    cursor: 'pointer',
    fontFamily: theme.font.normal,
    fontSize: '0.875rem',
    fontWeight: 'bold',
    padding: '7px 10px',
    whiteSpace: 'nowrap',
    '& svg': {
      color: theme.color.tagIcon,
      marginLeft: 10,
      height: 10,
      width: 10,
    },
  },
  tagsPanelItemWrapper: {
    marginBottom: theme.spacing(),
    position: 'relative',
  },
  selectTag: {
    animation: '$fadeIn .3s ease-in-out forwards',
    marginTop: -3.5,
    minWidth: 275,
    position: 'relative',
    textAlign: 'left',
    width: '100%',
    zIndex: 3,
    '& .error-for-scroll > div': {
      flexDirection: 'row',
      flexWrap: 'wrap-reverse',
    },
    '& .input': {
      '& p': {
        color: theme.color.grey1,
        borderLeft: 'none',
        fontSize: '.9rem',
      },
    },
    '& .react-select__input': {
      backgroundColor: 'transparent',
      color: theme.palette.text.primary,
      fontSize: '.9rem',
    },
    '& .react-select__value-container': {
      padding: '6px',
    },
  },
  progress: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    height: '100%',
    width: '100%',
    zIndex: 2,
  },
  loading: {
    opacity: 0.4,
  },
}));

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

export interface Props {
  align?: 'left' | 'right';
  tags: string[];
  updateTags: (tags: string[]) => Promise<any>;
  disabled?: boolean;
}

const TagsPanel: React.FC<Props> = (props) => {
  const classes = useStyles();
  const { tags, disabled, updateTags } = props;

  const [tagError, setTagError] = React.useState<string>('');
  const [isCreatingTag, setIsCreatingTag] = React.useState(false);
  const [tagInputValue, setTagInputValue] = React.useState('');
  const [tagsLoading, setTagsLoading] = React.useState(false);

  const { data: profile } = useProfile();

  const {
    data: userTags,
    isLoading: userTagsLoading,
    error: userTagsError,
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
          // set the input value to blank on submit
          setTagInputValue('');
          if (userTags) {
            updateTagsSuggestionsData([...userTags, value]);
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
          onChange={handleCreateTag}
          options={tagsToSuggest}
          creatable
          onBlur={toggleTagInput}
          placeholder="Create or Select a Tag"
          label="Create or Select a Tag"
          hideLabel
          value={tagInputValue}
          createOptionPosition="first"
          className={classes.selectTag}
          escapeClearsValue
          blurInputOnSelect
          // eslint-disable-next-line
          autoFocus
          isLoading={userTagsLoading}
        />
      ) : (
        <div
          className={classNames({
            [classes.addButtonWrapper]: true,
            [classes.hasError]: tagError,
          })}
        >
          <button
            className={classes.addTagButton}
            title="Add a tag"
            onClick={toggleTagInput}
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
              key={`tag-item-${thisTag}`}
              className={classNames({
                [classes.tag]: true,
                [classes.loading]: tagsLoading,
              })}
              colorVariant="lightBlue"
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

export default TagsPanel;
