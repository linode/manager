import * as H from 'history';
import * as React from 'react';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

type ClassNames = 'root'
 | 'highlight'
 | 'suggestionItem'
 | 'suggestionIcon'
 | 'suggestionContent'
 | 'suggestionTitle'
 | 'suggestionDescription';

 import Tag from 'src/components/Tag';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
    cursor: 'pointer',
    display: 'flex',
  },
  highlight: {
    color: theme.palette.primary.main,
  },
  suggestionItem: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  suggestionIcon: {
    '& svg': {
      width: '40px',
      height: '40px',
    },
  },
  suggestionContent: {
    marginLeft: theme.spacing.unit * 2,
  },
  suggestionTitle: {
    fontSize: '1rem',
    color: theme.palette.text.primary,
  },
  suggestionDescription: {
    color: theme.color.headline,
    fontSize: '.8rem',
    fontWeight: 600,
    marginTop: 2,
  },
});

export interface SearchSuggestionT {
  Icon: React.ComponentClass<any>;
  title: string;
  description: string;
  path: string;
  tags?: string[];
}

interface Props extends SearchSuggestionT {
  searchText: string;
  history: H.History;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const maybeStyleSegment = (text: string, searchText: string, hlClass: string): React.ReactNode => {
  const idx = text.toLocaleLowerCase().indexOf(searchText.toLocaleLowerCase());
  if (idx === -1) { return text; }
  return (
    <React.Fragment>
      {`${text.substr(0, idx)}`}
        <span className={hlClass}>{`${text.substr(idx, searchText.length)}`}</span>
      {`${text.slice(idx + searchText.length)}`}
    </React.Fragment>
  );
};

const renderTags = (tags:string[]) => {
  if (tags.length === 0) { return; }
  return tags.map((tag:string) => <Tag key={`tag-${tag}`} label={tag} /> );
}

const SearchSuggestion: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    title,
    description,
    Icon,
    searchText,
    classes: { highlight, root },
    path,
    history,
    classes,
    tags,
  } = props;

  const handleClick = () => {
    history.push(path);
  }

  return (
    <div
      onClick={handleClick}
      className={root}
    >
      <div className={`
        ${classes.suggestionItem}
        ${classes.suggestionIcon}
      `}>
        <Icon />
      </div>
      <div className={`
        ${classes.suggestionItem}
        ${classes.suggestionContent}
      `}>
        <div className={classes.suggestionTitle} data-qa-suggestion-title>
          {maybeStyleSegment(title, searchText, highlight)}
        </div>
        <div className={classes.suggestionDescription} data-qa-suggestion-desc>
          {description}
        </div>
        <span>
          {tags && renderTags(tags)}
        </span>
      </div>
    </div>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(SearchSuggestion);
