import capitalize from 'lodash/capitalize';

export function formatScope(scope) {
  return {
    ips: 'IPs',
    nodebalancers: 'NodeBalancers',
    stackscripts: 'StackScripts',
  }[scope] || capitalize(scope);
}
