import {
  StyleRulesCallback,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import * as React from 'react';
// import TableCell from 'src/components/TableCell';
// import TableRow from 'src/components/TableRow';
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

    if (!data) { return null }
    
    return (
      <div>Hello World</div>
    );
  }
}

const styled = withStyles(styles);

export default styled(TrustedDevicesTable);
