import { Linode } from '@linode/api-v4/lib/linodes/types';
import * as React from 'react';
import CPUIcon from 'src/assets/icons/cpu-icon.svg';
import DiskIcon from 'src/assets/icons/disk.svg';
import MapPin from 'src/assets/icons/map-pin-icon.svg';
import MiniKube from 'src/assets/icons/mini-kube.svg';
import RamIcon from 'src/assets/icons/ram-sticks.svg';
import VolumeIcon from 'src/assets/icons/volume.svg';
import ActionMenu from 'src/components/ActionMenu';
import Chip from 'src/components/core/Chip';
import List from 'src/components/core/List';
import ListItem from 'src/components/core/ListItem';
import { makeStyles, Theme } from 'src/components/core/styles';
import Table from 'src/components/core/Table';
import TableCell from 'src/components/core/TableCell';
import TableRow from 'src/components/core/TableRow';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import { dcDisplayNames } from 'src/constants';
import formatDate from 'src/utilities/formatDate';
import { pluralize } from 'src/utilities/pluralize';
import EntityHeader from 'src/components/EntityHeader';
import { lishLink, sshLink } from './LinodesDetail/utilities';
import EntityDetail from 'src/components/EntityDetail';

interface LinodeEntityDetailProps {
  linode: Linode;
  distro: string;
  numVolumes: number;
  username: string;
  openLishConsole: () => void;
}

const LinodeEntityDetail: React.FC<LinodeEntityDetailProps> = props => {
  const { linode, distro, numVolumes, username, openLishConsole } = props;

  return (
    <EntityDetail
      header={
        <Header linodeLabel={linode.label} linodeStatus={linode.status} />
      }
      body={
        <Body
          linodeLabel={linode.label}
          numCPUs={linode.specs.vcpus}
          gbRAM={linode.specs.memory / 1024}
          gbStorage={linode.specs.disk / 1024}
          distro={distro}
          numVolumes={numVolumes}
          region={linode.region}
          ipv4={linode.ipv4}
          ipv6={linode.ipv6}
          username={username}
          openLishConsole={openLishConsole}
        />
      }
      footer={
        <Footer
          linodeId={linode.id}
          linodeCreated={linode.created}
          linodeTags={linode.tags}
        />
      }
    />
  );
};

export default React.memo(LinodeEntityDetail);

// =============================================================================
// Header
// =============================================================================
interface HeaderProps {
  linodeLabel: string;
  linodeStatus: Linode['status'];
}

const Header: React.FC<HeaderProps> = props => {
  const { linodeLabel, linodeStatus } = props;
  return (
    <EntityHeader
      title={linodeLabel}
      parentLink="/linodes"
      parentText="Linodes"
      iconType="linode"
      actions={
        <ActionMenu ariaLabel="linode-detail" createActions={() => []} />
      }
      body={
        <Chip
          style={{
            backgroundColor: '#00b159',
            color: 'white',
            fontSize: '1.1 rem',
            padding: '10px'
          }}
          label={linodeStatus.toUpperCase()}
          component="span"
          clickable={false}
        />
      }
    />
  );
};

// =============================================================================
// Body
// =============================================================================
export interface BodyProps {
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

const useBodyStyles = makeStyles((theme: Theme) => ({
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

export const Body: React.FC<BodyProps> = React.memo(props => {
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

  const classes = useBodyStyles();

  return (
    <Grid container direction="row" justify="space-between">
      <Grid item>
        {/* @todo: Rewrite this code to make it dynamic. It's very similar to the LKE display. */}
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
});

// =============================================================================
// Footer
// =============================================================================
interface FooterProps {
  linodeId: number;
  linodeCreated: string;
  linodeTags: string[];
}

const useFooterStyles = makeStyles((theme: Theme) => ({
  detailsSection: {
    display: 'flex'
  },
  linodeId: {
    paddingRight: 10,
    borderRight: `1px solid ${theme.color.grey6}`
  },
  linodeCreated: {
    paddingLeft: 10
  },
  linodeTags: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end'
  }
}));

export const Footer: React.FC<FooterProps> = React.memo(props => {
  const { linodeId, linodeCreated } = props;

  const classes = useFooterStyles();
  return (
    <Grid container>
      <Grid item xs={6}>
        <div className={classes.detailsSection}>
          <Typography className={classes.linodeId}>
            Linode ID {linodeId}
          </Typography>
          <Typography className={classes.linodeCreated}>
            Created {formatDate(linodeCreated)}
          </Typography>
        </div>
      </Grid>
      <Grid item xs={6} className={classes.linodeTags}>
        <div>Linode Tags</div>
      </Grid>
    </Grid>
  );
});
