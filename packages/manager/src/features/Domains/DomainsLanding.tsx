import * as React from 'react';
import { Domain } from '@linode/api-v4/lib/domains';
import { useSnackbar } from 'notistack';
import { useHistory, useLocation } from 'react-router-dom';
import DomainIcon from 'src/assets/icons/entityIcons/domain.svg';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DeletionDialog from 'src/components/DeletionDialog';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import LandingHeader from 'src/components/LandingHeader';
import Link from 'src/components/Link';
import Notice from 'src/components/Notice';
import Placeholder from 'src/components/Placeholder';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import DisableDomainDialog from './DisableDomainDialog';
import { Handlers as DomainHandlers } from './DomainActionMenu';
import DomainBanner from './DomainBanner';
import DomainRow from './DomainTableRow';
import DomainZoneImportDrawer from './DomainZoneImportDrawer';
import { useProfile } from 'src/queries/profile';
import { useLinodesQuery } from 'src/queries/linodes';
import {
  useDeleteDomainMutation,
  useDomainsQuery,
  useUpdateDomainMutation,
} from 'src/queries/domains';
import usePagination from 'src/hooks/usePagination';
import { useOrder } from 'src/hooks/useOrder';
import Table from 'src/components/Table/Table';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/TableRow/TableRow';
import TableBody from 'src/components/core/TableBody';
import TableSortCell from 'src/components/TableSortCell/TableSortCell';
import TableCell from 'src/components/core/TableCell';
import PaginationFooter from 'src/components/PaginationFooter/PaginationFooter';
import Hidden from 'src/components/core/Hidden';
import { CloneDomainDrawer } from './CloneDomainDrawer';
import { EditDomainDrawer } from './EditDomainDrawer';

const DOMAIN_CREATE_ROUTE = '/domains/create';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    // Adds spacing when the docs button wraps to make it look a little less awkward
    [theme.breakpoints.down(380)]: {
      '& .docsButton': {
        paddingBottom: theme.spacing(2),
      },
    },
  },
  importButton: {
    marginLeft: -theme.spacing(),
    whiteSpace: 'nowrap',
  },
}));

interface Props {
  // Since secondary Domains do not have a Detail page, we allow the consumer to
  // render this component with the "Edit Domain" drawer already opened.
  domainForEditing?: Domain;
}

const preferenceKey = 'domains';

