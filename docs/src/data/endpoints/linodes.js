module.exports = {"name":"Linodes","basePath":"/linode/instances","description":"Linode endpoints provide a means of managing the <a href=\"#object-linode\"> Linode objects</a> on your account.\n","endpoints":[{"description":"Manage the collection of Linodes your account may access.\n","endpoints":null,"methods":[{"oauth":"linodes:view","description":"Returns a list of <a href=\"#object-linode\">Linodes</a>.\n","examples":[{"name":"curl","value":"curl -H \"Authorization: token $TOKEN\" \\\n    https://$api_root/$version/linode/instances\n"},{"name":"python","value":"import linode\nTODO\n"}],"name":"GET"},{"money":true,"oauth":"linodes:create","description":"Creates a new Linode.\n","params":{"datacenter":{"description":"A <a href=\"#object-datacenter\">datacenter</a> ID to provision this Linode in.\n","type":"datacenter"},"type":{"description":"A <a href=\"#object-service\">Linode type</a> ID to use for this Linode.\n","type":"service"},"label":{"optional":true,"description":"The label to assign this Linode. Defaults to \"linode\".","limit":"3-32 ASCII characters limited to letters, numbers, underscores, and dashes, starting and ending with a letter, and without two dashes or underscores in a row"},"group":{"optional":true,"description":"The group to assign this Linode. Defaults to \"empty\".","limit":"0-50 characters"},"distribution":{"optional":true,"description":"The <a href=\"#object-distribution\">Distribution</a> to deploy this Linode with.  May not be included if 'backup' is sent.\n","type":"distribution"},"root_pass":{"optional":"unless source == \"distro\"","description":"The root password to use when sourcing this Linode from a distribution. <ul><li>root_pass is required if the source provided is a distribution.</li></ul>\n"},"root_ssh_key":{"optional":true,"description":"A public SSH key file to install at `/root/.ssh/authorized_keys` when creating this Linode.\n"},"stackscript":{"optional":true,"description":"The stackscript ID to deploy with this disk. <ul><li>Must provide a distribution. Distribution must be one that the stackscript can be deployed to.</li></ul>\n","type":"stackscript"},"stackscript_udf_responses":{"optional":true,"description":"UDF (user-defined fields) for this stackscript. Defaults to \"{}\". <ul><li>Must match UDFs required by stackscript.</li></ul>\n","type":"string"},"backup":{"optional":true,"description":"The <a href=\"#object-backup\">Backup</a> to restore to the newly created Linode.  May not be included if 'distribution' is sent.\n","type":"backup"},"with_backup":{"optional":true,"description":"Subscribes this Linode with the Backup service. (Additional charges apply.) Defaults to \"false\".\n"}},"examples":[{"name":"curl","value":"curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\n        \"datacenter\": \"newark\",\n        \"type\": \"standard-1\"\n    }' \\\n    https://$api_root/$version/linode/instances\n"},{"name":"python","value":"import linode\nTODO\n"}],"name":"POST"}],"path":"linode/instances"},{"description":"Manage a particular Linode your account may access.\n","endpoints":null,"methods":[{"oauth":"linodes:view","description":"Returns information about this <a href=\"#object-linode\">Linode</a>.\n","examples":[{"name":"curl","value":"curl -H \"Authorization: token $TOKEN\" \\\n    https://$api_root/$version/linode/instances/$linode_id\n"},{"name":"python","value":"import linode\nTODO\n"}],"name":"GET"},{"oauth":"linodes:modify","description":"Edits this Linode.\n","examples":[{"name":"curl","value":"curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X PUT -d '{\n      \"label\": \"newlabel\",\n      \"schedule\": {\n        \"day\": \"Tuesday\",\n        \"window\": \"W20\"\n      }\n    }' \\\n    https://$api_root/$version/linode/instances/$linode_id\n"},{"name":"python","value":"import linode\nTODO\n"}],"name":"PUT"},{"oauth":"linodes:delete","dangerous":true,"description":"Deletes this Linode. This action cannot be undone.\n","examples":[{"name":"curl","value":"curl -H \"Authorization: token $TOKEN\" \\\n    -X DELETE \\\n    https://$api_root/$version/linode/instances/$linode_id\n"},{"name":"python","value":"import linode\nTODO\n"}],"name":"DELETE"}],"path":"linode/instances/:id"},{"description":"Manage the disks associated with this Linode.\n","endpoints":null,"methods":[{"oauth":"linodes:view","description":"Returns a list of <a href=\"#object-disk\">disks</a>.\n","examples":[{"name":"curl","value":"curl -H \"Authorization: token $TOKEN\" \\\n    https://$api_root/$version/linode/instances/$linode_id/disks\n"},{"name":"python","value":"import linode\nTODO\n"}],"name":"GET"},{"oauth":"linodes:modify","description":"Creates a new disk.\n","params":{"size":{"description":"Size in MB for this disk.\n","type":"integer","limit":"between 0 and the available space on the Linode"},"distribution":{"optional":true,"description":"Optional distribution to deploy with this disk. <ul><li>If no distribution is provided, a blank disk is created.</li></ul>\n","type":"distribution"},"root_pass":{"optional":"unless distribution is specified","description":"Root password to deploy distribution with. <ul><li>root_pass is required if a distribution is provided.</li></ul>\n","type":"string"},"root_ssh_key":{"optional":"unless distribution is not specified","description":"SSH key to add to root's authorized_keys.\n","type":"string"},"label":{"description":"User-friendly string to name this disk.\n","type":"string","limit":"1-50 characters"},"filesystem":{"description":"A <a href=\"#object-filesystem-enum\">filesystem</a> for this disk.\n","type":"string"},"read_only":{"optional":true,"description":"If true, this disk is read-only.\n","type":"boolean"},"stackscript":{"optional":true,"description":"The stackscript ID to deploy with this disk. <ul><li>Must provide a distribution. Distribution must be one that the stackscript can be deployed to.</li></ul>\n","type":"stackscript"},"stackscript_udf_responses":{"optional":true,"description":"UDF (user-defined fields) for this stackscript. Defaults to \"{}\". <ul><li>Must match UDFs required by stackscript.</li></ul>\n","type":"string"}},"examples":[{"name":"curl","value":"curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\n        \"label\": \"Example Disk\",\n        \"filesystem\": \"ext4\",\n        \"size\": 4096\n    }' \\\n    https://$api_root/$version/linode/instances/$linode_id/disks\n"},{"name":"python","value":"import linode\nTODO\n"}],"name":"POST"}],"path":"linode/instances/:id/disks"},{"description":"Manage a particular disk associated with this Linode.\n","endpoints":null,"methods":[{"oauth":"linodes:view","description":"Returns information about this <a href=\"#object-disk\">disk</a>.\n","examples":[{"name":"curl","value":"curl -H \"Authorization: token $TOKEN\" \\\n    https://$api_root/$version/linode/instances/$linode_id/disks/$disk_id\n"},{"name":"python","value":"import linode\nTODO\n"}],"name":"GET"},{"oauth":"linodes:modify","description":"Updates a disk's metadata.\n","examples":[{"name":"curl","value":"curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X PUT -d '{\n      \"label\": \"New Disk Label\"\n    }' \\\n    https://$api_root/$version/linode/instances/$linode_id/disks/$disk_id\n"},{"name":"python","value":"import linode\nTODO\n"}],"name":"PUT"},{"oauth":"linodes:create","description":"Duplicates this disk.\n","examples":[{"name":"curl","value":"curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST \\\n    https://$api_root/$version/linode/instances/$linode_id/disks/$disk_id\n"},{"name":"python","value":"import linode\nTODO\n"}],"name":"POST"},{"oauth":"linodes:delete","dangerous":true,"description":"Deletes this disk. This action cannot be undone.\n","examples":[{"name":"curl","value":"curl -H \"Authorization: token $TOKEN\" \\\n    -X DELETE \\\n    https://$api_root/$version/linode/instances/$linode_id/disks/$disk_id\n"},{"name":"python","value":"import linode\nTODO\n"}],"name":"DELETE"}],"path":"linode/instances/:id/disks/:id"},{"description":"Resizes the disk.","endpoints":null,"methods":[{"oauth":"linodes:modify","dangerous":true,"params":{"size":{"description":"The desired size of the disk in MB.","type":"integer"}},"examples":[{"name":"curl","value":"curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\n        \"size\": 1024\n    }' \\\n    https://$api_root/$version/linode/instances/$linode_id/disks/$disk_id/resize\n"}],"name":"POST"}],"path":"linode/instances/:id/disks/:id/resize"},{"description":"Resets the root password of a disk.\n","endpoints":null,"methods":[{"oauth":"linodes:modify","dangerous":true,"params":{"password":{"description":"New root password for the OS installed on this disk.\n","type":"string"}},"examples":[{"name":"curl","value":"curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\n        \"password\": \"hunter2\"\n    }' \\\n    https://$api_root/$version/linode/instances/$linode_id/disks/$disk_id/password\n"},{"name":"python","value":"import linode\nTODO\n"}],"name":"POST"}],"path":"linode/instances/:id/disks/:id/password"},{"description":"Manage the boot configs on this Linode.\n","endpoints":null,"methods":[{"oauth":"linodes:view","description":"Returns a list of <a href=\"#object-linode_config\">configs</a> for a given Linode.\n","examples":[{"name":"curl","value":"curl -H \"Authorization: token $TOKEN\" \\\n    https://$api_root/$version/linode/instances/$linode_id/configs\n"},{"name":"python","value":"import linode\nTODO\n"}],"name":"GET"},{"oauth":"linodes:modify","description":"Creates a new config for a given Linode.\n","params":{"kernel":{"description":"A <a href=\"#object-kernel\">kernel</a> ID to boot this Linode with.\n","type":"kernel"},"label":{"description":"The user-friendly label to name this config.\n","limit":"1-48 characters"},"disks":{"description":"<a href=\"#object-disk\">Disks</a> attached to this Linode config.\n"},"comments":{"optional":true,"description":"Optional field for arbitrary user comments on this config.\n","limit":"1-255 characters"},"ram_limit":{"optional":true,"description":"The maximum RAM the Linode will be given when booting this config. This defaults to the total RAM of the Linode.\n","limit":"between 0 and the Linode's total RAM"},"root_device_ro":{"optional":true,"description":"Controls whether to mount the root disk read-only. Defaults to false.\n"},"devtmpfs_automount":{"optional":true,"description":"Populates the /dev directory early during boot without udev. Defaults to false.\n"},"run_level":{"optional":true,"description":"Sets the <a href=\"#object-run_level-enum\">run level</a> for Linode boot. Defaults to \"default\".\n"},"virt_mode":{"optional":true,"description":"Controls the <a href=\"#object-virt_mode-enum\">virtualization mode</a>. Defaults to \"paravirt\".\n"}},"examples":[{"name":"curl","value":"curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\n        \"label\": \"Arch Linux config\",\n        \"kernel\": \"linode/latest_64\",\n        \"disks\": {\n          \"sda\": 5567,\n          \"sdb\": 5568\n          }\n        }\n    }' \\\n    https://$api_root/$version/linode/instances/$linode_id/configs\n"},{"name":"python","value":"import linode\nTODO\n"}],"name":"POST"}],"path":"linode/instances/:id/configs"},{"description":"Manage a particular config for a given Linode.\n","endpoints":null,"methods":[{"oauth":"linodes:view","description":"Returns information about this <a href=\"#object-linode_config\"> Linode config</a>.\n","examples":[{"name":"curl","value":"curl -H \"Authorization: token $TOKEN\" \\\n    https://$api_root/$version/linode/instances/$linode_id/configs/$config_id\n"},{"name":"python","value":"import linode\nTODO\n"}],"name":"GET"},{"oauth":"linodes:modify","description":"Modifies a given Linode config.\n","examples":[{"name":"curl","value":"curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X PUT -d '{\n        \"label\": \"Edited config\",\n        \"kernel\": {\n          \"id\": \"linode/latest_64\"\n        },\n        \"disks\": {\n          \"sda\": {\n            \"id\": 5567\n          }\n        }\n    }' \\\n    https://$api_root/$version/linode/instances/$linode_id/configs/$config_id\n"},{"name":"python","value":"import linode TODO"}],"name":"PUT"},{"oauth":"linodes:modify","description":"Deletes a given Linode config.\n","examples":[{"name":"curl","value":"curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X DELETE \\\n    https://$api_root/$version/linode/instances/$linode_id/configs/$config_id\n"},{"name":"python","value":"import linode\nTODO\n"}],"name":"DELETE"}],"path":"linode/instances/:id/configs/:id"},{"description":"Boots a Linode.\n","endpoints":null,"methods":[{"oauth":"linodes:modify","dangerous":false,"params":{"config":{"optional":true,"description":"Optional config ID to boot the linode with.\n","type":"linode_config"}},"examples":[{"name":"curl","value":"curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\n        \"config\": 5567\n    }' \\\n    https://$api_root/$version/linode/instances/$linode_id/boot\n"},{"name":"python","value":"import linode\nTODO\n"}],"name":"POST"}],"path":"linode/instances/:id/boot"},{"description":"Shuts down a Linode.\n","endpoints":null,"methods":[{"oauth":"linodes:modify","dangerous":true,"examples":[{"name":"curl","value":"curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST \\\n    https://$api_root/$version/linode/instances/$linode_id/shutdown\n"},{"name":"python","value":"import linode\nTODO\n"}],"name":"POST"}],"path":"linode/instances/:id/shutdown"},{"description":"Reboots a Linode.\n","endpoints":null,"methods":[{"oauth":"linodes:modify","dangerous":true,"params":{"config":{"optional":true,"description":"Optional config ID to boot the linode with.\n","type":"linode_config"}},"examples":[{"name":"curl","value":"curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\n        \"config\": 5567\n\n    }' \\\n    https://$api_root/$version/linode/instances/$linode_id/reboot\n"},{"name":"python","value":"import linode\nTODO\n"}],"name":"POST"}],"path":"linode/instances/:id/reboot"},{"description":"Changes a Linode's hypervisor from Xen to KVM.\n","endpoints":null,"methods":[{"oauth":"linodes:modify","dangerous":true,"examples":[{"name":"curl","value":"curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST \\\n    https://$api_root/$version/linode/instances/$linode_id/kvmify\n"},{"name":"python","value":"import linode\nTODO\n"}],"name":"POST"}],"path":"linode/instances/:id/kvmify"},{"description":"Reboots a Linode in Rescue Mode.\n","endpoints":null,"methods":[{"oauth":"linodes:modify","dangerous":false,"params":{"disks":{"optional":true,"description":"<a href=\"#object-disk\">Disks</a> to include during Rescue.\n","type":"disk"}},"examples":[{"name":"curl","value":"curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\n        \"disks\": {\n          \"sda\": 5567,\n          \"sdb\": 5568\n          }\n        }\n    }' \\\n    https://$api_root/$version/linode/instances/$linode_id/rescue\n"},{"name":"python","value":"import linode\nTODO\n"}],"name":"POST"}],"path":"linode/instances/:id/rescue"},{"description":"Resizes a Linode to a new <a href=\"#object-service\">Linode type</a>.\n","endpoints":null,"methods":[{"money":true,"oauth":"linodes:modify","dangerous":false,"params":{"type":{"description":"A <a href=\"#object-service\">Linode type</a> to use for this Linode.\n","type":"service"}},"examples":[{"name":"curl","value":"curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\n        \"type\": \"standard-1\"\n        }\n    }' \\\n    https://$api_root/$version/linode/instances/$linode_id/resize\n"}],"name":"POST"}],"path":"linode/instances/:id/resize"},{"description":"Returns information about this Linode's available <a href=\"#object-backup\">backups</a>.\n","endpoints":null,"methods":[{"description":"Returns a <a href=\"#object-backupsresponse\">Backups Response</a> with information on this Linode's available backups.\n","oauth":"linodes:view","examples":[{"name":"curl","value":"curl -H \"Authorization: token $TOKEN\" \\\n    https://$api_root/$version/linode/instances/$linode_id/backups\n"},{"name":"python","value":"import linode\nTODO\n"}],"name":"GET"},{"oauth":"linodes:modify","dangerous":true,"description":"Creates a snapshot backup of a Linode. <div class=\"alert alert-danger\">\n  <strong>WARNING</strong>\n  <p>\n    If you already have a snapshot, this is a destructive operation.\n    The previous snapshot will be deleted.\n  </p>\n</div>\n","params":{"label":{"optional":true,"description":"Human-friendly label for this snapshot. Must be 1-50 characters.\n"}},"examples":[{"name":"curl","value":"curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\n        \"label\": \"Linode123456 snapshot\",\n    }' \\\n    https://$api_root/$version/linode/instances/$linode_id/backups\n"},{"name":"python","value":"import linode\nTODO\n"}],"name":"POST"}],"path":"linode/instances/:id/backups"},{"description":"Enables the <a href=\"#object-backup\">backup</a> service on the given Linode.\n","endpoints":null,"methods":[{"money":true,"oauth":"linodes:modify","dangerous":true,"examples":[{"name":"curl","value":"curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST \\\n    https://$api_root/$version/linode/instances/$linode_id/backups/enable\n"},{"name":"python","value":"import linode\nTODO\n"}],"name":"POST"}],"path":"linode/instances/:id/backups/enable"},{"description":"Cancels the <a href=\"#object-backup\">backup</a> service on the given Linode.\n","endpoints":null,"methods":[{"oauth":"linodes:delete","dangerous":true,"examples":[{"name":"curl","value":"curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST \\\n    https://$api_root/$version/linode/instances/$linode_id/backups/cancel\n"},{"name":"python","value":"import linode\nTODO\n"}],"name":"POST"}],"path":"linode/instances/:id/backups/cancel"},{"description":"Restores a <a href=\"#object-backup\">backup</a> to a Linode.\n","endpoints":null,"methods":[{"oauth":"linodes:create","dangerous":true,"params":{"linode":{"description":"The ID of the Linode to restore a backup to.\n","type":"linode"},"overwrite":{"description":"If true, deletes all disks and configs on the target linode before restoring.\n","type":"boolean","optional":true}},"examples":[{"name":"curl","value":"curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\n        \"linode\": 123456,\n    }' \\\n    https://$api_root/$version/linode/instances/$linode_id/backups/$backup_id/restore\n"},{"name":"python","value":"import linode\nTODO\n"}],"name":"POST"}],"path":"linode/instances/:id/backups/:id/restore"},{"description":"View networking information for this Linode.\n","endpoints":null,"methods":[{"oauth":"linodes:view","description":"Returns a <a href=\"#object-linodenetworking\">Linode Networking Object</a>.\n","examples":[{"name":"curl","value":"curl -H \"Authorization: token $TOKEN\" \\\n    https://$api_root/$version/linode/instances/$linode_id/ips\n"}],"name":"GET"},{"money":true,"oauth":"linodes:modify","description":"Allocates a new IP Address for this Linode.\n","params":{"type":{"description":"An <a href=\"#object-ipaddresstype-enum\">IP Address Type</a> for this IP Address. Public IP's incur a monthly cost.\n","type":"IPAddressType"}},"examples":[{"name":"curl","value":"curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\n        \"type\": \"private\"\n    }' \\\n    https://$api_root/$version/linode/instances/$linode_id/ips\n"}],"name":"POST"}],"path":"linode/instances/:id/ips"},{"endpoints":null,"methods":[{"description":"Sets IP Sharing for this Linode.\n","params":{"ips":{"type":"list","subtype":"string","description":"A list of IP Addresses this Linode will share.\n"}},"example":{"curl":"curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\n      \"ips\": [ \"97.107.143.29\", \"97.107.143.112\" ]\n    }' \\\n    https://$api_root/$version/linode/instances/$linode_id/ips/sharing\n"},"name":"POST"}],"path":"linode/instances/:id/ips/sharing"},{"description":"Manage a particular IP Address associated with this Linode.\n","endpoints":null,"methods":[{"oauth":"linodes:view","description":"Returns information about this <a href=\"#object-ipaddress\">IPv4</a> or <a href=\"#object-ipv6-address\">IPv6</a> Address.\n","examples":[{"name":"curl","value":"curl -H \"Authorization: token $TOKEN\" \\\n    https://$api_root/$version/linode/instances/$linode_id/ips/$ip_address\n"}],"name":"GET"},{"oauth":"linodes:modify","description":"Update this IP Address\n","examples":[{"name":"curl","value":"curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X PUT -d '{\n        \"rdns\":\"example.org\"\n    }' \\\n    https://$api_root/$version/linode/instances/$linode_id/ips/$ip_address\n"}],"name":"PUT"}],"path":"linode/instances/:id/ips/:ip_address"},{"description":"Deletes all Disks and Configs on this Linode, then deploys a new Distribution to this Linode with the given attributes.\n","endpoints":null,"methods":[{"oauth":"linodes:modify","dangerous":true,"params":{"distribution":{"description":"An <a href=\"#object-ipaddresstype-enum\">Distribution</a> to deploy to this Linode.\n","type":"Distribution"},"root_pass":{"description":"The root password for the new deployment.\n","type":"string"},"root_ssh_key":{"optional":true,"description":"The key to authorize for root access to the new deployment.\n","type":"string"},"stackscript":{"optional":true,"description":"The stackscript ID to deploy with this disk. <ul><li>Must provide a distribution. Distribution must be one that the stackscript can be deployed to.</li></ul>\n","type":"stackscript"},"stackscript_udf_responses":{"optional":true,"description":"UDF (user-defined fields) for this stackscript. Defaults to \"{}\". <ul><li>Must match UDFs required by stackscript.</li></ul>\n","type":"string"}},"examples":[{"name":"curl","value":"curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST \\\n    https://$api_root/$version/linode/instances/$linode_id/rebuild \\\n    -d '{\"distribution\":\"linode/debian8\",\"root_pass\":\"hunter7\"}'\n"}],"name":"POST"}],"path":"linode/instances/:id/rebuild"}],"methods":null};