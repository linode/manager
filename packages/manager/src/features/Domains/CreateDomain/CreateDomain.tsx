import { createDomainRecord, Domain } from '@linode/api-v4/lib/domains';
import { Linode } from '@linode/api-v4/lib/linodes';
import { NodeBalancer } from '@linode/api-v4/lib/nodebalancers';
import { APIError } from '@linode/api-v4/lib/types';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import { path } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { bindActionCreators, Dispatch } from 'redux';
import ActionsPanel from 'src/components/ActionsPanel';
import Breadcrumb from 'src/components/Breadcrumb';
import Button from 'src/components/Button';
import DocumentationButton from 'src/components/DocumentationButton';
import FormControlLabel from 'src/components/core/FormControlLabel';
import FormHelperText from 'src/components/core/FormHelperText';
import Grid from 'src/components/core/Grid';
import Paper from 'src/components/core/Paper';
import RadioGroup from 'src/components/core/RadioGroup';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import MultipleIPInput from 'src/components/MultipleIPInput';
import Notice from 'src/components/Notice';
import Radio from 'src/components/Radio';
import TagsInput, { Tag } from 'src/components/TagsInput';
import TextField from 'src/components/TextField';
import { reportException } from 'src/exceptionReporting';
import LinodeSelect from 'src/features/linodes/LinodeSelect';
import NodeBalancerSelect from 'src/features/NodeBalancers/NodeBalancerSelect';
import {
  hasGrant,
  isRestrictedUser
} from 'src/features/Profile/permissionsHelpers';
import { ApplicationState } from 'src/store';
import {
  Origin as DomainDrawerOrigin,
  resetDrawer
} from 'src/store/domainDrawer';
import { upsertDomain } from 'src/store/domains/domains.actions';
import {
  DomainActionsProps,
  withDomainActions
} from 'src/store/domains/domains.container';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';
import { sendCreateDomainEvent } from 'src/utilities/ga';
import {
  ExtendedIP,
  extendedIPToString,
  stringToExtendedIP
} from 'src/utilities/ipUtils';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import { getInitialIPs } from '../domainUtils';

type ClassNames = 'title' | 'main' | 'inner' | 'radio' | 'ip' | 'helperText';

const styles = (theme: Theme) =>
  createStyles({
    title: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(3)
    },
    main: {
      width: '100%'
    },
    inner: {
      padding: theme.spacing(3),
      paddingTop: theme.spacing(2),
      '& > div': {
        marginBottom: theme.spacing(2)
      },
      '& label': {
        color: theme.color.headline,
        fontWeight: 600,
        lineHeight: '1.33rem',
        letterSpacing: '0.25px',
        margin: 0
      }
    },
    radio: {
      '& label:first-child .MuiButtonBase-root': {
        marginLeft: -10
      }
    },
    ip: {
      maxWidth: 468
    },
    helperText: {
      maxWidth: 'none'
    }
  });

type DefaultRecordsType = 'none' | 'linode' | 'nodebalancer';

interface State {
  domain: string;
  type: 'master' | 'slave';
  soaEmail: string;
  cloneName: string;
  tags: Tag[];
  errors?: APIError[];
  submitting: boolean;
  master_ips: string[];
  axfr_ips: string[];
  defaultRecordsSetting: DefaultRecordsType;
  selectedDefaultLinode?: Linode;
  selectedDefaultNodeBalancer?: NodeBalancer;
}

type CombinedProps = WithStyles<ClassNames> &
  DomainActionsProps &
  DispatchProps &
  RouteComponentProps<{}> &
  StateProps &
  WithSnackbarProps;

