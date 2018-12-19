import {
  StyleRulesCallback,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import * as React from 'react';

import Button from 'src/components/Button';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableRowEmpty from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface Props {
  loading: boolean;
  error?: Error;
  data?: Linode.Device[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

class TrustedDevicesTable extends React.PureComponent<CombinedProps, {}> {
  render() {
    const { loading, error, data } = this.props;
    if (loading) {
      return <TableRowLoading colSpan={4} />
    }

    if (error) {
      return <TableRowError colSpan={4} message="There was an issue loading your trusted devices." />
    }

    if (!data || data.length === 0) {
      return <TableRowEmpty colSpan={4} />
    }

    return (
      <React.Fragment>
        {data.map(eachDevice => {
          return (
            <TableRow key={eachDevice.id}>
              <TableCell parentColumn="Device">{eachDevice.user_agent}</TableCell>
              <TableCell parentColumn="Expires">
                <DateTimeDisplay value={eachDevice.expiry} />
              </TableCell>
              <TableCell><Button>Untrust</Button></TableCell>
            </TableRow>
          )
        })}
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

export default styled(TrustedDevicesTable);
