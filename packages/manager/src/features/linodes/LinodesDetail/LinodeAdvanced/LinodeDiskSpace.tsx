import { Disk } from 'linode-js-sdk/lib/linodes';
import * as React from 'react';
import BarPercent from 'src/components/BarPercent';
import Grid from 'src/components/core/Grid';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';

type ClassNames =
  | 'root'
  | 'header'
  | 'bar'
  | 'text'
  | 'divider'
  | 'textOuter'
  | 'code';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    header: {
      marginTop: theme.spacing(1) + 6,
      marginBottom: theme.spacing(1)
    },
    bar: {
      marginBottom: theme.spacing(1)
    },
    text: {
      margin: `${theme.spacing(2)}px 0`
      // paddingRight: 40
    },
    divider: {
      backgroundColor: theme.color.grey2
    },
    textOuter: {
      margin: `${theme.spacing(1) + 2}px 0`
    },
    code: {
      color: theme.color.black,
      margin: `0 0 ${theme.spacing(1) + 2}px`
    }
  });

interface Props {
  disks: Disk[];
  totalDiskSpace: number;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export class LinodeDiskSpace extends React.PureComponent<CombinedProps> {
  render() {
    const { disks, totalDiskSpace, classes } = this.props;

    const usedDiskSpace = addUsedDiskSpace(disks);

    const freeDiskSpace = totalDiskSpace - usedDiskSpace;

    const usedPercentage = (usedDiskSpace / totalDiskSpace) * 100;
    const formattedPercentage =
      usedPercentage < 1 && usedPercentage !== 0
        ? '< 1'
        : Math.floor(usedPercentage);

    return (
      <React.Fragment>
        <Typography className={classes.header} variant="h3">
          Disk Storage
        </Typography>
        <BarPercent
          className={classes.bar}
          max={totalDiskSpace}
          value={usedDiskSpace}
          rounded
        />
        <Grid container justify="space-between">
          <Grid item style={{ marginRight: 10 }}>
            <Typography>{usedDiskSpace} MB Used</Typography>
          </Grid>
          <Grid item>
            <Typography>{freeDiskSpace} MB Available</Typography>
          </Grid>
        </Grid>
        <Typography className={classes.text}>
          <strong data-qa-disk-used-percentage>{formattedPercentage}%</strong>{' '}
          of your {totalDiskSpace}MB is allocated towards
          <strong> {disks.length}</strong> disk{' '}
          {disks.length === 1 ? 'image' : 'images'}.
        </Typography>
        <Typography className={classes.text}>
          <strong>Note: </strong> This section represents your plan's available
          storage that has been allocated to your disks; run
        </Typography>
        <pre className={classes.code}>df -h</pre>
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
export const addUsedDiskSpace = (disks: Disk[]) => {
  return disks.reduce((accum, eachDisk) => eachDisk.size + accum, 0);
};

const styled = withStyles(styles);

export default styled(LinodeDiskSpace);
