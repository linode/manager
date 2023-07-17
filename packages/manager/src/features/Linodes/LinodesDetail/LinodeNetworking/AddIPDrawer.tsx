import { IPv6Prefix } from '@linode/api-v4/lib/networking';
import { Theme } from '@mui/material/styles';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';

import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import Drawer from 'src/components/Drawer';
import { Item } from 'src/components/EnhancedSelect/Select';
import { Link as ExternalLink } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { Radio } from 'src/components/Radio/Radio';
import { Tooltip } from 'src/components/Tooltip';
import { Typography } from 'src/components/Typography';
import FormControlLabel from 'src/components/core/FormControlLabel';
import RadioGroup from 'src/components/core/RadioGroup';
import {
  useAllocateIPMutation,
  useCreateIPv6RangeMutation,
  useLinodeIPsQuery,
} from 'src/queries/linodes/networking';

const useStyles = makeStyles()((theme: Theme) => ({
  copy: {
    marginTop: theme.spacing(2),
  },
  ipSubheader: {
    marginTop: '1rem',
  },
  ipv6: {
    marginTop: theme.spacing(4),
  },
  radioButtons: {
    marginTop: '0 !important',
  },
}));

type IPType = 'v4Private' | 'v4Public';

const ipOptions: Item<IPType>[] = [
  { label: 'Public', value: 'v4Public' },
  { label: 'Private', value: 'v4Private' },
];

const prefixOptions = [
  { label: '/64', value: '64' },
  { label: '/56', value: '56' },
];

// @todo: Pre-fill support tickets.
const explainerCopy: Record<IPType, JSX.Element> = {
  v4Private: (
    <>
      Add a private IP address to your Linode. Data sent explicitly to and from
      private IP addresses in the same data center does not incur transfer quota
      usage. To ensure that the private IP is properly configured once added,
      it&rsquo;s best to reboot your Linode.
    </>
  ),
  v4Public: (
    <>
      Public IP addresses, over and above the one included with each Linode,
      incur an additional monthly charge. If you need an additional Public IP
      Address you must request one. Please open a{' '}
      <Link to="support/tickets">Support Ticket</Link> if you have not done so
      already.
    </>
  ),
};

const IPv6ExplanatoryCopy = {
  56: (
    <>
      /56 ranges are typically only required by specialized systems or
      networking applications.
    </>
  ),
  64: (
    <>
      /64 is the most common range provided to our customers and sufficient for
      most applications that require additional IPv6 addresses.
    </>
  ),
};

const tooltipCopy: Record<IPType, JSX.Element | null> = {
  v4Private: <>This Linode already has a private IP address.</>,
  v4Public: null,
};

interface Props {
  linodeId: number;
  onClose: () => void;
  open: boolean;
  readOnly: boolean;
}

