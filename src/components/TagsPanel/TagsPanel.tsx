import AddCircle from '@material-ui/icons/AddCircle';
import * as classNames from 'classnames';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import { clone } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Select from 'src/components/EnhancedSelect/Select';
import Notice from 'src/components/Notice';
import { getTags } from 'src/services/tags';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import TagsPanelItem from './TagsPanelItem';

type ClassNames =
  | 'root'
  | 'tag'
  | 'addButtonWrapper'
  | 'hasError'
  | 'errorNotice'
  | 'addButton'
  | 'tagsPanelItemWrapper'
  | 'selectTag'
  | 'progress'
  | 'loading';

const styles = (theme: Theme) =>
  createStyles({
    '@keyframes fadeIn': {
      from: {
        opacity: 0
      },
      to: {
        opacity: 1
      }
    },
    root: {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    tag: {
      marginTop: theme.spacing(1) / 2,
      marginRight: theme.spacing(1),
      [theme.breakpoints.down('xs')]: {
        marginRight: theme.spacing(2)
      }
    },
    addButtonWrapper: {
      width: '100%',
      marginTop: theme.spacing(2) - 1,
      marginBottom: theme.spacing(2) + 1
    },
    hasError: {
      marginTop: 0
    },
    errorNotice: {
      '& .noticeText': {
        ...theme.typography.body1,
        fontFamily: '"LatoWeb", sans-serif'
      }
    },
    addButton: {
      padding: 0,
      position: 'relative',
      top: 2,
      '& svg': {
        marginRight: theme.spacing(1)
      },
      '&:hover p': {
        color: theme.palette.primary.main
      }
    },
    tagsPanelItemWrapper: {
      marginBottom: theme.spacing(2),
      position: 'relative'
    },
    selectTag: {
      marginTop: theme.spacing(1),
      width: '100%',
      position: 'relative',
      zIndex: 3,
      animation: '$fadeIn .3s ease-in-out forwards',
      maxWidth: 275,
      '& > div > div': {
        marginTop: 0
      },
      '& .error-for-scroll > div': {
        flexDirection: 'row',
        flexWrap: 'wrap-reverse'
      },
      '& .input': {
        '& p': {
          fontSize: '.9rem',
          color: theme.color.grey1,
          borderLeft: 'none'
        }
      },
      '& .react-select__input': {
        fontSize: '.9rem',
        color: theme.palette.text.primary,
        backgroundColor: 'transparent'
      },
      '& .react-select__value-container': {
        padding: '6px'
      }
    },
    progress: {
      position: 'absolute',
      height: '100%',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2
    },
    loading: {
      opacity: 0.4
    }
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
  updateTags: (tags: string[]) => Promise<void>;
  disabled?: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames> & WithSnackbarProps;

class TagsPanel extends React.Component<CombinedProps, State> {
  state: State = {
    tagsToSuggest: [],
    tagError: '',
    isCreatingTag: false,
    tagInputValue: '',
    listDeletingTags: [],
    loading: false
  };

  componentDidMount() {
    const { tags } = this.props;
    getTags()
      .then(response => {
        /*
         * The end goal is to display to the user a list of auto-suggestions
         * when they start typing in a new tag, but we don't want to display
         * tags that are already applied because there cannot
         * be duplicates.
         */
        const filteredTags = response.data.filter((eachTag: Tag) => {
          return !tags.some((alreadyAppliedTag: string) => {
            return alreadyAppliedTag === eachTag.label;
          });
        });
        /*
         * reshaping them for the purposes of being passed to the Select component
         */
        const reshapedTags = filteredTags.map((eachTag: Tag) => {
          return {
            label: eachTag.label,
            value: eachTag.label
          };
        });
        this.setState({ tagsToSuggest: reshapedTags });
      })
      .catch(e => e);
  }

  toggleTagInput = () => {
    if (!this.props.disabled) {
      this.setState({
        tagError: '',
        isCreatingTag: !this.state.isCreatingTag
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
        loading: true
      },
      () => {
        /*
         * Update the new list of tags (which is the previous list but
         * with the deleted tag filtered out). It's important to note that the Tag is *not*
         * being deleted here - it's just being removed from the list
         */
        const tagsWithoutDeletedTag = tags.filter((eachTag: string) => {
          return this.state.listDeletingTags.indexOf(eachTag) === -1;
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
                  label
                },
                ...cloneTagSuggestions
              ],
              listDeletingTags: this.state.listDeletingTags.filter(
                eachTag => eachTag !== label
              ),
              loading: false,
              tagError: ''
            });
          })
          .catch(e => {
            this.props.enqueueSnackbar(`Could not delete Tag: ${label}`, {
              variant: 'error'
            });
            /*
             * Remove this tag from the current list of tags that are queued for deletion
             */
            this.setState({
              listDeletingTags: this.state.listDeletingTags.filter(
                eachTag => eachTag !== label
              ),
              loading: false
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
      return tags.some(el => {
        return el === tag;
      });
    };

    this.toggleTagInput();

    if (inputValue.length < 3 || inputValue.length > 50) {
      this.setState({
        tagError: `Tag "${inputValue}" length must be 3-50 characters`
      });
    } else if (tagExists(inputValue)) {
      this.setState({
        tagError: `Tag "${inputValue}" is a duplicate`
      });
    } else {
      this.setState({
        loading: true
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
          const filteredTags = cloneTagSuggestions.filter((eachTag: Item) => {
            return eachTag.label !== value.label;
          });
          this.setState({
            tagsToSuggest: filteredTags,
            loading: false
          });
        })
        .catch(e => {
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
      listDeletingTags,
      tagsToSuggest,
      tagInputValue,
      tagError,
      loading
    } = this.state;

    return (
      <div
        className={classNames({
          [classes.root]: true
        })}
      >
        <div
          className={classNames({
            [classes.tagsPanelItemWrapper]: true
          })}
        >
          {loading && (
            <div className={classes.progress}>
              <CircleProgress mini />
            </div>
          )}
          <div
            className={classNames({
              [classes.loading]: loading
            })}
          >
            {tags.map(eachTag => {
              return (
                <TagsPanelItem
                  key={eachTag}
                  label={eachTag}
                  tagLabel={eachTag}
                  onDelete={disabled ? undefined : this.handleDeleteTag}
                  className={classes.tag}
                  loading={listDeletingTags.some(inProgressTag => {
                    /*
                     * The tag is getting deleted if it appears in the state
                     * which holds the list of tags queued for deletion
                     */
                    return eachTag === inProgressTag;
                  })}
                />
              );
            })}
          </div>
          {tagError && (
            <Notice
              text={tagError}
              error
              spacingBottom={0}
              spacingTop={16}
              className={classes.errorNotice}
            />
          )}
        </div>
        {isCreatingTag ? (
          <Select
            onChange={this.handleCreateTag}
            options={tagsToSuggest}
            variant="creatable"
            onBlur={this.toggleTagInput}
            placeholder="Create or Select a Tag"
            value={tagInputValue}
            createOptionPosition="first"
            autoFocus
            className={classes.selectTag}
            blurInputOnSelect={false}
            menuIsOpen={!loading && !tagError}
          />
        ) : (
          <div
            className={classNames({
              [classes.addButtonWrapper]: true,
              [classes.hasError]: tagError
            })}
          >
            <Button
              onClick={this.toggleTagInput}
              className={classes.addButton}
              disableFocusRipple
              disableRipple
              disabled={loading || disabled}
            >
              <AddCircle data-qa-add-tag />
              <Typography>Add New Tag</Typography>
            </Button>
          </div>
        )}
      </div>
    );
  }
}

const styled = withStyles(styles);

export default compose<CombinedProps, Props>(
  styled,
  withSnackbar
)(TagsPanel);
