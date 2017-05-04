const backup = require('./backup');
const backupsresponse = require('./backupsresponse');
const datacenter = require('./datacenter');
const disk = require('./disk');
const distribution = require('./distribution');
const dnszone = require('./dnszone');
const dnszonerecord = require('./dnszonerecord');
const event = require('./event');
const ipaddress = require('./ipaddress');
const ipv6address = require('./ipv6-address');
const ipv6pool = require('./ipv6pool');
const kernel = require('./kernel');
const linode = require('./linode');
const linodeConfig = require('./linode_config');
const linodenetworking = require('./linodenetworking');
const nodebalancerConfigNode = require('./nodebalancer_config_node');
const oauthclient = require('./oauthclient');
const oauthtoken = require('./oauthtoken');
const profile = require('./profile');
const service = require('./service');
const stackscript = require('./stackscript');
const supportticket = require('./supportticket');
const supportticketreply = require('./supportticketreply');
const user = require('./user');
const usergrants = require('./usergrants');

module.exports.apiObjectMap = {
  backupsresponse,
  datacenter,
  disk,
  distribution,
  dnszone,
  dnszonerecord,
  event,
  ipaddress,
  ipv6address,
  ipv6pool,
  kernel,
  linode,
  linodeConfig,
  linodenetworking,
  nodebalancerConfigNode,
  oauthclient,
  oauthtoken,
  profile,
  service,
  stackscript,
  supportticket,
  supportticketreply,
  user,
  usergrants,
};
