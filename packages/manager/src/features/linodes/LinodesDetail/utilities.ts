import { ZONES } from 'src/constants';

export const sshLink = (ipv4: string) => {
  return `ssh root@${ipv4}`;
};

export const lishLink = (
  username: string,
  region: string,
  linodeLabel: string
) => {
  const zoneName = ZONES[region];
  return `ssh -t ${username}@lish-${zoneName}.linode.com ${linodeLabel}`;
};
