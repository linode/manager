import { updateIP } from 'linode-js-sdk/lib/networking';
import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import FormHelperText from 'src/components/core/FormHelperText';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import TextField from 'src/components/TextField';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

interface Props {
  open: boolean;
  onClose: () => void;
  rdns?: string | null;
  range?: string;
  address?: string;
}

interface State {
  rdns?: string | null;
  address?: string;
  loading: boolean;
  errors?: APIError[];
  delayText: string | null;
  ipv6Address?: string | null;
}

type CombinedProps = Props;

class ViewRangeDrawer extends React.Component<CombinedProps, State> {
  state: State = {
    rdns: this.props.rdns,
    address: this.props.address,
    loading: false,
    delayText: null,
    ipv6Address: this.props.range
  };

  timer: any = undefined;
  mounted: boolean = false;

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
    clearTimeout(this.timer);
  }

  errorResources = {
    rdns: 'RDNS'
  };

  componentWillReceiveProps(nextProps: CombinedProps) {
    this.setState({
      rdns: nextProps.rdns,
      address: nextProps.address,
      ipv6Address: nextProps.range,
      errors: undefined
    });
  }

  showDelayText = () => {
    if (!this.mounted) {
      return;
    }
    this.setState({
      delayText:
        'Your request is still pending. Editing RDNS can take up to 30 seconds. Thank you for your patience.'
    });
  };

  save = () => {
    const { onClose, range } = this.props;
    const { rdns, address, ipv6Address } = this.state;
    this.setState({ loading: true, errors: undefined });
    this.timer = setTimeout(this.showDelayText, 5000);

    const ipToUpdate = range ? ipv6Address : address;

    // Something has gone wrong in this case.
    if (!ipToUpdate) {
      return;
    }

    updateIP(ipToUpdate, !rdns || rdns === '' ? null : rdns)
      .then(_ => {
        if (!this.mounted) {
          return;
        }
        clearTimeout(this.timer);
        this.setState({ loading: false, delayText: null });
        onClose();
      })
      .catch(errResponse => {
        if (!this.mounted) {
          return;
        }
        clearTimeout(this.timer);
        this.setState(
          {
            errors: getAPIErrorOrDefault(errResponse),
            loading: false,
            delayText: null
          },
          () => {
            scrollErrorIntoView();
          }
        );
      });
  };

  handleChangeDomain = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ rdns: e.target.value });
  };

  handleChangeIPv6Address = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ ipv6Address: e.target.value });
  };

  render() {
    const { open, onClose, range } = this.props;
    const { rdns, ipv6Address, delayText, errors, loading } = this.state;

    const hasErrorFor = getAPIErrorsFor(this.errorResources, errors);

    return (
      <Drawer open={open} onClose={onClose} title={`Edit Reverse DNS`}>
        <React.Fragment>
          {range && (
            <div>
              <TextField
                style={{ marginBottom: 16 }}
                placeholder="Enter an IPv6 address"
                value={ipv6Address || ''}
                errorText={hasErrorFor('ipv6Address')}
                onChange={this.handleChangeIPv6Address}
                data-qa-address-name
              />
            </div>
          )}
          <TextField
            placeholder="Enter a domain name"
            value={rdns || ''}
            errorText={hasErrorFor('rdns')}
            onChange={this.handleChangeDomain}
            data-qa-domain-name
          />
          <Typography variant="body1">
            Leave this field blank to reset RDNS
          </Typography>

          {hasErrorFor('none') && (
            <FormHelperText error style={{ marginTop: 16 }} data-qa-error>
              {hasErrorFor('none')}
            </FormHelperText>
          )}

          <ActionsPanel style={{ marginTop: 16 }}>
            <Button
              buttonType="primary"
              onClick={this.save}
              loading={loading}
              data-qa-submit
            >
              Save
            </Button>
            <Button
              buttonType="secondary"
              className="cancel"
              onClick={onClose}
              data-qa-cancel
            >
              Close
            </Button>
          </ActionsPanel>
          <Typography variant="body1">{delayText}</Typography>
        </React.Fragment>
      </Drawer>
    );
  }
}

export default ViewRangeDrawer;
