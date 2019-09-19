import { Event } from 'linode-js-sdk/lib/account';
import { LinodeStatus } from 'linode-js-sdk/lib/linodes';
import * as React from 'react';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import LinearProgress from 'src/components/LinearProgress';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { linodeInTransition } from 'src/features/linodes/transitions';

type ClassNames = 'bodyRow' | 'status' | 'bodyCell';

const styles = (theme: Theme) =>
  createStyles({
    bodyRow: {
      height: 'auto',
      '&:before': {
        borderBottomColor: 'transparent'
      }
    },
    bodyCell: {
      border: 0,
      paddingBottom: 0
    },
    status: {
      textTransform: 'capitalize',
      marginBottom: theme.spacing(1),
      color: theme.palette.text.primary,
      fontSize: '.92rem'
    }
  });

interface Props {
  linodeId: number;
  linodeStatus: LinodeStatus;
  linodeRecentEvent?: Event;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const LinodeRowLoading: React.StatelessComponent<CombinedProps> = props => {
  const {
    classes,
    linodeId,
    linodeStatus,
    linodeRecentEvent,
    children
  } = props;

  return (
    <TableRow
      key={linodeId}
      className={classes.bodyRow}
      data-qa-linode={linodeId}
      data-qa-loading
    >
      {children}
      <TableCell colSpan={5} className={classes.bodyCell}>
        {linodeRecentEvent &&
          linodeInTransition(linodeStatus, linodeRecentEvent) && (
            <ProgressDisplay progress={linodeRecentEvent.percent_complete} />
          )}
      </TableCell>
    </TableRow>
  );
};

const styled = withStyles(styles);

export default styled(LinodeRowLoading);

const ProgressDisplay: React.StatelessComponent<{
  progress: null | number;
}> = props => {
  const { progress } = props;

  return progress ? (
    <LinearProgress value={progress} />
  ) : (
    <LinearProgress variant="indeterminate" />
  );
};
