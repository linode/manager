import { Button, CircleProgress, Notice } from '@linode/ui';
import { styled } from '@mui/material/styles';
import { useLocation, useNavigate, useParams } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { DeletionDialog } from 'src/components/DeletionDialog/DeletionDialog';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Hidden } from 'src/components/Hidden';
import { LandingHeader } from 'src/components/LandingHeader';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { useDialogData } from 'src/hooks/useDialogData';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';
import {
  useDeleteDomainMutation,
  useDomainQuery,
  useDomainsQuery,
  useUpdateDomainMutation,
} from 'src/queries/domains';
import { useLinodesQuery } from 'src/queries/linodes/linodes';
import { useProfile } from 'src/queries/profile/profile';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { CloneDomainDrawer } from './CloneDomainDrawer';
import {
  DOMAINS_TABLE_DEFAULT_ORDER,
  DOMAINS_TABLE_DEFAULT_ORDER_BY,
  DOMAINS_TABLE_PREFERENCE_KEY,
} from './constants';
import { DisableDomainDialog } from './DisableDomainDialog';
import { DomainBanner } from './DomainBanner';
import { DomainsEmptyLandingState } from './DomainsEmptyLandingPage';
import { DomainTableRow } from './DomainTableRow';
import { DomainZoneImportDrawer } from './DomainZoneImportDrawer';
import { EditDomainDrawer } from './EditDomainDrawer';

import type { Handlers as DomainHandlers } from './DomainActionMenu';
import type { Domain } from '@linode/api-v4';
import type { DomainState } from 'src/routes/domains';

const DOMAIN_CREATE_ROUTE = '/domains/create';

interface DomainsLandingProps {
  // Since secondary Domains do not have a Detail page, we allow the consumer to
  // render this component with the "Edit Domain" drawer already opened.
  domainForEditing?: Domain;
}

