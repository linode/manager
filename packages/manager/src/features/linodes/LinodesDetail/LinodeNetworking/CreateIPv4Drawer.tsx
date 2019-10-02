import { allocateIPAddress } from 'linode-js-sdk/lib/linodes';
import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import Notice from 'src/components/Notice';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import substituteLink from 'src/utilities/substituteLink';

interface Props {
  open: boolean;
  forPublic: boolean;
  onClose: () => void;
  linodeID: number;
}

interface State {
  forPublic: boolean;
  errors?: APIError[];
}

type CombinedProps = Props;

class CreateIPv4Drawer extends React.Component<CombinedProps, State> {
  state: State = {
    forPublic: this.props.forPublic
  };

  componentWillReceiveProps(nextProps: CombinedProps) {
    this.setState({
      errors: undefined,
      forPublic: nextProps.forPublic
    });
  }

  create = () => {
    const { onClose, linodeID } = this.props;
    // Only IPv4 addresses can currently be allocated.
    allocateIPAddress(linodeID, { type: 'ipv4', public: this.state.forPublic })
      .then(_ => {
        onClose();
      })
      .catch(errResponse => {
        this.setState(
          {
            errors: getAPIErrorOrDefault(errResponse)
          },
          () => {
            scrollErrorIntoView();
          }
        );
      });
  };

  getCopy(): string {
    const publicCopy = `Public IP addresses, over and above the one included
      with each Linode, incur an additional monthly charge. If you need an
      additional Public IP Address you must request one. Please open a support
      ticket if you have not done so already.`;
    const privateCopy = `Add a private IP address to your Linode. Data sent
      explicitly to and from private IP addresses in the same data center does
      not incur transfer quota usage. To ensure that the private IP is properly
      configured once added, it's best to reboot your Linode.`;
    return this.state.forPublic ? publicCopy : privateCopy;
  }

  render() {
    const { open, onClose, forPublic } = this.props;
    const { errors } = this.state;

    const hasErrorFor = getAPIErrorsFor({}, errors);

    return (
      <Drawer
        open={open}
        onClose={onClose}
        title={`Allocate ${forPublic ? 'Public' : 'Private'} IPv4 Address`}
      >
        <React.Fragment>
          <Typography variant="body1" data-qa-service-notice>
            {this.getCopy()}
          </Typography>
          {hasErrorFor('none') && (
            <div style={{ marginTop: 24 }}>
              <Notice error data-qa-notice>
                {substituteLink(
                  hasErrorFor('none') || '',
                  'support ticket',
                  '/support'
                )}
              </Notice>
            </div>
          )}
          <ActionsPanel style={{ marginTop: 16 }}>
            <Button buttonType="primary" onClick={this.create} data-qa-submit>
              Allocate
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
        </React.Fragment>
      </Drawer>
    );
  }
}

export default CreateIPv4Drawer;
