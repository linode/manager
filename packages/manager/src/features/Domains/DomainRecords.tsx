import {
  Domain,
  DomainRecord,
  DomainType,
  RecordType,
  UpdateDomainPayload,
  deleteDomainRecord,
} from '@linode/api-v4/lib/domains';
import { APIError } from '@linode/api-v4/lib/types';
import Grid from '@mui/material/Unstable_Grid2';
import {
  compose,
  equals,
  filter,
  flatten,
  isEmpty,
  lensPath,
  over,
  pathOr,
  prepend,
  propEq,
} from 'ramda';
import * as React from 'react';
import { compose as recompose } from 'recompose';
import { Subscription } from 'rxjs/Subscription';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { Typography } from 'src/components/Typography';
import withFeatureFlags, {
  FeatureFlagConsumerProps,
} from 'src/containers/withFeatureFlagConsumer.container';
import {
  getAPIErrorOrDefault,
  getErrorStringOrDefault,
} from 'src/utilities/errorUtils';
import { scrollErrorIntoView } from 'src/utilities/scrollErrorIntoView';
import { storage } from 'src/utilities/storage';
import { truncateEnd } from 'src/utilities/truncate';

import { DomainRecordActionMenu } from './DomainRecordActionMenu';
import { DomainRecordDrawer } from './DomainRecordDrawer';
import { StyledDiv, StyledGrid, StyledTableCell } from './DomainRecords.styles';

interface DomainRecordsProps {
  domain: Domain;
  domainRecords: DomainRecord[];
  updateDomain: (data: { id: number } & UpdateDomainPayload) => Promise<Domain>;
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

type CombinedProps = DomainRecordsProps & FeatureFlagConsumerProps;

interface IType {
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

class DomainRecords extends React.Component<CombinedProps, State> {
  constructor(props: CombinedProps) {
    super(props);
    this.state = {
      confirmDialog: {
        open: false,
        submitting: false,
      },
      drawer: DomainRecords.defaultDrawerState,
      types: this.generateTypes(),
    };
  }

  componentDidUpdate(prevProps: CombinedProps) {
    if (
      !equals(prevProps.domainRecords, this.props.domainRecords) ||
      !equals(prevProps.domain, this.props.domain)
    ) {
      this.setState({ types: this.generateTypes() });
    }
  }

