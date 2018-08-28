import { LinodeVolumeActionMenu } from './LinodeVolumesActionMenu';

const poweredOnMenu = new LinodeVolumeActionMenu({
  onEdit: () => null,
  onDelete: () => null,
  onDetach: () => null,
  onClone: () => null,
  onResize: () => null,
  poweredOff: false,
  });

const poweredOffMenu = new LinodeVolumeActionMenu({
  onEdit: () => null,
  onDelete: () => null,
  onDetach: () => null,
  onClone: () => null,
  onResize: () => null,
  poweredOff: true,
  });

const getActionTitles = (component:any) => {
  const actionsGenerator = component.createLinodeActions();
  return actionsGenerator(() => null).map((action:any) => action.title);
}

describe('Linode Volumes Action Menu', () => {
  it('should not include a delete action when the Linode is powered on', () => {
    const actions = getActionTitles(poweredOnMenu);
    expect(actions.includes('Delete')).toBeFalsy();
  });

  it ('should display the delete action if the Linode is powered off', () => {
    const actions = getActionTitles(poweredOffMenu);
    expect(actions.includes('Delete')).toBeTruthy();
  })
});