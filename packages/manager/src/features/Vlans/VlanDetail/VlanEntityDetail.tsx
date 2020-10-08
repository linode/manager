/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-empty-interface */
// import { Linode } from '@linode/api-v4/lib/linodes/types';
// import { Config, LinodeBackups } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import * as classnames from 'classnames';
// import { useSnackbar } from 'notistack';
import DeleteIcon from 'src/assets/icons/delete.svg';
import EditIcon from 'src/assets/icons/edit.svg';
import DocumentationButton from 'src/components/CMR_DocumentationButton';
import {
  makeStyles,
  Theme
  // useTheme,
  // useMediaQuery
} from 'src/components/core/styles';
import TagCell from 'src/components/TagCell';
import Typography from 'src/components/core/Typography';
import EntityDetail from 'src/components/EntityDetail';
import EntityHeader from 'src/components/EntityHeader';
import Grid from 'src/components/Grid';
import IconTextLink from 'src/components/IconTextLink';
// import { distroIcons } from 'src/components/ImageSelect/icons';
// import { dcDisplayNames } from 'src/constants';
// import { OpenDialog } from 'src/features/linodes/types';
// import useImages from 'src/hooks/useImages';
// import useLinodes from 'src/hooks/useLinodes';
import useReduxLoad from 'src/hooks/useReduxLoad';
// import { useTypes } from 'src/hooks/useTypes';
// import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
// import formatDate from 'src/utilities/formatDate';
// import { pluralize } from 'src/utilities/pluralize';
// import { lishLink, sshLink } from './LinodesDetail/utilities';
// import { Action as BootAction } from 'src/features/linodes/PowerActionsDialogOrDrawer';
// import { sendLinodeActionMenuItemEvent } from 'src/utilities/ga';
// import { lishLaunch } from 'src/features/Lish/lishUtils';
import Hidden from 'src/components/core/Hidden';

// type LinodeEntityDetailVariant = 'dashboard' | 'landing' | 'details';

interface VlanEntityDetailProps {
  // variant: LinodeEntityDetailVariant;
  // linode: Linode;
  // username?: string;
  // openDialog: OpenDialog;
  // openPowerActionDialog: (
  //   bootAction: BootAction,
  //   linodeID: number,
  //   linodeLabel: string,
  //   linodeConfigs: Config[]
  // ) => void;
  // backups: LinodeBackups;
  // linodeConfigs: Config[];
  // numVolumes: number;
  openTagDrawer: (tags: string[]) => void;
  // isDetailLanding?: boolean;
}

const VlanEntityDetail: React.FC<VlanEntityDetailProps> = props => {
  const {
    // variant,
    // linode,
    // username,
    // openDialog,
    // openPowerActionDialog,
    // backups,
    // linodeConfigs,
    // numVolumes,
    // isDetailLanding,
    openTagDrawer
  } = props;

  useReduxLoad(['images', 'types']);
  // const { images } = useImages();
  // const { types } = useTypes();

  // const imageSlug = linode.image;

  // const imageVendor =
  //   imageSlug && images.itemsById[imageSlug]
  //     ? images.itemsById[imageSlug].vendor
  //     : null;

  // const linodeType = Boolean(linode.type)
  //   ? types.entities.find(thisType => thisType.id === linode.type) ?? null
  //   : null;

  // const linodePlan = linodeType?.label ?? null;

  // const linodeRegionDisplay = dcDisplayNames[linode.region] ?? null;

  return (
    <EntityDetail
      header={
        <Header
        // variant={variant}
        // imageVendor={imageVendor}
        // linodeLabel={linode.label}
        // linodeId={linode.id}
        // linodeStatus={linode.status}
        // openDialog={openDialog}
        // openPowerActionDialog={openPowerActionDialog}
        // linodeRegionDisplay={linodeRegionDisplay}
        // backups={backups}
        // linodeConfigs={linodeConfigs}
        // isDetailLanding={isDetailLanding}
        // type={'something'}
        // image={'something'}
        />
      }
      footer={
        <Footer
          // linodePlan={linodePlan}
          // linodeRegionDisplay={linodeRegionDisplay}
          // linodeId={linode.id}
          // linodeCreated={linode.created}
          tags={[]}
          // linodeLabel={linode.label}
          openTagDrawer={openTagDrawer}
          // openDialog={openDialog}
        />
      }
    />
  );
};

export default React.memo(VlanEntityDetail);

// =============================================================================
// Header
// =============================================================================
export interface HeaderProps {
  // variant: LinodeEntityDetailVariant;
  // imageVendor: string | null;
  // linodeLabel: string;
  // linodeId: number;
  // linodeStatus: Linode['status'];
  // openDialog: OpenDialog;
  // openPowerActionDialog: (
  //   bootAction: BootAction,
  //   linodeID: number,
  //   linodeLabel: string,
  //   linodeConfigs: Config[]
  // ) => void;
  // linodeRegionDisplay: string;
  // backups: LinodeBackups;
  // type: string;
  // image: string;
  // linodeConfigs: Config[];
  // isDetailLanding?: boolean;
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
  actionItem: {
    marginRight: 10,
    marginBottom: 0,
    padding: 10,
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
    }
  },
  actionItemsOuter: {
    display: 'flex',
    alignItems: 'center'
  }
}));

