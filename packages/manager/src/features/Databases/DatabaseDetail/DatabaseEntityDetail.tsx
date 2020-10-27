import * as React from 'react';
import * as classnames from 'classnames';
import CPUIcon from 'src/assets/icons/cpu-icon.svg';
import DiskIcon from 'src/assets/icons/disk.svg';
import RamIcon from 'src/assets/icons/ram-sticks.svg';
import ResizeIcon from 'src/assets/icons/resize.svg';
import VolumeIcon from 'src/assets/icons/volume.svg';
import DocumentationButton from 'src/components/CMR_DocumentationButton';
import Chip from 'src/components/core/Chip';
import Hidden from 'src/components/core/Hidden';
import {
  makeStyles,
  Theme,
  useMediaQuery,
  useTheme
} from 'src/components/core/styles';
// import TagCell from 'src/components/TagCell';
import Table from 'src/components/core/Table';
import TableBody from 'src/components/core/TableBody';
import TableCell from 'src/components/core/TableCell';
import TableRow from 'src/components/core/TableRow';
import Typography from 'src/components/core/Typography';
import EntityDetail from 'src/components/EntityDetail';
import EntityHeader from 'src/components/EntityHeader';
import Grid from 'src/components/Grid';
import IconTextLink from 'src/components/IconTextLink';
// import { dcDisplayNames } from 'src/constants';
// import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
// import formatDate from 'src/utilities/formatDate';
import { pluralize } from 'src/utilities/pluralize';
import DatabaseActionMenu from 'src/features/Databases/DatabaseLanding/DatabaseActionMenu';

interface DatabaseEntityDetailProps {
  database: any;
}

const DatabaseEntityDetail: React.FC<DatabaseEntityDetailProps> = props => {
  const {} = props;

  // const regionDisplay = dcDisplayNames[database.region] ?? null;

  return (
    <EntityDetail
      header={<Header label="Label" status="running" />}
      body={<Body numCPUs={0} gbRAM={0} gbStorage={0} numVolumes={0} />}
      footer={
        <Footer
          plan=""
          regionDisplay=""
          id={1234}
          created=""
          // tags={[]}
          // openTagDrawer={openTagDrawer}
        />
      }
    />
  );
};

export default React.memo(DatabaseEntityDetail);

// =============================================================================
// Header
// =============================================================================
export interface HeaderProps {
  label: string;
  status: string;
}

const useHeaderStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.bg.white
  },
  distroIcon: {
    fontSize: 25,
    marginRight: 10
  },
  body: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    [theme.breakpoints.up('md')]: {
      marginLeft: 'auto',
      padding: `0 !important`
    }
  },
  statusChip: {
    ...theme.applyStatusPillStyles
  },
  statusRunning: {
    '&:before': {
      backgroundColor: theme.cmrIconColors.iGreen
    }
  },
  statusOffline: {
    '&:before': {
      backgroundColor: theme.cmrIconColors.iGrey
    }
  },
  statusOther: {
    '&:before': {
      backgroundColor: theme.cmrIconColors.iOrange
    }
  },
  actionItemsOuter: {
    display: 'flex',
    alignItems: 'center'
  },
  actionItem: {
    marginRight: 0,
    marginBottom: 0,
    maxHeight: 'none',
    padding: `15px 10px`,
    '& svg': {
      height: 20,
      width: 20,
      fill: theme.color.blue,
      color: theme.color.blue,
      marginRight: 10
    },
    '& span': {
      fontFamily: `${theme.font.normal} !important`
    },
    '&:disabled': {
      '& svg': {
        fill: theme.color.disabled
      }
    },
    '&:hover': {
      color: '#ffffff',
      backgroundColor: theme.color.blue,
      '& svg': {
        fill: '#ffffff',
        '& g': {
          stroke: '#ffffff'
        },
        '& path': {
          stroke: '#ffffff'
        }
      }
    },
    '&:focus': {
      outline: '1px dotted #999'
    }
  }
}));