  render() {
    const { domain, domainRecords } = this.props;
    const { confirmDialog, drawer } = this.state;

    return (
      <>
        <DocumentTitleSegment segment={`${domain.domain} - DNS Records`} />
        {this.state.types.map((type, eachTypeIdx) => {
          const ref: React.Ref<any> = React.createRef();

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
              <OrderBy
                data={type.data}
                order={type.order}
                orderBy={type.orderBy}
              >
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
                            <Table aria-label={`List of Domains ${type.title}`}>
                              <TableHead>
                                <TableRow>
                                  {type.columns.length > 0 &&
                                    type.columns.map((col, columnIndex) => {
                                      return (
                                        <TableCell key={columnIndex}>
                                          {col.title}
                                        </TableCell>
                                      );
                                    })}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {type.data.length === 0 ? (
                                  <TableRowEmpty
                                    colSpan={type.columns.length}
                                  />
                                ) : (
                                  paginatedData.map((data, idx) => {
                                    return (
                                      <TableRow
                                        data-qa-record-row={type.title}
                                        key={idx}
                                      >
                                        {type.columns.length > 0 &&
                                          type.columns.map(
                                            (
                                              { render, title },
                                              columnIndex
                                            ) => {
                                              return (
                                                <StyledTableCell
                                                  data-qa-column={title}
                                                  key={columnIndex}
                                                  parentColumn={title}
                                                >
                                                  {render(data)}
                                                </StyledTableCell>
                                              );
                                            }
                                          )}
                                      </TableRow>
                                    );
                                  })
                                )}
                              </TableBody>
                            </Table>
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
            confirmDialog.errors
              ? getErrorStringOrDefault(confirmDialog.errors)
              : undefined
          }
          actions={this.renderDialogActions}
          onClose={this.handleCloseDialog}
          open={confirmDialog.open}
          title="Confirm Deletion"
        >
          Are you sure you want to delete this record?
        </ConfirmationDialog>
        <DomainRecordDrawer
          domain={this.props.domain.domain}
          domainId={this.props.domain.id}
          mode={drawer.mode}
          onClose={this.resetDrawer}
          open={drawer.open}
          records={domainRecords}
          type={drawer.type}
          updateDomain={this.props.updateDomain}
          updateRecords={this.props.updateRecords}
          {...drawer.fields}
        />
      </>
    );
  }

  confirmDeletion = (recordId: number) =>
    this.updateConfirmDialog((confirmDialog) => ({
      ...confirmDialog,
      open: true,
      recordId,
    }));

  static defaultDrawerState: DrawerState = {
    mode: 'create',
    open: false,
    type: 'NS',
  };

  deleteDomainRecord = () => {
    const {
      domain: { id: domainId },
    } = this.props;
    const {
      confirmDialog: { recordId },
    } = this.state;
    if (!domainId || !recordId) {
      return;
    }

    this.updateConfirmDialog((c) => ({
      ...c,
      errors: undefined,
      submitting: true,
    }));

    deleteDomainRecord(domainId, recordId)
      .then(() => {
        this.props.updateRecords();

        this.updateConfirmDialog((_) => ({
          errors: undefined,
          open: false,
          recordId: undefined,
          submitting: false,
        }));
      })
      .catch((errorResponse) => {
        const errors = getAPIErrorOrDefault(errorResponse);
        this.updateConfirmDialog((c) => ({
          ...c,
          errors,
          submitting: false,
        }));
      });
    this.updateConfirmDialog((c) => ({ ...c, submitting: true }));
  };

  eventsSubscription$: Subscription;

  generateTypes = (): IType[] => [
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
                label={this.props.domain.domain}
                onEdit={this.handleOpenSOADrawer}
              />
            ) : null;
          },
          title: '',
        },
      ],
      data: [this.props.domain],
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
            } = this.props;
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
          render: ({ id, name, target, ttl_sec }: DomainRecord) =>
            id === -1 ? null : (
              <DomainRecordActionMenu
                deleteData={{
                  onDelete: this.confirmDeletion,
                  recordID: id,
                }}
                editPayload={{
                  id,
                  name,
                  target,
                  ttl_sec,
                }}
                label={name}
                onEdit={this.openForEditNSRecord}
              />
            ),
          title: '',
        },
      ],
      data: getNSRecords(this.props),
      link: () => createLink('Add an NS Record', this.openForCreateNSRecord),
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
          render: ({ id, name, priority, target, ttl_sec }: DomainRecord) => (
            <DomainRecordActionMenu
              deleteData={{
                onDelete: this.confirmDeletion,
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
              onEdit={this.openForEditMXRecord}
            />
          ),
          title: '',
        },
      ],
      data: this.props.domainRecords.filter(typeEq('MX')),
      link: () => createLink('Add a MX Record', this.openForCreateMXRecord),
      order: 'asc',
      orderBy: 'target',
      title: 'MX Record',
    },

    /** A/AAAA Record */
    {
      columns: [
        {
          render: (r: DomainRecord) => r.name || this.props.domain.domain,
          title: 'Hostname',
        },
        { render: (r: DomainRecord) => r.target, title: 'IP Address' },
        { render: getTTL, title: 'TTL' },
        {
          render: ({ id, name, target, ttl_sec }: DomainRecord) => (
            <DomainRecordActionMenu
              deleteData={{
                onDelete: this.confirmDeletion,
                recordID: id,
              }}
              editPayload={{
                id,
                name,
                target,
                ttl_sec,
              }}
              label={name || this.props.domain.domain}
              onEdit={this.openForEditARecord}
            />
          ),
          title: '',
        },
      ],
      data: this.props.domainRecords.filter(
        (r) => typeEq('AAAA', r) || typeEq('A', r)
      ),
      link: () => createLink('Add an A/AAAA Record', this.openForCreateARecord),
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
          render: ({ id, name, target, ttl_sec }: DomainRecord) => (
            <DomainRecordActionMenu
              deleteData={{
                onDelete: this.confirmDeletion,
                recordID: id,
              }}
              editPayload={{
                id,
                name,
                target,
                ttl_sec,
              }}
              label={name}
              onEdit={this.openForEditCNAMERecord}
            />
          ),
          title: '',
        },
      ],
      data: this.props.domainRecords.filter(typeEq('CNAME')),
      link: () =>
        createLink('Add a CNAME Record', this.openForCreateCNAMERecord),
      order: 'asc',
      orderBy: 'name',
      title: 'CNAME Record',
    },

    /** TXT Record */
    {
      columns: [
        { render: (r: DomainRecord) => r.name, title: 'Hostname' },
        {
          render: (r: DomainRecord) => truncateEnd(r.target, 100),
          title: 'Value',
        },
        { render: getTTL, title: 'TTL' },
        {
          render: ({ id, name, target, ttl_sec }: DomainRecord) => (
            <DomainRecordActionMenu
              deleteData={{
                onDelete: this.confirmDeletion,
                recordID: id,
              }}
              editPayload={{
                id,
                name,
                target,
                ttl_sec,
              }}
              label={name}
              onEdit={this.openForEditTXTRecord}
            />
          ),
          title: '',
        },
      ],
      data: this.props.domainRecords.filter(typeEq('TXT')),
      link: () => createLink('Add a TXT Record', this.openForCreateTXTRecord),
      order: 'asc',
      orderBy: 'name',
      title: 'TXT Record',
    },
    /** SRV Record */
    {
      columns: [
        { render: (r: DomainRecord) => r.name, title: 'Name' },
        {
          render: () => this.props.domain.domain,
          title: 'Domain',
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
                onDelete: this.confirmDeletion,
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
              label={this.props.domain.domain}
              onEdit={this.openForEditSRVRecord}
            />
          ),
          title: '',
        },
      ],
      data: this.props.domainRecords.filter(typeEq('SRV')),
      link: () => createLink('Add an SRV Record', this.openForCreateSRVRecord),
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
          render: ({ id, name, tag, target, ttl_sec }: DomainRecord) => (
            <DomainRecordActionMenu
              deleteData={{
                onDelete: this.confirmDeletion,
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
              onEdit={this.openForEditCAARecord}
            />
          ),
          title: '',
        },
      ],
      data: this.props.domainRecords.filter(typeEq('CAA')),
      link: () => createLink('Add a CAA Record', this.openForCreateCAARecord),
      order: 'asc',
      orderBy: 'name',
      title: 'CAA Record',
    },
  ];

  handleCloseDialog = () => {
    this.updateConfirmDialog(() => ({
      open: false,
      recordId: undefined,
      submitting: false,
    }));
  };

  handleOpenSOADrawer = (d: Domain) => {
    return d.type === 'master'
      ? this.openForEditPrimaryDomain(d)
      : this.openForEditSecondaryDomain(d);
  };
  openForCreateARecord = () => this.openForCreation('AAAA');

  openForCreateCAARecord = () => this.openForCreation('CAA');
  openForCreateCNAMERecord = () => this.openForCreation('CNAME');

  openForCreateMXRecord = () => this.openForCreation('MX');
  openForCreateNSRecord = () => this.openForCreation('NS');

  openForCreateSRVRecord = () => this.openForCreation('SRV');
  openForCreateTXTRecord = () => this.openForCreation('TXT');

  openForCreation = (type: RecordType) =>
    this.updateDrawer(() => ({
      mode: 'create',
      open: true,
      submitting: false,
      type,
    }));
  openForEditARecord = (
    f: Pick<DomainRecord, 'id' | 'name' | 'target' | 'ttl_sec'>
  ) => this.openForEditing('AAAA', f);

  openForEditCAARecord = (
    f: Pick<DomainRecord, 'id' | 'name' | 'tag' | 'target' | 'ttl_sec'>
  ) => this.openForEditing('CAA', f);
  openForEditCNAMERecord = (
    f: Pick<DomainRecord, 'id' | 'name' | 'target' | 'ttl_sec'>
  ) => this.openForEditing('CNAME', f);

  openForEditMXRecord = (
    f: Pick<DomainRecord, 'id' | 'name' | 'priority' | 'target' | 'ttl_sec'>
  ) => this.openForEditing('MX', f);
  openForEditNSRecord = (
    f: Pick<DomainRecord, 'id' | 'name' | 'target' | 'ttl_sec'>
  ) => this.openForEditing('NS', f);

  openForEditPrimaryDomain = (f: Partial<Domain>) =>
    this.openForEditing('master', f);

  openForEditSRVRecord = (
    f: Pick<
      DomainRecord,
      'id' | 'name' | 'port' | 'priority' | 'protocol' | 'target' | 'weight'
    >
  ) => this.openForEditing('SRV', f);

  openForEditSecondaryDomain = (f: Partial<Domain>) =>
    this.openForEditing('slave', f);

  openForEditTXTRecord = (
    f: Pick<DomainRecord, 'id' | 'name' | 'target' | 'ttl_sec'>
  ) => this.openForEditing('TXT', f);

  openForEditing = (
    type: DomainType | RecordType,
    fields: Partial<Domain> | Partial<DomainRecord>
  ) =>
    this.updateDrawer(() => ({
      fields,
      mode: 'edit',
      open: true,
      submitting: false,
      type,
    }));

  renderDialogActions = () => {
    return (
      <ActionsPanel
        primaryButtonProps={{
          label: 'Delete',
          loading: this.state.confirmDialog.submitting,
          onClick: this.deleteDomainRecord,
        }}
        secondaryButtonProps={{
          label: 'Cancel',
          onClick: this.handleCloseDialog,
        }}
      />
    );
  };

  resetDrawer = () => this.updateDrawer(() => DomainRecords.defaultDrawerState);

  updateConfirmDialog = (fn: (d: ConfirmationState) => ConfirmationState) =>
    this.setState(over(lensPath(['confirmDialog']), fn), () => {
      scrollErrorIntoView();
    });

  updateDrawer = (fn: (d: DrawerState) => DrawerState) =>
    this.setState(over(lensPath(['drawer']), fn));
}

