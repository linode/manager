import { Linode } from 'linode-js-sdk/lib/linodes';
import * as React from 'react';
import { compose } from 'recompose';

import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';

import { Props as TextFieldProps } from 'src/components/TextField';
import LinodeSelect from 'src/features/linodes/LinodeSelect';
import { privateIPRegex } from 'src/utilities/ipUtils';

type ClassNames = 'labelOuter';

const styles = (theme: Theme) =>
  createStyles({
    labelOuter: {
      display: 'block'
    }
  });

interface Props {
  selectedRegion?: string;
  handleChange: (nodeIndex: number, ipAddress: string) => void;
  nodeIndex: number;
  errorText?: string;
  nodeAddress?: string;
  workflow: 'create' | 'edit';
  textfieldProps: Omit<TextFieldProps, 'label'>;
}

type CombinedProps = WithStyles<ClassNames> & Props;

const ConfigNodeIPSelect: React.FC<CombinedProps> = props => {
  const [selectedLinode, setSelectedLinode] = React.useState<number | null>(
    null
  );
  const { classes } = props;

  const handleChange = (linode: Linode) => {
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
      textFieldProps={props.textfieldProps}
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
          <div>
            <strong>
              {linode.ipv4.find(eachIP => eachIP.match(privateIPRegex))}
            </strong>
            <div className={classes.labelOuter}>{` ${linode.label}`}</div>
          </div>
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

const styled = withStyles(styles);

export default compose<CombinedProps, Props>(
  React.memo,
  styled
)(ConfigNodeIPSelect);
