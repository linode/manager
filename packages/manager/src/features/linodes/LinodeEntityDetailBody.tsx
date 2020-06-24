import { Linode } from '@linode/api-v4/lib/linodes/types';
import * as React from 'react';
import CPUIcon from 'src/assets/icons/cpu-icon.svg';
import DiskIcon from 'src/assets/icons/disk.svg';
import MapPin from 'src/assets/icons/map-pin-icon.svg';
import MiniKube from 'src/assets/icons/mini-kube.svg';
import RamIcon from 'src/assets/icons/ram-sticks.svg';
import VolumeIcon from 'src/assets/icons/volume.svg';
import List from 'src/components/core/List';
import ListItem from 'src/components/core/ListItem';
import { makeStyles, Theme } from 'src/components/core/styles';
import Table from 'src/components/core/Table';
import TableCell from 'src/components/core/TableCell';
import TableRow from 'src/components/core/TableRow';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import { dcDisplayNames } from 'src/constants';
import { pluralize } from 'src/utilities/pluralize';
import { lishLink, sshLink } from './LinodesDetail/utilities';

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  item: {
    '&:last-of-type': {
      paddingBottom: 0
    },
    paddingBottom: 7
  },
  iconsSharedStyling: {
    width: 25,
    height: 25,
    objectFit: 'contain'
  },
  specColumn: {
    marginRight: 50
  },
  iconSharedOuter: {
    textAlign: 'center',
    flexBasis: '28%',
    paddingRight: `4px !important`,
    paddingLeft: `4px !important`,
    display: 'flex'
  },
  iconTextOuter: {
    flexBasis: '72%',
    minWidth: 115,
    paddingRight: `4px !important`,
    paddingLeft: `4px !important`,
    alignSelf: 'center'
  },
  ipContainer: {
    marginLeft: 20
  },
  ipLabel: {
    fontWeight: 'bold'
  },
  ipList: {
    marginTop: 4,
    '& li': {
      padding: 0,
      lineHeight: 1.43
    }
  },
  // @todo: use mixin for this button reset (M3-4270)
  button: {
    backgroundColor: 'inherit',
    border: 'none',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    fontWeight: 'bold', // @todo: should be semi-bold
    color: theme.color.blue,
    padding: 0,
    cursor: 'pointer'
  },
  accessTable: {
    '& tr': {
      height: 34
    },
    '& td': {
      lineHeight: 1.4,
      fontStretch: 'normal',
      letterSpacing: 'normal',
      border: 'none',
      paddingTop: 8,
      paddingRight: 10,
      paddingBottom: 7,
      paddingLeft: 10
    },
    '& tr:first-child > td': {
      borderBottom: '1px solid white'
    },
    '& tr:last-child > td': {
      borderTop: '1px solid white'
    },
    '& tr > td:first-child': {
      backgroundColor: theme.color.grey5,
      fontWeight: 'bold'
    },
    '& tr > td:not(:first-child)': {
      backgroundColor: theme.color.grey7
    }
  },
  accessTableContainer: {
    paddingTop: `6px !important`
  },
  code: {
    // @todo: use font from designs
    fontFamily: '"Ubuntu Mono", monospace, sans-serif'
  }
}));

export interface LinodeEntityDetailBodyProps {
  numCPUs: number;
  gbRAM: number;
  gbStorage: number;
  distro: string;
  numVolumes: number;
  region: string;
  ipv4: Linode['ipv4'];
  ipv6: Linode['ipv6'];
  username: string;
  linodeLabel: string;
  openLishConsole: () => void;
}

export const LinodeEntityDetailBody: React.FC<LinodeEntityDetailBodyProps> = props => {
  const {
    numCPUs,
    gbRAM,
    gbStorage,
    distro,
    numVolumes,
    region,
    ipv4,
    ipv6,
    username,
    linodeLabel,
    openLishConsole
  } = props;

  const classes = useStyles();
  return (
    <Grid
      container
      direction="row"
      justify="space-between"
      className={classes.root}
    >
      <Grid item>
        <Grid container>
          <Grid item className={classes.specColumn}>
            <Grid container item wrap="nowrap" className={classes.item}>
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

          <Grid item>
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
      </Grid>

      <Grid item className={classes.ipContainer}>
        <Typography className={classes.ipLabel}>IP Addresses</Typography>
        <List className={classes.ipList}>
          {ipv4.map(thisIP => {
            return <ListItem key={thisIP}>{thisIP}</ListItem>;
          })}
          {ipv6 && <ListItem>{ipv6}</ListItem>}
        </List>
      </Grid>

      <Grid item className={classes.accessTableContainer}>
        <Table className={classes.accessTable}>
          <TableRow>
            <TableCell>SSH Access</TableCell>
            <TableCell className={classes.code}>{sshLink(ipv4[0])}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>LISH via SSH</TableCell>
            <TableCell className={classes.code}>
              {lishLink(username, region, linodeLabel)}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>LISH via Web</TableCell>
            <TableCell>
              <button className={classes.button} onClick={openLishConsole}>
                Launch Console
              </button>
            </TableCell>
          </TableRow>
        </Table>
      </Grid>
    </Grid>
  );
};

export default LinodeEntityDetailBody;