const Header: React.FC<HeaderProps> = props => {
  const {
    // variant,
    // imageVendor,
    // linodeLabel,
    // linodeId,
    // linodeStatus,
    // linodeRegionDisplay,
    // openDialog,
    // openPowerActionDialog,
    // backups,
    // type,
    // image,
    // linodeConfigs,
    // isDetailLanding
  } = props;

  const classes = useHeaderStyles();
  // const theme = useTheme<Theme>();
  // const matchesMdDown = useMediaQuery(theme.breakpoints.down('md'));

  // const distroIconClassName =
  //   imageVendor !== null ? `fl-${distroIcons[imageVendor]}` : 'fl-tux';

  return (
    <EntityHeader
      parentLink="/vlans"
      parentText="Virtual LANs"
      iconType="linode"
      actions={
        <Hidden mdUp>
          <DocumentationButton hideText href="https://www.linode.com/" />
        </Hidden>
      }
      title="Insert Label"
      bodyClassName={classes.body}
      body={
        <>
          <div className={classes.actionItemsOuter}>
            <IconTextLink
              className={classes.actionItem}
              SideIcon={EditIcon}
              text="Edit"
              title="Edit"
              to={`/`}
            />

            <IconTextLink
              className={classes.actionItem}
              SideIcon={DeleteIcon}
              text="Delete"
              title="Delete"
              to={`/`}
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
// Footer
// =============================================================================

interface FooterProps {
  // linodePlan: string | null;
  // linodeRegionDisplay: string | null;
  // linodeId: number;
  // linodeCreated: string;
  tags: string[];
  // linodeLabel: string;
  openTagDrawer: (tags: string[]) => void;
  // openDialog: OpenDialog;
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
  linodeCreated: {
    paddingLeft: 10,
    color: theme.color.grey8,
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
    // linodePlan,
    // linodeRegionDisplay,
    // linodeId,
    // linodeCreated,
    tags,
    openTagDrawer
    // openDialog
  } = props;

  const classes = useFooterStyles();

  // const { updateLinode } = useLinodes();
  // const { enqueueSnackbar } = useSnackbar();

  // const addTag = React.useCallback(
  //   (tag: string) => {
  //     const newTags = [...linodeTags, tag];
  //     updateLinode({ linodeId, tags: newTags }).catch(e =>
  //       enqueueSnackbar(getAPIErrorOrDefault(e, 'Error adding tag')[0].reason, {
  //         variant: 'error'
  //       })
  //     );
  //   },
  //   [linodeTags, linodeId, updateLinode, enqueueSnackbar]
  // );

  // const deleteTag = React.useCallback(
  //   (tag: string) => {
  //     const newTags = linodeTags.filter(thisTag => thisTag !== tag);
  //     updateLinode({ linodeId, tags: newTags }).catch(e =>
  //       enqueueSnackbar(
  //         getAPIErrorOrDefault(e, 'Error deleting tag')[0].reason,
  //         {
  //           variant: 'error'
  //         }
  //       )
  //     );
  //   },
  //   [linodeTags, linodeId, updateLinode, enqueueSnackbar]
  // );

  return (
    <Grid container direction="row" justify="space-between" alignItems="center">
      <Grid item xs={12} sm={7}>
        <div className={classes.detailsSection}>
          <button onClick={() => {}} className={classes.button}>
            Insert Region
          </button>
          <Typography
            className={classnames({
              [classes.listItem]: true
            })}
          >
            Insert IP
          </Typography>
          <Typography
            className={classnames({
              [classes.listItem]: true,
              [classes.listItemLast]: true
            })}
          >
            Insert ID
          </Typography>
          <Hidden xsDown>
            <Typography className={classes.linodeCreated}>
              Created{' '}
              {/* {formatDate(linodeCreated, { format: 'dd-LLL-y HH:mm ZZZZ' })} */}
            </Typography>
          </Hidden>
        </div>
      </Grid>
      <Hidden smUp>
        <Grid item xs={12}>
          <Typography className={classes.linodeCreated}>
            Created{' '}
            {/* {formatDate(linodeCreated, { format: 'dd-LLL-y HH:mm ZZZZ' })} */}
          </Typography>
        </Grid>
      </Hidden>
      <Grid item xs={12} sm={5} className={classes.tags}>
        <TagCell
          width={500}
          tags={tags}
          addTag={() => {}}
          deleteTag={() => {}}
          listAllTags={openTagDrawer}
        />
      </Grid>
    </Grid>
  );
});
