export interface MenuAction {
    label: string;
    onClick: () => void;
  }
  
  export const detailActions: MenuAction[] = [
    {
      label: 'Power Off',
      onClick: () => console.log('Power Off clicked')
    },
    {
      label: 'Reboot',
      onClick: () => console.log('Reboot clicked')
    },
    {
      label: 'Launch LISH Console',
      onClick: () => console.log('Launch LISH Console clicked')
    },
    {
      label: 'Action X',
      onClick: () => console.log('Action X clicked')
    },
    {
      label: 'Action Y',
      onClick: () => console.log('Action Y clicked')
    },
    {
      label: 'Action Z',
      onClick: () => console.log('Action Z clicked')
    },
  ];