import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { pathOr } from 'ramda';

import {
  withStyles,
  Theme,
  WithStyles,
  StyleRulesCallback,
} from 'material-ui/styles';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import Table from 'material-ui/Table';
import TableHead from 'material-ui/Table/TableHead';
import TableRow from 'material-ui/Table/TableRow';
import TableCell from 'material-ui/Table/TableCell';
import TableBody from 'material-ui/Table/TableBody';

import LinodeRow from './LinodeRow';
import ListLinodesEmptyState from './ListLinodesEmptyState';

const styles: StyleRulesCallback<'root'> = (theme: Theme) => ({
  root: {
    flexGrow: 1,
  },
});

interface Props {
  linodes: Linode.Linode[];
}

type PropsWithStyles = Props & WithStyles<'root'>;

class ListLinodes extends React.Component<PropsWithStyles> {
  static defaultProps = {
    linodes: [],
  };

  listLinodes() {
    const { linodes } = this.props;

    return (
      <Grid container>
        <Grid item xs={12}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Label</TableCell>
                <TableCell>IP Addresses</TableCell>
                <TableCell>Region</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {linodes.map((l, idx) => <LinodeRow key={idx} linode={l} />)}
            </TableBody>
          </Table>
        </Grid>
      </Grid>
    );
  }

  render() {
    const { classes, linodes } = this.props;

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
                  {linodes.length > 0 ? this.listLinodes() : <ListLinodesEmptyState />}
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
  linodes: pathOr([], ['api', 'linodes', 'data'], state),
});

export default compose(
  withStyles<'root'>(styles, { withTheme: true }),
  connect<Props>(mapStateToProps),
)(ListLinodes);
