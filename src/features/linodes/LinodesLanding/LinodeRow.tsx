import * as React from 'react';
import { Link } from 'react-router-dom';

import {
  withStyles,
  Theme,
  WithStyles,
  StyleRulesCallback,
} from 'material-ui/styles';
import Grid from 'src/components/Grid';
import Typography from 'material-ui/Typography';
import TableRow from 'material-ui/Table/TableRow';
import TableCell from 'material-ui/Table/TableCell';

import LinearProgress from 'src/components/LinearProgress';
import { LinodeConfigSelectionDrawerCallback } from 'src/features/LinodeConfigSelectionDrawer';
import Flag from 'src/assets/icons/flag.svg';

import LinodeStatusIndicator from './LinodeStatusIndicator';
import RegionIndicator from './RegionIndicator';
import IPAddress from './IPAddress';
import { displayLabel } from '../presentation';
import LinodeActionMenu from './LinodeActionMenu';
import transitionStatus from '../linodeTransitionStatus';
import Tooltip from 'material-ui/Tooltip';

type ClassNames = 'bodyRow'
| 'linodeCell'
| 'tagsCell'
| 'ipCell'
| 'regionCell'
| 'actionCell'
| 'actionInner'
| 'flag'
| 'status';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => {
  return ({
    bodyRow: {
      height: 77,
    },
    linodeCell: {
      width: '30%',
    },
    tagsCell: {
      width: '15%',
    },
    ipCell: {
      width: '30%',
    },
    regionCell: {
      width: '15%',
    },
    actionCell: {
      width: '10%',
      textAlign: 'right',
      '& button': {
        width: 30,
      },
    },
    actionInner: {
      display: 'flex',
      justifyContent: 'flex-end',
    },
    flag: {
      marginRight: 10,
      transition: theme.transitions.create('opacity'),
      opaity: 1,
      '&:hover': {
        opacity: .75,
      },
    },
    status: {
      textTransform: 'capitalize',
      marginBottom: theme.spacing.unit,
      color: '#555',
      fontSize: '.92rem',
    },
  });
};

interface Props {
  linode: Linode.EnhancedLinode;
  type?: Linode.LinodeType;
  openConfigDrawer: (configs: Linode.Config[], action: LinodeConfigSelectionDrawerCallback) => void;
}

type PropsWithStyles = Props & WithStyles<ClassNames>;

class LinodeRow extends React.Component<PropsWithStyles> {
  headCell = () => {
    const { type, linode, classes } = this.props;
    const specsLabel = type && displayLabel(type.memory);

    return(
      <TableCell className={classes.linodeCell}>
        <Grid container alignItems="center">
          <Grid item className="py0">
            <LinodeStatusIndicator status={linode.status} />
          </Grid>
          <Grid item className="py0">
            <Link to={`/linodes/${linode.id}`}>
              <Typography variant="subheading">
                {linode.label}
              </Typography>
            </Link>
            {specsLabel && <div>{specsLabel}</div>}
          </Grid>
        </Grid>
      </TableCell>
    );
  }

  loadingState = () => {
    const { linode, classes } = this.props;
    const value = (linode.recentEvent && linode.recentEvent.percent_complete) || 1;
    return(
      <TableRow key={linode.id} className={classes.bodyRow}>
        {this.headCell()}
        <TableCell colSpan={4}>
          {typeof value === 'number' &&
            <div className={classes.status}>{linode.status.replace('_', ' ')}: {value}%</div>
          }
          <LinearProgress value={value} />
        </TableCell>
      </TableRow>
    );
  }

  loadedState = () => {
    const { linode, classes, openConfigDrawer } = this.props;

    return(
      <TableRow key={linode.id}>
        {this.headCell()}
        <TableCell className={classes.ipCell}>
          <IPAddress ips={linode.ipv4} copyRight />
          <IPAddress ips={[linode.ipv6]} copyRight />
        </TableCell>
        <TableCell className={classes.regionCell}>
          <RegionIndicator region={linode.region} />
        </TableCell>
        <TableCell className={classes.actionCell}>
          <div className={classes.actionInner}>
            {linode.notification &&
              <Tooltip title={linode.notification}><Flag className={classes.flag} /></Tooltip>
            }
            <LinodeActionMenu
              linode={linode}
              openConfigDrawer={openConfigDrawer}
            />
          </div>
        </TableCell>
    </TableRow>
    );
  }

  render() {
    const loading = transitionStatus.includes(this.props.linode.status);

    return loading
      ? this.loadingState()
      : this.loadedState();
  }
}

export default withStyles(styles, { withTheme: true })(LinodeRow);
