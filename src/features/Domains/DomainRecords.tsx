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
  propEq
} from 'ramda';
import * as React from 'react';
import { Subscription } from 'rxjs/Subscription';
import ActionsPanel from 'src/components/ActionsPanel';
import AddNewLink from 'src/components/AddNewLink';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
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
import { deleteDomainRecord } from 'src/services/domains';
import {
  getAPIErrorOrDefault,
  getErrorStringOrDefault
} from 'src/utilities/errorUtils';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import ActionMenu from './DomainRecordActionMenu';
import Drawer from './DomainRecordDrawer';

type ClassNames = 'root' | 'cells' | 'titles' | 'linkContainer';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
      alignItems: 'flex-start'
    }
  },
  cells: {
    [theme.breakpoints.up('md')]: {
      maxWidth: 300,
      wordBreak: 'break-all'
    }
  },
  titles: {
    marginBottom: theme.spacing.unit,
    [theme.breakpoints.down('xs')]: {
      marginTop: theme.spacing.unit * 2
    }
  },
  linkContainer: {
    position: 'relative',
    top: theme.spacing.unit + 2,
    [theme.breakpoints.down('xs')]: {
      top: -10,
      '& button': {
        padding: 0
      }
    }
  }
});

interface Props {
  domain: Linode.Domain;
  domainRecords: Linode.DomainRecord[];
  updateRecords: () => void;
  updateDomain: () => void;
}

interface ConfirmationState {
  open: boolean;
  submitting: boolean;
  errors?: Linode.ApiFieldError[];
  recordId?: number;
}

interface DrawerState {
  open: boolean;
  mode: 'create' | 'edit';
  type: Linode.RecordType | Linode.DomainType;
  fields?: Partial<Linode.DomainRecord> | Partial<Linode.Domain>;
}

interface State {
  types: IType[];
  drawer: DrawerState;
  confirmDialog: ConfirmationState;
}

type CombinedProps = Props & WithStyles<ClassNames>;

interface IType {
  title: string;
  data: any[];
  order: 'asc' | 'desc';
  orderBy: 'name' | 'target' | 'domain';
  columns: {
    title: string;
    render: (
      r: Linode.DomainRecord | Linode.Domain
    ) => null | string | JSX.Element;
  }[];
  link?: () => null | JSX.Element;
}

const createLink = (title: string, handler: () => void) => (
  <AddNewLink onClick={handler} label={title} />
);

class DomainRecords extends React.Component<CombinedProps, State> {
  eventsSubscription$: Subscription;

  static defaultDrawerState: DrawerState = {
    open: false,
    mode: 'create',
    type: 'NS'
  };

  updateDrawer = (fn: (d: DrawerState) => DrawerState) =>
    this.setState(over(lensPath(['drawer']), fn));

  updateConfirmDialog = (fn: (d: ConfirmationState) => ConfirmationState) =>
    this.setState(over(lensPath(['confirmDialog']), fn), () => {
      scrollErrorIntoView();
    });

  resetDrawer = () => this.updateDrawer(() => DomainRecords.defaultDrawerState);

  openForCreation = (type: Linode.RecordType) =>
    this.updateDrawer(() => ({
      open: true,
      submitting: false,
      mode: 'create',
      type
    }));

  openForEditing = (
    type: Linode.RecordType | Linode.DomainType,
    fields: Partial<Linode.DomainRecord> | Partial<Linode.Domain>
  ) =>
    this.updateDrawer(() => ({
      open: true,
      submitting: false,
      mode: 'edit',
      type,
      fields
    }));

  openForEditMasterDomain = (f: Partial<Linode.Domain>) =>
    this.openForEditing('master', f);

  openForEditSlaveDomain = (f: Partial<Linode.Domain>) =>
    this.openForEditing('slave', f);

  openForCreateNSRecord = () => this.openForCreation('NS');
  openForEditNSRecord = (
    f: Pick<Linode.DomainRecord, 'id' | 'target' | 'name' | 'ttl_sec'>
  ) => this.openForEditing('NS', f);

  openForCreateMXRecord = () => this.openForCreation('MX');
  openForEditMXRecord = (
    f: Pick<
      Linode.DomainRecord,
      'id' | 'target' | 'priority' | 'name' | 'ttl_sec'
    >
  ) => this.openForEditing('MX', f);

  openForCreateARecord = () => this.openForCreation('AAAA');
  openForEditARecord = (
    f: Pick<Linode.DomainRecord, 'id' | 'name' | 'target' | 'ttl_sec'>
  ) => this.openForEditing('AAAA', f);

  openForCreateCNAMERecord = () => this.openForCreation('CNAME');
  openForEditCNAMERecord = (
    f: Pick<Linode.DomainRecord, 'id' | 'name' | 'target' | 'ttl_sec'>
  ) => this.openForEditing('CNAME', f);

