import  { Action } from 'src/components/ActionMenu';

export const actions: Action[] = [
  { title: 'Launch Console', onClick: (e) => { e.preventDefault(); } },
  { title: 'Reboot', onClick: (e) => { e.preventDefault(); } },
  { title: 'View Graphs', onClick: (e) => { e.preventDefault(); } },
  { title: 'Resize', onClick: (e) => { e.preventDefault(); } },
  { title: 'View Backups', onClick: (e) => { e.preventDefault(); } },
  { title: 'Power On', onClick: (e) => { e.preventDefault(); } },
  { title: 'Settings', onClick: (e) => { e.preventDefault(); } },
];
