import * as React from 'react';

import {
  withStyles,
  WithStyles,
  Theme,
  StyleRules,
} from 'material-ui/styles';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';

import DocComponent, { Doc } from './DocComponent';

const styles = (theme: Theme & Linode.Theme): StyleRules => ({
  titleContainer: {
    marginBottom: theme.spacing.unit * 2,
  },
  listContainer: {
    position: 'relative',
  },
  docContainer: {
    [theme.breakpoints.up('md')]: {
      paddingLeft: theme.spacing.unit * 2 + 'px !important',
    },
  },
});

interface Props {
  title: string;
  render: Function;
  docs: Doc[];
}

type PropsWithStyles = Props & WithStyles<'listContainer' 
| 'titleContainer'
| 'docContainer' >;

class WithDocumentation extends React.Component<PropsWithStyles>  {
  render() {
    const { classes, title, docs, render, ...rest } = this.props;

    return (
      <Grid container spacing={40}>
        <Grid item xs={12}>
          <Grid container spacing={16}>
            <Grid item xs={12} md={12} lg={10} className={classes.listContainer}>
              <Grid item xs={12} className={classes.titleContainer}>
                <Typography variant="headline" data-test-id="title">{title}</Typography>
              </Grid>
              {render(rest)}
            </Grid>
            <Grid item xs={12} md={12} lg={2} className={classes.docContainer}>
              <Typography variant="title">Linode Docs</Typography>
              {docs.map((doc, idx) => <DocComponent key={idx} {...doc} />)}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles, { withTheme: true })<Props>(WithDocumentation);
