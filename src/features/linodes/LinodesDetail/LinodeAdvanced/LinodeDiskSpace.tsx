import { WithStyles } from '@material-ui/core/styles';
import * as React from 'react';
import BarPercent from 'src/components/BarPercent';
import Divider from 'src/components/core/Divider';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
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
      margin: `${theme.spacing(1) + 2}px 0`,
      paddingRight: 40
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
  disks: Linode.Disk[];
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
        />
        <Typography className={classes.text}>
          <strong data-qa-disk-used-percentage>{formattedPercentage}%</strong>{' '}
          of your {totalDiskSpace}MB is allocated towards
          <strong> {disks.length}</strong> disk{' '}
          {disks.length === 1 ? 'image' : 'images'}.
        </Typography>
        <Divider className={classes.divider} />
        <div className={classes.textOuter}>
          <Typography variant="subtitle2">
            Total: <strong>{totalDiskSpace} MB</strong>
          </Typography>
          <Typography variant="subtitle2">
            Used: <strong>{usedDiskSpace} MB</strong>
          </Typography>
        </div>
        <Divider className={classes.divider} />
        <Typography variant="subtitle2" className={classes.text}>
          Free: <strong>{freeDiskSpace} MB</strong>
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
export const addUsedDiskSpace = (disks: Linode.Disk[]) => {
  return disks.reduce((accum, eachDisk) => eachDisk.size + accum, 0);
};

const styled = withStyles(styles);

export default styled(LinodeDiskSpace);
