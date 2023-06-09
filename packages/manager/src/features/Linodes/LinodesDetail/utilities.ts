export const sshLink = (ipv4: string) => {
  return `ssh root@${ipv4}`;
};

export const lishLink = (
  username: string,
  region: string,
  linodeLabel: string
) => {
  return `ssh -t ${username}@lish-${region}.linode.com ${linodeLabel}`;
};