export const generateDefaultDomainRecords = (
  domain: string,
  domainID: number,
  ipv4?: string,
  ipv6?: string | null
) => {
  /**
   * At this point, the IPv6 is including the prefix and we need to strip that
   *
   * BUT
   *
   * this logic only applies to Linodes' ipv6, not NodeBalancers. No stripping
   * needed for NodeBalancers.
   */
  const cleanedIPv6 =
    ipv6 && ipv6.includes('/') ? ipv6.substr(0, ipv6.indexOf('/')) : ipv6;

  const baseIPv4Requests = [
    createDomainRecord(domainID, {
      type: 'A',
      target: ipv4
    }),
    createDomainRecord(domainID, {
      type: 'A',
      target: ipv4,
      name: 'www'
    }),
    createDomainRecord(domainID, {
      type: 'A',
      target: ipv4,
      name: 'mail'
    })
  ];

  return Promise.all(
    /** ipv6 can be null so don't try to create domain records in that case */
    !!cleanedIPv6
      ? [
          ...baseIPv4Requests,
          createDomainRecord(domainID, {
            type: 'AAAA',
            target: cleanedIPv6
          }),
          createDomainRecord(domainID, {
            type: 'AAAA',
            target: cleanedIPv6,
            name: 'www'
          }),
          createDomainRecord(domainID, {
            type: 'AAAA',
            target: cleanedIPv6,
            name: 'mail'
          }),
          createDomainRecord(domainID, {
            type: 'MX',
            priority: 10,
            target: `mail.${domain}`
          })
        ]
      : baseIPv4Requests
  );
};

class CreateDomain extends React.Component<CombinedProps, State> {
  mounted: boolean = false;
  defaultState: State = {
    domain: '',
    type: 'master',
    soaEmail: '',
    cloneName: '',
    tags: [],
    submitting: false,
    errors: [],
    master_ips: [''],
    axfr_ips: [''],
    defaultRecordsSetting: 'none',
    selectedDefaultLinode: undefined,
    selectedDefaultNodeBalancer: undefined
  };

  state: State = {
    ...this.defaultState
  };

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidUpdate(prevProps: CombinedProps, prevState: State) {
    if (
      this.props.domainProps && // there are domain props for an update and ...
      (!prevProps.domainProps || // it just appeared
        prevProps.domainProps.id !== this.props.domainProps.id)
    ) {
      // or the domain for editing has changed

      // then put it props into state to populate fields
      const {
        axfr_ips,
        domain,
        tags,
        master_ips,
        type,
        soa_email
      } = this.props.domainProps;
      this.setState({
        tags: tags.map(tag => ({ label: tag, value: tag })),
        type,
        domain,
        master_ips: getInitialIPs(master_ips),
        axfr_ips: getInitialIPs(axfr_ips),
        soaEmail: soa_email
      });
    }
  }

