import { IPAddress, updateIP } from '@linode/api-v4/lib/networking';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import FormHelperText from 'src/components/core/FormHelperText';

import { makeStyles, Theme } from 'src/components/core/styles';

import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import TextField from 'src/components/TextField';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

const useStyles = makeStyles((theme: Theme) => ({
  section: {
    marginTop: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  header: {
    marginTop: theme.spacing(2),
  },
  rdnsRecord: {
    marginTop: theme.spacing(2),
  },
  ipv6Input: {
    marginBottom: theme.spacing(2),
  },
}));

interface Props {
  open: boolean;
  onClose: () => void;
  rdns?: string | null;
  range?: string;
  address?: string;
  ips?: IPAddress[];
  updateIPs?: (ip: IPAddress) => void;
}

type CombinedProps = Props;

export const ViewRangeDrawer: React.FC<CombinedProps> = (props) => {
  const { open, onClose, rdns, range, address, ips, updateIPs } = props;

  const [currentRDNS, setRDNS] = React.useState<string | null | undefined>(
    rdns
  );
  const [currentAddress, setCurrentAddress] = React.useState<
    string | undefined
  >(address);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [delayText, setDelayText] = React.useState<string | null>(null);
  const [ipv6Address, setIPv6Address] = React.useState<string | undefined>(
    range
  );
  const [errors, setErrors] = React.useState<APIError[]>([]);

  const [mounted, setMounted] = React.useState<boolean>(false);

  const classes = useStyles();

  let timer: number = 0;

  React.useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
      clearTimeout(timer);
    };
  }, [timer]);

  React.useEffect(() => {
    if (open) {
      setRDNS(rdns);
      setCurrentAddress(currentAddress);
      setIPv6Address(range);
      setErrors([]);
    }
  }, [open]);

  const errorResources = {
    rdns: 'RDNS',
  };

  const showDelayText = () => {
    if (!mounted) {
      return;
    }

    setDelayText(
      'Your request is still pending. Editing RDNS can take up to 30 seconds. Thank you for your patience.'
    );
  };

  const save = () => {
    const ipToUpdate = range ? ipv6Address : address;

    // If the field is blank, return an error.
    if (!ipToUpdate) {
      setErrors([
        { field: 'ipv6Address', reason: 'Please enter an IPv6 Address' },
      ]);

      return;
    }

    setLoading(true);
    setErrors([]);

    timer = window.setTimeout(showDelayText, 5000);

    updateIP(
      ipToUpdate,
      !currentRDNS || currentRDNS === '' ? null : currentRDNS
    )
      .then((ip) => {
        if (!mounted) {
          return;
        }

        clearTimeout(timer);
        setLoading(false);
        setDelayText(null);

        // If we're updating a range, manually update the parent component.
        if (range && updateIPs) {
          updateIPs(ip);
        }

        onClose();
      })
      .catch((errResponse) => {
        if (!mounted) {
          return;
        }

        clearTimeout(timer);

        setErrors(getAPIErrorOrDefault(errResponse));
        setLoading(false);
        setDelayText(null);
        scrollErrorIntoView();
      });
  };

  const handleChangeDomain = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRDNS(e.target.value);
  };

  const handleChangeIPv6Address = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIPv6Address(e.target.value);
  };

  const hasErrorFor = getAPIErrorsFor(errorResources, errors);

  return (
    <Drawer open={open} onClose={onClose} title={`Edit Reverse DNS`}>
      <React.Fragment>
        {range && (
          <div className={classes.ipv6Input}>
            <TextField
              placeholder="Enter an IPv6 address"
              label="Enter an IPv6 address"
              hideLabel
              value={ipv6Address || ''}
              errorText={hasErrorFor('ipv6Address')}
              onChange={handleChangeIPv6Address}
              data-qa-address-name
            />
          </div>
        )}
        <TextField
          placeholder="Enter a domain name"
          label="Enter a domain name"
          hideLabel
          value={currentRDNS || ''}
          errorText={hasErrorFor('rdns')}
          onChange={handleChangeDomain}
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
            onClick={save}
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
        {range && ips && ips.length > 0 && (
          <div className={classes.section}>
            <Typography variant="h3" className={classes.header}>
              Existing Records
            </Typography>
            {ips.map((ip) => (
              <div key={ip.address} className={classes.rdnsRecord}>
                <Typography>{ip.address}</Typography>
                <Typography>{ip.rdns || ''}</Typography>
              </div>
            ))}
          </div>
        )}
      </React.Fragment>
    </Drawer>
  );
};

export default React.memo(ViewRangeDrawer);
