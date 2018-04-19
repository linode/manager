import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import * as H from 'history';

type ClassNames = 'root'
 | 'highlight'
 | 'suggestionItem'
 | 'suggestionIcon'
 | 'suggestionContent'
 | 'suggestionTitle'
 | 'suggestionDescription';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
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
  },
  suggestionDescription: {
    fontSize: '.8rem',
    fontWeight: 700,
  },
});

export interface SearchSuggestionT {
  Icon: React.ComponentClass<any>;
  title: string;
  description: string;
  path: string;
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

const onClick = (path: string, history: H.History) => {
  history.push(path);
};

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
  } = props;
  return (
    <div onClick={() => onClick(path, history)} className={root}>
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
        <div className={classes.suggestionTitle}>
          {maybeStyleSegment(title, searchText, highlight)}
        </div>
        <div className={classes.suggestionDescription}>
          {description}
        </div>
      </div>
    </div>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(SearchSuggestion);
