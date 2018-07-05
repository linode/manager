import * as React from 'react';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {}

interface State {}

type CombinedProps = Props & WithStyles<ClassNames>;

class Glish extends React.Component<CombinedProps, State> {
  state = {};

  render() {
    return (
      <div>Hello Glish</div>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(Glish);
