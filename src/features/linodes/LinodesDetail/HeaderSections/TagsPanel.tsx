import * as React from 'react';

import IconButton from '@material-ui/core/IconButton';
import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import AddCircle from '@material-ui/icons/AddCircle';

import LinodeTag from './LinodeTag';

import Select from 'src/components/EnhancedSelect/Select';

type ClassNames = 'root'
  | 'tag'
  | 'addButton';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  tag: {
    position: 'relative',
    top: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    padding: theme.spacing.unit / 2,
    backgroundColor: theme.color.grey2,
    color: theme.palette.text.primary,
    '& > span': {
      position: 'relative',
      top: -2,
    },
    '&:focus': {
      backgroundColor: theme.color.grey2,
    },
  },
  addButton: {
    marginTop: theme.spacing.unit * 2,
  },
});

interface Item {
  label: string;
  value: string;
}

interface Tags {
  tagsQueuedForDeletion: string[];
  tagsAlreadyAppliedToLinode: string[];
  // tags that will appear in the auto-suggest dropdown (AKA tags that exist but aren't applied to this linode)
  tagsToSuggest: Item[];
}

interface ActionMeta {
  action: string;
}

interface Props {
  tags: Tags;
  onDeleteTag: (value: string) => void;
  toggleCreateTag: () => void;
  onCreateTag: (value: Item, actionMeta: ActionMeta) => void;
  tagInputValue: string;
  isCreatingTag: boolean;
  tagError: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const TagsPanel: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    tags: { tagsToSuggest, tagsAlreadyAppliedToLinode, tagsQueuedForDeletion },
    tagError,
    onCreateTag,
    toggleCreateTag,
    onDeleteTag,
    tagInputValue,
    isCreatingTag,
    classes
  } = props;

  return (
    <div className={classes.root}>
      {tagsAlreadyAppliedToLinode.map(eachTag => {
        return (
          <LinodeTag
            key={eachTag}
            label={eachTag}
            tagLabel={eachTag}
            onDelete={onDeleteTag}
            className={classes.tag}
            loading={tagsQueuedForDeletion.some((inProgressTag) => {
              /*
               * The tag is getting deleted if it appears in the state
               * which holds the list of tags queued for deletion 
               */
              return eachTag === inProgressTag;
            })}
          />
        )
      })}
      {(isCreatingTag)
        ? <Select
          onChange={onCreateTag}
          options={tagsToSuggest}
          variant='creatable'
          errorText={tagError}
          onBlur={toggleCreateTag}
          placeholder="Create or Select a Tag"
          value={tagInputValue}
          createOptionPosition="first"
          autoFocus
        />
        :
        <Tooltip
          title="Add New Tag"
          placement="right"
        >
          <IconButton
            onClick={toggleCreateTag}
            className={classes.addButton}
          >
            <AddCircle data-qa-add-tag />
          </IconButton>
        </Tooltip> 
      }
    </div>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(TagsPanel);
