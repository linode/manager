import * as React from 'react';

import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';

import OtherWays from './Panels/OtherWays';
import PopularPosts from './Panels/PopularPosts';
import SearchPanel from './Panels/SearchPanel';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {}

interface State {}

type CombinedProps = Props & WithStyles<ClassNames>;

export class HelpLanding extends React.Component<CombinedProps, State> {
  state: State = {};

  render() {
    return (
      <React.Fragment>
        <SearchPanel />
        <PopularPosts />
        <OtherWays />
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(HelpLanding);
