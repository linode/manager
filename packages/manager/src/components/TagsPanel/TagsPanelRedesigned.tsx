/**
 * This component was essentially copied from ./TagsPanel.tsx. The new designs
 * for the TagsPanel component are largely similar to the original, but there
 * were enough differences that we didn't want to handle for both cases with props.
 *
 * When the *new* component (this one) has been applied everywhere, the original
 * "./TagsPanel.tsx" should be replaced with the contents of this file, and this
 * file should be deleted.
 */
import { getTags } from '@linode/api-v4/lib/tags';
import * as classNames from 'classnames';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import { clone } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import Plus from 'src/assets/icons/plusSign.svg';
import CircleProgress from 'src/components/CircleProgress';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Select from 'src/components/EnhancedSelect/Select';
import Tag from 'src/components/Tag/Tag_CMR';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

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
      color: theme.cmrTextColors.linkActiveLight,
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
  align?: 'left' | 'right';
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
      <>
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
              onClick={this.toggleTagInput}
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
                onDelete={
                  disabled ? undefined : () => this.handleDeleteTag(thisTag)
                }
              />
            );
          })}
          {tagError && (
            <Typography className={classes.errorNotice}>{tagError}</Typography>
          )}
        </div>
      </>
    );
  }
}

const styled = withStyles(styles);

export default compose<CombinedProps, Props>(
  styled,
  withSnackbar
)(TagsPanelRedesigned);
