module.exports = {"name":"DNS Zones","base_path":"/dns/zones","description":"DNS Zone endpoints provide a means of managing the DNS <a href=\"#object-dnszone\"> DNS Zone objects</a> on your account.\nNote: the validation rules for DNS records are too complicated to document here. We'll just direct you to [RFC 1035](https://www.ietf.org/rfc/rfc1035.txt).\n","endpoints":[{"type":"list","resource":"dnszones","authenticated":true,"description":"Manage the collection of DNS Zones your account may access.\n","methods":[{"oauth":"dnszones:view","description":"Returns a list of <a href=\"#object-dnszone\">DNS Zones</a>.\n","examples":[{"name":"curl","value":"curl -H \"Authorization: token $TOKEN\" \\\n    https://$api_root/$version/dns/zones\n"},{"name":"python","value":"import linode\nTODO\n"}],"name":"GET","resource":{"name":"DNS Zones","prefix":"dnszone","description":"DNS Zones\n","schema":[{"name":"id","type":"integer"},{"name":"dnszone","description":"The DNS Zone name.\n","editable":true,"type":"string"},{"name":"soa_email","description":"Start of Authority (SOA) contact email.\n","editable":true,"type":"string"},{"name":"description","description":"A description to keep track of this DNS Zone.\n","editable":true,"type":"string"},{"name":"refresh_sec","description":"Time interval before the DNS Zone should be refreshed, in seconds.\n","editable":true,"type":"integer"},{"name":"retry_sec","description":"Time interval that should elapse before a failed refresh should be retried, in seconds.\n","editable":true,"type":"integer"},{"name":"expire_sec","description":"Time value that specifies the upper limit on the time interval that can elapse before the DNS Zone is no longer authoritative, in seconds.\n","editable":true,"type":"integer"},{"name":"ttl_sec","description":"Time interval that the resource record may be cached before\n  it should be discarded, in seconds.\n","editable":true,"type":"integer"},{"name":"status","description":"The status of the DNS Zone it can be disabled, active, or edit_mode.\n","editable":true,"type":"enum"},{"name":"master_ips","description":"An array of IP addresses for this DNS Zone.\n","editable":true,"type":"array"},{"name":"axfr_ips","description":"An array of IP addresses allowed to AXFR the entire DNS Zone.\n","editable":true,"type":"array"},{"name":"display_group","description":"A display group to keep track of this DNS Zone.\n","editable":true,"type":"string"},{"name":"type","description":"Controls the DNS zone type.","editable":false,"type":"enum"}],"enums":[{"active":"Turn on serving of this DNS Zone.","disabled":"Turn off serving of this DNS Zone.","edit_mode":"Use this mode while making edits.","name":"status"},{"master":"A primary, authoritative DNS zone","slave":"A secondary DNS zone which gets its updates from a master DNS zone.","name":"dnszone_type"}],"endpoints":null,"methods":null,"example":{"id":357,"dnszone":"example.com","soa_email":"admin@example.com","description":"Example Description","refresh_sec":14400,"retry_sec":3600,"expire_sec":604800,"ttl_sec":3600,"status":"active","master_ips":[{},{},{}],"axfr_ips":[{}],"display_group":"Example Display Group","type":"master"}}},{"oauth":"dnszones:create","description":"Create a DNS Zone.\n","params":[{"description":"The DNS Zone name.\n","name":"dnszone"},{"description":"DNS Zone <a href=\"#object-dnszone_type-enum\">type</a> as master or slave.\n","name":"type"},{"optional":true,"description":"Start of Authority (SOA) contact email.\n","name":"soa_email"},{"optional":true,"description":"A description to keep track of this DNS Zone.\n","name":"description"},{"optional":true,"description":"Time interval before the DNS Zone should be refreshed, in seconds.\n","name":"refresh_sec"},{"optional":true,"description":"Time interval that should elapse before a failed refresh should\n  be retried, in seconds.\n","name":"retry_sec"},{"optional":true,"description":"Time value that specifies the upper limit on\n  the time interval that can elapse before the DNS Zone is no\n  longer authoritative, in seconds.\n","name":"expire_sec"},{"optional":true,"description":"Time interval that the resource record may be cached before\n  it should be discarded, in seconds.\n","name":"ttl_sec"},{"optional":true,"description":"The status of the DNS Zone; it can be disabled, active, or edit_mode.\n","name":"status"},{"optional":true,"description":"An array of IP addresses for this DNS Zone.\n","name":"master_ips"},{"optional":true,"description":"An array of IP addresses allowed to AXFR the entire DNS Zone.\n","name":"axfr_ips"},{"optional":true,"description":"A display group to keep track of this DNS Zone.\n","name":"display_group"}],"examples":[{"name":"curl","value":"curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\n        \"dnszone\": \"example.com\",\n        \"type\": \"master\",\n        \"soa_email\": \"admin@example.com\",\n        \"description\": \"Example Description\",\n        \"refresh_sec\": 14400,\n        \"retry_sec\": 3600,\n        \"expire_sec\": 604800,\n        \"ttl_sec\": 3600,\n        \"status\": \"active\",\n        \"master_ips\": [\"127.0.0.1\",\"255.255.255.1\",\"123.123.123.7\"],\n        \"axfr_ips\": [\"44.55.66.77\"],\n        \"display_group\": \"Example Display Group\"\n    }'\n    https://$api_root/$version/dns/zones\n"},{"name":"python","value":"import linode\nTODO\n"}],"name":"POST"}],"endpoints":null,"path":"dns/zones"},{"authenticated":true,"resource":"dnszone","methods":[{"oauth":"dnszones:view","description":"Returns information for the <a href=\"#object-dnszone\">DNS Zone</a> identified by :id.\n","examples":[{"name":"curl","value":"curl -H \"Authorization: token $TOKEN\" \\\n    https://$api_root/$version/dns/zones/$dnszone_id\n"},{"name":"python","value":"import linode\nTODO\n"}],"name":"GET","resource":{"name":"DNS Zones","prefix":"dnszone","description":"DNS Zones\n","schema":[{"name":"0"},{"name":"1"},{"name":"2"},{"name":"3"},{"name":"4"},{"name":"5"},{"name":"6"},{"name":"7"},{"name":"8"},{"name":"9"},{"name":"10"},{"name":"11"},{"name":"12"}],"enums":[{"active":"Turn on serving of this DNS Zone.","disabled":"Turn off serving of this DNS Zone.","edit_mode":"Use this mode while making edits.","name":"0"},{"master":"A primary, authoritative DNS zone","slave":"A secondary DNS zone which gets its updates from a master DNS zone.","name":"1"}],"endpoints":null,"methods":null,"example":{}}},{"oauth":"dnszones:modify","description":"Modifies a given DNS Zone.\n","examples":[{"name":"curl","value":"curl -H \"Content-Type: application/json\" \\\n  -H \"Authorization: token TOKEN\" \\\n  -X PUT -d '{\n    \"dnszone\": \"examplechange.com\",\n    \"description\": \"The changed description\",\n    \"display_group\": \"New display group\",\n    \"status\": \"edit_mode\",\n    \"soa_email\": \"newemail@example.com\",\n    \"retry_sec\": 3602,\n    \"master_ips\": [\"123.456.789.101\", \"192.168.1.1\", \"127.0.0.1\"],\n    \"axfr_ips\": [\"55.66.77.88\"],\n    \"expire_sec\": 604802,\n    \"refresh_sec\": 14402,\n    \"ttl_sec\": 3602\n  }'\n  https://$api_root/$version/dns/zones/$dnszone_id\n"},{"name":"python","value":"import linode\nTODO\n"}],"name":"PUT"},{"oauth":"dnszones:modify","dangerous":true,"description":"Deletes the DNS zone. This action cannot be undone.\n","examples":[{"name":"curl","value":"curl -H \"Authorization: token $TOKEN\" \\\n    -X DELETE\n    https://$api_root/$version/dns/zones/$dnszone_id\n"},{"name":"python","value":"import linode\nTODO\n"}],"name":"DELETE"}],"endpoints":null,"path":"dns/zones/:id"},{"type":"list","resource":"dnszonerecords","authenticated":true,"description":"Manage the collection of DNS Zone Records your account may access.\n","methods":[{"oauth":"dnszones:view","description":"Returns a list of <a href=\"#object-dnszonerecord\">DNS Zone Records</a>.\n","examples":[{"name":"curl","value":"curl -H \"Authorization: token $TOKEN\" \\\n    https://$api_root/$version/dns/zones/$dnszone_id/records\n"},{"name":"python","value":"import linode\nTODO\n"}],"name":"GET","resource":{"name":"DNS Zone Records","prefix":"zrcd","description":"DNS Zone Records: The DNS Zone Record fields will contain different values depending on what type of record it is.\n","schema":[{"name":"id","type":"integer"},{"name":"type","description":"Type of record (A/AAAA, NS, MX, CNAME, TXT, SRV).\n","type":"string"},{"name":"name","description":"The hostname or FQDN. When type=MX the subdomain to delegate to the Target MX server.\n","editable":true,"type":"string"},{"name":"target","description":"When type=MX the hostname. When type=CNAME the target of the alias. When type=TXT the value of the record. When type=A or AAAA the token of '[remote_addr]' will be substituted with the IP address of the request.\n","editable":true,"type":"string"},{"name":"priority","description":"Priority for MX and SRV records.\n","editable":true,"type":"integer"},{"name":"weight","description":"A relative weight for records with the same priority, higher value means more preferred.\n","editable":true,"type":"integer"},{"name":"port","description":"The TCP or UDP port on which the service is to be found.\n","editable":true,"type":"integer"},{"name":"service","description":"The service to append to an SRV record. Must conform to RFC2782 standards.\n","editable":true,"type":"string"},{"name":"protocol","description":"The protocol to append to an SRV record. Must conform to RFC2782 standards.\n","editable":true,"type":"string"},{"name":"ttl_sec","description":"Time interval that the resource record may be cached before it should be discarded, in seconds. Leave as 0 to accept our default.\n","editable":true,"type":"integer"}],"enums":[{"A":"Address Mapping Record","AAAA":"IP Version 6 Address Record","NS":"Name Server Record","MX":"Mail Exchanger Record","CNAME":"Canonical Name Record","TXT":"Text Record","SRV":"Service Record","name":"Zone Record Types"}],"endpoints":null,"methods":null,"example":{"id":468,"type":"A","name":"sub.example.com","target":"sub","priority":10,"weight":20,"port":80,"service":"_sip","protocol":"_tcp","ttl_sec":86400}}},{"oauth":"dnszones:create","description":"Create a DNS Zone Record.\n","params":[{"description":"<a href=\"#object-zone-record-types-enum\">Type</a> of record.\n","name":"type"},{"optional":true,"description":"The hostname or FQDN. When type=MX the subdomain to delegate to the Target MX server.\n","limit":"1-100 characters","name":"name"},{"optional":true,"description":"When Type=MX the hostname. When Type=CNAME the target of the alias. When Type=TXT the value of the record. When Type=A or AAAA the token of '[remote_addr]' will be substituted with the IP address of the request.\n","name":"target"},{"optional":true,"description":"Priority for MX and SRV records.\n","name":"priority"},{"optional":true,"description":"A relative weight for records with the same priority, higher value means more preferred.\n","name":"weight"},{"optional":true,"description":"The TCP or UDP port on which the service is to be found.\n","name":"port"},{"optional":true,"description":"The service to append to an SRV record.\n","name":"service"},{"optional":true,"description":"The protocol to append to an SRV record.\n","name":"protocol"},{"optional":true,"description":"Time interval that the resource record may be cached before\n  it should be discarded. In seconds. Leave as 0 to accept\n  our default.\n","name":"ttl"}],"examples":[{"name":"curl","value":"curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\n        \"type\": \"A\",\n        \"target\": \"123.456.789.101\",\n        \"name\": \"sub.example.com\"\n    }'\n    https://$api_root/$version/dns/zones/$dnszone_id/records\n"},{"name":"python","value":"import linode\nTODO\n"}],"name":"POST"}],"endpoints":null,"path":"dns/zones/:id/records"},{"authenticated":true,"resource":"dnszonerecord","methods":[{"oauth":"dnszones:view","description":"Returns information for the <a href=\"#object-dnszonerecord\">DNS Zone Record</a> identified by \":id\".\n","examples":[{"name":"curl","value":"curl -H \"Authorization: token $TOKEN\" \\\n  https://$api_root/$version/dns/zones/$dnszone_id/records/$record_id\n"},{"name":"python","value":"import linode\nTODO\n"}],"name":"GET","resource":{"name":"DNS Zone Records","prefix":"zrcd","description":"DNS Zone Records: The DNS Zone Record fields will contain different values depending on what type of record it is.\n","schema":[{"name":"0"},{"name":"1"},{"name":"2"},{"name":"3"},{"name":"4"},{"name":"5"},{"name":"6"},{"name":"7"},{"name":"8"},{"name":"9"}],"enums":[{"A":"Address Mapping Record","AAAA":"IP Version 6 Address Record","NS":"Name Server Record","MX":"Mail Exchanger Record","CNAME":"Canonical Name Record","TXT":"Text Record","SRV":"Service Record","name":"0"}],"endpoints":null,"methods":null,"example":{}}},{"oauth":"dnszones:modify","description":"Modifies a given DNS Zone Record.\n","examples":[{"name":"curl","value":"curl -H \"Content-Type: application/json\" \\\n  -H \"Authorization: token TOKEN\" \\\n  -X PUT -d '{\n        \"target\": \"123.456.789.102\",\n        \"name\": \"sub2.example.com\"\n  }'\n  https://$api_root/$version/dns/zones/$dnszone_id/records/$record_id\n"},{"name":"python","value":"import linode\nTODO\n"}],"name":"PUT"},{"oauth":"dnszones:modify","dangerous":true,"description":"Deletes the DNS Zone Record. This action cannot be undone.\n","examples":[{"name":"curl","value":"curl -H \"Authorization: token $TOKEN\" \\\n  -X DELETE\n  https://$api_root/$version/dns/zones/$dnszone_id/records/$record_id\n"},{"name":"python","value":"import linode\nTODO\n"}],"name":"DELETE"}],"endpoints":null,"path":"dns/zones/:id/records/:id"}],"basePath":"/dns/zones","methods":null};