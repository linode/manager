import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import {
  withStyles,
  Theme,
  StyledComponentProps,
  StyleRules,
} from 'material-ui/styles';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Table from 'material-ui/Table';
import TableHead from 'material-ui/Table/TableHead';
import TableRow from 'material-ui/Table/TableRow';
import TableCell from 'material-ui/Table/TableCell';
import TableBody from 'material-ui/Table/TableBody';

import LinodeRow from './LinodeRow';

const styles = (theme: Theme): StyleRules => ({
  root: {
    flexGrow: 1,
  },
  newLinodeButton: {
    borderRadius: '4px',
  },
  emptyStateContainer: {
    paddingTop: '25px',
    paddingBottom: '25px',
  },
  emptyStateCopy: {
    textAlign: 'center',
  },
  [theme.breakpoints.up('md')]: {
    emptyStateContainer: {
      paddingTop: '50px',
      paddingBottom: '50px',
    },
  },
});

interface Props extends StyledComponentProps<any> {
  linodes?: Linode[];
}

interface DefaultProps {
  linodes: Linode[];
  classes: any;
}

type PropsWithDefaults = Props & DefaultProps;


class ListLinodes extends React.Component<Props> {
  public static defaultProps = {
    linodes: [],
    classes: {},
  };

  emptyState() {
    const { classes } = this.props as PropsWithDefaults;

    return (
      <Grid
        container
        spacing={24}
        alignItems="center"
        direction="column"
        justify="center"
        className={classes.emptyStateContainer}
      >
        <Grid item xs={12}> Image goes here... </Grid>
        <Grid item xs={12} lg={10} className={classes.emptyStateCopy}>
          <Typography variant="body1">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce mollis
            quis tortor ultrices lobortis. Aliquam rutrum dolor turpis, at
            molestie purus semper non. Ut finibus bibendum velit.
        </Typography>
        </Grid>
        <Grid item xs={12}>
          <Button variant="raised" color="primary" className={classes.newLinodeButton}>
            Add New Linode
          </Button>
        </Grid>
      </Grid>
    );
  }

  listLinodes() {
    const { classes, linodes } = this.props as PropsWithDefaults;
    return (
      <Grid container>
        <Grid item xs={12}>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell>Label</TableCell>
                <TableCell>IP Addresses</TableCell>
                <TableCell>Region</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* @todo Fix */}
              {linodes.map((l, idx) => <LinodeRow key={idx} linode={l} />)}
            </TableBody>
          </Table>
        </Grid>
      </Grid>
    );
  }

  render() {
    const { classes, linodes } = this.props as PropsWithDefaults;

    return (
      <div className={classes.root}>
        <Grid container spacing={40}>
          <Grid item xs={12}>
            <Typography variant="display1">Linodes</Typography>
          </Grid>

          <Grid item xs={12}>
            <Grid container spacing={16}>
              <Grid item xs={12} md={9} xl={10}>
                {/* Everything Else */}
                <Paper elevation={1}>
                  {linodes.length > 0 ? this.listLinodes() : this.emptyState()}
                </Paper>
              </Grid>
              <Grid item xs={12} md={3} xl={2}>
                {/** Docs */}
                Documentation...
          </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    );
  }
}

const mapStateToProps = (state: any) => ({
  linodes: state.api.linodes.data,
});

export default compose(
  withStyles(styles, { withTheme: true }),
  connect<Props>(mapStateToProps),
)(ListLinodes);
