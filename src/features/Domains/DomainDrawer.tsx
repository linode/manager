import { withSnackbar, WithSnackbarProps } from 'notistack';
import { Lens, lensPath, over, path, pathOr, set, view } from 'ramda';
import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { bindActionCreators } from 'redux';
import ActionsPanel from 'src/components/ActionsPanel';
import AddNewLink from 'src/components/AddNewLink';
import Button from 'src/components/Button';
import FormControlLabel from 'src/components/core/FormControlLabel';
import FormHelperText from 'src/components/core/FormHelperText';
import RadioGroup from 'src/components/core/RadioGroup';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Drawer from 'src/components/Drawer';
import Notice from 'src/components/Notice';
import Radio from 'src/components/Radio';
import TagsInput, { Tag } from 'src/components/TagsInput';
import TextField from 'src/components/TextField';
import {
  hasGrant,
  isRestrictedUser
} from 'src/features/Profile/permissionsHelpers';
import { cloneDomain } from 'src/services/domains';
import { ApplicationState } from 'src/store';
import {
  CLONING,
  CREATING,
  EDITING,
  resetDrawer
} from 'src/store/domainDrawer';
import {
  DomainActionsProps,
  withDomainActions
} from 'src/store/domains/domains.container';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

import Select, { Item } from 'src/components/EnhancedSelect/Select';
import { reportException } from 'src/exceptionReporting';
import LinodeSelect from 'src/features/linodes/LinodeSelect';
import NodeBalancerSelect from 'src/features/NodeBalancers/NodeBalancerSelect';
import { createDomainRecord } from 'src/services/domains/records';
import { getErrorMap } from 'src/utilities/errorUtils';

import { createDomainEvent } from 'src/utilities/ga';
import { isValidSOAEmail } from './domainUtils';

import CheckBox from 'src/components/CheckBox';

type ClassNames =
  | 'root'
  | 'masterIPErrorNotice'
  | 'addIP'
  | 'actionPanel'
  | 'gmailCheck';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    masterIPErrorNotice: {
      marginTop: theme.spacing(2)
    },
    addIP: {
      left: -theme.spacing(2) + 3
    },
    gmailCheck: {
      marginTop: theme.spacing(1)
    },
    actionPanel: {
      display: 'flex',
      flexFlow: 'row wrap',
      alignItems: 'center'
    }
  });

type DefaultRecordsType = 'none' | 'linode' | 'nodebalancer';

interface State {
  domain: string;
  type: 'master' | 'slave';
  soaEmail: string;
  cloneName: string;
  tags: Tag[];
  errors?: Linode.ApiFieldError[];
  submitting: boolean;
  master_ips: string[];
  masterIPsCount: number;
  defaultRecordsSetting: DefaultRecordsType;
  selectedDefaultLinode?: Linode.Linode;
  selectedDefaultNodeBalancer?: Linode.NodeBalancer;
  loadingText?: string;
  shouldCreateGmailRecords: boolean;
}

type CombinedProps = WithStyles<ClassNames> &
  DomainActionsProps &
  DispatchProps &
  RouteComponentProps<{}> &
  StateProps &
  WithSnackbarProps;

const gmailMXRecords = (domainID: number) => {
  return [
    /**
     * see https://support.google.com/a/answer/140034?hl=en
     * for where this list came from.
     */
    createDomainRecord(domainID, {
      type: 'MX',
      ttl_sec: 3600,
      priority: 1,
      target: 'ASPMX.L.GOOGLE.COM.'
    }),
    createDomainRecord(domainID, {
      type: 'MX',
      ttl_sec: 3600,
      priority: 5,
      target: 'ALT1.ASPMX.L.GOOGLE.COM.'
    }),
    createDomainRecord(domainID, {
      type: 'MX',
      ttl_sec: 3600,
      priority: 5,
      target: 'ALT2.ASPMX.L.GOOGLE.COM.'
    }),
    createDomainRecord(domainID, {
      type: 'MX',
      ttl_sec: 3600,
      priority: 10,
      target: 'ALT3.ASPMX.L.GOOGLE.COM.'
    }),
    createDomainRecord(domainID, {
      type: 'MX',
      ttl_sec: 3600,
      priority: 10,
      target: 'ALT4.ASPMX.L.GOOGLE.COM.'
    })
  ];
};

