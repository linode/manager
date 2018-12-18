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
  triggerDeletion: (deviceId: number) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class TrustedDevicesTable extends React.PureComponent<CombinedProps, {}> {
  render() {
    const { loading, error, data, triggerDeletion } = this.props;
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
              <TableCell>
                <UntrustButton
                  deviceId={eachDevice.id}
                  triggerDeletion={triggerDeletion}
                />
              </TableCell>
            </TableRow>
          )
        })}
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

export default styled(TrustedDevicesTable);

interface ButtonProps {
  deviceId?: number;
  triggerDeletion: (deviceId: number) => void;
}
class UntrustButton extends React.PureComponent<ButtonProps, {}> {
  handleDelete = () => {
    const { triggerDeletion, deviceId } = this.props;
    if (!!deviceId) { triggerDeletion(deviceId) }
  }
  render() {
    return (
      <Button onClick={this.handleDelete}>Untrust</Button>
    )
  }
}
