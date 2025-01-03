import { deleteDomainRecord as deleteDomain } from '@linode/api-v4/lib/domains';
import { Typography } from '@linode/ui';
import Grid from '@mui/material/Unstable_Grid2';
import { lensPath, over } from 'ramda';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import {
  getAPIErrorOrDefault,
  getErrorStringOrDefault,
} from 'src/utilities/errorUtils';
import { scrollErrorIntoView } from 'src/utilities/scrollErrorIntoView';
import { storage } from 'src/utilities/storage';

import { DomainRecordDrawer } from './DomainRecordDrawer';
import { StyledDiv, StyledGrid } from './DomainRecords.styles';
import { DomainRecordTable } from './DomainRecordTable';
import { generateTypes } from './generateTypes';

import type { GenerateTypesHandlers, IType } from './generateTypes';
import type {
  Domain,
  DomainRecord,
  DomainType,
  RecordType,
  UpdateDomainPayload,
} from '@linode/api-v4/lib/domains';
import type { APIError } from '@linode/api-v4/lib/types';

interface UpdateDomainDataProps extends UpdateDomainPayload {
  id: number;
}

export interface Props {
  domain: Domain;
  domainRecords: DomainRecord[];
  updateDomain: (data: UpdateDomainDataProps) => Promise<Domain>;
  updateRecords: () => void;
}

interface ConfirmationState {
  errors?: APIError[];
  open: boolean;
  recordId?: number;
  submitting: boolean;
}

interface DrawerState {
  fields?: Partial<Domain> | Partial<DomainRecord>;
  mode: 'create' | 'edit';
  open: boolean;
  type: DomainType | RecordType;
}

interface State {
  confirmDialog: ConfirmationState;
  drawer: DrawerState;
  types: IType[];
}

