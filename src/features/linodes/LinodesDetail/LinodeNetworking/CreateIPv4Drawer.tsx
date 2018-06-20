import * as React from 'react';
import { path } from 'ramda';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import ActionsPanel from 'src/components/ActionsPanel';
import Drawer from 'src/components/Drawer';
import Notice from 'src/components/Notice';
import { allocatePublicIP } from 'src/services/linodes';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import substituteLink from 'src/utilities/substituteLink';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {
  open: boolean;
  onClose: () => void;
  linodeID: number;
}

interface State {
  errors?: Linode.ApiFieldError[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

class CreateIPv4Drawer extends React.Component<CombinedProps, State> {
  state: State = {};

  componentWillReceiveProps(nextProps: CombinedProps) {
    this.setState({
      errors: undefined,
    });
  }

  create() {
    const { onClose, linodeID } = this.props;
    allocatePublicIP(linodeID)
      .then((ipAddress) => {
        onClose();
      })
      .catch((errResponse) => {
        this.setState({
          errors: path(['response', 'data', 'errors'], errResponse),
        }, () => {
          scrollErrorIntoView();
        });
      });
  }

  render() {
    const { open, onClose } = this.props;
    const { errors } = this.state;

    const hasErrorFor = getAPIErrorsFor({}, errors);

    return (
      <Drawer
        open={open}
        onClose={onClose}
        title="Allocate Public IPv4 Address"
      >
        <React.Fragment>
          <Typography variant="body1" data-qa-service-notice>
            Public IP addresses, over and above the one included with each
            Linode, incur an additional monthly charge. If you need an
            additional Public IP Address you must request one. Please open a
            support ticket if you have not done so already.
          </Typography>
          {hasErrorFor('none') &&
            <Notice
              style={{ marginTop: 36 }}
              error
              data-qa-notice
            >
              {substituteLink(hasErrorFor('none') || '', 'support ticket', '/support')}
            </Notice>
          }
          <ActionsPanel style={{ marginTop: 16 }}>
            <Button
              variant="raised"
              color="primary"
              onClick={() => this.create()}
              data-qa-submit
            >
              Allocate
            </Button>
            <Button
              variant="raised"
              color="secondary"
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

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(CreateIPv4Drawer);
