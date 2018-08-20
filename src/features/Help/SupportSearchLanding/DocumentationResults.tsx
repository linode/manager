import * as React from 'react';

import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Linode.Theme) => {
  // const { palette: { status } } = theme;
  return {
    root: {},
  }
};

export interface SearchResult {
  description: string;
  source: string;
  title: string;
  url: string;
}

interface Props {
  results: SearchResult[];
  sectionTitle: string;
  target: string;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const DocumentationResults: React.StatelessComponent<CombinedProps> = (props) => {
  const { sectionTitle } = props;
  return (
    <Paper>
      <Typography variant="headline" >
        { sectionTitle }
      </Typography>
    </Paper>
  )
}

export default withStyles(styles, { withTheme: true })(DocumentationResults);