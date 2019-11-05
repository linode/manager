export const protocolOptions = [
  { label: 'TCP', value: 'tcp' },
  { label: 'HTTP', value: 'http' },
  { label: 'HTTPS', value: 'https' }
];

export const algorithmOptions = [
  { label: 'Round Robin', value: 'roundrobin' },
  { label: 'Least Connections', value: 'leastconn' },
  { label: 'Source', value: 'source' }
];

export const stickinessOptions = [
  { label: 'None', value: 'none' },
  { label: 'Table', value: 'table' },
  { label: 'HTTP Cookie', value: 'http_cookie' }
];

export const checkOptions = (protocol: string) => [
  {
    label: 'None',
    value: 'none'
  },
  {
    label: 'TCP Connection',
    value: 'connection'
  },
  {
    label: 'HTTP Status',
    value: 'http',
    disabled: protocol === 'tcp'
  },
  {
    label: 'HTTP Body',
    value: 'http_body',
    disabled: protocol === 'tcp'
  }
];
