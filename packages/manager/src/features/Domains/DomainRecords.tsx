import {
  deleteDomainRecord,
  Domain,
  DomainRecord,
  DomainType,
  RecordType,
  UpdateDomainPayload,
} from '@linode/api-v4/lib/domains';
import { APIError } from '@linode/api-v4/lib/types';
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
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { createStyles, withStyles, WithStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { TableBody } from 'src/components/TableBody';
import { TableHead } from 'src/components/TableHead';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from '@mui/material/Unstable_Grid2';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import withFeatureFlags, {
  FeatureFlagConsumerProps,
} from 'src/containers/withFeatureFlagConsumer.container';
import {
  getAPIErrorOrDefault,
  getErrorStringOrDefault,
} from 'src/utilities/errorUtils';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import { storage } from 'src/utilities/storage';
import { truncateEnd } from 'src/utilities/truncate';
import ActionMenu from './DomainRecordActionMenu';
import DomainRecordDrawer from './DomainRecordDrawer';

type ClassNames = 'root' | 'cells' | 'linkContainer';

const styles = (theme: Theme) =>
  createStyles({
    cells: {
      '& .data': {
        maxWidth: 300,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        [theme.breakpoints.up('md')]: {
          maxWidth: 750,
        },
        whiteSpace: 'nowrap',
      },
      '&:last-of-type': {
        display: 'flex',
        justifyContent: 'flex-end',
      },
      whiteSpace: 'nowrap',
      width: 'auto',
    },
    linkContainer: {
      [theme.breakpoints.down('md')]: {
        marginLeft: theme.spacing(),
        marginRight: theme.spacing(),
      },
    },
    root: {
      '& .MuiGrid-item': {
        paddingLeft: 0,
        paddingRight: 0,
      },
      '& .domain-btn': {
        [theme.breakpoints.down('lg')]: {
          marginRight: theme.spacing(),
        },
      },
      margin: 0,
      marginTop: theme.spacing(2),
      [theme.breakpoints.down('md')]: {
        marginLeft: theme.spacing(),
        marginRight: theme.spacing(),
      },
      width: '100%',
    },
  });

interface Props {
  domain: Domain;
  domainRecords: DomainRecord[];
  updateRecords: () => void;
  updateDomain: (data: { id: number } & UpdateDomainPayload) => Promise<Domain>;
}

interface ConfirmationState {
  open: boolean;
  submitting: boolean;
  errors?: APIError[];
  recordId?: number;
}

interface DrawerState {
  open: boolean;
  mode: 'create' | 'edit';
  type: RecordType | DomainType;
  fields?: Partial<DomainRecord> | Partial<Domain>;
}

interface State {
  types: IType[];
  drawer: DrawerState;
  confirmDialog: ConfirmationState;
}

type CombinedProps = Props & WithStyles<ClassNames> & FeatureFlagConsumerProps;

interface IType {
  title: string;
  data: any[];
  order: 'asc' | 'desc';
  orderBy: 'name' | 'target' | 'domain';
  columns: {
    title: string;
    render: (r: DomainRecord | Domain) => null | string | JSX.Element;
  }[];
  link?: () => null | JSX.Element;
}

const createLink = (title: string, handler: () => void) => (
  <Button buttonType="primary" className="domain-btn" onClick={handler}>
    {title}
  </Button>
);

class DomainRecords extends React.Component<CombinedProps, State> {
  eventsSubscription$: Subscription;

  static defaultDrawerState: DrawerState = {
    mode: 'create',
    open: false,
    type: 'NS',
  };

  updateDrawer = (fn: (d: DrawerState) => DrawerState) =>
    this.setState(over(lensPath(['drawer']), fn));

  updateConfirmDialog = (fn: (d: ConfirmationState) => ConfirmationState) =>
    this.setState(over(lensPath(['confirmDialog']), fn), () => {
      scrollErrorIntoView();
    });

  resetDrawer = () => this.updateDrawer(() => DomainRecords.defaultDrawerState);

  openForCreation = (type: RecordType) =>
    this.updateDrawer(() => ({
      mode: 'create',
      open: true,
      submitting: false,
      type,
    }));

  openForEditing = (
    type: RecordType | DomainType,
    fields: Partial<DomainRecord> | Partial<Domain>
  ) =>
    this.updateDrawer(() => ({
      fields,
      mode: 'edit',
      open: true,
      submitting: false,
      type,
    }));

  openForEditPrimaryDomain = (f: Partial<Domain>) =>
    this.openForEditing('master', f);

  openForEditSecondaryDomain = (f: Partial<Domain>) =>
    this.openForEditing('slave', f);

  openForCreateNSRecord = () => this.openForCreation('NS');
  openForEditNSRecord = (
    f: Pick<DomainRecord, 'id' | 'target' | 'name' | 'ttl_sec'>
  ) => this.openForEditing('NS', f);

  openForCreateMXRecord = () => this.openForCreation('MX');
  openForEditMXRecord = (
    f: Pick<DomainRecord, 'id' | 'target' | 'priority' | 'name' | 'ttl_sec'>
  ) => this.openForEditing('MX', f);

  openForCreateARecord = () => this.openForCreation('AAAA');
  openForEditARecord = (
    f: Pick<DomainRecord, 'id' | 'name' | 'target' | 'ttl_sec'>
  ) => this.openForEditing('AAAA', f);

  openForCreateCNAMERecord = () => this.openForCreation('CNAME');
  openForEditCNAMERecord = (
    f: Pick<DomainRecord, 'id' | 'name' | 'target' | 'ttl_sec'>
  ) => this.openForEditing('CNAME', f);

  openForCreateTXTRecord = () => this.openForCreation('TXT');
  openForEditTXTRecord = (
    f: Pick<DomainRecord, 'id' | 'name' | 'target' | 'ttl_sec'>
  ) => this.openForEditing('TXT', f);

  openForCreateSRVRecord = () => this.openForCreation('SRV');
  openForEditSRVRecord = (
    f: Pick<
      DomainRecord,
      'id' | 'name' | 'priority' | 'weight' | 'port' | 'target' | 'protocol'
    >
  ) => this.openForEditing('SRV', f);

  openForCreateCAARecord = () => this.openForCreation('CAA');
  openForEditCAARecord = (
    f: Pick<DomainRecord, 'id' | 'name' | 'tag' | 'target' | 'ttl_sec'>
  ) => this.openForEditing('CAA', f);

  confirmDeletion = (recordId: number) =>
    this.updateConfirmDialog((confirmDialog) => ({
      ...confirmDialog,
      open: true,
      recordId,
    }));

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

  handleOpenSOADrawer = (d: Domain) => {
    return d.type === 'master'
      ? this.openForEditPrimaryDomain(d)
      : this.openForEditSecondaryDomain(d);
  };

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
              <ActionMenu
                editPayload={d}
                onEdit={this.handleOpenSOADrawer}
                label={this.props.domain.domain}
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
              <ActionMenu
                editPayload={{
                  id,
                  name,
                  target,
                  ttl_sec,
                }}
                label={name}
                onEdit={this.openForEditNSRecord}
                deleteData={{
                  onDelete: this.confirmDeletion,
                  recordID: id,
                }}
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
            <ActionMenu
              onEdit={this.openForEditMXRecord}
              editPayload={{
                id,
                name,
                priority,
                target,
                ttl_sec,
              }}
              label={name}
              deleteData={{
                onDelete: this.confirmDeletion,
                recordID: id,
              }}
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
            <ActionMenu
              editPayload={{
                id,
                name,
                target,
                ttl_sec,
              }}
              onEdit={this.openForEditARecord}
              label={name || this.props.domain.domain}
              deleteData={{
                onDelete: this.confirmDeletion,
                recordID: id,
              }}
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
            <ActionMenu
              editPayload={{
                id,
                name,
                target,
                ttl_sec,
              }}
              label={name}
              onEdit={this.openForEditCNAMERecord}
              deleteData={{
                onDelete: this.confirmDeletion,
                recordID: id,
              }}
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
            <ActionMenu
              editPayload={{
                id,
                name,
                target,
                ttl_sec,
              }}
              label={name}
              onEdit={this.openForEditTXTRecord}
              deleteData={{
                onDelete: this.confirmDeletion,
                recordID: id,
              }}
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
            <ActionMenu
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
              deleteData={{
                onDelete: this.confirmDeletion,
                recordID: id,
              }}
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
            <ActionMenu
              editPayload={{
                id,
                name,
                tag,
                target,
                ttl_sec,
              }}
              label={name}
              onEdit={this.openForEditCAARecord}
              deleteData={{
                onDelete: this.confirmDeletion,
                recordID: id,
              }}
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

  renderDialogActions = () => {
    return (
      <ActionsPanel>
        <Button buttonType="secondary" onClick={this.handleCloseDialog}>
          Cancel
        </Button>
        <Button
          buttonType="primary"
          onClick={this.deleteDomainRecord}
          loading={this.state.confirmDialog.submitting}
        >
          Delete
        </Button>
      </ActionsPanel>
    );
  };

  render() {
    const { classes, domain, domainRecords } = this.props;
    const { confirmDialog, drawer } = this.state;

    return (
      <>
        <DocumentTitleSegment segment={`${domain.domain} - DNS Records`} />
        {this.state.types.map((type, eachTypeIdx) => {
          const ref: React.Ref<any> = React.createRef();

          return (
            <div key={eachTypeIdx}>
              <Grid
                container
                justifyContent="space-between"
                alignItems="center"
                className={classes.root}
                spacing={2}
              >
                <Grid ref={ref} sx={{ paddingLeft: 0, paddingRight: 0 }}>
                  <Typography
                    role="heading"
                    aria-level={2}
                    variant="h2"
                    className="m0"
                    data-qa-domain-record={type.title}
                  >
                    {type.title}
                  </Typography>
                </Grid>
                {type.link && (
                  <Grid sx={{ paddingLeft: 0, paddingRight: 0 }}>
                    {' '}
                    <div className={classes.linkContainer}>
                      {type.link()}
                    </div>{' '}
                  </Grid>
                )}
              </Grid>
              <OrderBy
                data={type.data}
                order={type.order}
                orderBy={type.orderBy}
              >
                {({ data: orderedData }) => {
                  return (
                    <Paginate
                      data={orderedData}
                      scrollToRef={ref}
                      pageSize={storage.infinitePageSize.get()}
                      pageSizeSetter={storage.infinitePageSize.set}
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
                                        key={idx}
                                        data-qa-record-row={type.title}
                                      >
                                        {type.columns.length > 0 &&
                                          type.columns.map(
                                            (
                                              { render, title },
                                              columnIndex
                                            ) => {
                                              return (
                                                <TableCell
                                                  parentColumn={title}
                                                  key={columnIndex}
                                                  data-qa-column={title}
                                                  className={classes.cells}
                                                >
                                                  {render(data)}
                                                </TableCell>
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
                              handlePageChange={handlePageChange}
                              handleSizeChange={handlePageSizeChange}
                              page={page}
                              pageSize={pageSize}
                              eventCategory={`${type.title.toLowerCase()} panel`}
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
          open={confirmDialog.open}
          onClose={this.handleCloseDialog}
          title="Confirm Deletion"
          actions={this.renderDialogActions}
          error={
            confirmDialog.errors
              ? getErrorStringOrDefault(confirmDialog.errors)
              : undefined
          }
        >
          Are you sure you want to delete this record?
        </ConfirmationDialog>
        <DomainRecordDrawer
          open={drawer.open}
          domain={this.props.domain.domain}
          domainId={this.props.domain.id}
          onClose={this.resetDrawer}
          mode={drawer.mode}
          records={domainRecords}
          type={drawer.type}
          updateRecords={this.props.updateRecords}
          updateDomain={this.props.updateDomain}
          {...drawer.fields}
        />
      </>
    );
  }
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
  Props,
  DomainRecord[],
  DomainRecord[],
  DomainRecord[]
>(prependLinodeNS, filter(typeEq('NS')), pathOr([], ['domainRecords']));

const styled = withStyles(styles);

export default recompose<CombinedProps, Props>(
  styled,
  withFeatureFlags
)(DomainRecords);
