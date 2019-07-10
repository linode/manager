import * as React from 'react';
import { compose } from 'recompose';

import LinodeSelect from 'src/features/linodes/LinodeSelect';

interface Props {
  selectedRegion?: string;
  handleChange: (nodeIndex: number, ipAddress: string) => void;
  nodeIndex: number;
  errorText?: string;
  nodeAddress?: string;
  workflow: 'create' | 'edit';
}

type CombinedProps = Props;

const privateIPRegex = /^10\.|^172\.1[6-9]\.|^172\.2[0-9]\.|^172\.3[0-1]\.|^192\.168\.|^fd/;

const ConfigNodeIPSelect: React.FC<CombinedProps> = props => {
  const [selectedLinode, setSelectedLinode] = React.useState<number | null>(
    null
  );

  const handleChange = (linode: Linode.Linode) => {
    setSelectedLinode(linode.id);

    const thisLinodesPrivateIP = linode.ipv4.find(ipv4 =>
      ipv4.match(privateIPRegex)
    );
    /**
     * we can be sure the selection has a private IP because of the
     * filterCondition prop in the render method below
     */
    props.handleChange(props.nodeIndex, thisLinodesPrivateIP!);
  };

  React.useEffect(() => {
    /**
     * In other words, when we select a new region in the create workflow
     * clear out the selected IP Address because it might belong to a node
     * NOT in the selected region
     */
    if (props.workflow === 'create') {
      setSelectedLinode(null);
      props.handleChange(props.nodeIndex, '');
    }
  }, [props.selectedRegion]);

  return (
    <LinodeSelect
      noMarginTop
      value={
        props.nodeAddress
          ? {
              value: props.nodeAddress,
              label: props.nodeAddress
            }
          : null
      }
      selectedLinode={selectedLinode}
      noOptionsMessage={`No options - please ensure you have at least 1 Linode 
      with a private IP located in the selected region.`}
      generalError={props.errorText}
      handleChange={handleChange}
      label="IP Address"
      small
      placeholder="Enter IP Address"
      valueOverride={linode => {
        return linode.ipv4.find(eachIP => eachIP.match(privateIPRegex));
      }}
      labelOverride={linode => {
        return (
          <span>
            <strong>
              {linode.ipv4.find(eachIP => eachIP.match(privateIPRegex))}
            </strong>
            {` ${linode.label}`}
          </span>
        );
      }}
      filterCondition={linode => {
        /**
         * if the Linode doesn't have an private IP OR if the Linode
         * is in a different region that the NodeBalancer, don't show it
         * in the select dropdown
         */
        return (
          !!linode.ipv4.find(eachIP => eachIP.match(privateIPRegex)) &&
          linode.region === props.selectedRegion
        );
      }}
    />
  );
};

export default compose<CombinedProps, Props>(React.memo)(ConfigNodeIPSelect);
