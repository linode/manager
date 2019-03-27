import AddCircle from '@material-ui/icons/AddCircle';
import { InjectedNotistackProps, withSnackbar } from 'notistack';
import { clone, pathOr } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import Button from 'src/components/core/Button';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Select from 'src/components/EnhancedSelect/Select';
import { getTags } from 'src/services/tags';
import TagsPanelItem from './TagsPanelItem';

type ClassNames =
  | 'root'
  | 'tag'
  | 'addButtonWrapper'
  | 'addButton'
  | 'tagsPanelItemWrapper'
  | 'selectTag';

const styles: StyleRulesCallback<ClassNames> = theme => ({
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
    marginTop: theme.spacing.unit / 2,
    marginRight: theme.spacing.unit,
    [theme.breakpoints.down('xs')]: {
      marginRight: theme.spacing.unit * 2
    }
  },
  addButtonWrapper: {
    width: '100%',
    marginTop: theme.spacing.unit * 2 - 1,
    marginBottom: theme.spacing.unit * 2 + 1
  },
  addButton: {
    padding: 0,
    position: 'relative',
    top: 2,
    '& svg': {
      marginRight: theme.spacing.unit
    },
    '&:hover p': {
      color: theme.palette.primary.main
    }
  },
  tagsPanelItemWrapper: {
    marginBottom: theme.spacing.unit * 2
  },
  selectTag: {
    marginTop: theme.spacing.unit,
    width: '100%',
    position: 'relative',
    zIndex: 3,
    animation: 'fadeIn .3s ease-in-out forwards',
    maxWidth: 275,
    '& > div > div': {
      marginTop: 0
    },
    '& .error-for-scroll > div': {
      width: 'auto',
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
    '& .error-for-scroll p:last-child': {
      padding: theme.spacing.unit,
      marginTop: 0,
      position: 'absolute',
      top: '-50px',
      left: 10,
      maxWidth: 170,
      boxShadow: `0 0 5px ${theme.color.boxShadow}`,
      backgroundColor: theme.bg.offWhiteDT,
      color: `${theme.palette.text.primary}`,
      borderLeft: `5px solid ${theme.palette.status.errorDark}`,
      lineHeight: 1.2,
      zIndex: 5
    },
    '& .react-select__input': {
      fontSize: '.9rem',
      color: theme.palette.text.primary,
      backgroundColor: 'transparent'
    },
    '& .react-select__value-container': {
      padding: '6px'
    }
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
}

export interface Props {
  tags: string[];
  updateTags: (tags: string[]) => Promise<void>;
  disabled?: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames> & InjectedNotistackProps;

class TagsPanel extends React.Component<CombinedProps, State> {
  state: State = {
    tagsToSuggest: [],
    tagError: '',
    isCreatingTag: false,
    tagInputValue: '',
    listDeletingTags: []
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
        listDeletingTags: [...this.state.listDeletingTags, label]
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
              )
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
              )
            });
          });
      }
    );
  };

  handleCreateTag = (value: Item, actionMeta: ActionMeta) => {
    const { tagsToSuggest } = this.state;
    const { tags, updateTags } = this.props;
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

    this.setState({
      tagError: ''
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
          tagsToSuggest: filteredTags
        });
      })
      .catch(e => {
        const tagError = pathOr(
          'Error while creating tag',
          ['response', 'data', 'errors', 0, 'reason'],
          e
        );
        // display the first error in the array or a generic one
        this.setState({ tagError });
      });
  };

  render() {
    const { tags, classes, disabled } = this.props;

    const {
      isCreatingTag,
      listDeletingTags,
      tagsToSuggest,
      tagInputValue,
      tagError
    } = this.state;

    return (
      <div className={classes.root}>
        <div className={classes.tagsPanelItemWrapper}>
          {tags.map(eachTag => {
            return (
              <TagsPanelItem
                key={eachTag}
                label={eachTag}
                tagLabel={eachTag}
                onDelete={!disabled ? this.handleDeleteTag : undefined}
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
        {isCreatingTag ? (
          <Select
            onChange={this.handleCreateTag}
            options={tagsToSuggest}
            variant="creatable"
            errorText={tagError}
            onBlur={this.toggleTagInput}
            placeholder="Create or Select a Tag"
            value={tagInputValue}
            createOptionPosition="first"
            autoFocus
            className={classes.selectTag}
            blurInputOnSelect={false}
            menuIsOpen={true}
          />
        ) : (
          <div className={classes.addButtonWrapper}>
            <Button
              onClick={this.toggleTagInput}
              className={classes.addButton}
              type="primary"
              disabled={disabled}
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
