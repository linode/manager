import { VLAN } from '@linode/api-v4/lib/vlans';
import * as classnames from 'classnames';
import * as React from 'react';
import DeleteIcon from 'src/assets/icons/delete.svg';
// import EditIcon from 'src/assets/icons/edit.svg';
import DocumentationButton from 'src/components/CMR_DocumentationButton';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import EntityDetail from 'src/components/EntityDetail';
import EntityHeader from 'src/components/EntityHeader';
import Grid from 'src/components/Grid';
import Hidden from 'src/components/core/Hidden';
import IconTextLink from 'src/components/IconTextLink';
// import TagCell from 'src/components/TagCell';
import { dcDisplayNames } from 'src/constants';
import VlanDialog from 'src/features/Vlans/VlanLanding/VlanDialog';
import formatDate from 'src/utilities/formatDate';

interface VlanEntityDetailProps {
  vlan: VLAN;
  // openTagDrawer: (tags: string[]) => void;
}

export type CombinedProps = VlanEntityDetailProps;

const VlanEntityDetail: React.FC<CombinedProps> = props => {
  const { vlan } = props;

  const regionDisplay = dcDisplayNames[vlan.region] ?? null;

  return (
    <EntityDetail
      header={<Header id={vlan.id} label={vlan.description} />}
      footer={
        <Footer
          regionDisplay={regionDisplay}
          cidr={vlan.cidr_block}
          id={vlan.id}
          created={vlan.created}
          // tags={[]}
          // openTagDrawer={openTagDrawer}
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
  id: number;
  label: string;
}

const useHeaderStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.bg.white
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
  const classes = useHeaderStyles();

  const { id, label } = props;

  const [modalOpen, toggleModal] = React.useState<boolean>(false);

  const handleOpenDeleteVlanModal = () => {
    toggleModal(true);
  };

  const handleCloseDeleteVlanModal = () => {
    toggleModal(false);
  };

  return (
    <>
      <EntityHeader
        parentLink="/vlans"
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
            <div className={classes.actionItemsOuter}>
              {/* @todo: Implement edit action */}
              {/* <IconTextLink
              className={classes.actionItem}
              SideIcon={EditIcon}
              text="Edit"
              title="Edit"
              to={`/`}
            /> */}
              <IconTextLink
                className={classes.actionItem}
                SideIcon={DeleteIcon}
                text="Delete"
                title="Delete"
                onClick={handleOpenDeleteVlanModal}
              />
            </div>
            <Hidden smDown>
              <DocumentationButton href="https://www.linode.com/" />
            </Hidden>
          </>
        }
      />
      <VlanDialog
        open={modalOpen}
        selectedVlanID={id}
        selectedVlanLabel={label}
        closeDialog={handleCloseDeleteVlanModal}
        redirectToLanding={true}
      />
    </>
  );
};

// =============================================================================
// Footer
// =============================================================================

interface FooterProps {
  regionDisplay: string | null;
  cidr: string;
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
  region: {
    borderRight: `1px solid ${theme.color.grey6}`,
    color: theme.color.grey8,
    cursor: 'auto',
    fontSize: '.875rem',
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
  const { regionDisplay, cidr, id, created } = props;

  const classes = useFooterStyles();

  return (
    <Grid container direction="row" justify="space-between" alignItems="center">
      <Grid item xs={12} sm={7}>
        <div className={classes.detailsSection}>
          {regionDisplay && (
            <Typography className={classes.region}>{regionDisplay}</Typography>
          )}
          <Typography className={classes.listItem}>{cidr}</Typography>
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
              Created {formatDate(created)}
            </Typography>
          </Hidden>
        </div>
      </Grid>
      <Hidden smUp>
        <Grid item xs={12}>
          <Typography className={classes.created}>
            Created {formatDate(created)}
          </Typography>
        </Grid>
      </Hidden>
      {/* @todo: Implement tags */}
      {/* <Grid item xs={12} sm={5} className={classes.tags}>
        <TagCell
          width={500}
          tags={tags}
          addTag={() => {}}
          deleteTag={() => {}}
          listAllTags={openTagDrawer}
        />
      </Grid> */}
    </Grid>
  );
});