const generateDefaultDomainRecords = (
  domain: string,
  domainID: number,
  ipv4: string,
  ipv6: string | null
) => {
  /**
   * at this point, the IPv6 is including the prefix and we need to strip that
   *
   * BUT
   *
   * this logic only applies to Linodes' ipv6, not nodebalancers. No stripping
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

const masterIPsLens = lensPath(['master_ips']);
const masterIPLens = (idx: number) =>
  compose(
    masterIPsLens,
    lensPath([idx])
  ) as Lens;
const viewMasterIP = (idx: number, obj: any) =>
  view<any, string | undefined>(masterIPLens(idx), obj);
const setMasterIP = (idx: number, value: string) =>
  set(masterIPLens(idx), value);

const masterIPsCountLens = lensPath(['masterIPsCount']);
const updateMasterIPsCount = (fn: (s: any) => any) => (obj: any) =>
  over(masterIPsCountLens, fn, obj);

class DomainDrawer extends React.Component<CombinedProps, State> {
  mounted: boolean = false;
  defaultState: State = {
    domain: '',
    type: 'master',
    soaEmail: '',
    cloneName: '',
    tags: [],
    submitting: false,
    errors: [],
    master_ips: [],
    masterIPsCount: 1,
    defaultRecordsSetting: 'none',
    selectedDefaultLinode: undefined,
    selectedDefaultNodeBalancer: undefined,
    shouldCreateGmailRecords: false
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
      this.props.mode === CLONING &&
      prevState.domain !== (this.props.domain || '')
    ) {
      this.setState({ domain: this.props.domain || '' });
    }

    if (
      this.props.domainProps && // there are domain props for an update and ...
      (!prevProps.domainProps || // it just appeared
        prevProps.domainProps.id !== this.props.domainProps.id)
    ) {
      // or the domain for editing has changed

      // then put it props into state to populate fields
      const {
        domain,
        tags,
        master_ips,
        type,
        soa_email
      } = this.props.domainProps;
      this.setState({
        tags: tags.map(tag => ({ label: tag, value: tag })),
        masterIPsCount: master_ips.length,
        type,
        domain,
        master_ips,
        soaEmail: soa_email
      });
    }
  }

  render() {
    const { classes, open, mode, disabled } = this.props;
    const {
      type,
      domain,
      soaEmail,
      cloneName,
      errors,
      submitting,
      tags
    } = this.state;

    const errorMap = getErrorMap(
      [
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

    const title = mode === EDITING ? 'Edit Domain' : 'Add a new Domain';

    const isCreatingMasterDomain = mode === CREATING && type === 'master';
    const isEditingMasterDomain = mode === EDITING && type === 'master';
    const isCreatingSlaveDomain = mode === CREATING && type === 'slave';
    const isEditingSlaveDomain = mode === EDITING && type === 'slave';

    return (
      <Drawer title={title} open={open} onClose={this.closeDrawer}>
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
            error={true}
            important
          />
        )}
        <RadioGroup
          aria-label="type"
          name="type"
          value={type}
          onChange={this.updateType}
          row
        >
          <FormControlLabel
            value="master"
            label="Master"
            control={<Radio />}
            data-qa-domain-radio="Master"
            disabled={mode === EDITING || mode === CLONING || disabled}
          />
          <FormControlLabel
            value="slave"
            label="Slave"
            control={<Radio />}
            data-qa-domain-radio="Slave"
            disabled={mode === EDITING || mode === CLONING || disabled}
          />
        </RadioGroup>
        <TextField
          errorText={
            (mode === CREATING || mode === EDITING || '') && errorMap.domain
          }
          value={domain}
          disabled={mode === CLONING || disabled}
          label="Domain"
          onChange={this.updateLabel}
          data-qa-domain-name
        />
        {mode === CLONING && (
          <TextField
            errorText={errorMap.domain}
            value={cloneName}
            label="New Domain"
            onChange={this.updateCloneLabel}
            data-qa-clone-name
            disabled={disabled}
          />
        )}
        {(isCreatingMasterDomain || isEditingMasterDomain) && (
          <TextField
            errorText={errorMap.soa_email}
            value={soaEmail}
            label="SOA Email Address"
            onChange={this.updateEmailAddress}
            data-qa-soa-email
            disabled={disabled}
          />
        )}
        {(isCreatingSlaveDomain || isEditingSlaveDomain) && (
          <React.Fragment>
            {masterIPsError && (
              <Notice
                className={classes.masterIPErrorNotice}
                error
                text={`Master IP addresses must be valid IPv4 addresses.`}
              />
            )}
            {Array.from(Array(this.state.masterIPsCount)).map((slave, idx) => (
              <TextField
                key={idx}
                label="Master Nameserver IP Address"
                InputProps={{ 'aria-label': `ip-address-${idx}` }}
                value={viewMasterIP(idx, this.state) || ''}
                onChange={this.updateMasterIPAddress(idx)}
                data-qa-master-ip={idx}
                disabled={disabled}
              />
            ))}
            <AddNewLink
              onClick={this.addIPField}
              className={classes.addIP}
              label="Add IP"
              data-qa-add-master-ip-field
              disabled={disabled}
            />
          </React.Fragment>
        )}
        {this.props.mode !== CLONING && (
          <TagsInput
            value={tags}
            onChange={this.updateTags}
            tagError={errorMap.tags}
            disabled={disabled}
          />
        )}
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
                  label: 'Insert default records from one of my NodeBalancers.'
                }
              ]}
            />
            <FormHelperText>
              If specified, we can automatically create some domain records
              (A/AAAA and MX) to get you started, based on one of your Linodes
              or NodeBalancers.
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
        {isCreatingMasterDomain && (
          <CheckBox
            className={classes.gmailCheck}
            onChange={this.toggleGmailCheckBox}
            checked={this.state.shouldCreateGmailRecords}
            text="Automatically Create Gmail MX Records For Me"
            subtext="If checked, we will create 5 MX records for the Google mail servers."
          />
        )}
        <ActionsPanel className={classes.actionPanel}>
          <Button
            buttonType="primary"
            onClick={this.submit}
            data-qa-submit
            loading={submitting}
            disabled={disabled}
          >
            {mode === EDITING ? 'Update' : 'Create'}
          </Button>
          {!!submitting ? (
            <span>
              {this.state.loadingText ? this.state.loadingText : null}
            </span>
          ) : (
            <Button
              onClick={this.closeDrawer}
              buttonType="cancel"
              data-qa-cancel
            >
              Cancel
            </Button>
          )}
        </ActionsPanel>
      </Drawer>
    );
  }

  resetInternalState = () => {
    if (this.mounted) {
      this.setState({ ...this.defaultState });
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
    this.setState(
      {
        submitting: false,
        loadingText: ''
      },
      () => {
        if (type === 'master' && domainID) {
          this.redirect(domainID, state);
        } else {
          this.redirect('', state);
        }
        this.closeDrawer();
      }
    );
  };

  handleEmailValidationErrors = () => {
    const err = [
      {
        field: 'soa_email',
        reason:
          'Please choose an SOA email address that does not belong to the target Domain.'
      }
    ];
    this.setState(
      {
        submitting: false,
        errors: getAPIErrorOrDefault(err)
      },
      () => {
        scrollErrorIntoView();
      }
    );
  };

  create = () => {
    const {
      domain,
      type,
      soaEmail,
      master_ips,
      defaultRecordsSetting,
      selectedDefaultLinode,
      selectedDefaultNodeBalancer,
      shouldCreateGmailRecords
    } = this.state;
    const { domainActions } = this.props;

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
    if (defaultRecordsSetting === 'linode') {
      if (!selectedDefaultLinode) {
        return this.setState({
          errors: [
            {
              reason: 'Please select a Linode.',
              field: 'defaultLinode'
            }
          ]
        });
      }
    }

    if (defaultRecordsSetting === 'nodebalancer') {
      if (!selectedDefaultNodeBalancer) {
        return this.setState({
          errors: [
            {
              reason: 'Please select a NodeBalancer.',
              field: 'defaultNodeBalancer'
            }
          ]
        });
      }
    }

    const data =
      type === 'master'
        ? { domain, type, tags, soa_email: soaEmail }
        : { domain, type, tags, master_ips: finalMasterIPs };

    if (type === 'master' && !isValidSOAEmail(data.soa_email || '', domain)) {
      this.handleEmailValidationErrors();
      return;
    }

    this.setState({
      submitting: true,
      loadingText: `Creating ${data.domain}...`
    });
    domainActions
      .createDomain(data)
      .then((domainData: Linode.Domain) => {
        /**
         * the domain has now been created. Lets send the user's config
         * options to Google Analytics
         */
        let analyticsLabel = '';

        if (defaultRecordsSetting === 'linode') {
          analyticsLabel += 'from Linode ';
        } else if (defaultRecordsSetting === 'nodebalancer') {
          analyticsLabel += 'from NodeBalancer ';
        }
        if (shouldCreateGmailRecords) {
          analyticsLabel += 'with Gmail MX Records';
        }

        createDomainEvent(
          defaultRecordsSetting !== 'none' || shouldCreateGmailRecords
            ? 'with defaults'
            : 'plain',
          analyticsLabel
        );

        if (!this.mounted) {
          return Promise.resolve(domainData);
        }

        /** attempt to create some default Gmail MX records */
        if (this.state.shouldCreateGmailRecords) {
          this.setState({ loadingText: 'Creating your Gmail MX Records...' });
          return (
            Promise.all(gmailMXRecords(domainData.id))
              .then(() => {
                return Promise.resolve(domainData);
              })
              /**
               * if we fail, just continue on and promise.resolve
               * Creating domain records shouldn't any processes.
               * We'll concat all the errors and show them to the user
               * when we redirect them off to Domain Detail page.
               */
              .catch(e => {
                reportException(
                  `Default Gmail MX Records could not be created:
             ${e[0].reason}`,
                  {
                    domainID: domainData.id
                  }
                );
                return Promise.resolve({
                  ...domainData,
                  error: 'There was an issue creating some Gmail MX records.'
                });
              })
          );
        }

        return Promise.resolve(domainData);
      })
      .then((domainData: Linode.Domain & { error: string }) => {
        if (!this.mounted) {
          return;
        }

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
            this.setState({ loadingText: 'Creating some default records...' });
            return generateDefaultDomainRecords(
              domainData.domain,
              domainData.id,
              /**
               * we did undefined checking above so selectedDefaultLinode is
               * most certainly defined
               */
              selectedDefaultLinode!.ipv4[0],
              selectedDefaultLinode!.ipv6
            )
              .then(() => {
                return this.redirectToLandingOrDetail(type, domainData.id, {
                  recordError: domainData.error
                });
              })
              .catch((e: Linode.ApiFieldError[]) => {
                reportException(
                  `Default DNS Records couldn't be created from Linode: ${
                    e[0].reason
                  }`,
                  {
                    selectedLinode: this.state.selectedDefaultLinode!.id,
                    domainID: domainData.id,
                    ipv4: path(['ipv4', 0], selectedDefaultLinode),
                    ipv6: path(['ipv6'], selectedDefaultLinode)
                  }
                );
                return this.redirectToLandingOrDetail(type, domainData.id, {
                  recordError:
                    /**
                     * if domainData.error exists, it means there was an issue creating
                     * Gmail MX records
                     */
                    domainData.error
                      ? 'There were issues creating some Gmail MX records and default domain records.'
                      : 'There was an issue creating default domain records.'
                });
              });
          }

          if (defaultRecordsSetting === 'nodebalancer') {
            this.setState({ loadingText: 'Creating some default records...' });
            return generateDefaultDomainRecords(
              domainData.domain,
              domainData.id,
              /**
               * we did undefined checking above so selectedDefaultLinode is
               * most certainly defined
               */
              selectedDefaultNodeBalancer!.ipv4,
              selectedDefaultNodeBalancer!.ipv6
            )
              .then(() => {
                return this.redirectToLandingOrDetail(type, domainData.id);
              })
              .catch((e: Linode.ApiFieldError[]) => {
                reportException(
                  `Default DNS Records couldn't be created from NodeBalancer: ${
                    e[0].reason
                  }`,
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
            loadingText: '',
            errors: getAPIErrorOrDefault(err)
          },
          () => {
            scrollErrorIntoView();
          }
        );
      });
  };

  clone = () => {
    const { id } = this.props;
    const { cloneName } = this.state;

    if (!id) {
      this.closeDrawer();
      this.props.enqueueSnackbar('Error cloning domain', {
        variant: 'error'
      });
      return;
    }

    this.setState({ submitting: true });
    cloneDomain(id, cloneName)
      .then(data => {
        if (!this.mounted) {
          return;
        }
        this.redirect(data.id || '');
        this.closeDrawer();
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

  update = () => {
    const { domain, type, soaEmail, master_ips } = this.state;
    const { domainActions, id } = this.props;
    const tags = this.state.tags.map(tag => tag.value);

    if (!id) {
      // weird case if the id was not passed
      this.closeDrawer();
      return;
    }

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

    const data =
      type === 'master'
        ? // not sending type for master. There is a bug on server and it returns an error that `master_ips` is required
          { domain, tags, soa_email: soaEmail, domainId: id }
        : { domain, type, tags, master_ips: finalMasterIPs, domainId: id };

    if (type === 'master' && !isValidSOAEmail(data.soa_email || '', domain)) {
      this.handleEmailValidationErrors();
      return;
    }

    this.setState({ submitting: true });
    domainActions
      .updateDomain(data)
      .then((domainData: Linode.Domain) => {
        if (!this.mounted) {
          return;
        }
        this.closeDrawer();
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

  submit = () => {
    if (this.props.mode === CREATING) {
      this.create();
    } else if (this.props.mode === CLONING) {
      this.clone();
    } else if (this.props.mode === EDITING) {
      this.update();
    }
  };

  closeDrawer = () => {
    this.resetInternalState();
    this.props.resetDrawer();
  };

  toggleGmailCheckBox = () => {
    this.setState({
      shouldCreateGmailRecords: !this.state.shouldCreateGmailRecords
    });
  };

  updateLabel = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.setState({ domain: e.target.value });

  updateCloneLabel = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.setState({ cloneName: e.target.value });

  updateEmailAddress = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.setState({ soaEmail: e.target.value });

  updateSelectedLinode = (linode: Linode.Linode) =>
    this.setState({ selectedDefaultLinode: linode });

  updateSelectedNodeBalancer = (nodebalancer: Linode.NodeBalancer) =>
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
  ) => this.setState({ type: value });

  updateMasterIPAddress = (idx: number) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => this.setState(setMasterIP(idx, e.target.value));

  addIPField = () => this.setState(updateMasterIPsCount(v => v + 1));
}

const styled = withStyles(styles);

interface DispatchProps {
  resetDrawer: () => void;
}

const mapDispatchToProps = (dispatch: Dispatch<any>) =>
  bindActionCreators({ resetDrawer }, dispatch);

interface StateProps {
  mode: typeof CLONING | typeof CREATING | typeof EDITING;
  open: boolean;
  domain?: string;
  domainProps?: Linode.Domain;
  id?: number;
  disabled: boolean;
}

const mapStateToProps = (state: ApplicationState) => {
  const id = path(['domainDrawer', 'id'], state);
  const domainEntities = pathOr(
    [],
    ['__resources', 'domains', 'entities'],
    state
  );
  const domainProps = domainEntities.find(
    (domain: Linode.Domain) => domain.id === path(['domainDrawer', 'id'], state)
  );
  return {
    mode: pathOr(CREATING, ['domainDrawer', 'mode'], state),
    open: pathOr(false, ['domainDrawer', 'open'], state),
    domain: path(['domainDrawer', 'domain'], state),
    domainProps,
    id,
    // disabled if the profile is restricted and doesn't have add_domains grant
    disabled: isRestrictedUser(state) && !hasGrant(state, 'add_domains')
  };
};

const connected = connect(
  mapStateToProps,
  mapDispatchToProps
);

export default compose<CombinedProps, {}>(
  withDomainActions,
  styled,
  connected,
  withRouter,
  withSnackbar
)(DomainDrawer);