  render() {
    const { classes, disabled } = this.props;
    const { type, domain, soaEmail, errors, submitting, tags } = this.state;

    const errorMap = getErrorMap(
      [
        'axfr_ips',
        'master_ips',
        'domain',
        'type',
        'soa_email',
        'tags',
        'defaultNodeBalancer',
        'defaultLinode'
      ],
      errors
    );

    const generalError = errorMap.none;
    const masterIPsError = errorMap.master_ips;

    const isCreatingMasterDomain = type === 'master';
    const isCreatingSlaveDomain = type === 'slave';

    return (
      <Grid container>
        <DocumentTitleSegment segment="Create a Domain" />
        <Grid
          container
          justify="space-between"
          alignItems="flex-end"
          className={classes.title}
        >
          <Grid item>
            <Breadcrumb
              pathname={location.pathname}
              labelTitle="Create a Domain"
              labelOptions={{ noCap: true }}
            />
          </Grid>
          <Grid item>
            <Grid container alignItems="flex-end">
              <Grid item className="pt0">
                <DocumentationButton href="https://www.linode.com/docs/guides/dns-manager/" />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid item className={classes.main}>
          {generalError && !disabled && (
            <Notice error spacingTop={8}>
              {generalError}
            </Notice>
          )}
          {disabled && (
            <Notice
              text={
                "You don't have permissions to create a new Domain. Please contact an account administrator for details."
              }
              error
              important
            />
          )}

          <Paper data-qa-label-header>
            <div className={classes.inner}>
              <RadioGroup
                aria-label="type"
                className={classes.radio}
                name="type"
                onChange={this.updateType}
                row
                value={type}
              >
                <FormControlLabel
                  value="master"
                  label="Master"
                  control={<Radio />}
                  data-qa-domain-radio="Master"
                  disabled={disabled}
                />
                <FormControlLabel
                  value="slave"
                  label="Slave"
                  control={<Radio />}
                  data-qa-domain-radio="Slave"
                  disabled={disabled}
                />
              </RadioGroup>
              <TextField
                errorText={errorMap.domain}
                value={domain}
                disabled={disabled}
                label="Domain"
                onChange={this.updateLabel}
                data-qa-domain-name
                data-testid="domain-name-input"
              />
              {isCreatingMasterDomain && (
                <TextField
                  errorText={errorMap.soa_email}
                  value={soaEmail}
                  label="SOA Email Address"
                  onChange={this.updateEmailAddress}
                  data-qa-soa-email
                  data-testid="soa-email-input"
                  disabled={disabled}
                />
              )}
              {isCreatingSlaveDomain && (
                <MultipleIPInput
                  title="Master Nameserver IP Address"
                  className={classes.ip}
                  ips={this.state.master_ips.map(stringToExtendedIP)}
                  onChange={this.updateMasterIPAddress}
                  error={masterIPsError}
                />
              )}
              <TagsInput
                value={tags}
                onChange={this.updateTags}
                tagError={errorMap.tags}
                disabled={disabled}
              />
              {isCreatingMasterDomain && (
                <React.Fragment>
                  <Select
                    isClearable={false}
                    onChange={(value: Item<DefaultRecordsType>) =>
                      this.updateInsertDefaultRecords(value.value)
                    }
                    defaultValue={{
                      value: 'none',
                      label: 'Do not insert default records for me.'
                    }}
                    label="Insert Default Records"
                    options={[
                      {
                        value: 'none',
                        label: 'Do not insert default records for me.'
                      },
                      {
                        value: 'linode',
                        label: 'Insert default records from one of my Linodes.'
                      },
                      {
                        value: 'nodebalancer',
                        label:
                          'Insert default records from one of my NodeBalancers.'
                      }
                    ]}
                  />
                  <FormHelperText className={classes.helperText}>
                    If specified, we can automatically create some domain
                    records (A/AAAA and MX) to get you started, based on one of
                    your Linodes or NodeBalancers.
                  </FormHelperText>
                </React.Fragment>
              )}
              {isCreatingMasterDomain &&
                this.state.defaultRecordsSetting === 'linode' && (
                  <React.Fragment>
                    <LinodeSelect
                      linodeError={errorMap.defaultLinode}
                      handleChange={this.updateSelectedLinode}
                      selectedLinode={
                        this.state.selectedDefaultLinode
                          ? this.state.selectedDefaultLinode.id
                          : null
                      }
                      disabled={disabled}
                    />
                    {!errorMap.defaultLinode && (
                      <FormHelperText>
                        {this.state.selectedDefaultLinode &&
                        !this.state.selectedDefaultLinode.ipv6
                          ? `We'll automatically create domains for the first IPv4 address on this
                    Linode.`
                          : `We'll automatically create domain records for both the first
                    IPv4 and IPv6 addresses on this Linode.`}
                      </FormHelperText>
                    )}
                  </React.Fragment>
                )}
              {isCreatingMasterDomain &&
                this.state.defaultRecordsSetting === 'nodebalancer' && (
                  <React.Fragment>
                    <NodeBalancerSelect
                      nodeBalancerError={errorMap.defaultNodeBalancer}
                      handleChange={this.updateSelectedNodeBalancer}
                      selectedNodeBalancer={
                        this.state.selectedDefaultNodeBalancer
                          ? this.state.selectedDefaultNodeBalancer.id
                          : null
                      }
                    />
                    {!errorMap.defaultNodeBalancer && (
                      <FormHelperText>
                        {this.state.selectedDefaultNodeBalancer &&
                        !this.state.selectedDefaultNodeBalancer.ipv6
                          ? `We'll automatically create domains for the first IPv4 address on this
                  NodeBalancer.`
                          : `We'll automatically create domain records for both the first
                  IPv4 and IPv6 addresses on this NodeBalancer.`}
                      </FormHelperText>
                    )}
                  </React.Fragment>
                )}
              <ActionsPanel>
                <Button
                  buttonType="primary"
                  onClick={this.create}
                  data-qa-submit
                  data-testid="create-domain-submit"
                  loading={submitting}
                  disabled={disabled}
                >
                  Create
                </Button>
              </ActionsPanel>
            </div>
          </Paper>
        </Grid>
      </Grid>
    );
  }

