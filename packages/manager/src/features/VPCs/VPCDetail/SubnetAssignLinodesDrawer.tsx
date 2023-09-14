import { Linode, Subnet } from '@linode/api-v4';
import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Button } from 'src/components/Button/Button';
import { Checkbox } from 'src/components/Checkbox';
import { Drawer } from 'src/components/Drawer';
import { FormHelperText } from 'src/components/FormHelperText';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';

import { useAllLinodesQuery } from 'src/queries/linodes/linodes';


// @TODO VPC - if all subnet action menu item related components use this as their props, might be worth 
// putting this in a common file and naming it something like SubnetActionMenuItemProps or somthing 
interface Props {
  onClose: () => void;
  open: boolean;
  subnet?: Subnet;
  vpcId: number;
  vpcRegion: string;
}

export const SubnetAssignLinodesDrawer = (props: Props) => {
  const { onClose, open, subnet, vpcId, vpcRegion } = props;
  const [assignedLinodes, setAssignedLinodes] = React.useState<Linode[]>([]);
  const [selectedLinode, setSelectedLinode] = React.useState<Linode>();
  const [autoAssignIPv4, setAutoAssignIPv4] = React.useState<boolean>(true);
  
  // get all linodes from the same region as the VPC is in  
  const { data: linodes} = useAllLinodesQuery(
    {},
    {
      region: vpcRegion,
    },
  );

  // using formik??? idk
  return (
    <Drawer onClose={onClose} open={open} title={`Assign Linode to subnet: ${subnet?.label} (${subnet?.ipv4})`}>
      <Notice variant='warning'>Assigning a Linode to a subnet requires you to reboot the Linode to update its configuration.</Notice>
      <FormHelperText>Select the Linodes you would like to assign to this subnet. Only Linodes in this VPC's region are displayed.</FormHelperText>
      
      <Autocomplete 
        label={'Linodes'}
        options={linodes ?? []}
      />
      <Checkbox 
        checked={autoAssignIPv4}
        text={'Auto-assign a VPC IPv4 address for this Linode'}
        toolTipText={'A range of non-internet facing IP used in an internal network'}
        onChange={(_) => { setAutoAssignIPv4(!autoAssignIPv4)}} // idk just trying to get things set up rn
      />
      {(!autoAssignIPv4 && 
        <TextField label={'VPC IPv4'} 
        />
      )}
      {/* // wrong boolean to check but putting it here for visualization and stuff */}
      {(assignedLinodes.length === 0 && 
        <>
          <FormHelperText>
            This Linode has multiple configurations. Select which configuration you would like added to the subnet. 
            {/* @TODO: VPC - add docs link */}
            <Link to='#'> Learn more</Link>.
          </FormHelperText>
          <Autocomplete 
            label={'Configuration profile'}
            options={[]}
          />
        </>
      )}
      <Button buttonType='primary'>Assign Linode</Button>
      {/* figure out the typography for this. somehow also need to include list */}
      <Typography variant="body2">Linodes Assigned to Subnet ({assignedLinodes.length})</Typography>
      <Button buttonType="outlined">Done</Button>
    </Drawer>
  );
}