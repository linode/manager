import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from '@material-ui/core/styles';
import * as React from 'react';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableRowEmpty from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {}
});

interface Props {
  loading: boolean;
  error?: Error;
  data?: Linode.Device[];
  setDevice: (deviceId: number) => void;
  toggleDialog: () => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

class TrustedDevicesTable extends React.PureComponent<CombinedProps, {}> {
  triggerDeletion = (deviceId: number) => {
    this.props.setDevice(deviceId);
    this.props.toggleDialog();
  };

  render() {
    const { loading, error, data } = this.props;
    if (loading) {
      return <TableRowLoading colSpan={6} />;
    }

    if (error) {
      return (
        <TableRowError
          colSpan={4}
          message="There was an issue loading your trusted devices."
        />
      );
    }

    if (!data || data.length === 0) {
      return <TableRowEmpty colSpan={6} />;
    }

    return (
      <React.Fragment>
        {data.map(eachDevice => {
          return (
            <TableRow key={eachDevice.id}>
              <TableCell parentColumn="Device">
                {eachDevice.user_agent}
              </TableCell>
              <TableCell parentColumn="Last IP">
                {eachDevice.last_remote_addr}
              </TableCell>
              <TableCell parentColumn="Last Used">
                <DateTimeDisplay
                  value={eachDevice.last_authenticated}
                  humanizeCutoff="month"
                />
              </TableCell>
              <TableCell parentColumn="Expires">
                <DateTimeDisplay
                  value={eachDevice.expiry}
                  humanizeCutoff="month"
                />
              </TableCell>
              <TableCell>
                <UntrustButton
                  deviceId={eachDevice.id}
                  triggerDeletion={this.triggerDeletion}
                />
              </TableCell>
            </TableRow>
          );
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
    if (!!deviceId) {
      triggerDeletion(deviceId);
    }
  };
  render() {
    return (
      <a href="javascript:void(0)" onClick={this.handleDelete} title="Untrust">
        Untrust
      </a>
    );
  }
}
