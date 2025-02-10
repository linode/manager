import {
  Accordion,
  Autocomplete,
  BetaChip,
  Box,
  Button,
  Stack,
  Typography,
} from '@linode/ui';
import * as React from 'react';

import { Link } from 'src/components/Link';

import type { LinodeInterfaceAccountSetting } from '@linode/api-v4';
import type { SelectOption } from '@linode/ui';

interface Props {
  interfacesSetting: LinodeInterfaceAccountSetting;
  updateInterfaceSettings: (
    newInterfaceSettings: LinodeInterfaceAccountSetting
  ) => void;
}

const accountSettingInterfaceOptions: SelectOption<LinodeInterfaceAccountSetting>[] = [
  {
    label: 'Configuration Profile Interfaces but allow Linode Interfaces',
    value: 'legacy_config_default_but_linode_allowed',
  },
  {
    label: 'Linode Interfaces but allow Configuration Profile Interfaces',
    value: 'linode_default_but_legacy_config_allowed',
  },
  {
    label: 'Configuration Profile Interfaces Only',
    value: 'legacy_config_only',
  },
  {
    label: 'Linode Interfaces Only',
    value: 'linode_only',
  },
];

export const NetworkInterfaceType = (props: Props) => {
  const { interfacesSetting, updateInterfaceSettings } = props;
  const [
    selectedInterfaceSetting,
    setSelectedInterfaceSetting,
  ] = React.useState<LinodeInterfaceAccountSetting>(interfacesSetting);

  return (
    <Accordion
      defaultExpanded
      heading="Network Interface Type"
      headingChip={<BetaChip color="primary" />}
    >
      <Stack>
        <Typography variant="body1">
          Set the network interface for your Linode instances to use during
          creation. <Link to="/#">Learn more</Link>.
        </Typography>
        <Autocomplete
          onChange={(_, item: SelectOption<LinodeInterfaceAccountSetting>) => {
            setSelectedInterfaceSetting(item.value);
          }}
          sx={(theme) => ({
            [theme.breakpoints.up('md')]: {
              minWidth: '458px',
            },
          })}
          textFieldProps={{
            tooltipText: '@TODO Linode Interfaces - get copy for this tooltip',
          }}
          value={accountSettingInterfaceOptions.find(
            (option) => option.value === selectedInterfaceSetting
          )}
          disableClearable
          label="Interfaces for new Linodes"
          options={accountSettingInterfaceOptions}
        />
        <Box
          sx={(theme) => ({
            marginTop: theme.spacing(2),
          })}
        >
          <Button
            buttonType="outlined"
            onClick={() => updateInterfaceSettings(selectedInterfaceSetting)}
          >
            Save
          </Button>
        </Box>
      </Stack>
    </Accordion>
  );
};
