export interface DataItemType {
  label: string;
  value: string;
}

export interface ColumnConfig {
  title: string;
  items: DataItemType[];
  backgroundColor?: string;
}

export const summaryData: ColumnConfig = {
  title: 'Summary',
  items: [
    { label: 'Status', value: 'Running' },
    { label: 'CPU Core', value: '1' },
    { label: 'Storage', value: '25 GB' },
    { label: 'RAM', value: '1 GB' },
    { label: 'Volumes', value: '0' },
    { label: 'Linode ID', value: '78979699' },
    { label: 'Plan', value: 'Nanode 1 GB' },
    { label: 'Region', value: 'US, Atlanta, GA' },
    { label: 'Encryption', value: 'Encrypted' },
    { label: 'Created', value: '2025-06-20 13:35' },
  ]
};

export const vpcData: ColumnConfig = {
  title: 'VPC',
  items: [
    { label: 'Address 1', value: '50.116.6.212' },
    { label: 'Address 2', value: '2600:3c00::f03c:92ff:fee2:6c40/64' },
    { label: 'View all IP Addresses', value: '' },
  ]
};

export const publicIpData: ColumnConfig = {
  title: 'Public IP',
  items: [
    { label: 'Address 1', value: '50.116.6.212' },
    { label: 'Address 2', value: '2600:3c00::f03c:92ff:fee2:6c40/64' },
    { label: 'View all IP Addresses', value: '' },
  ]
};

export const accessData: ColumnConfig = {
  title: 'Access',
  items: [
    { label: 'SSH Access', value: 'ssh root@50.116.6.212' },
    {
      label: 'LISH Console via SSH',
      value: 'ssh -t mock-user@lish-us-ord.linode.com linode-detail',
    },
  ]
};

export const firewallData: ColumnConfig = {
  title: 'Firewall',
  items: [
    { label: 'Label', value: 'mock-firewall-1' },
    { label: 'ID', value: '112233' },
  ]
};