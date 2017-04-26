module.exports = {"name":"Service","prefix":"serv","description":"Service objects describe a service available for purchase from Linode. Provisioning new infrastructure generally involves including a service ID with the request.\n","schema":{"id":{"_type":"string","_value":"linode2048.5"},"storage":{"_type":"integer","_value":24576,"_description":"If applicable, disk space in MB.","_filterable":true},"backups_price":{"_type":"integer","_value":250,"_description":"Cost (in cents) per month if backups are enabled.","_filterable":false},"hourly_price":{"_type":"integer","_value":1,"_description":"Cost (in cents) per hour.","_filterable":true},"label":{"_type":"string","_value":"Linode 2048","_description":"Human-friendly name of this service.","_filterable":true},"mbits_out":{"_type":"integer","_value":125,"_description":"If applicable, Mbits outbound bandwidth.","_filterable":true},"monthly_price":{"_type":"integer","_value":1000,"_description":"Cost (in cents) per month.","_filterable":true},"ram":{"_type":"integer","_value":2048,"_description":"Amount of RAM included in this service.","_filterable":true},"service_type":{"_type":"enum","_subtype":"Service Type","_value":"linode","_description":"The type of service offered.","_filterable":true},"transfer":{"_type":"integer","_value":2000,"_description":"If applicable, outbound transfer in MB.","_filterable":true},"vcpus":{"_type":"integer","_value":2,"_description":"If applicable, number of CPU cores.","_filterable":true}},"enums":{"Service Type":{"linode":"A Linode service.","backup":"A backup service.","nodebalancer":"A NodeBalancer service.","longview":"A Longview subscription."}},"endpoints":null,"methods":null};