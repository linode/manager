import {
  StyleRulesCallback,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import * as React from 'react';
import { compose, lifecycle } from 'recompose';

import { getTrustedDevices } from 'src/services/profile';

import Paper from 'src/components/core/Paper';
import TableBody from 'src/components/core/TableBody';
import Typography from 'src/components/core/Typography';
import Pagey, { PaginationProps } from 'src/components/Pagey';
// import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';

import TrustedDevicesTable from './TrustedDevicesTable';

type ClassNames = 'root' | 'title';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    padding: theme.spacing.unit * 3,
    paddingBottom: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit * 3,
  },
  title: {
    marginBottom: theme.spacing.unit * 2,
  }
});

type CombinedProps = PaginationProps<Linode.Device> & WithStyles<ClassNames>;

class TrustedDevices extends React.PureComponent<CombinedProps, {}> {
  render() {
    const { classes, loading, error, data: devices } = this.props;
    return (
      <Paper className={classes.root}>
        <Typography
          role="header"
          variant="h2"
          className={classes.title}
          data-qa-title
        >
          Trusted Devices
        </Typography>
        <Table>
          <TableBody>
            <TrustedDevicesTable
              error={error}
              data={devices}
              loading={loading} />
          </TableBody>
        </Table>
      </Paper>
    );
  }
}

const paginated = Pagey(
  (ownProps: {}, params: any, filter: any) => getTrustedDevices(params, filter)
    .then(response => response)
)

const styled = withStyles(styles);

const withRequestOnMount = lifecycle<PaginationProps<Linode.Device>, {}>({
  componentDidMount() {
    this.props.request();
  }
})

export default compose<CombinedProps, {}>(
  paginated,
  withRequestOnMount,
  styled
)(TrustedDevices);