  handleTransferInput = (newIPs: ExtendedIP[]) => {
    const axfr_ips = newIPs.length > 0 ? newIPs.map(extendedIPToString) : [''];
    if (this.mounted) {
      this.setState({ axfr_ips });
    }
  };

  redirect = (id: number | '', state?: Record<string, string>) => {
    const returnPath = !!id ? `/domains/${id}` : '/domains';
    this.props.history.push(returnPath, state);
  };

  redirectToLandingOrDetail = (
    type: 'master' | 'slave',
    domainID: number,
    state: Record<string, string> = {}
  ) => {
    if (type === 'master' && domainID) {
      this.redirect(domainID, state);
    } else {
      this.redirect('', state);
    }
  };

  create = () => {
    const {
      domain,
      type,
      soaEmail,
      master_ips,
      defaultRecordsSetting,
      selectedDefaultLinode,
      selectedDefaultNodeBalancer
    } = this.state;
    const { domainActions, origin } = this.props;

    const tags = this.state.tags.map(tag => tag.value);

    const finalMasterIPs = master_ips.filter(v => v !== '');

    if (type === 'slave' && finalMasterIPs.length === 0) {
      this.setState({
        submitting: false,
        errors: [
          {
            field: 'master_ips',
            reason: 'You must provide at least one Master Nameserver IP Address'
          }
        ]
      });
      return;
    }

    /**
     * In this case, the user wants default domain records created, but
     * they haven't supplied a Linode or NodeBalancer
     */
    if (defaultRecordsSetting === 'linode' && !selectedDefaultLinode) {
      return this.setState({
        errors: [
          {
            reason: 'Please select a Linode.',
            field: 'defaultLinode'
          }
        ]
      });
    }

    if (
      defaultRecordsSetting === 'nodebalancer' &&
      !selectedDefaultNodeBalancer
    ) {
      return this.setState({
        errors: [
          {
            reason: 'Please select a NodeBalancer.',
            field: 'defaultNodeBalancer'
          }
        ]
      });
    }

    const data =
      type === 'master'
        ? { domain, type, tags, soa_email: soaEmail }
        : { domain, type, tags, master_ips: finalMasterIPs };

    this.setState({ submitting: true });
    domainActions
      .createDomain(data)
      .then((domainData: Domain) => {
        if (!this.mounted) {
          return;
        }
        sendCreateDomainEvent(origin);
        /**
         * now we check to see if the user wanted us to automatically create
         * domain records for them. If so, create some A/AAAA and MX records
         * with the first IPv4 and IPv6 from the Linode or NodeBalancer they
         * selected.
         *
         * This only applies to master domains.
         */
        if (type === 'master') {
          if (defaultRecordsSetting === 'linode') {
            return generateDefaultDomainRecords(
              domainData.domain,
              domainData.id,
              path(['ipv4', 0], selectedDefaultLinode),
              path(['ipv6'], selectedDefaultLinode)
            )
              .then(() => {
                return this.redirectToLandingOrDetail(type, domainData.id);
              })
              .catch((e: APIError[]) => {
                reportException(
                  `Default DNS Records couldn't be created from Linode: ${e[0].reason}`,
                  {
                    selectedLinode: this.state.selectedDefaultLinode!.id,
                    domainID: domainData.id,
                    ipv4: path(['ipv4', 0], selectedDefaultLinode),
                    ipv6: path(['ipv6'], selectedDefaultLinode)
                  }
                );
                return this.redirectToLandingOrDetail(type, domainData.id, {
                  recordError:
                    'There was an issue creating default domain records.'
                });
              });
          }

          if (defaultRecordsSetting === 'nodebalancer') {
            return generateDefaultDomainRecords(
              domainData.domain,
              domainData.id,
              path(['ipv4'], selectedDefaultNodeBalancer),
              path(['ipv6'], selectedDefaultNodeBalancer)
            )
              .then(() => {
                return this.redirectToLandingOrDetail(type, domainData.id);
              })
              .catch((e: APIError[]) => {
                reportException(
                  `Default DNS Records couldn't be created from NodeBalancer: ${e[0].reason}`,
                  {
                    selectedNodeBalancer: this.state
                      .selectedDefaultNodeBalancer!.id,
                    domainID: domainData.id,
                    ipv4: path(['ipv4'], selectedDefaultNodeBalancer),
                    ipv6: path(['ipv6'], selectedDefaultNodeBalancer)
                  }
                );
                return this.redirectToLandingOrDetail(type, domainData.id, {
                  recordError:
                    'There was an issue creating default domain records.'
                });
              });
          }
        }
        return this.redirectToLandingOrDetail(type, domainData.id);
      })
      .catch(err => {
        if (!this.mounted) {
          return;
        }
        this.setState(
          {
            submitting: false,
            errors: getAPIErrorOrDefault(err)
          },
          () => {
            scrollErrorIntoView();
          }
        );
      });
  };

