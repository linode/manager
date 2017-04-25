module.exports = {"name":"Types","basePath":"/linode/types","description":"Type endpoints provide a means of viewing <a href=\"#object-service\"> service objects</a>.\n","endpoints":[{"description":"Returns collection of types.\n","endpoints":null,"methods":[{"description":"Returns list of <a href=\"#object-service\">services</a>.\n","examples":[{"name":"curl","value":"curl https://$api_root/$version/linode/services\n"},{"name":"python","value":"import services\nTODO\n"}],"name":"GET"}],"path":"linode/types"},{"description":"Returns information about a specific Linode type offered by Linode.\n","endpoints":null,"methods":[{"description":"Returns information about this <a href=\"#object-service\">service</a>.\n","examples":[{"name":"curl","value":"curl https://$api_root/$version/linode/services/$service_id\n"},{"name":"python","value":"import services\nTODO\n"}],"name":"GET"}],"path":"linode/types/:id"}],"methods":null};