export const DomainsLanding = (props: DomainsLandingProps) => {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const location = useLocation();
  const locationState = location.state as DomainState;

  const { enqueueSnackbar } = useSnackbar();
  const { data: profile } = useProfile();

  const pagination = usePaginationV2({
    currentRoute: '/domains',
    preferenceKey: DOMAINS_TABLE_PREFERENCE_KEY,
  });

  const { handleOrderChange, order, orderBy } = useOrderV2({
    initialRoute: {
      defaultOrder: {
        order: DOMAINS_TABLE_DEFAULT_ORDER,
        orderBy: DOMAINS_TABLE_DEFAULT_ORDER_BY,
      },
      from: '/domains',
    },
    preferenceKey: `${DOMAINS_TABLE_PREFERENCE_KEY}-order`,
  });

  const filter = {
    ['+order']: order,
    ['+order_by']: orderBy,
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

  const { data: selectedDomain, isFetching: isFetchingDomain } = useDialogData({
    enabled: !!params.domainId,
    paramKey: 'domainId',
    queryHook: useDomainQuery,
    redirectToOnNotFound: '/domains',
  });

  const {
    error: deleteError,
    isPending: isDeleting,
    mutateAsync: deleteDomain,
  } = useDeleteDomainMutation(selectedDomain?.id ?? 0);

  const { mutateAsync: updateDomain } = useUpdateDomainMutation();

  const navigateToDomains = () => {
    navigate({
      search: (prev) => prev,
      to: '/domains',
    });
  };

  const handleClone = (domain: Domain) => {
    navigate({
      params: { action: 'clone', domainId: domain.id },
      search: (prev) => prev,
      to: `/domains/$domainId/$action`,
    });
  };

  const handleEdit = (domain: Domain) => {
    navigate({
      params: { action: 'edit', domainId: domain.id },
      search: (prev) => prev,
      to: `/domains/$domainId/$action`,
    });
  };

  React.useEffect(() => {
    // Open the "Edit Domain" drawer if so specified by this component's props.
    if (domainForEditing) {
      handleEdit(domainForEditing);
    }
  }, [domainForEditing]);

  const navigateToCreate = () => {
    navigate({
      to: DOMAIN_CREATE_ROUTE,
    });
  };

  const handleImport = () => {
    navigate({
      search: (prev) => prev,
      to: `/domains/import`,
    });
  };

  const handleDelete = (domain: Domain) => {
    navigate({
      params: { action: 'delete', domainId: domain.id },
      search: (prev) => prev,
      to: `/domains/$domainId/$action`,
    });
  };

  const removeDomain = () => {
    deleteDomain().then(() => {
      navigateToDomains();
    });
  };

  const handleDisableOrEnable = (
    action: 'disable' | 'enable',
    domain: Domain
  ) => {
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
      navigate({
        params: { action: 'disable', domainId: domain.id },
        search: (prev) => prev,
        to: `/domains/$domainId/$action`,
      });
    }
  };

  const handlers: DomainHandlers = {
    onClone: handleClone,
    onDisableOrEnable: handleDisableOrEnable,
    onEdit: handleEdit,
    onRemove: handleDelete,
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
        <DomainsEmptyLandingState
          navigateToCreate={navigateToCreate}
          openImportZoneDrawer={handleImport}
        />
        <DomainZoneImportDrawer
          onClose={navigateToDomains}
          open={location.pathname === '/domains/import'}
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
      {locationState?.recordError && (
        <Notice text={locationState.recordError} variant="error" />
      )}
      <LandingHeader
        breadcrumbProps={{
          labelTitle: 'Domains',
          pathname: '/domains',
        }}
        extraActions={
          <StyledButon buttonType="secondary" onClick={handleImport}>
            Import a Zone
          </StyledButon>
        }
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/dns-manager"
        entity="Domain"
        onButtonClick={navigateToCreate}
        title="Domains"
      />
      <Table>
        <TableHead>
          <TableRow>
            <TableSortCell
              active={orderBy === 'domain'}
              direction={order}
              handleClick={handleOrderChange}
              label="domain"
            >
              Domain
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'status'}
              direction={order}
              handleClick={handleOrderChange}
              label="status"
            >
              Status
            </TableSortCell>
            <Hidden smDown>
              <TableSortCell
                active={orderBy === 'type'}
                direction={order}
                handleClick={handleOrderChange}
                label="type"
              >
                Type
              </TableSortCell>
              <TableSortCell
                active={orderBy === 'updated'}
                direction={order}
                handleClick={handleOrderChange}
                label="updated"
              >
                Last Modified
              </TableSortCell>
            </Hidden>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {domains?.data.map((domain: Domain) => (
            <DomainTableRow domain={domain} key={domain.id} {...handlers} />
          ))}
        </TableBody>
      </Table>
      <PaginationFooter
        count={domains?.results || 0}
        eventCategory="Domains Table"
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />
      <DomainZoneImportDrawer
        onClose={navigateToDomains}
        open={location.pathname === '/domains/import'}
      />
      <DisableDomainDialog
        domain={selectedDomain}
        isFetching={isFetchingDomain}
        onClose={navigateToDomains}
        open={params.action === 'disable'}
      />
      <CloneDomainDrawer
        domain={selectedDomain}
        isFetching={isFetchingDomain}
        onClose={navigateToDomains}
        open={params.action === 'clone'}
      />
      <EditDomainDrawer
        domain={selectedDomain}
        isFetching={isFetchingDomain}
        onClose={navigateToDomains}
        open={params.action === 'edit'}
      />
      <DeletionDialog
        error={
          deleteError
            ? getAPIErrorOrDefault(deleteError, 'Error deleting Domain.')[0]
                .reason
            : undefined
        }
        entity="domain"
        isFetching={isFetchingDomain}
        label={selectedDomain?.domain ?? 'Unknown'}
        loading={isDeleting}
        onClose={navigateToDomains}
        onDelete={removeDomain}
        open={params.action === 'delete'}
        typeToConfirm
      />
    </>
  );
};

const StyledButon = styled(Button, { label: 'StyledButton' })(({ theme }) => ({
  marginLeft: `-${theme.spacing()}`,
  whiteSpace: 'nowrap',
}));
