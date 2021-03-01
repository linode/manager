import {
  deleteDomainRecord,
  Domain,
  DomainRecord,
  DomainType,
  RecordType,
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
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import withFeatureFlags, {
  FeatureFlagConsumerProps,
} from 'src/containers/withFeatureFlagConsumer.container.ts';
import {
  getAPIErrorOrDefault,
  getErrorStringOrDefault,
} from 'src/utilities/errorUtils';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import { storage } from 'src/utilities/storage';
import ActionMenu from './DomainRecordActionMenu';
import Drawer from './DomainRecordDrawer';

type ClassNames = 'root' | 'cells' | 'linkContainer' | 'addNewLink';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      margin: 0,
      '& .MuiGrid-item': {
        paddingLeft: 0,
      },
      [theme.breakpoints.down('sm')]: {
        marginLeft: theme.spacing(),
        marginRight: theme.spacing(),
      },
    },
    cells: {
      whiteSpace: 'nowrap',
      [theme.breakpoints.up('md')]: {
        maxWidth: 300,
      },
      '& .data': {
        maxWidth: 300,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        [theme.breakpoints.up('md')]: {
          maxWidth: 750,
        },
      },
    },
    linkContainer: {
      [theme.breakpoints.down('sm')]: {
        marginLeft: theme.spacing(),
        marginRight: theme.spacing(),
      },
    },
  });

interface Props {
  domain: Domain;
  domainRecords: DomainRecord[];
  updateRecords: () => void;
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
  <Button buttonType="secondary" onClick={handler}>
    {title}
  </Button>
);

class DomainRecords extends React.Component<CombinedProps, State> {
  eventsSubscription$: Subscription;

