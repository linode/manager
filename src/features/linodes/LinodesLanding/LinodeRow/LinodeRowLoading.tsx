import * as React from 'react';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import LinearProgress from 'src/components/LinearProgress';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';

type ClassNames = 'bodyRow' | 'status' | 'bodyCell';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  bodyRow: {
    height: 77,
  },
  bodyCell: {
    border: 0,
    paddingBottom: 0,
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
  linodeRecentEvent?: Linode.Event;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const LinodeRowLoading: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    classes,
    linodeId,
    linodeRecentEvent,
    children,
  } = props;

  const value = (linodeRecentEvent && linodeRecentEvent.percent_complete) || 1;

  return (
    <TableRow key={linodeId} className={classes.bodyRow} data-qa-loading>
      { children }
      <TableCell colSpan={5} className={classes.bodyCell}>
        <LinearProgress value={value} />
      </TableCell>
    </TableRow>
  );
};

const styled = withStyles(styles);

export default styled(LinodeRowLoading);
