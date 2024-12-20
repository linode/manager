import { deleteDomainRecord as deleteDomain } from '@linode/api-v4/lib/domains';
import { Button, Typography } from '@linode/ui';
import Grid from '@mui/material/Unstable_Grid2';
import { compose, isEmpty, lensPath, over, pathOr } from 'ramda';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import {
  getAPIErrorOrDefault,
  getErrorStringOrDefault,
} from 'src/utilities/errorUtils';
import { scrollErrorIntoView } from 'src/utilities/scrollErrorIntoView';
import { storage } from 'src/utilities/storage';
import { truncateEnd } from 'src/utilities/truncate';

import { DomainRecordActionMenu } from './DomainRecordActionMenu';
import { DomainRecordDrawer } from './DomainRecordDrawer';
import { StyledDiv, StyledGrid } from './DomainRecords.styles';
import {
  getNSRecords,
  getTTL,
  msToReadable,
  typeEq,
} from './DomainRecordsUtils';
import { DomainRecordTable } from './DomainRecordTable';

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

export interface IType {
  columns: {
    render: (r: Domain | DomainRecord) => JSX.Element | null | string;
    title: string;
  }[];
  data: any[];
  link?: () => JSX.Element | null;
  order: 'asc' | 'desc';
  orderBy: 'domain' | 'name' | 'target';
  title: string;
}

const createLink = (title: string, handler: () => void) => (
  <Button buttonType="primary" className="domain-btn" onClick={handler}>
    {title}
  </Button>
);