  updateLabel = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.setState({ domain: e.target.value });

  updateEmailAddress = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.setState({ soaEmail: e.target.value });

  updateSelectedLinode = (linode: Linode) =>
    this.setState({ selectedDefaultLinode: linode });

  updateSelectedNodeBalancer = (nodebalancer: NodeBalancer) =>
    this.setState({ selectedDefaultNodeBalancer: nodebalancer });

  updateTags = (selected: Tag[]) => {
    this.setState({ tags: selected });
  };

  updateInsertDefaultRecords = (value: DefaultRecordsType) => {
    this.setState({ defaultRecordsSetting: value });
  };

  updateType = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: 'master' | 'slave'
  ) => this.setState({ type: value, errors: [] });

  updateMasterIPAddress = (newIPs: ExtendedIP[]) => {
    const master_ips =
      newIPs.length > 0 ? newIPs.map(extendedIPToString) : [''];
    if (this.mounted) {
      this.setState({ master_ips });
    }
  };
}

const styled = withStyles(styles);

interface DispatchProps {
  resetDrawer: () => void;
  upsertDomain: (domain: Domain) => void;
}

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators({ resetDrawer, upsertDomain }, dispatch);

interface StateProps {
  domain?: string;
  domainProps?: Domain;
  id?: number;
  disabled: boolean;
  origin: DomainDrawerOrigin;
}

const mapStateToProps = (state: ApplicationState) => {
  const id = state.domainDrawer?.id ?? '0';
  const domainEntities = state.__resources.domains.itemsById;
  const domainProps = domainEntities[String(id)];
  return {
    domain: path(['domainDrawer', 'domain'], state),
    domainProps,
    id,
    // disabled if the profile is restricted and doesn't have add_domains grant
    disabled: isRestrictedUser(state) && !hasGrant(state, 'add_domains'),
    origin: state.domainDrawer.origin
  };
};

const connected = connect(mapStateToProps, mapDispatchToProps);

export default compose<CombinedProps, {}>(
  withDomainActions,
  styled,
  connected,
  withRouter,
  withSnackbar
)(CreateDomain);
