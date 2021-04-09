/**
 * This component was essentially copied from ./TagsPanel.tsx. The new designs
 * for the TagsPanel component are largely similar to the original, but there
 * were enough differences that we didn't want to handle for both cases with props.
 *
 * When the *new* component (this one) has been applied everywhere, the original
 * "./TagsPanel.tsx" should be replaced with the contents of this file, and this
 * file should be deleted.
 */
import Plus from 'src/assets/icons/plusSign.svg';
import * as classNames from 'classnames';
import { getTags } from '@linode/api-v4/lib/tags';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import { clone } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import CircleProgress from 'src/components/CircleProgress';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Select from 'src/components/EnhancedSelect/Select';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import Tag from 'src/components/Tag/Tag_CMR';

type ClassNames =
  | 'root'
  | 'tag'
  | 'addButtonWrapper'
  | 'hasError'
  | 'errorNotice'
  | 'addTagButton'
  | 'tagsPanelItemWrapper'
  | 'selectTag'
  | 'progress'
  | 'loading';

const styles = (theme: Theme) =>
  createStyles({
    '@keyframes fadeIn': {
      from: {
        opacity: 0,
      },
      to: {
        opacity: 1,
      },
    },
    root: {},
    tag: {
      marginTop: theme.spacing(1) / 2,
      marginRight: theme.spacing(1),
      [theme.breakpoints.down('xs')]: {
        marginRight: theme.spacing(2),
      },
      fontWeight: 600,
    },
    addButtonWrapper: {
      width: '100%',
      marginBottom: theme.spacing(2) + 1,
      display: 'flex',
      justifyContent: 'flex-end',
    },
    hasError: {
      marginTop: 0,
    },
    errorNotice: {
      borderLeft: `5px solid ${theme.palette.status.errorDark}`,
      animation: '$fadeIn 225ms linear forwards',
      '& .noticeText': {
        ...theme.typography.body1,
        fontFamily: '"LatoWeb", sans-serif',
      },
      textAlign: 'left',
      paddingLeft: 10,
      marginTop: 20,
    },
    addTagButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 3,
      backgroundColor: theme.color.tagButton,
      border: 'none',
      color: theme.cmrTextColors.linkActiveLight,
      cursor: 'pointer',
      fontFamily: theme.font.normal,
      fontSize: 14,
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
      marginBottom: theme.spacing(2),
      position: 'relative',
    },
    selectTag: {
      minWidth: 275,
      textAlign: 'left',
      width: '100%',
      position: 'relative',
      zIndex: 3,
      animation: '$fadeIn .3s ease-in-out forwards',
      '& .error-for-scroll > div': {
        flexDirection: 'row',
        flexWrap: 'wrap-reverse',
      },
      '& .input': {
        '& p': {
          fontSize: '.9rem',
          color: theme.color.grey1,
          borderLeft: 'none',
        },
      },
      '& .react-select__input': {
        fontSize: '.9rem',
        color: theme.palette.text.primary,
        backgroundColor: 'transparent',
      },
      '& .react-select__value-container': {
        padding: '6px',
      },
    },
    progress: {
      position: 'absolute',
      height: '100%',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2,
    },
    loading: {
      opacity: 0.4,
    },
  });

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

interface State {
  tagsToSuggest?: Item[];
  tagError: string;
  isCreatingTag: boolean;
  tagInputValue: string;
  listDeletingTags: string[];
  loading?: boolean;
}

export interface Props {
  tags: string[];
  updateTags: (tags: string[]) => Promise<any>;
  disabled?: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames> & WithSnackbarProps;

class TagsPanelRedesigned extends React.Component<CombinedProps, State> {
  state: State = {
    tagsToSuggest: [],
    tagError: '',
    isCreatingTag: false,
    tagInputValue: '',
    listDeletingTags: [],
    loading: false,
  };