const Header: React.FC<HeaderProps> = props => {
  const { label, status } = props;

  const classes = useHeaderStyles();
  const theme = useTheme<Theme>();
  const matchesMdDown = useMediaQuery(theme.breakpoints.down('md'));

  const isRunning = status === 'running';
  const isOffline = status === 'stopped' || status === 'offline';
  const isOther = !['running', 'stopped', 'offline'].includes(status);

  return (
    <EntityHeader
      parentLink="/databases"
      parentText="Virtual LANs"
      iconType="linode"
      actions={
        <Hidden mdUp>
          <DocumentationButton hideText href="https://www.linode.com/" />
        </Hidden>
      }
      title={label}
      bodyClassName={classes.body}
      body={
        <>
          <Chip
            className={classnames({
              [classes.statusChip]: true,
              [classes.statusRunning]: isRunning,
              [classes.statusOffline]: isOffline,
              [classes.statusOther]: isOther,
              statusOtherDetail: isOther
            })}
            label={status.replace('_', ' ').toUpperCase()}
            component="span"
            clickable={isOther ? true : false}
            {...(isOther && {
              onClick: () => {
                return undefined;
              }
            })}
          />

          <div className={classes.actionItemsOuter}>
            <IconTextLink
              className={classes.actionItem}
              SideIcon={ResizeIcon}
              text="Resize"
              title="Resize"
              to={`/`}
            />

            <DatabaseActionMenu
              databaseID={1234}
              databaseLabel=""
              inlineLabel={matchesMdDown ? undefined : 'More Actions'}
              triggerDeleteDatabase={() => null}
            />
          </div>
          <Hidden smDown>
            <DocumentationButton href="https://www.linode.com/" />
          </Hidden>
        </>
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
  numVolumes: number;
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
  iconSharedOuter: {
    textAlign: 'center',
    justifyContent: 'center',
    flexBasis: '28%',
    display: 'flex'
  },
  iconTextOuter: {
    flexBasis: '72%',
    minWidth: 115,
    alignSelf: 'center',
    color: theme.cmrTextColors.tableStatic
  },
  ipContainer: {
    paddingLeft: '40px !important'
  },
  ipList: {
    marginTop: 4,
    color: theme.cmrTextColors.tableStatic,
    '& li': {
      padding: 0,
      fontSize: '0.875rem',
      lineHeight: 1.43
    }
  },
  accessTable: {
    '& tr': {
      height: 34
    },
    '& td': {
      lineHeight: 1.29,
      fontSize: '0.875rem',
      fontStretch: 'normal',
      letterSpacing: 'normal',
      border: 'none',
      paddingTop: 8,
      paddingRight: 10,
      paddingBottom: 7,
      paddingLeft: 10,
      overflowX: 'auto',
      maxWidth: '100%',
      whiteSpace: 'nowrap',
      backgroundColor: theme.cmrBGColors.bgAccessRow,
      borderBottom: `1px solid ${theme.cmrBGColors.bgTableBody}`
    },
    '& th': {
      backgroundColor: theme.cmrBGColors.bgAccessHeader,
      borderBottom: `1px solid ${theme.cmrBGColors.bgTableBody}`,
      fontWeight: 'bold',
      fontSize: '0.875rem',
      color: theme.cmrTextColors.textAccessTable,
      lineHeight: 1.1,
      width: '102px',
      whiteSpace: 'nowrap',
      paddingTop: 8,
      paddingRight: 10,
      paddingBottom: 7,
      paddingLeft: 10,
      textAlign: 'left'
    }
  },
  accessTableContainer: {
    overflowX: 'auto',
    maxWidth: 335,
    [theme.breakpoints.up('md')]: {
      maxWidth: 728
    },
    [theme.breakpoints.up('lg')]: {
      maxWidth: 600
    }
  },
  code: {
    fontFamily: '"SourceCodePro", monospace, sans-serif',
    color: theme.cmrTextColors.textAccessCode
  },
  bodyWrapper: {
    [theme.breakpoints.up('lg')]: {
      justifyContent: 'space-between'
    }
  }
}));

