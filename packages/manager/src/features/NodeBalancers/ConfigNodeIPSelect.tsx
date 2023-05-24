import * as React from 'react';
import LinodeSelect from 'src/features/linodes/LinodeSelect';
import { Linode } from '@linode/api-v4/lib/linodes';
import { privateIPRegex } from 'src/utilities/ipUtils';
import type { Props as TextFieldProps } from 'src/components/TextField';

interface ConfigNodeIPSelectProps {
  selectedRegion?: string;
  handleChange: (nodeIndex: number, ipAddress: string) => void;
  nodeIndex: number;
  disabled?: boolean;
  inputId?: string;
  errorText?: string;
  nodeAddress?: string;
  textfieldProps: Omit<TextFieldProps, 'label'>;
}

export const ConfigNodeIPSelect = React.memo(
  (props: ConfigNodeIPSelectProps) => {
    const [selectedLinode, setSelectedLinode] = React.useState<number | null>(
      null
    );
    const { handleChange: _handleChange, inputId } = props;

    const handleChange = (linode: Linode) => {
      setSelectedLinode(linode.id);
      const thisLinodesPrivateIP = linode.ipv4.find((ipv4) =>
        ipv4.match(privateIPRegex)
      );
      /**
       * we can be sure the selection has a private IP because of the
       * filterCondition prop in the render method below
       */
      _handleChange(props.nodeIndex, thisLinodesPrivateIP!);
    };

    return (
      <LinodeSelect
        noMarginTop
        inputId={inputId}
        textFieldProps={props.textfieldProps}
        value={
          props.nodeAddress
            ? {
                value: props.nodeAddress,
                label: props.nodeAddress,
              }
            : null
        }
        selectedLinode={selectedLinode}
        noOptionsMessage={`No options - please ensure you have at least 1 Linode
      with a private IP located in the selected region.`}
        generalError={props.errorText}
        handleChange={handleChange}
        label="IP Address"
        disabled={props.disabled}
        small
        placeholder="Enter IP Address"
        valueOverride={(linode) => {
          return linode.ipv4.find((eachIP) => eachIP.match(privateIPRegex));
        }}
        labelOverride={(linode) => {
          return (
            <div>
              <strong>
                {linode.ipv4.find((eachIP) => eachIP.match(privateIPRegex))}
              </strong>
              <div>{` ${linode.label}`}</div>
            </div>
          );
        }}
        filterCondition={(linode) => {
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
      />
    );
  }
);
