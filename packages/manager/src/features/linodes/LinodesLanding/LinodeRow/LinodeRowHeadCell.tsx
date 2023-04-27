import classNames from 'classnames';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import { TooltipIcon } from 'src/components/TooltipIcon/TooltipIcon';
import Notice from 'src/components/Notice';
import TableCell from 'src/components/TableCell';

const useStyles = makeStyles((theme: Theme) => ({
  link: {
    display: 'block',
    fontSize: '.875rem',
    lineHeight: '1.125rem',
    color: theme.textColors.linkActiveLight,
    '&:hover, &:focus': {
      textDecoration: 'underline',
    },
  },
  root: {
    '& h3': {
      transition: theme.transitions.create(['color']),
    },
    [theme.breakpoints.up('lg')]: {
      width: '20%',
    },
    [theme.breakpoints.up('xl')]: {
      width: '35%',
    },
  },
  labelStatusWrapper: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    '& a': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: 'inline-block',
    },
  },
  maintenanceContainer: {},
  maintenanceNotice: {
    paddingTop: 0,
    paddingBottom: 0,
    '& .noticeText': {
      display: 'flex',
      alignItems: 'center',
      fontSize: '.9rem',
      '& br': {
        display: 'none',
      },
    },
  },
  TooltipIcon: {
    paddingTop: 0,
    paddingBottom: 0,
  },
}));

interface Props {
  label: string;
  id: number;
  width?: number;
  maintenance?: string;
  isDashboard?: boolean;
}

const LinodeRowHeadCell = (props: Props) => {
  const { label, id, width, maintenance, isDashboard } = props;

  const classes = useStyles();

  const style = width ? { width: `${width}%` } : {};
  const dateTime = maintenance && maintenance.split(' ');
  const MaintenanceText = () => {
    return (
      <>
        For more information, please see your{' '}
        <Link to="/support/tickets?type=open">open support tickets.</Link>
      </>
    );
  };

  return (
    <TableCell
      className={classNames({
        [classes.root]: true,
      })}
      style={style}
    >
      <Grid container wrap="nowrap" alignItems="center">
        {/* Hidden overflow is necessary for the wrapping of the label to work. */}
        <Grid style={{ overflow: 'hidden' }}>
          <div className={classes.labelStatusWrapper}>
            <Link className={classes.link} to={`/linodes/${id}`} tabIndex={0}>
              {label}
            </Link>
          </div>
          {maintenance && dateTime && isDashboard && (
            <div className={classes.maintenanceContainer}>
              <Notice
                warning
                spacingTop={8}
                spacingBottom={0}
                className={classes.maintenanceNotice}
              >
                Maintenance: <br />
                {dateTime[0]} at {dateTime[1]}
                <TooltipIcon
                  status="help"
                  text={<MaintenanceText />}
                  tooltipPosition="top"
                  interactive
                  className={classes.TooltipIcon}
                />
              </Notice>
            </div>
          )}
        </Grid>
      </Grid>
    </TableCell>
  );
};

export default LinodeRowHeadCell;