export const DomainRecords = (props: Props) => {
  const { domain, domainRecords, updateDomain, updateRecords } = props;

  const defaultDrawerState: DrawerState = {
    mode: 'create',
    open: false,
    type: 'NS',
  };

  const [state, setState] = React.useState<State>({
    confirmDialog: {
      open: false,
      submitting: false,
    },
    drawer: defaultDrawerState,
    types: [],
  });

  const confirmDeletion = (recordId: number) =>
    updateConfirmDialog((confirmDialog) => ({
      ...confirmDialog,
      open: true,
      recordId,
    }));

  const deleteDomainRecord = () => {
    const {
      domain: { id: domainId },
    } = props;
    const {
      confirmDialog: { recordId },
    } = state;

    if (!domainId || !recordId) {
      return;
    }

    updateConfirmDialog((c) => ({
      ...c,
      errors: undefined,
      submitting: true,
    }));

    deleteDomain(domainId, recordId)
      .then(() => {
        updateRecords();

        updateConfirmDialog((_) => ({
          errors: undefined,
          open: false,
          recordId: undefined,
          submitting: false,
        }));
      })
      .catch((errorResponse) => {
        const errors = getAPIErrorOrDefault(errorResponse);
        updateConfirmDialog((c) => ({
          ...c,
          errors,
          submitting: false,
        }));
      });

    updateConfirmDialog((c) => ({ ...c, submitting: true }));
  };

  const handleCloseDialog = () => {
    updateConfirmDialog(() => ({
      open: false,
      recordId: undefined,
      submitting: false,
    }));
  };

  const handleOpenSOADrawer = (d: Domain) => {
    return d.type === 'master'
      ? openForEditPrimaryDomain(d)
      : openForEditSecondaryDomain(d);
  };

  const openForCreation = (type: RecordType) =>
    updateDrawer(() => ({
      mode: 'create',
      open: true,
      submitting: false,
      type,
    }));

  const openForEditing = (
    type: DomainType | RecordType,
    fields: Partial<Domain> | Partial<DomainRecord>
  ) =>
    updateDrawer(() => ({
      fields,
      mode: 'edit',
      open: true,
      submitting: false,
      type,
    }));

  const openForEditPrimaryDomain = (f: Partial<Domain>) =>
    openForEditing('master', f);

  const openForEditSecondaryDomain = (f: Partial<Domain>) =>
    openForEditing('slave', f);

  const renderDialogActions = () => {
    return (
      <ActionsPanel
        primaryButtonProps={{
          label: 'Delete',
          loading: state.confirmDialog.submitting,
          onClick: deleteDomainRecord,
        }}
        secondaryButtonProps={{
          label: 'Cancel',
          onClick: handleCloseDialog,
        }}
      />
    );
  };

  const resetDrawer = () => updateDrawer(() => defaultDrawerState);

  const updateConfirmDialog = (
    fn: (d: ConfirmationState) => ConfirmationState
  ) => {
    setState((prevState) => {
      const newState = over(lensPath(['confirmDialog']), fn, prevState);
      scrollErrorIntoView();

      return newState;
    });
  };

  const updateDrawer = (fn: (d: DrawerState) => DrawerState) => {
    setState((prevState) => {
      return over(lensPath(['drawer']), fn, prevState);
    });
  };

  const handlers: GenerateTypesHandlers = {
    confirmDeletion,
    handleOpenSOADrawer,
    openForCreateARecord: () => openForCreation('AAAA'),
    openForCreateCAARecord: () => openForCreation('CAA'),
    openForCreateCNAMERecord: () => openForCreation('CNAME'),
    openForCreateMXRecord: () => openForCreation('MX'),
    openForCreateNSRecord: () => openForCreation('NS'),
    openForCreateSRVRecord: () => openForCreation('SRV'),
    openForCreateTXTRecord: () => openForCreation('TXT'),
    openForEditARecord: (f) => openForEditing('AAAA', f),
    openForEditCAARecord: (f) => openForEditing('CAA', f),
    openForEditCNAMERecord: (f) => openForEditing('CNAME', f),
    openForEditMXRecord: (f) => openForEditing('MX', f),
    openForEditNSRecord: (f) => openForEditing('NS', f),
    openForEditSRVRecord: (f) => openForEditing('SRV', f),
    openForEditTXTRecord: (f) => openForEditing('TXT', f),
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const types = React.useMemo(() => generateTypes(props, handlers), [
    domain,
    domainRecords,
  ]);

  React.useEffect(() => {
    setState((prevState) => ({
      ...prevState,
      types,
    }));
  }, [types]);

  return (
    <>
      <DocumentTitleSegment segment={`${domain.domain} - DNS Records`} />
      {state.types.map((type, eachTypeIdx) => {
        const ref: React.RefObject<HTMLDivElement> = React.createRef();

        return (
          <div key={eachTypeIdx}>
            <StyledGrid
              alignItems="center"
              container
              justifyContent="space-between"
              spacing={2}
            >
              <Grid ref={ref} sx={{ paddingLeft: 0, paddingRight: 0 }}>
                <Typography
                  aria-level={2}
                  className="m0"
                  data-qa-domain-record={type.title}
                  role="heading"
                  variant="h2"
                >
                  {type.title}
                </Typography>
              </Grid>
              {type.link && (
                <Grid sx={{ paddingLeft: 0, paddingRight: 0 }}>
                  {' '}
                  <StyledDiv>{type.link()}</StyledDiv>{' '}
                </Grid>
              )}
            </StyledGrid>
            <OrderBy data={type.data} order={type.order} orderBy={type.orderBy}>
              {({ data: orderedData }) => {
                return (
                  <Paginate
                    data={orderedData}
                    pageSize={storage.infinitePageSize.get()}
                    pageSizeSetter={storage.infinitePageSize.set}
                    scrollToRef={ref}
                  >
                    {({
                      count,
                      data: paginatedData,
                      handlePageChange,
                      handlePageSizeChange,
                      page,
                      pageSize,
                    }) => (
                      <DomainRecordTable
                        count={count}
                        handlePageChange={handlePageChange}
                        handlePageSizeChange={handlePageSizeChange}
                        page={page}
                        pageSize={pageSize}
                        paginatedData={paginatedData}
                        type={type}
                      />
                    )}
                  </Paginate>
                );
              }}
            </OrderBy>
          </div>
        );
      })}
      <ConfirmationDialog
        error={
          state.confirmDialog.errors
            ? getErrorStringOrDefault(state.confirmDialog.errors)
            : undefined
        }
        actions={renderDialogActions}
        onClose={handleCloseDialog}
        open={state.confirmDialog.open}
        title="Confirm Deletion"
      >
        Are you sure you want to delete this record?
      </ConfirmationDialog>
      <DomainRecordDrawer
        domain={domain.domain}
        domainId={domain.id}
        mode={state.drawer.mode}
        onClose={resetDrawer}
        open={state.drawer.open}
        records={domainRecords}
        type={state.drawer.type}
        updateDomain={updateDomain}
        updateRecords={updateRecords}
        {...state.drawer.fields}
      />
    </>
  );
};
