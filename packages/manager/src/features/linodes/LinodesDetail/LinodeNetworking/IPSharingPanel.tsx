import { Linode } from 'linode-js-sdk/lib/linodes';
import { shareAddresses } from 'linode-js-sdk/lib/networking';
import { APIError } from 'linode-js-sdk/lib/types';
import { clone, flatten, uniq } from 'ramda';
import * as React from 'react';
import { compose as recompose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import AddNewLink from 'src/components/AddNewLink';
import Button from 'src/components/Button';
import Divider from 'src/components/core/Divider';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import ExpansionPanel from 'src/components/ExpansionPanel';
import Grid from 'src/components/Grid';
import RenderGuard, { RenderGuardProps } from 'src/components/RenderGuard';
import TextField from 'src/components/TextField';
import withLinodes, {
  DispatchProps
} from 'src/containers/withLinodes.container';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';

type ClassNames =
  | 'ipFieldLabel'
  | 'containerDivider'
  | 'ipField'
  | 'addNewButton'
  | 'noIPsMessage'
  | 'networkActionText'
  | 'removeCont'
  | 'addNewIP'
  | 'remove';

const styles = (theme: Theme) =>
  createStyles({
    addNewButton: {
      marginTop: theme.spacing(3),
      marginBottom: -theme.spacing(2)
    },
    containerDivider: {
      marginTop: theme.spacing(1)
    },
    ipField: {
      width: '100%',
      marginTop: 0
    },
    ipFieldLabel: {
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        width: `calc(175px + ${theme.spacing(2)}px)`
      }
    },
    noIPsMessage: {
      marginTop: theme.spacing(2),
      color: theme.color.grey1
    },
    networkActionText: {
      marginBottom: theme.spacing(2)
    },
    removeCont: {
      [theme.breakpoints.down('xs')]: {
        width: '100%'
      }
    },
    addNewIP: {
      marginLeft: -(theme.spacing(1) + theme.spacing(1) / 2)
    },
    remove: {
      [theme.breakpoints.down('xs')]: {
        margin: '-16px 0 0 -26px'
      }
    }
  });

interface Props {
  linodeID: number;
  linodeRegion: string;
  linodeIPs: string[];
  linodeSharedIPs: string[];
  readOnly?: boolean;
  refreshIPs: () => Promise<void>;
}

interface State {
  ipsToShare: string[];
  submitting: boolean;
  successMessage?: string;
  errors?: APIError[];
}

type CombinedProps = Props &
  WithStyles<ClassNames> &
  WithLinodesProps &
  DispatchProps;

class IPSharingPanel extends React.Component<CombinedProps, State> {
  state: State = {
    ipsToShare: this.props.linodeSharedIPs,
    submitting: false
  };
  mounted = false;

