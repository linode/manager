import _ from 'lodash';


export function scopeFormat(scope) {
  return {
    ips: 'IPs',
    nodebalancers: 'NodeBalancers',
    stackscripts: 'StackScripts',
  }[scope] || _.capitalize(scope);
}
