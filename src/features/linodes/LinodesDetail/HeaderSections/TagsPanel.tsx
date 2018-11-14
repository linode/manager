import * as React from 'react';

import IconButton from '@material-ui/core/IconButton';
import {
  StyleRulesCallback,
  
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import AddCircle from '@material-ui/icons/AddCircle';

import LinodeTag from './LinodeTag';

import Select from 'src/components/EnhancedSelect/Select';

type ClassNames = 'root'
  | 'tag'
  | 'addButton'
  | 'selectTag';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  '@keyframes fadeIn': {
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
  },
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
    marginTop: theme.spacing.unit / 2,
    position: 'relative',
    top: 6,
  },
  selectTag: {
    marginTop: theme.spacing.unit / 2,
    height: '48px',
    width: 'auto',
    position: 'relative',
    zIndex: 3,
    animation: 'fadeIn .3s ease-in-out forwards',
    '& .error-for-scroll > div': {
      width: 'auto',
    },
    '& .input': {
      minHeight: 'auto',
      border: 0,
      backgroundColor: 'transparent',
      boxShadow: 'none',
      '& p': {
        fontSize: '.9rem',
        color: theme.color.grey1,
      },
    },
    '& .error-for-scroll p': {
      padding: theme.spacing.unit,
      marginLeft: 12,
      marginTop: 0,
      position: 'absolute',
      boxShadow: '0 0 5px #ddd',
      backgroundColor: theme.bg.offWhite,
      lineHeight: 1.2,
      zIndex: 5.
    },
    '& .react-select__input': {
      fontSize: '.9rem',
      color: theme.palette.text.primary,
      backgroundColor: 'transparent',
    },
    '& .react-select__value-container': {
      width: 150,
    },
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
  toggleTagInput: () => void;
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
    toggleTagInput,
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
            onBlur={toggleTagInput}
            placeholder="Create or Select a Tag"
            value={tagInputValue}
            createOptionPosition="first"
            autoFocus
            className={classes.selectTag}
            blurInputOnSelect={false}
        />
        :
        <Tooltip
          title="Add New Tag"
          placement="right"
        >
          <IconButton
            onClick={toggleTagInput}
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
