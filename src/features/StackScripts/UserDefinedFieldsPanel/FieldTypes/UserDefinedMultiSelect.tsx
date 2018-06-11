import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';
// import FormControlLabel from 'material-ui/Form/FormControlLabel';

// import Toggle from 'src/components/Toggle';


type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {}

interface State {}

type CombinedProps = Props & WithStyles<ClassNames>;

class UserDefinedMultiSelect extends React.Component<CombinedProps, State> {
  state: State = {};

  render() {
    return (
      <div>MutliSelect</div>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(UserDefinedMultiSelect);
