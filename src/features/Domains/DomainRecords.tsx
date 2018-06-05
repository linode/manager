import * as React from 'react';
import {
  compose,
  equals,
  filter,
  flatten,
  isEmpty,
  lensPath,
  over,
  path,
  pathOr,
  prepend,
  propEq,
} from 'ramda';
import { Subscription } from 'rxjs/Subscription';

import { withStyles, StyleRulesCallback, Theme, WithStyles } from 'material-ui';
import Button from 'material-ui/Button';
import Paper from 'material-ui/Paper';
import Grid from 'material-ui/Grid';
import TableBody from 'material-ui/Table/TableBody';
import TableCell from 'material-ui/Table/TableCell';
import TableHead from 'material-ui/Table/TableHead';
import TableRow from 'material-ui/Table/TableRow';

import { deleteDomainRecord } from 'src/services/domains';
import Table from 'src/components/Table';
import ExpansionPanel from 'src/components/ExpansionPanel';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import ActionsPanel from 'src/components/ActionsPanel';
import ActionMenu from './DomainRecordActionMenu';
import Drawer from './DomainRecordDrawer';
import AddNewLink from 'src/components/AddNewLink';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {
  domain: Linode.Domain;
  domainRecords: Linode.Record[];
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
  fields?: Partial<Linode.Record> | Partial<Linode.Domain>;
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
  columns: {
    title: string;
    render: (r: Linode.Record | Linode.Domain) => null | string | JSX.Element;
  }[];
  link?: () => null | JSX.Element;
}

const createLink = (title: string, handler: () => void) =>
  <AddNewLink onClick={handler} label={title} />;


class DomainRecords extends React.Component<CombinedProps, State> {
  eventsSubscription$: Subscription;

  static defaultDrawerState: DrawerState = {
    open: false,
    mode: 'create',
    type: 'NS',
  };

  updateDrawer = (fn: (d: DrawerState) => DrawerState) =>
    this.setState(over(lensPath(['drawer']), fn))

  updateConfirmDialog = (fn: (d: ConfirmationState) => ConfirmationState) =>
    this.setState(over(lensPath(['confirmDialog']), fn))

  resetDrawer = () => this.updateDrawer(() => DomainRecords.defaultDrawerState);

  openForCreation = (type: Linode.RecordType) => this.updateDrawer(() => ({
    open: true,
    submitting: false,
    mode: 'create',
    type,
  }))

  openForEditing = (
    type: Linode.RecordType | Linode.DomainType,
    fields: Partial<Linode.Record> | Partial<Linode.Domain>,
  ) =>
    this.updateDrawer(() => ({
      open: true,
      submitting: false,
      mode: 'edit',
      type,
      fields,
    }))

  openForEditMasterDomain = (f: Partial<Linode.Domain>) =>
    this.openForEditing('master', f)

  openForEditSlaveDomain = (f: Partial<Linode.Domain>) =>
    this.openForEditing('slave', f)

  openForCreateNSRecord = () => this.openForCreation('NS');
  openForEditNSRecord = (f: Pick<Linode.Record, 'id' | 'target' | 'name' | 'ttl_sec'>) =>
    this.openForEditing('NS', f)

  openForCreateMXRecord = () => this.openForCreation('MX');
  openForEditMXRecord = (
    f: Pick<Linode.Record, 'id' | 'target' | 'priority' | 'name' | 'ttl_sec'>,
  ) =>
    this.openForEditing('MX', f)

  openForCreateARecord = () => this.openForCreation('AAAA');
  openForEditARecord = (f: Pick<Linode.Record, 'id' | 'name' | 'target' | 'ttl_sec'>) =>
    this.openForEditing('AAAA', f)

  openForCreateCNAMERecord = () => this.openForCreation('CNAME');
  openForEditCNAMERecord = (f: Pick<Linode.Record, 'id' | 'name' | 'target' | 'ttl_sec'>) =>
    this.openForEditing('CNAME', f)

  openForCreateTXTRecord = () => this.openForCreation('TXT');
  openForEditTXTRecord = (f: Pick<Linode.Record, 'id' | 'name' | 'target' | 'ttl_sec'>) =>
    this.openForEditing('TXT', f)

  openForCreateSRVRecord = () => this.openForCreation('SRV');
  openForEditSRVRecord = (
    f: Pick<Linode.Record, 'id' | 'name' | 'priority' | 'weight' | 'port' | 'target'>,
  ) =>
    this.openForEditing('SRV', f)

  openForCreateCAARecord = () => this.openForCreation('CAA');
  openForEditCAARecord = (
    f: Pick<Linode.Record, 'id' | 'name' | 'tag' | 'target' | 'ttl_sec'>,
  ) =>
    this.openForEditing('CAA', f)

  confirmDeletion = (recordId: number) => this.updateConfirmDialog(confirmDialog => ({
    ...confirmDialog,
    open: true,
    recordId,
  }))