const msToReadable = (v: number): null | string =>
  pathOr(null, [v], {
    0: 'Default',
    30: '30 seconds',
    120: '2 minutes',
    300: '5 minutes',
    3600: '1 hour',
    7200: '2 hours',
    14400: '4 hours',
    28800: '8 hours',
    57600: '16 hours',
    86400: '1 day',
    172800: '2 days',
    345600: '4 days',
    604800: '1 week',
    1209600: '2 weeks',
    2419200: '4 weeks',
  });

const getTTL = compose(msToReadable, pathOr(0, ['ttl_sec']));

const typeEq = propEq('type');

const prependLinodeNS = compose<any, any, DomainRecord[]>(
  flatten,
  prepend([
    {
      id: -1,
      name: '',
      port: 0,
      priority: 0,
      protocol: null,
      service: null,
      tag: null,
      target: 'ns1.linode.com',
      ttl_sec: 0,
      type: 'NS',
      weight: 0,
    },
    {
      id: -1,
      name: '',
      port: 0,
      priority: 0,
      protocol: null,
      service: null,
      tag: null,
      target: 'ns2.linode.com',
      ttl_sec: 0,
      type: 'NS',
      weight: 0,
    },
    {
      id: -1,
      name: '',
      port: 0,
      priority: 0,
      protocol: null,
      service: null,
      tag: null,
      target: 'ns3.linode.com',
      ttl_sec: 0,
      type: 'NS',
      weight: 0,
    },
    {
      id: -1,
      name: '',
      port: 0,
      priority: 0,
      protocol: null,
      service: null,
      tag: null,
      target: 'ns4.linode.com',
      ttl_sec: 0,
      type: 'NS',
      weight: 0,
    },
    {
      id: -1,
      name: '',
      port: 0,
      priority: 0,
      protocol: null,
      service: null,
      tag: null,
      target: 'ns5.linode.com',
      ttl_sec: 0,
      type: 'NS',
      weight: 0,
    },
  ])
);

const getNSRecords = compose<
  DomainRecordsProps,
  DomainRecord[],
  DomainRecord[],
  DomainRecord[]
>(prependLinodeNS, filter(typeEq('NS')), pathOr([], ['domainRecords']));

export default recompose<CombinedProps, DomainRecordsProps>(withFeatureFlags)(
  DomainRecords
);
