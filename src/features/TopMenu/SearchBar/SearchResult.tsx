import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';

type ClassNames = 'root' | 'highlight';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  highlight: { color: 'blue' },
});

export interface SearchResultT {
  title: string;
  description: string;
  Icon: React.ComponentClass<any>;
}

interface Props extends SearchResultT {
  searchText: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const maybeStyleSegment = (text: string, searchText: string, hlClass: string): React.ReactNode => {
  const idx = text.indexOf(searchText);
  if (idx === -1) { return text; }
  return (
    <React.Fragment>
      {`${text.substr(0, idx)}`}
        <span className={hlClass}>{`${text.substr(idx, searchText.length)}`}</span>
      {`${text.slice(idx + searchText.length)}`}
    </React.Fragment>
  );
};

const SearchResult: React.StatelessComponent<CombinedProps> = (props) => {
  const { title, description, Icon, searchText, classes: { highlight } } = props;
  return (
    <div style={{ display: 'flex' }}>
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
