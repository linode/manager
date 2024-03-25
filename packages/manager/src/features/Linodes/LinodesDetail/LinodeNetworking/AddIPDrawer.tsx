import { IPv6Prefix } from '@linode/api-v4/lib/networking';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Box } from 'src/components/Box';
import { Divider } from 'src/components/Divider';
import { Drawer } from 'src/components/Drawer';
import { Item } from 'src/components/EnhancedSelect/Select';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { Radio } from 'src/components/Radio/Radio';
import { RadioGroup } from 'src/components/RadioGroup';
import { Stack } from 'src/components/Stack';
import { Tooltip } from 'src/components/Tooltip';
import { Typography } from 'src/components/Typography';
import {
  useAllocateIPMutation,
  useCreateIPv6RangeMutation,
  useLinodeIPsQuery,
} from 'src/queries/linodes/networking';

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

const tooltipCopy: Record<IPType, string | null> = {
  v4Private: 'This Linode already has a private IP address.',
  v4Public: null,
};

interface Props {
  linodeId: number;
  linodeIsInEdgeRegion?: boolean;
  onClose: () => void;
  open: boolean;
  readOnly: boolean;
}

export const AddIPDrawer = (props: Props) => {
  const { linodeId, linodeIsInEdgeRegion, onClose, open, readOnly } = props;

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

  return (
    <Drawer onClose={onClose} open={open} title="Add an IP Address">
      <Stack spacing={2}>
        <Typography variant="h3">IPv4</Typography>
        {Boolean(ipv4Error) && (
          <Notice spacingTop={4} text={ipv4Error?.[0].reason} variant="error" />
        )}

        <StyledRadioGroup
          aria-labelledby="ipv4-select-type"
          data-qa-ip-options-radio-group
          name="Select IPv4 type"
          onChange={handleIPv4Change}
          value={selectedIPv4}
        >
          {linodeIsInEdgeRegion && (
            <Notice
              sx={{ fontSize: 15 }}
              text="Private IP is currently not available for Edge regions."
              variant="warning"
            />
          )}
          <Typography id="ipv4-select-type">Select type</Typography>
          <Box>
            {ipOptions.map((option, idx) => (
              <FormControlLabel
                control={<Radio />}
                data-qa-radio={option.label}
                disabled={option.value === 'v4Private' && linodeIsInEdgeRegion}
                key={idx}
                label={option.label}
                value={option.value}
              />
            ))}
          </Box>
        </StyledRadioGroup>
        {selectedIPv4 && <Typography>{explainerCopy[selectedIPv4]}</Typography>}

        {_tooltipCopy ? (
          <Tooltip placement="bottom-end" title={_tooltipCopy}>
            <div style={{ display: 'inline' }}>
              <StyledActionsPanel
                primaryButtonProps={{
                  disabled: disabledIPv4,
                  label: 'Allocate',
                  loading: ipv4Loading,
                  onClick: handleAllocateIPv4,
                }}
              />
            </div>
          </Tooltip>
        ) : (
          <StyledActionsPanel
            primaryButtonProps={{
              disabled: disabledIPv4,
              label: 'Allocate',
              loading: ipv4Loading,
              onClick: handleAllocateIPv4,
            }}
          />
        )}
        <Divider sx={{ pt: 1 }} />
        <Typography sx={{ pt: 1 }} variant="h3">
          IPv6
        </Typography>
        {Boolean(ipv6Error) && (
          <Notice spacingTop={4} text={ipv6Error?.[0].reason} variant="error" />
        )}

        <StyledRadioGroup
          aria-labelledby="ipv6-select-type"
          data-qa-ip-options-radio-group
          name="Select IPv6 type"
          onChange={handleIPv6Change}
          value={selectedIPv6Prefix}
        >
          <Typography id="ipv6-select-type">Select prefix</Typography>
          <Box>
            {prefixOptions.map((option, idx) => (
              <FormControlLabel
                control={<Radio />}
                data-qa-radio={option.label}
                key={idx}
                label={option.label}
                value={option.value}
              />
            ))}
          </Box>
        </StyledRadioGroup>
        {selectedIPv6Prefix && (
          <Typography>{IPv6ExplanatoryCopy[selectedIPv6Prefix]}</Typography>
        )}
        <Typography>
          IPv6 addresses are allocated as ranges, which you can choose to
          distribute and further route yourself.{' '}
          <Link to="https://www.linode.com/docs/guides/an-overview-of-ipv6-on-linode/">
            Learn more
          </Link>
          .
        </Typography>
        <StyledActionsPanel
          primaryButtonProps={{
            disabled: disabledIPv6,
            label: 'Allocate',
            loading: ipv6Loading,
            onClick: handleCreateIPv6Range,
          }}
        />
      </Stack>
    </Drawer>
  );
};

const StyledRadioGroup = styled(RadioGroup, {
  label: 'StyledApiDrawerRadioGroup',
})(({ theme }) => ({
  '& label': {
    minWidth: 100,
  },
  '& p': {
    fontFamily: theme.font.bold,
  },
  marginBottom: '0 !important',
}));

const StyledActionsPanel = styled(ActionsPanel, {
  label: 'StyledActionsPanel',
})(({ theme }) => ({
  paddingTop: theme.spacing(2),
}));
