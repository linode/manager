import * as React from 'react';
import CPUIcon from 'src/assets/icons/cpu-icon.svg';
import DiskIcon from 'src/assets/icons/disk.svg';
import MapPin from 'src/assets/icons/map-pin-icon.svg';
import MiniKube from 'src/assets/icons/mini-kube.svg';
import RamIcon from 'src/assets/icons/ram-sticks.svg';
import VolumeIcon from 'src/assets/icons/volume.svg';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import { dcDisplayNames } from 'src/constants';
import { pluralize } from 'src/utilities/pluralize';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(3),
    padding: `${theme.spacing(2) + 4}px ${theme.spacing(2) +
      4}px ${theme.spacing(3)}px`
  },
  mainGridContainer: {
    [theme.breakpoints.up('lg')]: {
      justifyContent: 'space-between'
    }
  },
  item: {
    '&:last-of-type': {
      paddingBottom: 0
    },
    paddingBottom: theme.spacing(1)
  },
  label: {
    marginBottom: `${theme.spacing(1) - 3}px`,
    fontWeight: 'bold'
  },
  column: {},
  iconsSharedStyling: {
    width: 24,
    height: 24,
    objectFit: 'contain'
  },
  kubeconfigSection: {
    marginTop: `${theme.spacing() + 2}px`
  },
  kubeconfigElements: {
    color: theme.palette.primary.main,
    display: 'flex',
    alignItems: 'center'
  },
  kubeconfigFileText: {
    cursor: 'pointer',
    color: theme.palette.primary.main,
    marginRight: theme.spacing(1)
  },
  kubeconfigIcons: {
    cursor: 'pointer',
    width: 16,
    height: 16,
    objectFit: 'contain',
    margin: `0 ${theme.spacing(1)}px`
  },
  tagsSection: {
    display: 'flex',
    [theme.breakpoints.up('lg')]: {
      justifyContent: 'flex-end',
      textAlign: 'right'
    }
  },
  iconSharedOuter: {
    textAlign: 'center',
    flexBasis: '28%'
  },
  iconTextOuter: {
    flexBasis: '72%',
    minWidth: 115
  }
}));

export interface LinodeEntityDetailBodyProps {
  numCPUs: number;
  gbRAM: number;
  gbStorage: number;
  distro: string;
  numVolumes: number;
  region: string;
}

export const LinodeEntityDetailBody: React.FC<LinodeEntityDetailBodyProps> = props => {
  const { numCPUs, gbRAM, gbStorage, distro, numVolumes, region } = props;

  const classes = useStyles();
  return (
    <Grid container>
      <Grid item container direction="row" xs={12} justify="space-between">
        <div>
          <Grid container>
            <Grid item className={classes.column}>
              <Grid
                container
                item
                wrap="nowrap"
                alignItems="center"
                className={classes.item}
              >
                <Grid item className={classes.iconSharedOuter}>
                  <CPUIcon className={classes.iconsSharedStyling} />
                </Grid>

                <Grid item className={classes.iconTextOuter}>
                  <Typography>
                    {pluralize('CPU Core', 'CPU Cores', numCPUs)}
                  </Typography>
                </Grid>
              </Grid>

              <Grid
                container
                item
                wrap="nowrap"
                alignItems="center"
                className={classes.item}
              >
                <Grid item className={classes.iconSharedOuter}>
                  <RamIcon className={classes.iconsSharedStyling} />
                </Grid>

                <Grid item className={classes.iconTextOuter}>
                  <Typography>{gbRAM} RAM</Typography>
                </Grid>
              </Grid>

              <Grid
                container
                item
                wrap="nowrap"
                alignItems="center"
                className={classes.item}
              >
                <Grid item className={classes.iconSharedOuter}>
                  <DiskIcon width={19} height={24} object-fit="contain" />
                </Grid>

                <Grid item className={classes.iconTextOuter}>
                  <Typography>{gbStorage} GB Storage</Typography>
                </Grid>
              </Grid>
            </Grid>

            <Grid item className={classes.column}>
              <Grid
                container
                item
                wrap="nowrap"
                alignItems="center"
                className={classes.item}
              >
                <Grid item className={classes.iconSharedOuter}>
                  <MiniKube className={classes.iconsSharedStyling} />
                </Grid>

                <Grid item className={classes.iconTextOuter}>
                  <Typography>{distro}</Typography>
                </Grid>
              </Grid>

              <Grid
                container
                item
                wrap="nowrap"
                alignItems="center"
                className={classes.item}
              >
                <Grid item className={classes.iconSharedOuter}>
                  <VolumeIcon className={classes.iconsSharedStyling} />
                </Grid>

                <Grid item className={classes.iconTextOuter}>
                  <Typography>
                    {pluralize('Volume', 'Volumes', numVolumes)}
                  </Typography>
                </Grid>
              </Grid>

              <Grid
                container
                item
                wrap="nowrap"
                alignItems="center"
                className={classes.item}
              >
                <Grid item className={classes.iconSharedOuter}>
                  <MapPin className={classes.iconsSharedStyling} />
                </Grid>

                <Grid item className={classes.iconTextOuter}>
                  <Typography>
                    {dcDisplayNames[region] ?? 'Unknown Region'}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </div>
        <Grid item>IP Addresses</Grid>
        <Grid item>Access details</Grid>
      </Grid>
    </Grid>
  );
};

export default LinodeEntityDetailBody;
