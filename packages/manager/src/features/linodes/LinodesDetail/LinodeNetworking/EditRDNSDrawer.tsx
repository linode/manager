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
  address?: string;
}

interface State {
  rdns?: string | null;
  address?: string;
  loading: boolean;
  errors?: APIError[];
  delayText: string | null;
}

type CombinedProps = Props;

class ViewRangeDrawer extends React.Component<CombinedProps, State> {
  state: State = {
    rdns: this.props.rdns,
    address: this.props.address,
    loading: false,
    delayText: null
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
    const { onClose } = this.props;
    const { rdns, address } = this.state;
    this.setState({ loading: true, errors: undefined });
    this.timer = setTimeout(this.showDelayText, 5000);
    updateIP(address!, !rdns || rdns === '' ? null : rdns)
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

  render() {
    const { open, onClose } = this.props;
    const { rdns, delayText, errors, loading } = this.state;

    const hasErrorFor = getAPIErrorsFor(this.errorResources, errors);

    return (
      <Drawer open={open} onClose={onClose} title={`Edit Reverse DNS`}>
        <React.Fragment>
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