  deleteDomainRecord = () => {
    const { domain: { id: domainId } } = this.props;
    const { confirmDialog: { recordId } } = this.state;
    if (!domainId || !recordId) { return; }

    this.updateConfirmDialog(c => ({ ...c, submitting: true, errors: undefined }));

    deleteDomainRecord(domainId, recordId)
      .then((response) => {
        this.props.updateRecords();

        this.updateConfirmDialog(c => ({
          open: false,
          submitting: false,
          errors: undefined,
          recordId: undefined,
        }));
      })
      .catch((errorResponse) => {
        const errors = path<Linode.ApiFieldError[]>(['response', 'data', 'errors'], errorResponse);
        if (errors) {
          this.updateConfirmDialog(c => ({
            ...c,
            submitting: false,
            errors,
          }));
        }
      });
    this.updateConfirmDialog(c => ({ ...c, submitting: true }));
  }

  generateTypes = () => [
    /** SOA Record */
    {
      title: 'SOA Record',
      data: [this.props.domain],
      columns: [
        {
          title: 'Primary Domain',
          render: (d: Linode.Domain) => d.domain,
        },
        {
          title: 'Email',
          render: (d: Linode.Domain) => d.soa_email,
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
          render: (d: Linode.Domain) => {
            return d.type === 'master'
              ? <ActionMenu
                onEdit={() => {
                  d.type === 'master'
                    ? this.openForEditMasterDomain(d)
                    : this.openForEditSlaveDomain(d);
                }}
              />
              : <React.Fragment />;
          },
        },
      ],
    },

    /** NS Record */
    {
      title: 'NS Record',
      data: getNSRecords(this.props),
      columns: [
        {
          title: 'Name Server',
          render: (r: Linode.Record) => r.target,
        },
        {
          title: 'Subdomain',
          render: (r: Linode.Record) => {
            const sd = r.name;
            const { domain: { domain } } = this.props;
            return isEmpty(sd)
              ? domain
              : `${sd}.${domain}`;
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
          render: ({ id, name, target, ttl_sec }: Linode.Record) => /linode.com/.test(target)
            ? null
            : <ActionMenu
              onEdit={() => this.openForEditNSRecord({ id, name, target, ttl_sec })}
              onDelete={() => this.confirmDeletion(id)}
            />,
        },
      ],
      link: () => createLink('Add a NS Record', this.openForCreateNSRecord),
    },

    /** MX Record */
    {
      title: 'MX Record',
      data: this.props.domainRecords.filter(typeEq('MX')),
      columns: [
        {
          title: 'Mail Server',
          render: (r: Linode.Record) => r.target,
        },
        {
          title: 'Preference',
          render: (r: Linode.Record) => String(r.priority),
        },
        {
          title: 'Subdomain',
          render: (r: Linode.Record) => r.name,
        },
        {
          title: 'TTL',
          render: getTTL,
        },
        {
          title: '',
          render: ({ id, name, priority, target, ttl_sec }: Linode.Record) =>
            <ActionMenu
              onEdit={() => this.openForEditMXRecord({ id, name, priority, target, ttl_sec })}
              onDelete={() => this.confirmDeletion(id)}
            />,
        },
      ],
      link: () => createLink('Add a MX Record', this.openForCreateMXRecord),
    },

    /** A/AAAA Record */
    {
      title: 'A/AAAA Record',
      data: this.props.domainRecords.filter(r => typeEq('AAAA', r) || typeEq('A', r)),
      columns: [
        { title: 'Hostname', render: (r: Linode.Record) => r.name },
        { title: 'IP Address', render: (r: Linode.Record) => r.target },
        { title: 'TTL', render: getTTL },
        {
          title: '',
          render: ({ id, name, target, ttl_sec }: Linode.Record) =>
            <ActionMenu
              onEdit={() => this.openForEditARecord({ id, name, target, ttl_sec })}
              onDelete={() => this.confirmDeletion(id)}
            />,
        },
      ],
      link: () => createLink('Add an A/AAAA Record', this.openForCreateARecord),
    },

    /** CNAME Record */
    {
      title: 'CNAME Record',
      data: this.props.domainRecords.filter(typeEq('CNAME')),
      columns: [
        { title: 'Hostname', render: (r: Linode.Record) => r.name },
        { title: 'Aliases to', render: (r: Linode.Record) => r.target },
        { title: 'TTL', render: getTTL },
        {
          title: '',
          render: ({ id, name, target, ttl_sec }: Linode.Record) =>
            <ActionMenu
              onEdit={() => this.openForEditCNAMERecord({ id, name, target, ttl_sec })}
              onDelete={() => this.confirmDeletion(id)}
            />,
        },
      ],
      link: () => createLink('Add a CNAME Record', this.openForCreateCNAMERecord),
    },

    /** TXT Record */
    {
      title: 'TXT Record',
      data: this.props.domainRecords.filter(typeEq('TXT')),
      columns: [
        { title: 'Hostname', render: (r: Linode.Record) => r.name },
        { title: 'Value', render: (r: Linode.Record) => r.target },
        { title: 'TTL', render: getTTL },
        {
          title: '',
          render: ({ id, target, name, ttl_sec }: Linode.Record) =>
            <ActionMenu
              onEdit={() => this.openForEditTXTRecord({ id, target, name, ttl_sec })}
              onDelete={() => this.confirmDeletion(id)}
            />,
        },
      ],
      link: () => createLink('Add a TXT Record', this.openForCreateTXTRecord),
    },
    /** SRV Record */
    {
      title: 'SRV Record',
      data: this.props.domainRecords.filter(typeEq('SRV')),
      columns: [
        { title: 'Name', render: (r: Linode.Record) => r.name },
        { title: 'Domain', render: (r: Linode.Record) => this.props.domain.domain },
        { title: 'Priority', render: (r: Linode.Record) => String(r.priority) },
        { title: 'Weight', render: (r: Linode.Record) => String(r.weight) },
        { title: 'Port', render: (r: Linode.Record) => String(r.port) },
        { title: 'Target', render: (r: Linode.Record) => r.target },
        { title: 'TTL', render: getTTL },
        {
          title: '',
          render: ({ id, name, port, priority, target, weight }: Linode.Record) =>
            <ActionMenu
              onEdit={() => this.openForEditSRVRecord({ id, name, port, priority, target, weight })}
              onDelete={() => this.confirmDeletion(id)}
            />,
        },
      ],
      link: () => createLink('Add a SRV Record', this.openForCreateSRVRecord),
    },

    /** CAA Record */
    {
      title: 'CAA Record',
      data: this.props.domainRecords.filter(typeEq('CAA')),
      columns: [
        { title: 'Name', render: (r: Linode.Record) => r.name },
        { title: 'Tag', render: (r: Linode.Record) => r.tag },
        { title: 'Value', render: (r: Linode.Record) => r.target },
        { title: 'TTL', render: getTTL },
        {
          title: '',
          render: ({ id, name, tag, target, ttl_sec }: Linode.Record) =>
            <ActionMenu
              onEdit={() => this.openForEditCAARecord({ id, name, tag, target, ttl_sec })}
              onDelete={() => this.confirmDeletion(id)}
            />,
        },
      ],
      link: () => createLink('Add a CAA Record', this.openForCreateCAARecord),
    },
  ]

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
    if (!equals(prevProps.domainRecords, this.props.domainRecords)
      || !equals(prevProps.domain, this.props.domain)) {
      this.setState({ types: this.generateTypes() });
    }
  }