  openForCreateTXTRecord = () => this.openForCreation('TXT');
  openForEditTXTRecord = (
    f: Pick<Linode.DomainRecord, 'id' | 'name' | 'target' | 'ttl_sec'>
  ) => this.openForEditing('TXT', f);

  openForCreateSRVRecord = () => this.openForCreation('SRV');
  openForEditSRVRecord = (
    f: Pick<
      Linode.DomainRecord,
      'id' | 'name' | 'priority' | 'weight' | 'port' | 'target' | 'protocol'
    >
  ) => this.openForEditing('SRV', f);

  openForCreateCAARecord = () => this.openForCreation('CAA');
  openForEditCAARecord = (
    f: Pick<Linode.DomainRecord, 'id' | 'name' | 'tag' | 'target' | 'ttl_sec'>
  ) => this.openForEditing('CAA', f);

  confirmDeletion = (recordId: number) =>
    this.updateConfirmDialog(confirmDialog => ({
      ...confirmDialog,
      open: true,
      recordId
    }));

  deleteDomainRecord = () => {
    const {
      domain: { id: domainId }
    } = this.props;
    const {
      confirmDialog: { recordId }
    } = this.state;
    if (!domainId || !recordId) {
      return;
    }

    this.updateConfirmDialog(c => ({
      ...c,
      submitting: true,
      errors: undefined
    }));

    deleteDomainRecord(domainId, recordId)
      .then(() => {
        this.props.updateRecords();

        this.updateConfirmDialog(c => ({
          open: false,
          submitting: false,
          errors: undefined,
          recordId: undefined
        }));
      })
      .catch(errorResponse => {
        const errors = getAPIErrorOrDefault(errorResponse);
        this.updateConfirmDialog(c => ({
          ...c,
          submitting: false,
          errors
        }));
      });
    this.updateConfirmDialog(c => ({ ...c, submitting: true }));
  };

