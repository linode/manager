import { VLAN } from '@linode/api-v4/lib/vlans';
import * as React from 'react';
import Breadcrumb from 'src/components/Breadcrumb';
import Button from 'src/components/Button';
import DocumentationButton from 'src/components/CMR_DocumentationButton';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import EntityDetail from 'src/components/EntityDetail';
import EntityHeader from 'src/components/EntityHeader';
import Grid from 'src/components/Grid';
import { dcDisplayNames } from 'src/constants';
import VlanDialog from 'src/features/Vlans/VlanLanding/VlanDialog';
import formatDate from 'src/utilities/formatDate';

interface VlanEntityDetailProps {
  vlan: VLAN;
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
    margin: 0,
    width: '100%'
  },
  body: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginLeft: 'auto',
    padding: `0 !important`
  },
  actionItemsOuter: {
    display: 'flex',
    alignItems: 'center',
    height: 40
  },
  actionItem: {
    minWidth: 'auto'
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
      <Grid
        className={classes.root}
        container
        alignItems="center"
        justify="space-between"
      >
        <Grid className="px0" item>
          <Breadcrumb
            crumbOverrides={[
              {
                label: 'VLANs',
                position: 1
              }
            ]}
            pathname={location.pathname}
            data-qa-title
          />
        </Grid>
        <Grid className="px0" item>
          <DocumentationButton href="https://www.linode.com/" />
        </Grid>
      </Grid>
      <EntityHeader
        parentLink="/vlans"
        parentText="Virtual LANs"
        title={label}
        bodyClassName={classes.body}
        body={
          <div className={classes.actionItemsOuter}>
            <Button
              buttonType="secondary"
              className={classes.actionItem}
              onClick={handleOpenDeleteVlanModal}
            >
              Delete
            </Button>
          </div>
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
}

const useFooterStyles = makeStyles((theme: Theme) => ({
  label: {
    fontFamily: theme.font.bold
  },
  listItem: {
    borderRight: `1px solid ${theme.cmrBorderColors.borderTypography}`,
    color: theme.cmrTextColors.tableStatic,
    padding: `0px 10px`,
    '&:last-of-type': {
      borderRight: 'none'
    }
  }
}));

export const Footer: React.FC<FooterProps> = React.memo(props => {
  const { regionDisplay, cidr, id, created } = props;

  const classes = useFooterStyles();

  return (
    <Grid container direction="row" alignItems="center" justify="space-between">
      <Grid container item>
        {regionDisplay && (
          <Typography className={classes.listItem}>
            <span className={classes.label}>Region:</span> {regionDisplay}
          </Typography>
        )}
        <Typography className={classes.listItem}>
          <span className={classes.label}>CIDR:</span> {cidr}
        </Typography>
        <Typography className={classes.listItem}>
          <span className={classes.label}>ID:</span> {id}
        </Typography>
        <Typography className={classes.listItem}>
          <span className={classes.label}>Created:</span>{' '}
          {formatDate(created, { format: 'dd-LLL-y HH:mm ZZZZ' })}
        </Typography>
      </Grid>
    </Grid>
  );
});
