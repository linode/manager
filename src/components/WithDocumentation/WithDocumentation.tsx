import * as React from 'react';

import {
  withStyles,
  WithStyles,
  Theme,
  StyleRules,
} from 'material-ui/styles';
import Grid from 'src/components/Grid';
import Typography from 'material-ui/Typography';
import LinodeTheme from 'src/theme';

import DocComponent, { Doc } from './DocComponent';

const styles = (theme: Theme & Linode.Theme): StyleRules => ({
  titleContainer: {
    marginBottom: theme.spacing.unit * 2,
  },
  listContainer: {
    position: 'relative',
  },
  sidebarTitle: {
    fontSize: '1.5rem',
    color: LinodeTheme.color.green,
  },
  // docContainer: {
  //   [theme.breakpoints.up('md')]: {
  //     paddingLeft: theme.spacing.unit * 2 + 'px !important',
  //   },
  // },
});

interface Props {
  title: string;
  render: Function;
  docs: Doc[];
}

type PropsWithStyles = Props & WithStyles<'listContainer'
| 'titleContainer'
| 'sidebarTitle'
| 'docContainer' >;

class WithDocumentation extends React.Component<PropsWithStyles>  {
  render() {
    const { classes, title, docs, render, ...rest } = this.props;

    return (
      <Grid container spacing={40}>
        <Grid item xs={12}>
          <Grid container>
            <Grid item className={`${classes.listContainer} mlMain`}>
              <Grid item xs={12} className={classes.titleContainer}>
                <Typography variant="headline" data-test-id="title">{title}</Typography>
              </Grid>
              {render(rest)}
            </Grid>
            <Grid item className="mlSidebar">
              <Typography variant="title" className={classes.sidebarTitle}>Linode Docs</Typography>
              {docs.map((doc, idx) => <DocComponent key={idx} {...doc} />)}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles, { withTheme: true })<Props>(WithDocumentation);