export const DomainRecords = (props: Props) => {
  const { domain, domainRecords, updateDomain, updateRecords } = props;

  const generateTypes = (): IType[] => [
    /** SOA Record */
    {
      columns: [
        {
          render: (d: Domain) => d.domain,
          title: 'Primary Domain',
        },
        {
          render: (d: Domain) => d.soa_email,
          title: 'Email',
        },
        {
          render: compose(msToReadable, pathOr(0, ['ttl_sec'])),
          title: 'Default TTL',
        },
        {
          render: compose(msToReadable, pathOr(0, ['refresh_sec'])),
          title: 'Refresh Rate',
        },
        {
          render: compose(msToReadable, pathOr(0, ['retry_sec'])),
          title: 'Retry Rate',
        },
        {
          render: compose(msToReadable, pathOr(0, ['expire_sec'])),
          title: 'Expire Time',
        },
        {
          render: (d: Domain) => {
            return d.type === 'master' ? (
              <DomainRecordActionMenu
                editPayload={d}
                label={domain.domain}
                onEdit={handleOpenSOADrawer}
              />
            ) : null;
          },
          title: '',
        },
      ],
      data: [domain],
      order: 'asc',
      orderBy: 'domain',
      title: 'SOA Record',
    },

    /** NS Record */
    {
      columns: [
        {
          render: (r: DomainRecord) => r.target,
          title: 'Name Server',
        },
        {
          render: (r: DomainRecord) => {
            const sd = r.name;
            const {
              domain: { domain },
            } = props;
            return isEmpty(sd) ? domain : `${sd}.${domain}`;
          },
          title: 'Subdomain',
        },
        {
          render: getTTL,
          title: 'TTL',
        },
        {
          /**
           * If the NS is one of Linode's, don't display the Action menu since the user
           * cannot make changes to Linode's nameservers.
           */
          render: (domainRecordParams: DomainRecord) => {
            const { id, name, target, ttl_sec } = domainRecordParams;

            if (id === -1) {
              return null;
            }

            return (
              <DomainRecordActionMenu
                deleteData={{
                  onDelete: confirmDeletion,
                  recordID: id,
                }}
                editPayload={{
                  id,
                  name,
                  target,
                  ttl_sec,
                }}
                label={name}
                onEdit={openForEditNSRecord}
              />
            );
          },
          title: '',
        },
      ],
      data: getNSRecords(props),
      link: () => createLink('Add an NS Record', openForCreateNSRecord),
      order: 'asc',
      orderBy: 'target',
      title: 'NS Record',
    },

    /** MX Record */
    {
      columns: [
        {
          render: (r: DomainRecord) => r.target,
          title: 'Mail Server',
        },
        {
          render: (r: DomainRecord) => String(r.priority),
          title: 'Preference',
        },
        {
          render: (r: DomainRecord) => r.name,
          title: 'Subdomain',
        },
        {
          render: getTTL,
          title: 'TTL',
        },
        {
          render: (domainRecordParams: DomainRecord) => {
            const { id, name, priority, target, ttl_sec } = domainRecordParams;
            return (
              <DomainRecordActionMenu
                deleteData={{
                  onDelete: confirmDeletion,
                  recordID: id,
                }}
                editPayload={{
                  id,
                  name,
                  priority,
                  target,
                  ttl_sec,
                }}
                label={name}
                onEdit={openForEditMXRecord}
              />
            );
          },
          title: '',
        },
      ],
      data: domainRecords.filter(typeEq('MX')),
      link: () => createLink('Add a MX Record', openForCreateMXRecord),
      order: 'asc',
      orderBy: 'target',
      title: 'MX Record',
    },

    /** A/AAAA Record */
    {
      columns: [
        {
          render: (r: DomainRecord) => r.name || domain.domain,
          title: 'Hostname',
        },
        { render: (r: DomainRecord) => r.target, title: 'IP Address' },
        { render: getTTL, title: 'TTL' },
        {
          render: (domainRecordParams: DomainRecord) => {
            const { id, name, target, ttl_sec } = domainRecordParams;
            return (
              <DomainRecordActionMenu
                deleteData={{
                  onDelete: confirmDeletion,
                  recordID: id,
                }}
                editPayload={{
                  id,
                  name,
                  target,
                  ttl_sec,
                }}
                label={name || domain.domain}
                onEdit={openForEditARecord}
              />
            );
          },
          title: '',
        },
      ],
      data: domainRecords.filter((r) => typeEq('AAAA', r) || typeEq('A', r)),
      link: () => createLink('Add an A/AAAA Record', openForCreateARecord),
      order: 'asc',
      orderBy: 'name',
      title: 'A/AAAA Record',
    },

    /** CNAME Record */
    {
      columns: [
        { render: (r: DomainRecord) => r.name, title: 'Hostname' },
        { render: (r: DomainRecord) => r.target, title: 'Aliases to' },
        { render: getTTL, title: 'TTL' },
        {
          render: (domainRecordParams: DomainRecord) => {
            const { id, name, target, ttl_sec } = domainRecordParams;
            return (
              <DomainRecordActionMenu
                deleteData={{
                  onDelete: confirmDeletion,
                  recordID: id,
                }}
                editPayload={{
                  id,
                  name,
                  target,
                  ttl_sec,
                }}
                label={name}
                onEdit={openForEditCNAMERecord}
              />
            );
          },
          title: '',
        },
      ],
      data: domainRecords.filter(typeEq('CNAME')),
      link: () => createLink('Add a CNAME Record', openForCreateCNAMERecord),
      order: 'asc',
      orderBy: 'name',
      title: 'CNAME Record',
    },

    /** TXT Record */
    {
      columns: [
        {
          render: (r: DomainRecord) => r.name || domain.domain,
          title: 'Hostname',
        },
        {
          render: (r: DomainRecord) => truncateEnd(r.target, 100),
          title: 'Value',
        },
        { render: getTTL, title: 'TTL' },
        {
          render: (domainRecordParams: DomainRecord) => {
            const { id, name, target, ttl_sec } = domainRecordParams;
            return (
              <DomainRecordActionMenu
                deleteData={{
                  onDelete: confirmDeletion,
                  recordID: id,
                }}
                editPayload={{
                  id,
                  name,
                  target,
                  ttl_sec,
                }}
                label={name}
                onEdit={openForEditTXTRecord}
              />
            );
          },
          title: '',
        },
      ],
      data: domainRecords.filter(typeEq('TXT')),
      link: () => createLink('Add a TXT Record', openForCreateTXTRecord),
      order: 'asc',
      orderBy: 'name',
      title: 'TXT Record',
    },
    /** SRV Record */
    {
      columns: [
        { render: (r: DomainRecord) => r.name, title: 'Service/Protocol' },
        {
          render: () => domain.domain,
          title: 'Name',
        },
        {
          render: (r: DomainRecord) => String(r.priority),
          title: 'Priority',
        },
        {
          render: (r: DomainRecord) => String(r.weight),
          title: 'Weight',
        },
        { render: (r: DomainRecord) => String(r.port), title: 'Port' },
        { render: (r: DomainRecord) => r.target, title: 'Target' },
        { render: getTTL, title: 'TTL' },
        {
          render: ({
            id,
            port,
            priority,
            protocol,
            service,
            target,
            weight,
          }: DomainRecord) => (
            <DomainRecordActionMenu
              deleteData={{
                onDelete: confirmDeletion,
                recordID: id,
              }}
              editPayload={{
                id,
                port,
                priority,
                protocol,
                service,
                target,
                weight,
              }}
              label={domain.domain}
              onEdit={openForEditSRVRecord}
            />
          ),
          title: '',
        },
      ],
      data: domainRecords.filter(typeEq('SRV')),
      link: () => createLink('Add an SRV Record', openForCreateSRVRecord),
      order: 'asc',
      orderBy: 'name',
      title: 'SRV Record',
    },

    /** CAA Record */
    {
      columns: [
        { render: (r: DomainRecord) => r.name, title: 'Name' },
        { render: (r: DomainRecord) => r.tag, title: 'Tag' },
        {
          render: (r: DomainRecord) => r.target,
          title: 'Value',
        },
        { render: getTTL, title: 'TTL' },
        {
          render: (domainRecordParams: DomainRecord) => {
            const { id, name, tag, target, ttl_sec } = domainRecordParams;
            return (
              <DomainRecordActionMenu
                deleteData={{
                  onDelete: confirmDeletion,
                  recordID: id,
                }}
                editPayload={{
                  id,
                  name,
                  tag,
                  target,
                  ttl_sec,
                }}
                label={name}
                onEdit={openForEditCAARecord}
              />
            );
          },
          title: '',
        },
      ],
      data: domainRecords.filter(typeEq('CAA')),
      link: () => createLink('Add a CAA Record', openForCreateCAARecord),
      order: 'asc',
      orderBy: 'name',
      title: 'CAA Record',
    },
  ];

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

  const openForCreateARecord = () => openForCreation('AAAA');

  const openForCreateCAARecord = () => openForCreation('CAA');

  const openForCreateCNAMERecord = () => openForCreation('CNAME');
  const openForCreateMXRecord = () => openForCreation('MX');

  const openForCreateNSRecord = () => openForCreation('NS');
  const openForCreateSRVRecord = () => openForCreation('SRV');

  const openForCreateTXTRecord = () => openForCreation('TXT');
  const openForCreation = (type: RecordType) =>
    updateDrawer(() => ({
      mode: 'create',
      open: true,
      submitting: false,
      type,
    }));

  const openForEditARecord = (
    f: Pick<DomainRecord, 'id' | 'name' | 'target' | 'ttl_sec'>
  ) => openForEditing('AAAA', f);
  const openForEditCAARecord = (
    f: Pick<DomainRecord, 'id' | 'name' | 'tag' | 'target' | 'ttl_sec'>
  ) => openForEditing('CAA', f);

  const openForEditCNAMERecord = (
    f: Pick<DomainRecord, 'id' | 'name' | 'target' | 'ttl_sec'>
  ) => openForEditing('CNAME', f);
  const openForEditMXRecord = (
    f: Pick<DomainRecord, 'id' | 'name' | 'priority' | 'target' | 'ttl_sec'>
  ) => openForEditing('MX', f);

  const openForEditNSRecord = (
    f: Pick<DomainRecord, 'id' | 'name' | 'target' | 'ttl_sec'>
  ) => openForEditing('NS', f);
  const openForEditPrimaryDomain = (f: Partial<Domain>) =>
    openForEditing('master', f);

  const openForEditSRVRecord = (
    f: Pick<
      DomainRecord,
      'id' | 'name' | 'port' | 'priority' | 'protocol' | 'target' | 'weight'
    >
  ) => openForEditing('SRV', f);
  const openForEditSecondaryDomain = (f: Partial<Domain>) =>
    openForEditing('slave', f);

  const openForEditTXTRecord = (
    f: Pick<DomainRecord, 'id' | 'name' | 'target' | 'ttl_sec'>
  ) => openForEditing('TXT', f);

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

  React.useEffect(() => {
    setState((prevState) => ({
      ...prevState,
      types: generateTypes(),
    }));
  }, [domainRecords, domain]);

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
                    }) => {
                      return (
                        <>
                          <DomainRecordTable
                            paginatedData={paginatedData}
                            type={type}
                          />
                          <PaginationFooter
                            count={count}
                            eventCategory={`${type.title.toLowerCase()} panel`}
                            handlePageChange={handlePageChange}
                            handleSizeChange={handlePageSizeChange}
                            page={page}
                            pageSize={pageSize}
                            // Disabling show All as it is impacting page performance.
                            showAll={false}
                          />
                        </>
                      );
                    }}
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