const Body: React.FC<BodyProps> = props => {
  const { numCPUs, gbRAM, gbStorage, numVolumes } = props;

  const classes = useBodyStyles();

  return (
    <Grid container direction="row" className={classes.bodyWrapper}>
      <Grid item>
        <Grid container>
          <Grid item>
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
                <Typography>{gbRAM} GB RAM</Typography>
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
                <DiskIcon width={19} height={24} object-fit="contain" />
              </Grid>

              <Grid item className={classes.iconTextOuter}>
                <Typography>{gbStorage} GB Storage</Typography>
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
          </Grid>
        </Grid>
      </Grid>
      <Grid item>
        <div className={classes.accessTableContainer}>
          <Table className={classes.accessTable}>
            <TableBody>
              <TableRow>
                <th scope="row">Connection String</th>

                <TableCell className={classes.code}>test</TableCell>
              </TableRow>

              <TableRow>
                <th scope="row">Port</th>

                <TableCell className={classes.code}>test</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Grid>
    </Grid>
  );
};

// =============================================================================
// Footer
// =============================================================================

interface FooterProps {
  plan: string;
  regionDisplay: string | null;
  id: number;
  created: string;
  // tags: string[];
  // openTagDrawer: (tags: string[]) => void;
}

const useFooterStyles = makeStyles((theme: Theme) => ({
  detailsSection: {
    display: 'flex',
    alignItems: 'center',
    lineHeight: 1,
    '& a': {
      color: theme.color.blue,
      fontFamily: theme.font.bold
    }
  },
  listItem: {
    padding: `0px 10px`,
    borderRight: `1px solid ${theme.color.grey6}`,
    color: theme.color.grey8
  },
  listItemLast: {
    [theme.breakpoints.only('xs')]: {
      borderRight: 'none',
      paddingRight: 0
    }
  },
  button: {
    ...theme.applyLinkStyles,
    borderRight: `1px solid ${theme.color.grey6}`,
    fontSize: '.875rem',
    fontWeight: 'bold',
    paddingLeft: 4,
    paddingRight: 10,
    '&:hover': {
      textDecoration: 'none'
    }
  },
  created: {
    color: theme.color.grey8,
    paddingLeft: 10,
    [theme.breakpoints.down('sm')]: {
      textAlign: 'center'
    }
  },
  tags: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    [theme.breakpoints.only('xs')]: {
      marginTop: 20,
      marginBottom: 10
    }
  }
}));

export const Footer: React.FC<FooterProps> = React.memo(props => {
  const {
    // plan,
    // regionDisplay,
    id
    // created,
    // tags,
    // openTagDrawer
  } = props;

  const classes = useFooterStyles();

  return (
    <Grid container direction="row" justify="space-between" alignItems="center">
      <Grid item xs={12} sm={7}>
        <div className={classes.detailsSection}>
          {/* {plan && ( */}
          <button className={classes.button}>Insert Plan</button>
          {/* )} */}
          {/* {regionDisplay && ( */}
          <Typography className={classes.button}>Insert Region</Typography>
          {/* )} */}
          <Typography
            className={classnames({
              [classes.listItem]: true,
              [classes.listItemLast]: true
            })}
          >
            ID {id}
          </Typography>
          <Hidden xsDown>
            <Typography className={classes.created}>
              Created{' '}
              {/* {formatDate(linodeCreated, { format: 'dd-LLL-y HH:mm ZZZZ' })} */}
            </Typography>
          </Hidden>
        </div>
      </Grid>
      <Hidden smUp>
        <Grid item xs={12}>
          <Typography className={classes.created}>
            Created{' '}
            {/* {formatDate(linodeCreated, { format: 'dd-LLL-y HH:mm ZZZZ' })} */}
          </Typography>
        </Grid>
      </Hidden>
      <Grid item xs={12} sm={5} className={classes.tags}>
        {/* <TagCell
          width={500}
          tags={tags}
          addTag={() => {}}
          deleteTag={() => {}}
          listAllTags={openTagDrawer}
        /> */}
      </Grid>
    </Grid>
  );
});
