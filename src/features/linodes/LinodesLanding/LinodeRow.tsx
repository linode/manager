import * as React from 'react';
import { Link } from 'react-router-dom';

import {
  withStyles,
  Theme,
  WithStyles,
  StyleRulesCallback,
} from 'material-ui/styles';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import TableRow from 'material-ui/Table/TableRow';
import TableCell from 'material-ui/Table/TableCell';

import Tag from 'src/components/Tag';
import LinearProgress from 'src/components/LinearProgress';

import LinodeStatusIndicator from './LinodeStatusIndicator';
import RegionIndicator from './RegionIndicator';
import IPAddress from './IPAddress';
import { displayLabel } from '../presentation';
import LinodeActionMenu from './LinodeActionMenu';
import transitionStatus from './linodeTransitionStatus';

type ClassNames = 'bodyRow'
| 'linodeCell'
| 'tagsCell'
| 'ipCell'
| 'ipCellInner'
| 'regionCell'
| 'actionCell'
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
    ipCellInner: {
      maxWidth: 100,
      display: 'block',
      overflow: 'auto',
      [theme.breakpoints.up('md')]: {
        maxWidth: 300,
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
  linode: (Linode.Linode & { recentEvent?: Linode.Event });
  type?: Linode.LinodeType;
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
    const value = (linode.recentEvent && linode.recentEvent.percent_complete !== null)
      ? Math.max(linode.recentEvent.percent_complete, 1)
      : true;

    return(
      <TableRow key={linode.id} className={classes.bodyRow}>
        {this.headCell()}
        <TableCell colSpan={4}>
        { typeof value === 'number' &&
          <div className={classes.status}>{linode.status.replace('_', ' ')}: {value}%</div>
        }
          <LinearProgress value={value} />
        </TableCell>
      </TableRow>
    );
  }

  loadedState = () => {
    const { linode, classes } = this.props;

    /**
     * @todo Until tags are implemented we're using the group as a faux tag.
     **/
    const tags = [linode.group].filter(Boolean);

    return(
      <TableRow key={linode.id}>
        {this.headCell()}
        <TableCell className={classes.tagsCell}>
          {tags.map((v: string, idx) => <Tag key={idx} label={v} />)}
        </TableCell>
        <TableCell className={classes.ipCell}>
          <div className={classes.ipCellInner}>
            <IPAddress ips={linode.ipv4} />
            <IPAddress ips={[linode.ipv6]} />
          </div>
        </TableCell>
        <TableCell className={classes.regionCell}>
          <RegionIndicator region={linode.region} />
        </TableCell>
        <TableCell className={classes.actionCell}>
          <LinodeActionMenu linode={linode} />
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