  handleOpenSOADrawer = (d: Linode.Domain) => {
    d.type === 'master'
      ? this.openForEditMasterDomain(d)
      : this.openForEditSlaveDomain(d);
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
          render: (d: Linode.Domain) => d.domain
        },
        {
          title: 'Email',
          render: (d: Linode.Domain) => d.soa_email
        },
        {
          title: 'Default TTL',
          render: compose(
            msToReadable,
            pathOr(0, ['ttl_sec'])
          )
        },
        {
          title: 'Refresh Rate',
          render: compose(
            msToReadable,
            pathOr(0, ['refresh_sec'])
          )
        },
        {
          title: 'Retry Rate',
          render: compose(
            msToReadable,
            pathOr(0, ['retry_sec'])
          )
        },
        {
          title: 'Expire Time',
          render: compose(
            msToReadable,
            pathOr(0, ['expire_sec'])
          )
        },
        {
          title: '',
          render: (d: Linode.Domain) => {
            return d.type === 'master' ? (
              <ActionMenu editPayload={d} onEdit={this.handleOpenSOADrawer} />
            ) : null;
          }
        }
      ]
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
          render: (r: Linode.DomainRecord) => r.target
        },
        {
          title: 'Subdomain',
          render: (r: Linode.DomainRecord) => {
            const sd = r.name;
            const {
              domain: { domain }
            } = this.props;
            return isEmpty(sd) ? domain : `${sd}.${domain}`;
          }
        },
        {
          title: 'TTL',
          render: getTTL
        },
        {
          title: '',
          /**
           * If the NS is one of Linode's, don't display the Action menu since the user
           * cannot make changes to Linode's nameservers.
           */
          render: ({ id, name, target, ttl_sec }: Linode.DomainRecord) =>
            /linode.com/.test(target) ? null : (
              <ActionMenu
                editPayload={{
                  id,
                  name,
                  target,
                  ttl_sec
                }}
                onEdit={this.openForEditNSRecord}
                deleteData={{
                  recordID: id,
                  onDelete: this.confirmDeletion
                }}
              />
            )
        }
      ],
      link: () => createLink('Add a NS Record', this.openForCreateNSRecord)
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
          render: (r: Linode.DomainRecord) => r.target
        },
        {
          title: 'Preference',
          render: (r: Linode.DomainRecord) => String(r.priority)
        },
        {
          title: 'Subdomain',
          render: (r: Linode.DomainRecord) => r.name
        },
        {
          title: 'TTL',
          render: getTTL
        },
        {
          title: '',
          render: ({
            id,
            name,
            priority,
            target,
            ttl_sec
          }: Linode.DomainRecord) => (
            <ActionMenu
              onEdit={this.openForEditMXRecord}
              editPayload={{
                id,
                name,
                priority,
                target,
                ttl_sec
              }}
              deleteData={{
                recordID: id,
                onDelete: this.confirmDeletion
              }}
            />
          )
        }
      ],
      link: () => createLink('Add a MX Record', this.openForCreateMXRecord)
    },

    /** A/AAAA Record */
    {
      title: 'A/AAAA Record',
      orderBy: 'name',
      order: 'asc',
      data: this.props.domainRecords.filter(
        r => typeEq('AAAA', r) || typeEq('A', r)
      ),
      columns: [
        { title: 'Hostname', render: (r: Linode.DomainRecord) => r.name },
        { title: 'IP Address', render: (r: Linode.DomainRecord) => r.target },
        { title: 'TTL', render: getTTL },
        {
          title: '',
          render: ({ id, name, target, ttl_sec }: Linode.DomainRecord) => (
            <ActionMenu
              editPayload={{
                id,
                name,
                target,
                ttl_sec
              }}
              onEdit={this.openForEditARecord}
              deleteData={{
                recordID: id,
                onDelete: this.confirmDeletion
              }}
            />
          )
        }
      ],
      link: () => createLink('Add an A/AAAA Record', this.openForCreateARecord)
    },

    /** CNAME Record */
    {
      title: 'CNAME Record',
      orderBy: 'name',
      order: 'asc',
      data: this.props.domainRecords.filter(typeEq('CNAME')),
      columns: [
        { title: 'Hostname', render: (r: Linode.DomainRecord) => r.name },
        { title: 'Aliases to', render: (r: Linode.DomainRecord) => r.target },
        { title: 'TTL', render: getTTL },
        {
          title: '',
          render: ({ id, name, target, ttl_sec }: Linode.DomainRecord) => (
            <ActionMenu
              editPayload={{
                id,
                name,
                target,
                ttl_sec
              }}
              onEdit={this.openForEditCNAMERecord}
              deleteData={{
                recordID: id,
                onDelete: this.confirmDeletion
              }}
            />
          )
        }
      ],
      link: () =>
        createLink('Add a CNAME Record', this.openForCreateCNAMERecord)
    },

    /** TXT Record */
    {
      title: 'TXT Record',
      orderBy: 'name',
      order: 'asc',
      data: this.props.domainRecords.filter(typeEq('TXT')),
      columns: [
        { title: 'Hostname', render: (r: Linode.DomainRecord) => r.name },
        { title: 'Value', render: (r: Linode.DomainRecord) => r.target },
        { title: 'TTL', render: getTTL },
        {
          title: '',
          render: ({ id, target, name, ttl_sec }: Linode.DomainRecord) => (
            <ActionMenu
              editPayload={{
                id,
                name,
                target,
                ttl_sec
              }}
              onEdit={this.openForEditTXTRecord}
              deleteData={{
                recordID: id,
                onDelete: this.confirmDeletion
              }}
            />
          )
        }
      ],
      link: () => createLink('Add a TXT Record', this.openForCreateTXTRecord)
    },
    /** SRV Record */
    {
      title: 'SRV Record',
      orderBy: 'name',
      order: 'asc',
      data: this.props.domainRecords.filter(typeEq('SRV')),
      columns: [
        { title: 'Name', render: (r: Linode.DomainRecord) => r.name },
        {
          title: 'Domain',
          render: (r: Linode.DomainRecord) => this.props.domain.domain
        },
        {
          title: 'Priority',
          render: (r: Linode.DomainRecord) => String(r.priority)
        },
        {
          title: 'Weight',
          render: (r: Linode.DomainRecord) => String(r.weight)
        },
        { title: 'Port', render: (r: Linode.DomainRecord) => String(r.port) },
        { title: 'Target', render: (r: Linode.DomainRecord) => r.target },
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
            weight
          }: Linode.DomainRecord) => (
            <ActionMenu
              editPayload={{
                id,
                service,
                port,
                priority,
                protocol,
                target,
                weight
              }}
              onEdit={this.openForEditSRVRecord}
              deleteData={{
                recordID: id,
                onDelete: this.confirmDeletion
              }}
            />
          )
        }
      ],
      link: () => createLink('Add a SRV Record', this.openForCreateSRVRecord)
    },

    /** CAA Record */
    {
      title: 'CAA Record',
      orderBy: 'name',
      order: 'asc',
      data: this.props.domainRecords.filter(typeEq('CAA')),
      columns: [
        { title: 'Name', render: (r: Linode.DomainRecord) => r.name },
        { title: 'Tag', render: (r: Linode.DomainRecord) => r.tag },
        { title: 'Value', render: (r: Linode.DomainRecord) => r.target },
        { title: 'TTL', render: getTTL },
        {
          title: '',
          render: ({ id, name, tag, target, ttl_sec }: Linode.DomainRecord) => (
            <ActionMenu
              editPayload={{
                id,
                name,
                tag,
                target,
                ttl_sec
              }}
              onEdit={this.openForEditCAARecord}
              deleteData={{
                recordID: id,
                onDelete: this.confirmDeletion
              }}
            />
          )
        }
      ],
      link: () => createLink('Add a CAA Record', this.openForCreateCAARecord)
    }
  ];

  handleCloseDialog = () => {
    this.updateConfirmDialog(() => ({
      open: false,
      submitting: false,
      recordId: undefined
    }));
  };

  constructor(props: CombinedProps) {
    super(props);
    this.state = {
      drawer: DomainRecords.defaultDrawerState,
      confirmDialog: {
        open: false,
        submitting: false
      },
      types: this.generateTypes()
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
        <Button type="cancel" onClick={this.handleCloseDialog}>
          Cancel
        </Button>
        <Button type="secondary" destructive onClick={this.deleteDomainRecord}>
          Delete
        </Button>
      </ActionsPanel>
    );
  };

  render() {
    const { domain, domainRecords, classes } = this.props;
    const { drawer, confirmDialog } = this.state;

    return (
      <React.Fragment>
        <DocumentTitleSegment segment={`${domain.domain} - DNS Records`} />
        {this.state.types.map((type, eachTypeIdx) => {
          const ref: React.Ref<any> = React.createRef();

          return (
            <div key={eachTypeIdx}>
              <Grid
                container
                justify="space-between"
                alignItems="flex-end"
                className={classes.root}
              >
                <Grid item>
                  <a ref={ref} />
                  <Typography
                    variant="h2"
                    className={classes.titles}
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
                {({ data: orderedData, handleOrderChange, order, orderBy }) => {
                  return (
                    <Paginate data={orderedData} scrollToRef={ref}>
                      {({
                        count,
                        data: paginatedData,
                        handlePageChange,
                        handlePageSizeChange,
                        page,
                        pageSize
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
          domainId={this.props.domain.id}
          onClose={this.resetDrawer}
          mode={drawer.mode}
          records={domainRecords}
          type={drawer.type}
          updateRecords={this.props.updateRecords}
          updateDomain={this.props.updateDomain}
          {...drawer.fields}
        />
      </React.Fragment>
    );
  }
}

const msToReadable = (v: number): null | string =>
  pathOr(null, [v], {
    0: 'Default',
    300: '5 minutes',
    3600: '1 hours',
    7200: '2 hours',
    14400: '4 hours',
    28800: '8 hours',
    57600: '16 hours',
    86400: '1 day',
    172800: '2 days',
    345600: '4 days',
    604800: '1 week',
    1209600: '2 weeks',
    2419200: '4 weeks'
  });

const getTTL = compose(
  msToReadable,
  pathOr(0, ['ttl_sec'])
);

const typeEq = propEq('type');

const prependLinodeNS = compose<any, any, Linode.DomainRecord[]>(
  flatten,
  prepend([
    {
      priority: 0,
      type: 'NS',
      name: '',
      id: 9999,
      protocol: null,
      weight: 0,
      tag: null,
      port: 0,
      target: 'ns1.linode.com',
      service: null,
      ttl_sec: 0
    },
    {
      priority: 0,
      type: 'NS',
      name: '',
      id: 9999,
      protocol: null,
      weight: 0,
      tag: null,
      port: 0,
      target: 'ns2.linode.com',
      service: null,
      ttl_sec: 0
    },
    {
      priority: 0,
      type: 'NS',
      name: '',
      id: 9999,
      protocol: null,
      weight: 0,
      tag: null,
      port: 0,
      target: 'ns3.linode.com',
      service: null,
      ttl_sec: 0
    },
    {
      priority: 0,
      type: 'NS',
      name: '',
      id: 9999,
      protocol: null,
      weight: 0,
      tag: null,
      port: 0,
      target: 'ns4.linode.com',
      service: null,
      ttl_sec: 0
    },
    {
      priority: 0,
      type: 'NS',
      name: '',
      id: 9999,
      protocol: null,
      weight: 0,
      tag: null,
      port: 0,
      target: 'ns5.linode.com',
      service: null,
      ttl_sec: 0
    }
  ])
);

const getNSRecords = compose<
  Props,
  Linode.DomainRecord[],
  Linode.DomainRecord[],
  Linode.DomainRecord[]
>(
  prependLinodeNS,
  filter(typeEq('NS')),
  pathOr([], ['domainRecords'])
);

const styled = withStyles(styles);

export default styled(DomainRecords);