  static errorResources = {};
  static selectIPText = 'Select an IP';

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (!this.mounted) {
      return;
    }
    this.setState({
      ipsToShare: nextProps.linodeSharedIPs
    });
  }

  renderMyIPRow = (ip: string) => {
    const { classes } = this.props;
    return (
      <Grid container key={ip}>
        <Grid item xs={12}>
          <Divider className={classes.containerDivider} />
        </Grid>
        <Grid item xs={12}>
          <TextField
            disabled
            value={ip}
            className={classes.ipField}
            label="IP Address"
            hideLabel
          />
        </Grid>
      </Grid>
    );
  };

  onIPSelect = (ipIdx: number) => (e: Item<string>) => {
    if (ipIdx === undefined) {
      return;
    }
    const newIPsToShare = clone(this.state.ipsToShare);
    newIPsToShare[+ipIdx] = e.value;
    if (!this.mounted) {
      return;
    }
    this.setState({
      ipsToShare: newIPsToShare
    });
  };

  onIPDelete = (ipIdx: number) => (e: React.MouseEvent<HTMLElement>) => {
    if (ipIdx === undefined) {
      return;
    }
    const newIPsToShare = clone(this.state.ipsToShare);
    newIPsToShare.splice(+ipIdx, 1);
    if (!this.mounted) {
      return;
    }
    this.setState({
      ipsToShare: newIPsToShare
    });
  };

  remainingChoices = (selectedIP: string) => {
    return this.props.ipChoices.filter((ip: string) => {
      const hasBeenSelected = this.state.ipsToShare.includes(ip);
      return ip === selectedIP || !hasBeenSelected;
    });
  };

  renderShareIPRow = (ip: string, idx: number) => {
    const { classes, readOnly } = this.props;

    const ipList = this.remainingChoices(ip).map((ipChoice: string) => {
      const label = `${ipChoice} ${
        this.props.ipChoiceLabels[ipChoice] !== undefined
          ? this.props.ipChoiceLabels[ipChoice]
          : ''
      }`;
      return { label, value: ipChoice };
    });

    const defaultIP = ipList.find(eachIP => {
      return eachIP.value === ip;
    });

    return (
      <Grid container key={idx}>
        <Grid item xs={12}>
          <Divider className={classes.containerDivider} />
        </Grid>
        <Grid item xs={12} sm={10}>
          <Select
            defaultValue={defaultIP}
            options={ipList}
            onChange={this.onIPSelect(idx)}
            className={classes.ipField}
            textFieldProps={{
              dataAttrs: {
                'data-qa-share-ip': true
              }
            }}
            disabled={readOnly}
            isClearable={false}
            placeholder="Select an IP"
            label="Select an IP"
            hideLabel
          />
        </Grid>
        <Grid item className={classes.removeCont}>
          <Button
            buttonType="remove"
            onClick={this.onIPDelete(idx)}
            className={classes.remove}
            data-qa-remove-shared-ip
            disabled={readOnly}
          />
        </Grid>
      </Grid>
    );
  };

  addIPToShare = () => {
    if (!this.mounted) {
      return;
    }
    this.setState({
      ipsToShare: [...this.state.ipsToShare, IPSharingPanel.selectIPText]
    });
  };

  onSubmit = () => {
    const finalIPs = uniq(
      this.state.ipsToShare.filter(
        (ip: string) => ip !== IPSharingPanel.selectIPText
      )
    );
    if (!this.mounted) {
      return;
    }
    this.setState({
      errors: undefined,
      submitting: true
    });
    shareAddresses({ linode_id: this.props.linodeID, ips: finalIPs })
      .then(_ => {
        this.props.refreshIPs();
        if (!this.mounted) {
          return;
        }
        this.setState({
          errors: undefined,
          submitting: false,
          successMessage: 'IP Sharing updated successfully'
        });
      })
      .catch(errorResponse => {
        const errors = getAPIErrorOrDefault(
          errorResponse,
          'Unable to complete request at this time.'
        );

        if (!this.mounted) {
          return;
        }
        this.setState({
          errors,
          submitting: false,
          successMessage: undefined
        });
      });
  };

  onCancel = () => {
    if (!this.mounted) {
      return;
    }
    this.setState({
      errors: undefined,
      successMessage: undefined,
      ipsToShare: this.props.linodeSharedIPs
    });
  };

  renderActions = () => {
    const { readOnly } = this.props;
    const { submitting } = this.state;
    const noChoices = this.props.ipChoices.length <= 1;
    return (
      <ActionsPanel>
        <Button
          loading={submitting}
          disabled={readOnly || noChoices}
          onClick={this.onSubmit}
          buttonType="primary"
          data-qa-submit
        >
          Save
        </Button>
        <Button
          disabled={submitting || noChoices}
          onClick={this.onCancel}
          buttonType="secondary"
          data-qa-cancel
        >
          Cancel
        </Button>
      </ActionsPanel>
    );
  };

  render() {
    const { classes, linodeIPs, readOnly, ipChoices } = this.props;
    const { errors, successMessage, ipsToShare } = this.state;

    const errorFor = getAPIErrorsFor(IPSharingPanel.errorResources, errors);
    const generalError = errorFor('none');

    return (
      <ExpansionPanel
        heading="IP Sharing"
        error={generalError}
        success={successMessage}
        actions={this.renderActions}
      >
        <Grid container>
          <Grid item sm={12} lg={8} xl={6}>
            <Typography className={classes.networkActionText}>
              IP Sharing allows a Linode to share an IP address assignment (one
              or more additional IPv4 addresses). This can be used to allow one
              Linode to begin serving requests should another become
              unresponsive. Only IPs in the same datacenter are offered for
              sharing.
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Grid container>
              <Grid item className={classes.ipFieldLabel}>
                <Typography>IP Addresses</Typography>
              </Grid>
            </Grid>
            {ipChoices.length <= 1 ? (
              <Typography className={classes.noIPsMessage}>
                You have no other Linodes in this Linode's datacenter with which
                to share IPs.
              </Typography>
            ) : (
              <React.Fragment>
                {linodeIPs.map((ip: string) => this.renderMyIPRow(ip))}
                {ipsToShare.map((ip: string, idx: number) =>
                  this.renderShareIPRow(ip, idx)
                )}
                {/* the "1" that will always be there is the selectionText */}
                {this.remainingChoices('').length > 1 && (
                  <div className={classes.addNewButton}>
                    <AddNewLink
                      label="Add IP Address"
                      disabled={readOnly}
                      onClick={this.addIPToShare}
                      className={classes.addNewIP}
                    />
                  </div>
                )}
              </React.Fragment>
            )}
          </Grid>
        </Grid>
      </ExpansionPanel>
    );
  }
}

const styled = withStyles(styles);

interface WithLinodesProps {
  ipChoices: string[];
  ipChoiceLabels: {
    [key: string]: string;
  };
}

const enhanced = recompose<CombinedProps, Props & RenderGuardProps>(
  styled,
  RenderGuard,
  withLinodes<WithLinodesProps, Props>((ownProps, linodesData) => {
    const { linodeRegion, linodeID } = ownProps;
    const choiceLabels = {};
    const ipChoices = flatten<string>(
      linodesData
        .filter((linode: Linode) => {
          // Filter out:
          // 1. The current Linode
          // 2. Linodes outside of the current Linode's region
          return linode.id !== linodeID && linode.region === linodeRegion;
        })
        .map((linode: Linode) => {
          // side-effect of this mapping is saving the labels
          linode.ipv4.map((ip: string) => {
            choiceLabels[ip] = linode.label;
          });
          return linode.ipv4;
        })
    );
    /**
     * NB: We were previously filtering private IP addresses out at this point,
     * but it seems that the API (or our infra) doesn't care about this.
     */
    ipChoices.unshift(IPSharingPanel.selectIPText);
    return {
      ipChoices,
      ipChoiceLabels: choiceLabels
    };
  })
);

export default enhanced(IPSharingPanel);