  render() {
    const { drawer, confirmDialog } = this.state;

    return (
      <React.Fragment>
        {
          this.state.types.map((type, idx) => {
            return (
              <ExpansionPanel
                key={idx}
                heading={type.title}
                defaultExpanded
              >
                <Grid
                  container
                  justify="space-between"
                  alignItems="flex-end"
                >
                  <Grid item></Grid>
                  <Grid item>{type.link && type.link()}</Grid>
                </Grid>
                <Paper>
                  <Table>
                    <TableHead>
                      <TableRow>
                        {type.columns.length > 0 && type.columns.map((col, idx) => {
                          return (
                            <TableCell key={idx}>{col.title}</TableCell>
                          );
                        })}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {
                        type.data.map((data, idx) => {
                          return (
                            <TableRow key={idx}>
                              {type.columns.length > 0 && type.columns.map(({ render }, idx) => {
                                return (
                                  <TableCell key={idx}>{render(data)}</TableCell>
                                );
                              })}
                            </TableRow>
                          );
                        })
                      }
                    </TableBody>
                  </Table>
                </Paper>
              </ExpansionPanel>);
          })
        }
        <ConfirmationDialog
          open={confirmDialog.open}
          onClose={() => this.updateConfirmDialog(() => ({
            open: false,
            submitting: false,
            recordId: undefined,
          }))}
          title="Confirm Deletion"
          actions={({ onClose }) =>
            <ActionsPanel>
              <Button onClick={onClose}>Cancel</Button>
              <Button
                variant="raised"
                color="secondary"
                className="destructive"
                onClick={() => this.deleteDomainRecord()}
              >
                Delete
              </Button>
            </ActionsPanel>
          }
        >
          Are you sure you want to delete this record?
        </ConfirmationDialog>
        <Drawer
          open={drawer.open}
          domainId={this.props.domain.id}
          onClose={this.resetDrawer}
          mode={drawer.mode}
          type={drawer.type}
          updateRecords={this.props.updateRecords}
          updateDomain={this.props.updateDomain}
          {...drawer.fields}
        />
      </React.Fragment>
    );
  }
}

const msToReadable = (v: number): null | string => pathOr(null, [v], {
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
  2419200: '4 weeks',
});

const getTTL = compose(
  msToReadable,
  pathOr(0, ['ttl_sec']),
);

const typeEq = propEq('type');

const prependLinodeNS = compose<any, any, Linode.Record[]>(
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
      ttl_sec: 0,
    }, {
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
      ttl_sec: 0,
    }, {
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
      ttl_sec: 0,
    }, {
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
      ttl_sec: 0,
    }, {
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
      ttl_sec: 0,
    },
  ]),
);

const getNSRecords = compose<Props, Linode.Record[], Linode.Record[], Linode.Record[]>(
  prependLinodeNS,
  filter(typeEq('NS')),
  pathOr([], ['domainRecords']),
);

const styled = withStyles(styles, { withTheme: true });

export default styled(DomainRecords);