  componentDidMount() {
    const { tags } = this.props;
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
        this.setState({ tagsToSuggest: reshapedTags });
      })
      .catch((e) => e);
  }

  toggleTagInput = () => {
    if (!this.props.disabled) {
      this.setState({
        tagError: '',
        isCreatingTag: !this.state.isCreatingTag,
      });
    }
  };

  handleDeleteTag = (label: string) => {
    const { tags, updateTags } = this.props;
    /*
     * Add this tag to the current list of tags that are queued for deletion
     */
    this.setState(
      {
        listDeletingTags: [...this.state.listDeletingTags, label],
        loading: true,
      },
      () => {
        /*
         * Update the new list of tags (which is the previous list but
         * with the deleted tag filtered out). It's important to note that the Tag is *not*
         * being deleted here - it's just being removed from the list
         */
        const tagsWithoutDeletedTag = tags.filter((thisTag: string) => {
          return this.state.listDeletingTags.indexOf(thisTag) === -1;
        });

        updateTags(tagsWithoutDeletedTag)
          .then(() => {
            /*
             * Remove this tag from the current list of tags that are queued for deletion
             */
            const cloneTagSuggestions = clone(this.state.tagsToSuggest) || [];
            this.setState({
              tagsToSuggest: [
                {
                  value: label,
                  label,
                },
                ...cloneTagSuggestions,
              ],
              listDeletingTags: this.state.listDeletingTags.filter(
                (thisTag) => thisTag !== label
              ),
              loading: false,
              tagError: '',
            });
          })
          .catch((_) => {
            this.props.enqueueSnackbar(`Could not delete Tag: ${label}`, {
              variant: 'error',
            });
            /*
             * Remove this tag from the current list of tags that are queued for deletion
             */
            this.setState({
              listDeletingTags: this.state.listDeletingTags.filter(
                (thisTag) => thisTag !== label
              ),
              loading: false,
            });
          });
      }
    );
  };

  handleCreateTag = (value: Item, actionMeta: ActionMeta) => {
    const { tagsToSuggest } = this.state;
    const { tags, updateTags } = this.props;
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

    this.toggleTagInput();

    if (inputValue.length < 3 || inputValue.length > 50) {
      this.setState({
        tagError: `Tag "${inputValue}" length must be 3-50 characters`,
      });
    } else if (tagExists(inputValue)) {
      this.setState({
        tagError: `Tag "${inputValue}" is a duplicate`,
      });
    } else {
      this.setState({
        loading: true,
      });
      updateTags([...tags, value.label])
        .then(() => {
          // set the input value to blank on submit
          this.setState({ tagInputValue: '' });
          /*
           * Filter out the new tag out of the auto-suggestion list
           * since we can't attach this tag anymore
           */
          const cloneTagSuggestions = clone(tagsToSuggest) || [];
          const filteredTags = cloneTagSuggestions.filter((thisTag: Item) => {
            return thisTag.label !== value.label;
          });
          this.setState({
            tagsToSuggest: filteredTags,
            loading: false,
          });
        })
        .catch((e) => {
          const tagError = getErrorStringOrDefault(
            e,
            'Error while creating tag'
          );
          this.setState({ loading: false, tagError });
        });
    }
  };

  render() {
    const { tags, classes, disabled } = this.props;

    const {
      isCreatingTag,
      tagsToSuggest,
      tagInputValue,
      tagError,
      loading,
    } = this.state;

    return (
      <div
        className={classNames({
          [classes.root]: true,
        })}
      >
        {isCreatingTag ? (
          <Select
            onChange={this.handleCreateTag}
            options={tagsToSuggest}
            variant="creatable"
            onBlur={this.toggleTagInput}
            placeholder="Create or Select a Tag"
            label="Create or Select a Tag"
            hideLabel
            value={tagInputValue}
            createOptionPosition="first"
            className={classes.selectTag}
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
              onClick={this.toggleTagInput}
            >
              Add a tag
              <Plus />
            </button>
          </div>
        )}

        <div
          className={classNames({
            [classes.tagsPanelItemWrapper]: true,
          })}
        >
          {loading && (
            <div className={classes.progress}>
              <CircleProgress mini />
            </div>
          )}
          <div
            className={classNames({
              [classes.loading]: loading,
            })}
          >
            {tags.map((thisTag) => {
              return (
                <Tag
                  key={`tag-item-${thisTag}`}
                  colorVariant="lightBlue"
                  label={thisTag}
                  onDelete={
                    disabled ? undefined : () => this.handleDeleteTag(thisTag)
                  }
                  className={classes.tag}
                />
              );
            })}
          </div>
          {tagError && (
            <Typography className={classes.errorNotice}>{tagError}</Typography>
          )}
        </div>
      </div>
    );
  }
}

const styled = withStyles(styles);

export default compose<CombinedProps, Props>(
  styled,
  withSnackbar
)(TagsPanelRedesigned);
