import * as React from 'react';
import { Link } from 'react-router-dom';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';

interface Props {
  open: boolean;
  onClose: () => void;
}

type CombinedProps = Props;

const CreateIPv6Drawer: React.StatelessComponent<CombinedProps> = props => {
  return (
    <Drawer
      open={props.open}
      onClose={props.onClose}
      title="Allocate IPv6 Ranges"
    >
      <React.Fragment>
        <Typography variant="body1" data-qa-service-notice>
          IPv6 addresses are allocated as ranges, which you can choose to
          distribute and further route yourself. These ranges can only be
          allocated by our support team. Please open a{' '}
          <Link to="/support">Support Ticket</Link> and request an IPv6 range
          for this Linode.
        </Typography>
        <ActionsPanel style={{ marginTop: 16 }}>
          <Button
            buttonType="primary"
            className="cancel"
            onClick={props.onClose}
            data-qa-cancel
          >
            Close
          </Button>
        </ActionsPanel>
      </React.Fragment>
    </Drawer>
  );
};

export default CreateIPv6Drawer;
