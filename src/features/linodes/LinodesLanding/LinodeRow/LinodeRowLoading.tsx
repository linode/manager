import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';
import * as React from 'react';
import LinearProgress from 'src/components/LinearProgress';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { transitionText } from 'src/features/linodes/transitions';
import HeadCell from './HeadCell';

type ClassNames = 'bodyRow' | 'status';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  bodyRow: {
    height: 77,
  },
  status: {
    textTransform: 'capitalize',
    marginBottom: theme.spacing.unit,
    color: theme.palette.text.primary,
    fontSize: '.92rem',
  },
});

interface Props {
  linodeId: number;
  linodeLabel: string;
  linodeRecentEvent?: Linode.Event;
  linodeStatus: Linode.LinodeStatus;
  linodeTags: string[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

const LinodeRowLoading: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    classes,
    linodeId,
    linodeLabel,
    linodeRecentEvent,
    linodeStatus,
    linodeTags,
  } = props;

  const value = (linodeRecentEvent && linodeRecentEvent.percent_complete) || 1;

  return (
    <TableRow key={linodeId} className={classes.bodyRow} data-qa-loading>
      <HeadCell
        linodeId={linodeId}
        linodeLabel={linodeLabel}
        linodeTags={linodeTags}
        linodeStatus={linodeStatus}
      />
      <TableCell colSpan={5}>
        {typeof value === 'number' &&
          <div className={classes.status}>
            {transitionText(linodeStatus, linodeRecentEvent)}: {value}%
          </div>
        }
        <LinearProgress value={value} />
      </TableCell>
    </TableRow>
  );
};

const styled = withStyles(styles);

export default styled(LinodeRowLoading);
