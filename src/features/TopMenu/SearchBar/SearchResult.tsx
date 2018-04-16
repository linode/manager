import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
import * as H from 'history';

type ClassNames = 'root' | 'highlight';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    cursor: 'pointer',
    display: 'flex',
  },
  highlight: { color: 'blue' },
});

export interface SearchResultT {
  Icon: React.ComponentClass<any>;
  title: string;
  description: string;
  path: string;
}

interface Props extends SearchResultT {
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

const SearchResult: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    title,
    description,
    Icon,
    searchText,
    classes: { highlight, root },
    path,
    history,
  } = props;
  return (
    <div onClick={() => onClick(path, history)} className={root}>
      <div><Icon /></div>
      <div>
        <div>{maybeStyleSegment(title, searchText, highlight)}</div>
        <div>{maybeStyleSegment(description, searchText, highlight)}</div>
      </div>
    </div>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(SearchResult);
