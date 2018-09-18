import * as React from 'react';

import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import AddCircle from '@material-ui/icons/AddCircle';

import LinodeTag from './LinodeTag';

import Select from 'src/components/EnhancedSelect/Select';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
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

interface Props {
  tags: Tags;
  onDeleteTag: () => void;
  toggleCreateTag: () => void;
  onCreateTag: () => void;
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
    isCreatingTag
  } = props;

  return (
    <React.Fragment>
      {tagsAlreadyAppliedToLinode.map(eachTag => {
        return (
          <LinodeTag
            key={eachTag}
            label={eachTag}
            variant="gray"
            tagLabel={eachTag}
            onDelete={onDeleteTag}
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
        : <AddCircle onClick={toggleCreateTag} />
      }
    </React.Fragment>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(TagsPanel);