  static defaultDrawerState: DrawerState = {
    open: false,
    mode: 'create',
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
      open: true,
      submitting: false,
      mode: 'create',
      type,
    }));

  openForEditing = (
    type: RecordType | DomainType,
    fields: Partial<DomainRecord> | Partial<Domain>
  ) =>
    this.updateDrawer(() => ({
      open: true,
      submitting: false,
      mode: 'edit',
      type,
      fields,
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
      submitting: true,
      errors: undefined,
    }));

    deleteDomainRecord(domainId, recordId)
      .then(() => {
        this.props.updateRecords();

        this.updateConfirmDialog((_) => ({
          open: false,
          submitting: false,
          errors: undefined,
          recordId: undefined,
        }));
      })
      .catch((errorResponse) => {
        const errors = getAPIErrorOrDefault(errorResponse);
        this.updateConfirmDialog((c) => ({
          ...c,
          submitting: false,
          errors,
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
      title: 'SOA Record',
      orderBy: 'domain',
      order: 'asc',
      data: [this.props.domain],
      columns: [
        {
          title: 'Primary Domain',
          render: (d: Domain) => d.domain,
        },
        {
          title: 'Email',
          render: (d: Domain) => d.soa_email,
        },
        {
          title: 'Default TTL',
          render: compose(msToReadable, pathOr(0, ['ttl_sec'])),
        },
        {
          title: 'Refresh Rate',
          render: compose(msToReadable, pathOr(0, ['refresh_sec'])),
        },
        {
          title: 'Retry Rate',
          render: compose(msToReadable, pathOr(0, ['retry_sec'])),
        },
        {
          title: 'Expire Time',
          render: compose(msToReadable, pathOr(0, ['expire_sec'])),
        },
        {
          title: '',
          render: (d: Domain) => {
            return d.type === 'master' ? (
              <ActionMenu
                editPayload={d}
                onEdit={this.handleOpenSOADrawer}
                label={this.props.domain.domain}
              />
            ) : null;
          },
        },
      ],
    },

    /** NS Record */
    {
      title: 'NS Record',
      orderBy: 'target',
      order: 'asc',
      data: getNSRecords(this.props),
      columns: [
        {
          title: 'Name Server',
          render: (r: DomainRecord) => r.target,
        },
        {
          title: 'Subdomain',
          render: (r: DomainRecord) => {
            const sd = r.name;
            const {
              domain: { domain },
            } = this.props;
            return isEmpty(sd) ? domain : `${sd}.${domain}`;
          },
        },
        {
          title: 'TTL',
          render: getTTL,
        },
        {
          title: '',
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
                  recordID: id,
                  onDelete: this.confirmDeletion,
                }}
              />
            ),
        },
      ],
      link: () => createLink('Add a NS Record', this.openForCreateNSRecord),
    },

    /** MX Record */
    {
      title: 'MX Record',
      orderBy: 'target',
      order: 'asc',
      data: this.props.domainRecords.filter(typeEq('MX')),
      columns: [
        {
          title: 'Mail Server',
          render: (r: DomainRecord) => r.target,
        },
        {
          title: 'Preference',
          render: (r: DomainRecord) => String(r.priority),
        },
        {
          title: 'Subdomain',
          render: (r: DomainRecord) => r.name,
        },
        {
          title: 'TTL',
          render: getTTL,
        },
        {
          title: '',
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
                recordID: id,
                onDelete: this.confirmDeletion,
              }}
            />
          ),
        },
      ],
      link: () => createLink('Add a MX Record', this.openForCreateMXRecord),
    },

    /** A/AAAA Record */
    {
      title: 'A/AAAA Record',
      orderBy: 'name',
      order: 'asc',
      data: this.props.domainRecords.filter(
        (r) => typeEq('AAAA', r) || typeEq('A', r)
      ),
      columns: [
        {
          title: 'Hostname',
          render: (r: DomainRecord) => r.name || this.props.domain.domain,
        },
        { title: 'IP Address', render: (r: DomainRecord) => r.target },
        { title: 'TTL', render: getTTL },
        {
          title: '',
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
                recordID: id,
                onDelete: this.confirmDeletion,
              }}
            />
          ),
        },
      ],
      link: () => createLink('Add an A/AAAA Record', this.openForCreateARecord),
    },

    /** CNAME Record */
    {
      title: 'CNAME Record',
      orderBy: 'name',
      order: 'asc',
      data: this.props.domainRecords.filter(typeEq('CNAME')),
      columns: [
        { title: 'Hostname', render: (r: DomainRecord) => r.name },
        { title: 'Aliases to', render: (r: DomainRecord) => r.target },
        { title: 'TTL', render: getTTL },
        {
          title: '',
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
                recordID: id,
                onDelete: this.confirmDeletion,
              }}
            />
          ),
        },
      ],
      link: () =>
        createLink('Add a CNAME Record', this.openForCreateCNAMERecord),
    },

    /** TXT Record */
    {
      title: 'TXT Record',
      orderBy: 'name',
      order: 'asc',
      data: this.props.domainRecords.filter(typeEq('TXT')),
      columns: [
        { title: 'Hostname', render: (r: DomainRecord) => r.name },
        {
          title: 'Value',
          render: (r: DomainRecord) => r.target,
        },
        { title: 'TTL', render: getTTL },
        {
          title: '',
          render: ({ id, target, name, ttl_sec }: DomainRecord) => (
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
                recordID: id,
                onDelete: this.confirmDeletion,
              }}
            />
          ),
        },
      ],
      link: () => createLink('Add a TXT Record', this.openForCreateTXTRecord),
    },
    /** SRV Record */
    {
      title: 'SRV Record',
      orderBy: 'name',
      order: 'asc',
      data: this.props.domainRecords.filter(typeEq('SRV')),
      columns: [
        { title: 'Name', render: (r: DomainRecord) => r.name },
        {
          title: 'Domain',
          render: () => this.props.domain.domain,
        },
        {
          title: 'Priority',
          render: (r: DomainRecord) => String(r.priority),
        },
        {
          title: 'Weight',
          render: (r: DomainRecord) => String(r.weight),
        },
        { title: 'Port', render: (r: DomainRecord) => String(r.port) },
        { title: 'Target', render: (r: DomainRecord) => r.target },
        { title: 'TTL', render: getTTL },
        {
          title: '',
          render: ({
            id,
            service,
            port,
            priority,
            protocol,
            target,
            weight,
          }: DomainRecord) => (
            <ActionMenu
              editPayload={{
                id,
                service,
                port,
                priority,
                protocol,
                target,
                weight,
              }}
              label={this.props.domain.domain}
              onEdit={this.openForEditSRVRecord}
              deleteData={{
                recordID: id,
                onDelete: this.confirmDeletion,
              }}
            />
          ),
        },
      ],
      link: () => createLink('Add a SRV Record', this.openForCreateSRVRecord),
    },

    /** CAA Record */
    {
      title: 'CAA Record',
      orderBy: 'name',
      order: 'asc',
      data: this.props.domainRecords.filter(typeEq('CAA')),
      columns: [
        { title: 'Name', render: (r: DomainRecord) => r.name },
        { title: 'Tag', render: (r: DomainRecord) => r.tag },
        {
          title: 'Value',
          render: (r: DomainRecord) => r.target,
        },
        { title: 'TTL', render: getTTL },
        {
          title: '',
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
                recordID: id,
                onDelete: this.confirmDeletion,
              }}
            />
          ),
        },
      ],
      link: () => createLink('Add a CAA Record', this.openForCreateCAARecord),
    },
  ];

  handleCloseDialog = () => {
    this.updateConfirmDialog(() => ({
      open: false,
      submitting: false,
      recordId: undefined,
    }));
  };

  constructor(props: CombinedProps) {
    super(props);
    this.state = {
      drawer: DomainRecords.defaultDrawerState,
      confirmDialog: {
        open: false,
        submitting: false,
      },
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
        <Button buttonType="cancel" onClick={this.handleCloseDialog}>
          Cancel
        </Button>
        <Button
          buttonType="primary"
          destructive
          onClick={this.deleteDomainRecord}
        >
          Delete
        </Button>
      </ActionsPanel>
    );
  };

  render() {
    const { domain, domainRecords, classes } = this.props;
    const { drawer, confirmDialog } = this.state;

    return (
      <>
        <DocumentTitleSegment segment={`${domain.domain} - DNS Records`} />
        {this.state.types.map((type, eachTypeIdx) => {
          const ref: React.Ref<any> = React.createRef();

          return (
            <div key={eachTypeIdx}>
              <Grid
                container
                justify="space-between"
                alignItems="center"
                className={classes.root}
              >
                <Grid item ref={ref}>
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
                  <Grid item>
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
                            <Paper>
                              <Table
                                aria-label={`List of Domains ${type.title}`}
                              >
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
                                    <TableRowEmptyState
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
                                                { title, render },
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
                            </Paper>
                            <PaginationFooter
                              count={count}
                              handlePageChange={handlePageChange}
                              handleSizeChange={handlePageSizeChange}
                              page={page}
                              pageSize={pageSize}
                              eventCategory={`${type.title.toLowerCase()} panel`}
                              showAll
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
        <Drawer
          open={drawer.open}
          domain={this.props.domain.domain}
          domainId={this.props.domain.id}
          onClose={this.resetDrawer}
          mode={drawer.mode}
          records={domainRecords}
          type={drawer.type}
          updateRecords={this.props.updateRecords}
          {...drawer.fields}
        />
      </>
    );
  }
}

const msToReadable = (v: number): null | string =>
  pathOr(null, [v], {
    0: 'Default',
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
      priority: 0,
      type: 'NS',
      name: '',
      id: -1,
      protocol: null,
      weight: 0,
      tag: null,
      port: 0,
      target: 'ns1.linode.com',
      service: null,
      ttl_sec: 0,
    },
    {
      priority: 0,
      type: 'NS',
      name: '',
      id: -1,
      protocol: null,
      weight: 0,
      tag: null,
      port: 0,
      target: 'ns2.linode.com',
      service: null,
      ttl_sec: 0,
    },
    {
      priority: 0,
      type: 'NS',
      name: '',
      id: -1,
      protocol: null,
      weight: 0,
      tag: null,
      port: 0,
      target: 'ns3.linode.com',
      service: null,
      ttl_sec: 0,
    },
    {
      priority: 0,
      type: 'NS',
      name: '',
      id: -1,
      protocol: null,
      weight: 0,
      tag: null,
      port: 0,
      target: 'ns4.linode.com',
      service: null,
      ttl_sec: 0,
    },
    {
      priority: 0,
      type: 'NS',
      name: '',
      id: -1,
      protocol: null,
      weight: 0,
      tag: null,
      port: 0,
      target: 'ns5.linode.com',
      service: null,
      ttl_sec: 0,
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
