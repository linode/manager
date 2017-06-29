import _ from 'lodash';


export function formatScope(scope) {
  return {
    ips: 'IPs',
    nodebalancers: 'NodeBalancers',
    stackscripts: 'StackScripts',
  }[scope] || _.capitalize(scope);
}
