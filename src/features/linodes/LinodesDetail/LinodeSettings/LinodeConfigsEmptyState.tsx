import * as React from 'react';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props { }

type CombinedProps = Props & WithStyles<ClassNames>;

const LinodeConfigsEmptyState: React.StatelessComponent<CombinedProps> = (props) => {
  return (
    <div>LinodeConfigsEmptyState</div>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled(LinodeConfigsEmptyState);
