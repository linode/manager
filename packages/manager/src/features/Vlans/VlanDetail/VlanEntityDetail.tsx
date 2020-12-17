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
          label={vlan.description}
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

const useHeaderStyles = makeStyles(() => ({
  root: {
    margin: 0,
    width: '100%'
  }
}));

const Header: React.FC<HeaderProps> = props => {
  const classes = useHeaderStyles();

  const { label } = props;

  return (
    <>
      <Grid
        container
        className={classes.root}
        alignItems="center"
        justify="space-between"
      >
        <Grid item className="px0">
          <Breadcrumb
            crumbOverrides={[
              {
                label: 'VLANs',
                position: 1
              }
            ]}
            labelTitle={label}
            labelOptions={{ noCap: true }}
            pathname={location.pathname}
            data-qa-title
          />
        </Grid>
        <Grid item className="px0">
          <DocumentationButton href="https://www.linode.com/" />
        </Grid>
      </Grid>
      <EntityHeader
        parentLink="/vlans"
        parentText="Virtual LANs"
        title={label}
      />
    </>
  );
};

// =============================================================================
// Footer
// =============================================================================

interface FooterProps {
  label: string;
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
  },
  actionItemsOuter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 40
  },
  actionItem: {
    minWidth: 'auto',
    paddingLeft: theme.spacing(),
    paddingRight: theme.spacing()
  }
}));

export const Footer: React.FC<FooterProps> = React.memo(props => {
  const classes = useFooterStyles();

  const { label, regionDisplay, cidr, id, created } = props;

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
        container
        direction="row"
        alignItems="center"
        justify="space-between"
      >
        <Grid container item xs={12} sm={11}>
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
            {formatDate(created)}
          </Typography>
        </Grid>
        <Grid item className={classes.actionItemsOuter} xs={12} sm={1}>
          <Button
            buttonType="secondary"
            className={classes.actionItem}
            onClick={handleOpenDeleteVlanModal}
          >
            Delete
          </Button>
        </Grid>
      </Grid>

      <VlanDialog
        open={modalOpen}
        selectedVlanID={id}
        selectedVlanLabel={label}
        closeDialog={handleCloseDeleteVlanModal}
        redirectToLanding={true}
      />
    </>
  );
});
