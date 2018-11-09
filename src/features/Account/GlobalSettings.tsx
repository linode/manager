import * as React from 'react';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import AutoBackups from './AutoBackups';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

type CombinedProps = {} & WithStyles<ClassNames>;

const GlobalSettings: React.StatelessComponent<CombinedProps> = (props) =>{
  return(
    <AutoBackups />
  )
}

const styled = withStyles(styles, { withTheme: true });

export default styled(GlobalSettings);