const AddIPDrawer = (props: Props) => {
  const { linodeId, onClose, open, readOnly } = props;
  const { classes } = useStyles();

  const {
    error: ipv4Error,
    isLoading: ipv4Loading,
    mutateAsync: allocateIPAddress,
    reset: resetIPv4,
  } = useAllocateIPMutation(linodeId);

  const {
    error: ipv6Error,
    isLoading: ipv6Loading,
    mutateAsync: createIPv6Range,
    reset: resetIPv6,
  } = useCreateIPv6RangeMutation();

  const [selectedIPv4, setSelectedIPv4] = React.useState<IPType | null>(null);

  const [
    selectedIPv6Prefix,
    setSelectedIPv6Prefix,
  ] = React.useState<IPv6Prefix | null>(null);

  const { data: ips } = useLinodeIPsQuery(linodeId, open);

  React.useEffect(() => {
    if (open) {
      setSelectedIPv4(null);
      setSelectedIPv6Prefix(null);
      resetIPv4();
      resetIPv6();
    }
  }, [open]);

  const handleIPv4Change = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: 'v4Private' | 'v4Public'
  ) => {
    setSelectedIPv4(value);
  };

  const handleIPv6Change = (
    e: React.ChangeEvent<HTMLInputElement>,
    value: any
  ) => {
    setSelectedIPv6Prefix(value);
  };

  const handleAllocateIPv4 = async () => {
    // Only IPv4 addresses can currently be allocated.
    await allocateIPAddress({
      public: selectedIPv4 === 'v4Public',
      type: 'ipv4',
    });
    onClose();
  };

  const handleCreateIPv6Range = async () => {
    await createIPv6Range({
      linode_id: linodeId,
      prefix_length: Number(selectedIPv6Prefix) as IPv6Prefix,
    });
    onClose();
  };

  const hasPrivateIPAddress = ips !== undefined && ips.ipv4.private.length > 0;

  const disabledIPv4 =
    (selectedIPv4 === 'v4Private' && hasPrivateIPAddress) ||
    !selectedIPv4 ||
    readOnly;

  const disabledIPv6 = !selectedIPv6Prefix || readOnly;

  const _tooltipCopy =
    disabledIPv4 && selectedIPv4
      ? readOnly
        ? 'You do not have permission to modify this Linode.'
        : tooltipCopy[selectedIPv4]
      : null;

  const buttonJSX = (type: 'IPv4' | 'IPv6') => {
    const IPv4 = type === 'IPv4';

    const onClick = IPv4 ? handleAllocateIPv4 : handleCreateIPv6Range;
    const disabled = IPv4 ? disabledIPv4 : disabledIPv6;
    const submitting = IPv4 ? ipv4Loading : ipv6Loading;

    return (
      <Button
        buttonType="primary"
        disabled={disabled}
        loading={submitting}
        onClick={onClick}
        style={{ marginBottom: 8 }}
      >
        Allocate
      </Button>
    );
  };

  return (
    <Drawer onClose={onClose} open={open} title="Add an IP Address">
      <React.Fragment>
        <Typography variant="h2">IPv4</Typography>
        {Boolean(ipv4Error) && (
          <Notice error spacingTop={8} text={ipv4Error?.[0].reason} />
        )}
        <Typography className={classes.ipSubheader} variant="h3">
          Select type
        </Typography>
        <RadioGroup
          aria-label="ip-option"
          className={classes.radioButtons}
          data-qa-ip-options-radio-group
          name="Select IPv4 type"
          onChange={handleIPv4Change}
          value={selectedIPv4}
        >
          {ipOptions.map((option, idx) => (
            <FormControlLabel
              control={<Radio />}
              data-qa-radio={option.label}
              key={idx}
              label={option.label}
              value={option.value}
            />
          ))}
        </RadioGroup>
        {selectedIPv4 && (
          <Typography className={classes.copy} variant="body1">
            {explainerCopy[selectedIPv4]}
          </Typography>
        )}
        <ActionsPanel>
          {_tooltipCopy ? (
            <Tooltip title={_tooltipCopy}>
              <div style={{ display: 'inline' }}>{buttonJSX('IPv4')}</div>
            </Tooltip>
          ) : (
            buttonJSX('IPv4')
          )}
        </ActionsPanel>
        <Typography className={classes.ipv6} variant="h2">
          IPv6
        </Typography>
        {Boolean(ipv6Error) && (
          <Notice error spacingTop={8} text={ipv6Error?.[0].reason} />
        )}
        <Typography className={classes.ipSubheader} variant="h3">
          Select prefix
        </Typography>
        <RadioGroup
          aria-label="prefix-option"
          className={classes.radioButtons}
          data-qa-ip-options-radio-group
          name="Select prefix"
          onChange={handleIPv6Change}
          value={selectedIPv6Prefix}
        >
          {prefixOptions.map((option, idx) => (
            <FormControlLabel
              control={<Radio />}
              data-qa-radio={option.label}
              key={idx}
              label={option.label}
              value={option.value}
            />
          ))}
        </RadioGroup>
        {selectedIPv6Prefix && (
          <Typography style={{ marginBottom: '1rem' }} variant="body1">
            {IPv6ExplanatoryCopy[selectedIPv6Prefix]}
          </Typography>
        )}
        <Typography>
          IPv6 addresses are allocated as ranges, which you can choose to
          distribute and further route yourself.{' '}
          <ExternalLink to="https://www.linode.com/docs/guides/an-overview-of-ipv6-on-linode/">
            Learn more
          </ExternalLink>
          .
        </Typography>
        <ActionsPanel>{buttonJSX('IPv6')}</ActionsPanel>
      </React.Fragment>
    </Drawer>
  );
};

export default AddIPDrawer;