export const DomainsLanding: React.FC<Props> = (props) => {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation<{ recordError?: string }>();

  const { enqueueSnackbar } = useSnackbar();
  const { data: profile } = useProfile();

  const pagination = usePagination(1, preferenceKey);

  const { order, orderBy, handleOrderChange } = useOrder(
    {
      orderBy: 'domain',
      order: 'asc',
    },
    `${preferenceKey}-order`
  );

  const filter = {
    ['+order_by']: orderBy,
    ['+order']: order,
  };

  const { data: domains, error, isLoading } = useDomainsQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filter
  );

  const shouldCheckLinodeCount = domains !== undefined && domains.results > 0;

  const { data: linodes } = useLinodesQuery({}, {}, shouldCheckLinodeCount);

  const isRestrictedUser = Boolean(profile?.restricted);

  const { domainForEditing } = props;

  const [importDrawerOpen, setImportDrawerOpen] = React.useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = React.useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = React.useState(false);
  const [cloneDialogOpen, setCloneDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);

  const [selectedDomain, setSelectedDomain] = React.useState<
    Domain | undefined
  >();

  const {
    mutateAsync: deleteDomain,
    isLoading: isDeleting,
    error: deleteError,
  } = useDeleteDomainMutation(selectedDomain?.id ?? 0);

  const { mutateAsync: updateDomain } = useUpdateDomainMutation();

  const onClone = (domain: Domain) => {
    setSelectedDomain(domain);
    setCloneDialogOpen(true);
  };

  const onEdit = (domain: Domain) => {
    setSelectedDomain(domain);
    setEditDialogOpen(true);
  };

  React.useEffect(() => {
    // Open the "Edit Domain" drawer if so specified by this component's props.
    if (domainForEditing) {
      onEdit(domainForEditing);
    }
  }, [domainForEditing]);

  const navigateToCreate = () => {
    history.push(DOMAIN_CREATE_ROUTE);
  };

  const openImportZoneDrawer = () => {
    setImportDrawerOpen(true);
  };

  const closeImportZoneDrawer = () => {
    setImportDrawerOpen(false);
  };

  const onRemove = (domain: Domain) => {
    setSelectedDomain(domain);
    setRemoveDialogOpen(true);
  };

  const closeRemoveDialog = () => {
    setRemoveDialogOpen(false);
  };

  const removeDomain = () => {
    deleteDomain().then(() => {
      closeRemoveDialog();
    });
  };

  const onDisableOrEnable = (action: 'enable' | 'disable', domain: Domain) => {
    if (action === 'enable') {
      updateDomain({
        id: domain.id,
        status: 'active',
      }).catch((e) => {
        return enqueueSnackbar(
          getAPIErrorOrDefault(e, 'There was an issue enabling your domain')[0]
            .reason,
          {
            variant: 'error',
          }
        );
      });
    } else {
      setSelectedDomain(domain);
      setDisableDialogOpen(true);
    }
  };

  const handlers: DomainHandlers = {
    onClone,
    onEdit,
    onRemove,
    onDisableOrEnable,
  };

  if (isLoading) {
    return <CircleProgress />;
  }

  if (error) {
    return (
      <ErrorState errorText="There was an error retrieving your domains. Please reload and try again." />
    );
  }

  if (domains?.results === 0) {
    return (
      <>
        <DocumentTitleSegment segment="Domains" />
        <Placeholder
          title="Domains"
          isEntity
          icon={DomainIcon}
          buttonProps={[
            {
              onClick: navigateToCreate,
              children: 'Create Domain',
            },
            {
              onClick: openImportZoneDrawer,
              children: 'Import a Zone',
            },
          ]}
        >
          <Typography variant="subtitle1">
            Create a Domain, add Domain records, import zones and domains.
          </Typography>
          <Typography variant="subtitle1">
            <Link to="https://www.linode.com/docs/platform/manager/dns-manager-new-manager/">
              Get help managing your Domains
            </Link>
            &nbsp;or&nbsp;
            <Link to="https://www.linode.com/docs/">
              visit our guides and tutorials.
            </Link>
          </Typography>
        </Placeholder>
        <DomainZoneImportDrawer
          open={importDrawerOpen}
          onClose={closeImportZoneDrawer}
        />
      </>
    );
  }

  /**
   * Users with no Linodes on their account should see a banner
   * warning them that their DNS records are not being served.
   *
   * Restricted users can often not view the number of Linodes
   * on the account, so to prevent the possibility of displaying inaccurate
   * warnings, we don't show the banner to restricted users.
   *
   * We also hide the banner while Linodes data are still loading, since count
   * will be 0 until loading is complete.
   */
  const shouldShowBanner =
    !isRestrictedUser &&
    linodes?.results === 0 &&
    domains &&
    domains.results > 0;

  return (
    <>
      <DocumentTitleSegment segment="Domains" />
      <DomainBanner hidden={!shouldShowBanner} />
      {location.state?.recordError && (
        <Notice error text={location.state.recordError} />
      )}
      <LandingHeader
        title="Domains"
        extraActions={
          <Button
            className={classes.importButton}
            onClick={openImportZoneDrawer}
            buttonType="secondary"
          >
            Import a Zone
          </Button>
        }
        entity="Domain"
        onAddNew={navigateToCreate}
        docsLink="https://www.linode.com/docs/platform/manager/dns-manager/"
      />
      <Table>
        <TableHead>
          <TableRow>
            <TableSortCell
              active={orderBy === 'domain'}
              direction={order}
              label="domain"
              handleClick={handleOrderChange}
            >
              Domain
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'status'}
              direction={order}
              label="status"
              handleClick={handleOrderChange}
            >
              Status
            </TableSortCell>
            <Hidden smDown>
              <TableSortCell
                active={orderBy === 'type'}
                direction={order}
                label="type"
                handleClick={handleOrderChange}
              >
                Type
              </TableSortCell>
              <TableSortCell
                active={orderBy === 'updated'}
                direction={order}
                label="updated"
                handleClick={handleOrderChange}
              >
                Last Modified
              </TableSortCell>
            </Hidden>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {domains?.data.map((domain: Domain) => (
            <DomainRow key={domain.id} domain={domain} {...handlers} />
          ))}
        </TableBody>
      </Table>
      <PaginationFooter
        count={domains?.results || 0}
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
        eventCategory="Domains Table"
      />
      <DomainZoneImportDrawer
        open={importDrawerOpen}
        onClose={closeImportZoneDrawer}
      />
      <DisableDomainDialog
        domain={selectedDomain}
        onClose={() => setDisableDialogOpen(false)}
        open={disableDialogOpen}
      />
      <CloneDomainDrawer
        open={cloneDialogOpen}
        onClose={() => setCloneDialogOpen(false)}
        domain={selectedDomain}
      />
      <EditDomainDrawer
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        domain={selectedDomain}
      />
      <DeletionDialog
        typeToConfirm
        entity="domain"
        open={removeDialogOpen}
        label={selectedDomain?.domain ?? 'Unknown'}
        loading={isDeleting}
        error={
          deleteError
            ? getAPIErrorOrDefault(deleteError, 'Error deleting Domain.')[0]
                .reason
            : undefined
        }
        onClose={closeRemoveDialog}
        onDelete={removeDomain}
      />
    </>
  );
};

export default DomainsLanding;
