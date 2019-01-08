import {
  StyleRulesCallback,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import * as React from 'react';

import BarPercent from 'src/components/BarPercent';
import Divider from 'src/components/core/Divider';
import Typography from 'src/components/core/Typography';
import ErrorState from 'src/components/ErrorState';

type ClassNames = 'root' | 'item';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  item: {
    marginBottom: theme.spacing.unit
  }
});

interface Props {
  loading: boolean;
  disks?: Linode.Disk[];
  error?: Error;
  totalDiskSpace?: number;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export class LinodeDiskSpace extends React.PureComponent<CombinedProps> {
  render() {
    const { loading, error, disks, totalDiskSpace, classes } = this.props;


    if (loading) { return <DiskSpaceLoading /> }

    if (error) {
      return (
        <ErrorState cozy errorText="There was an error loading your storage statistics" />
      )
    }

    if (!disks || !totalDiskSpace) { return null; }

    const usedDiskSpace = addUsedDiskSpace(disks);

    const freeDiskSpace = totalDiskSpace - usedDiskSpace;

    const usedPercentage = Math.floor((usedDiskSpace / totalDiskSpace) * 100);

    return (
      <React.Fragment>
        <Typography className={classes.item} style={{ textAlign: 'center' }} variant="h3">
          Disk Storage
        </Typography>
        <BarPercent
          className={classes.item}
          max={totalDiskSpace}
          value={usedDiskSpace}
        />
        <Typography className={classes.item}>
          <strong>{usedPercentage}%</strong> of your {totalDiskSpace}MB is allocated towards
          <strong> {disks.length}</strong> disk {disks.length === 1 ? 'image' : 'images'}.
        </Typography>
        <Divider className={classes.item} />
        <Typography variant="subtitle2" className={classes.item}>Free: {freeDiskSpace} MB</Typography>
        <Typography variant="subtitle2" className={classes.item}>Used: {usedDiskSpace} MB</Typography>
        <Divider className={classes.item} />
        <Typography variant="subtitle2" className={classes.item}>Total: {totalDiskSpace} MB</Typography>
        <Typography className={classes.item}>
          <strong>Note: </strong> This section represents your plan's available storage that has
           been allocated to your disks; run
        </Typography>
        <Typography className={classes.item}>df -h</Typography>
        <Typography>
          from within your Linode to see your actual filesystem usage.
        </Typography>
      </React.Fragment>
    );
  }
}

/**
 * add all the used disk space together
 */
export const addUsedDiskSpace = (disks: Linode.Disk[]) => {
  return disks.reduce((accum, eachDisk) => eachDisk.size + accum, 0)
}

const styled = withStyles(styles);

export default styled(LinodeDiskSpace);

class DiskSpaceLoading extends React.PureComponent<{}> {
  render() {
    return (
      <BarPercent
        isFetchingValue={true}
        loadingText="Loading your storage statistics..."
        max={0}
        value={0}
      />
    )
  }
}
