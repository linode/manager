// import { allocateIPAddress } from '@linode/api-v4/lib/linodes';
// import { createIPv6Range, IPv6Prefix } from '@linode/api-v4/lib/networking';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import FormControlLabel from 'src/components/core/FormControlLabel';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import { Item } from 'src/components/EnhancedSelect/Select';
import ExternalLink from 'src/components/Link';
import Notice from 'src/components/Notice';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import MultipleIPInput from 'src/components/MultipleIPInput/MultipleIPInput';

const useStyles = makeStyles((theme: Theme) => ({
  instructions: {
    marginBottom: '2rem',
  },
  ipSelect: {
    marginTop: theme.spacing(2),
  },
}));

interface Props {
  open: boolean;
  onClose: () => void;
  updateDatabase: any; // fix
  allowList: string[];
  // linodeID: number;
  // hasPrivateIPAddress: boolean;
  // onSuccess: () => void;
  // readOnly: boolean;
}

type CombinedProps = Props;

const AddAccessControlDrawer: React.FC<CombinedProps> = (props) => {
  const {
    open,
    onClose,
    updateDatabase,
    allowList,
    // linodeID,
    // hasPrivateIPAddress,
    // onSuccess,
    // readOnly,
  } = props;

  const classes = useStyles();

  const [error, setError] = React.useState<string | undefined>('');
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (open) {
      setError('');
    }
  }, [open]);

  const handleAllowInboundSourcesClick = () => {
    setLoading(true);

    updateDatabase({ allow_list: [...allowList, '1.1.1.1'] })
      .then(() => {
        setLoading(false);
        onClose();
      })
      .catch((e: APIError[]) => {
        setLoading(false);
        setError(getErrorStringOrDefault(e));
      });
  };

  const buttonsJSX = (
    <>
      <Button
        buttonType="secondary"
        onClick={onClose}
        disabled={false}
        style={{ marginBottom: 8 }}
        loading={false}
      >
        Cancel
      </Button>
      <Button
        buttonType="primary"
        onClick={handleAllowInboundSourcesClick}
        disabled={false}
        style={{ marginBottom: 8 }}
        loading={loading}
      >
        Allow Inbound Sources
      </Button>
    </>
  );

  return (
    <Drawer open={open} onClose={onClose} title="Add Access Controls">
      <React.Fragment>
        {error ? <Notice error text={error} /> : null}
        <Typography variant="body1" className={classes.instructions}>
          To restrict connections to trusted sources, add at least one inbound
          source below. When you do, all other public and private connections
          will be denied.{' '}
          <ExternalLink to="https://www.linode.com/docs">
            Learn more about securing your cluster.
          </ExternalLink>
        </Typography>
        <MultipleIPInput
          title="Inbound Sources"
          aria-label="Inbound Sources"
          className={classes.ipSelect}
          ips={[]}
          onChange={() => null}
          onBlur={() => null}
          inputProps={{ autoFocus: true }}
          placeholder="Add IP address or range"
        />
        <ActionsPanel>{buttonsJSX}</ActionsPanel>
      </React.Fragment>
    </Drawer>
  );
};

export default AddAccessControlDrawer;
