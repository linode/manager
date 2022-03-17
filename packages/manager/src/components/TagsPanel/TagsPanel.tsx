import { getTags } from '@linode/api-v4/lib/tags';
import classNames from 'classnames';
import { clone } from 'ramda';
import * as React from 'react';
import Plus from 'src/assets/icons/plusSign.svg';
import CircleProgress from 'src/components/CircleProgress';
import Typography from 'src/components/core/Typography';
import Select from 'src/components/EnhancedSelect/Select';
import { isRestrictedUser } from 'src/features/Profile/permissionsHelpers';
import Tag from 'src/components/Tag';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import { Theme, makeStyles } from 'src/components/core/styles';
import { useSnackbar } from 'notistack';

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
    marginTop: theme.spacing(1) / 2,
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
    borderLeft: `5px solid ${theme.palette.status.errorDark}`,
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
  const { enqueueSnackbar } = useSnackbar();

  const [tagsToSuggest, setTagsToSuggest] = React.useState<Item[]>([]);
  const [tagError, setTagError] = React.useState('');
  const [isCreatingTag, setIsCreatingTag] = React.useState(false);
  const [tagInputValue, setTagInputValue] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!isRestrictedUser()) {
      getTags()
        .then((response) => {
          /*
           * The end goal is to display to the user a list of auto-suggestions
           * when they start typing in a new tag, but we don't want to display
           * tags that are already applied because there cannot
           * be duplicates.
           */
          const filteredTags = response.data.filter((thisTag: Tag) => {
            return !tags.some((alreadyAppliedTag: string) => {
              return alreadyAppliedTag === thisTag.label;
            });
          });
          /*
           * reshaping them for the purposes of being passed to the Select component
           */
          const reshapedTags = filteredTags.map((thisTag: Tag) => {
            return {
              label: thisTag.label,
              value: thisTag.label,
            };
          });
          setTagsToSuggest(reshapedTags);
        })
        .catch((e) => e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleTagInput = () => {
    if (!disabled) {
      if (tagError) {
        setTagError('');
      }
      setIsCreatingTag((prev) => !prev);
    }
  };

  const handleDeleteTag = (label: string) => {
    setLoading(true);

    const tagsWithoutDeletedTag = tags.filter(
      (thisTag: string) => thisTag !== label
    );

    updateTags(tagsWithoutDeletedTag)
      .then(() => {
        /*
         * Remove this tag from the current list of tags that are queued for deletion
         */
        const cloneTagSuggestions = clone(tagsToSuggest) || [];
        setTagsToSuggest([
          {
            value: label,
            label,
          },
          ...cloneTagSuggestions,
        ]);
        setLoading(false);
        setTagError('');
      })
      .catch((_) => {
        enqueueSnackbar(`Could not delete Tag: ${label}`, {
          variant: 'error',
        });
        setLoading(false);
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
      setLoading(true);
      updateTags([...tags, value.label])
        .then(() => {
          // set the input value to blank on submit
          setTagInputValue('');
          /*
           * Filter out the new tag out of the auto-suggestion list
           * since we can't attach this tag anymore
           */
          const cloneTagSuggestions = clone(tagsToSuggest) || [];
          const filteredTags = cloneTagSuggestions.filter((thisTag: Item) => {
            return thisTag.label !== value.label;
          });
          setTagsToSuggest(filteredTags);
          setLoading(false);
        })
        .catch((e) => {
          const tagError = getErrorStringOrDefault(
            e,
            'Error while creating tag'
          );
          setLoading(false);
          setTagError(tagError);
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
        {loading && (
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
                [classes.loading]: loading,
              })}
              colorVariant="lightBlue"
              label={thisTag}
              maxLength={30}
              onDelete={disabled ? undefined : () => handleDeleteTag(thisTag)}
            />
          );
        })}
        {tagError && (
          <Typography className={classes.errorNotice}>{tagError}</Typography>
        )}
      </div>
    </>
  );
};

export default TagsPanel;
