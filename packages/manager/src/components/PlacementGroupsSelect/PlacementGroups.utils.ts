{
  /* TODO VM_Placement: Add utility functions in this file */
}

{
  /* TODO VM_Placement: Function to format the option label */
}
// const getPlacementGroupOptions = {};

{
  /* TODO VM_Placement: Function to set the value of the selected option */
}
// const getSelectedPlacementGroupValue = {};

('Placement Groups in ${regionFromSelectedId?.label}');

const noOptionsMessage = () => {
  if (placementGroupsInRegion === 0) {
    return 'There are no Placement Groups in this region';
  }
  if (linode_ids.length === 10) {
    return "This Placement Group doesn't have capacity";
  }
};
