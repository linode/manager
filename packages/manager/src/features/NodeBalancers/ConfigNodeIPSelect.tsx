import { Linode } from '@linode/api-v4/lib/linodes';
import { Box } from '@mui/material';
import * as React from 'react';

import { SelectedIcon } from 'src/features/Linodes/LinodeSelect/LinodeSelect.styles';
import { LinodeSelectV2 } from 'src/features/Linodes/LinodeSelect/LinodeSelectV2';
import { privateIPRegex } from 'src/utilities/ipUtils';

import type { TextFieldProps } from 'src/components/TextField';

interface ConfigNodeIPSelectProps {
  disabled?: boolean;
  errorText?: string;
  handleChange: (nodeIndex: number, ipAddress: string) => void;
  inputId?: string;
  nodeAddress?: string;
  nodeIndex: number;
  selectedRegion?: string;
  textfieldProps: Omit<TextFieldProps, 'label'>;
}

export const ConfigNodeIPSelect = React.memo(
  (props: ConfigNodeIPSelectProps) => {
    const [selectedLinode, setSelectedLinode] = React.useState<null | number>(
      null
    );
    const {
      handleChange: _handleChange,
      inputId,
      nodeAddress,
      nodeIndex,
    } = props;

    const handleChange = (linode: Linode) => {
      if (!linode?.id) {
        return;
      }

      setSelectedLinode(linode.id);

      const thisLinodesPrivateIP = linode.ipv4.find((ipv4) =>
        ipv4.match(privateIPRegex)
      );
      /**
       * we can be sure the selection has a private IP because of the
       * filterCondition prop in the render method below
       */
      _handleChange(nodeIndex, thisLinodesPrivateIP!);
    };

    return (
      <LinodeSelectV2
        noOptionsMessage={`No options - please ensure you have at least 1 Linode
      with a private IP located in the selected region.`}
        optionsFilter={(linode) => {
          /**
           * if the Linode doesn't have an private IP OR if the Linode
           * is in a different region that the NodeBalancer, don't show it
           * in the select dropdown
           */
          return (
            !!linode.ipv4.find((eachIP) => eachIP.match(privateIPRegex)) &&
            linode.region === props.selectedRegion
          );
        }}
        renderOption={(linode, selected) => (
          <>
            <Box
              sx={{
                flexGrow: 1,
              }}
            >
              <strong>
                {linode.ipv4.find((eachIP) => eachIP.match(privateIPRegex))}
              </strong>
              <div>{linode.label}</div>
            </Box>
            <SelectedIcon visible={selected} />
          </>
        )}
        renderOptionLabel={(linode) =>
          linode.ipv4.find((eachIP) => eachIP.match(privateIPRegex)) ?? ''
        }
        clearable
        disabled={props.disabled}
        errorText={props.errorText}
        id={inputId}
        noMarginTop
        onSelectionChange={handleChange}
        placeholder="IP Address"
        showIPAddressLabel
        value={nodeAddress === '' ? null : selectedLinode}
      />
    );
  }
);
