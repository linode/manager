import * as React from 'react';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';

import {
  ExpansionPanelActions,
  ExpansionPanelActionsProps,
} from 'material-ui/ExpansionPanel';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props extends ExpansionPanelActionsProps {}

type CombinedProps = Props & WithStyles<ClassNames>;

const ActionPanel: React.StatelessComponent<CombinedProps> = (props) => {
  return (
    <ExpansionPanelActions
      className={`${props.classes.root} actionPanel`}
      {...props}
    >
      { props.children }
    </ExpansionPanelActions>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(ActionPanel);
