module.exports = { endpoints: [
  {
    "name": "Linodes",
    "path": "/linode",
    "formattedEndpoints": [
      {
        "name": "Distributions",
        "sort": 2,
        "base_path": "/linode/distributions",
        "description": "Distribution endpoints provide a means of viewing distribution objects.\n",
        "path": "/linode",
        "formattedEndpoints": [
          {
            "type": "list",
            "resource": "distributions",
            "description": "View the collection of distributions.\n",
            "methods": [
              {
                "description": "Returns a list of distributions.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl https://$api_root/$version/linode/distributions\n"
                  },
                  {
                    "name": "python",
                    "value": "import distributions\nTODO\n"
                  }
                ],
                "name": "GET",
                "resource": {
                  "name": "Distribution",
                  "prefix": "dist",
                  "description": "Distribution objects describe a Linux distribution supported by Linode.\n",
                  "schema": [
                    {
                      "name": "id",
                      "type": "string",
                      "value": "linode/Arch2014.10"
                    },
                    {
                      "name": "created",
                      "type": "datetime",
                      "value": "2014-12-24T18:00:09.000Z"
                    },
                    {
                      "name": "label",
                      "description": "The user-friendly name of this distribution.",
                      "type": "string",
                      "value": "Arch Linux 2014.10"
                    },
                    {
                      "name": "minimum_storage_size",
                      "description": "The minimum size required for the distrbution image.",
                      "type": "integer",
                      "value": 800
                    },
                    {
                      "name": "recommended",
                      "description": "True if this distribution is recommended by Linode.",
                      "type": "boolean",
                      "value": true
                    },
                    {
                      "name": "vendor",
                      "description": "The upstream distribution vendor. Consistent between releases of a distro.",
                      "type": "string",
                      "value": "Arch"
                    },
                    {
                      "name": "x64",
                      "description": "True if this is a 64-bit distribution.",
                      "type": "boolean",
                      "value": true
                    }
                  ]
                }
              }
            ],
            "path": "/linode/distributions",
            "formattedEndpoints": []
          },
          {
            "type": "resource",
            "resource": "distributions",
            "description": "Returns information about a specific distribution.\n",
            "methods": [
              {
                "description": "Returns information about this distribution.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl https://$api_root/$version/linode/distributions/$distribution_id\n"
                  },
                  {
                    "name": "python",
                    "value": "import distributions\nTODO\n"
                  }
                ],
                "name": "GET",
                "resource": {
                  "name": "Distribution",
                  "prefix": "dist",
                  "description": "Distribution objects describe a Linux distribution supported by Linode.\n",
                  "schema": [
                    {
                      "name": "0"
                    },
                    {
                      "name": "1"
                    },
                    {
                      "name": "2",
                      "description": "The user-friendly name of this distribution."
                    },
                    {
                      "name": "3",
                      "description": "The minimum size required for the distrbution image."
                    },
                    {
                      "name": "4",
                      "description": "True if this distribution is recommended by Linode."
                    },
                    {
                      "name": "5",
                      "description": "The upstream distribution vendor. Consistent between releases of a distro."
                    },
                    {
                      "name": "6",
                      "description": "True if this is a 64-bit distribution."
                    }
                  ]
                }
              }
            ],
            "path": "/linode/distributions/:id",
            "formattedEndpoints": []
          }
        ],
        "methods": null
      },
      {
        "name": "Kernels",
        "sort": 3,
        "base_path": "/linode/kernels",
        "description": "Kernel endpoints provide a means of viewing kernel objects.\n",
        "path": "/linode",
        "formattedEndpoints": [
          {
            "type": "list",
            "resource": "kernels",
            "description": "Returns collection of kernels.\n",
            "methods": [
              {
                "description": "Returns list of kernels.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl https://$api_root/$version/linode/kernels\n"
                  },
                  {
                    "name": "python",
                    "value": "import kernels\nTODO\n"
                  }
                ],
                "name": "GET",
                "resource": {
                  "name": "Kernel",
                  "prefix": "krnl",
                  "description": "Kernel objects describe a Linux kernel that can be booted on a Linode. Some special kernels are available that have special behavior, such as \"Direct Disk\", which will boot your disk directly instead of supplying a kernel directly to the hypervisor. The latest kernels are \"linode/latest_64\" (64 bit) and \"linode/latest\" (32bit).\n",
                  "schema": [
                    {
                      "name": "id",
                      "type": "string",
                      "value": "linode/3.5.2-x86_64-linode26"
                    },
                    {
                      "name": "description",
                      "description": "Additional, descriptive text about the kernel.",
                      "type": "string",
                      "value": "null"
                    },
                    {
                      "name": "xen",
                      "description": "If this kernel is suitable for Xen Linodes.",
                      "type": "boolean",
                      "value": false
                    },
                    {
                      "name": "kvm",
                      "description": "If this kernel is suitable for KVM Linodes.",
                      "type": "boolean",
                      "value": true
                    },
                    {
                      "name": "label",
                      "description": "The friendly name of this kernel.",
                      "type": "string",
                      "value": "3.5.2-x86_64-linode26"
                    },
                    {
                      "name": "version",
                      "description": "Linux Kernel version.",
                      "type": "string",
                      "value": "3.5.2"
                    },
                    {
                      "name": "x64",
                      "description": "True if this is a 64-bit kernel, false for 32-bit.",
                      "type": "boolean",
                      "value": true
                    },
                    {
                      "name": "current",
                      "type": "boolean",
                      "value": true
                    },
                    {
                      "name": "deprecated",
                      "type": "boolean",
                      "value": false
                    },
                    {
                      "name": "latest",
                      "type": "boolean",
                      "value": true
                    }
                  ]
                }
              }
            ],
            "path": "/linode/kernels",
            "formattedEndpoints": []
          },
          {
            "type": "resource",
            "resource": "kernels",
            "description": "Returns information about a specific kernel.\n",
            "methods": [
              {
                "description": "Returns information about this kernel.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl https://$api_root/$version/linode/kernels/$kernel_id\n"
                  },
                  {
                    "name": "python",
                    "value": "import kernels\nTODO\n"
                  }
                ],
                "name": "GET",
                "resource": {
                  "name": "Kernel",
                  "prefix": "krnl",
                  "description": "Kernel objects describe a Linux kernel that can be booted on a Linode. Some special kernels are available that have special behavior, such as \"Direct Disk\", which will boot your disk directly instead of supplying a kernel directly to the hypervisor. The latest kernels are \"linode/latest_64\" (64 bit) and \"linode/latest\" (32bit).\n",
                  "schema": [
                    {
                      "name": "0"
                    },
                    {
                      "name": "1",
                      "description": "Additional, descriptive text about the kernel."
                    },
                    {
                      "name": "2",
                      "description": "If this kernel is suitable for Xen Linodes."
                    },
                    {
                      "name": "3",
                      "description": "If this kernel is suitable for KVM Linodes."
                    },
                    {
                      "name": "4",
                      "description": "The friendly name of this kernel."
                    },
                    {
                      "name": "5",
                      "description": "Linux Kernel version."
                    },
                    {
                      "name": "6",
                      "description": "True if this is a 64-bit kernel, false for 32-bit."
                    },
                    {
                      "name": "7"
                    },
                    {
                      "name": "8"
                    },
                    {
                      "name": "9"
                    }
                  ]
                }
              }
            ],
            "path": "/linode/kernels/:id",
            "formattedEndpoints": []
          }
        ],
        "methods": null
      },
      {
        "name": "Linodes",
        "sort": 0,
        "base_path": "/linode/instances",
        "description": "Linode endpoints provide a means of managing the Linode objects on your account.\n",
        "path": "/linode",
        "formattedEndpoints": [
          {
            "type": "list",
            "resource": "linode",
            "authenticated": true,
            "description": "Manage the collection of Linodes your account may access.\n",
            "methods": [
              {
                "oauth": "linodes:view",
                "description": "Returns a list of Linodes.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n    https://$api_root/$version/linode/instances\n"
                  },
                  {
                    "name": "python",
                    "value": "import linode\nTODO\n"
                  }
                ],
                "name": "GET",
                "resource": {
                  "name": "Linode",
                  "prefix": "lnde",
                  "description": "Linode objects describe a single Linode on your account.\n",
                  "schema": [
                    {
                      "name": "id",
                      "description": "This Linode's ID",
                      "type": "integer",
                      "value": 123456
                    },
                    {
                      "name": "alerts",
                      "description": "Toggle and set thresholds for receiving email alerts. <ul> <li>CPU Usage - % - Average CPU usage over 2 hours exceeding this value triggers this alert. (Range 0-2000, default 90)</li> <li>Disk IO Rate - IO Ops/sec - Average Disk IO ops/sec over 2 hours exceeding this value triggers this alert. (Range 0-100000, default 10000)</li> <li>Incoming Traffic - Mbit/s - Average incoming traffic over a 2 hour period exceeding this value triggers this alert. (Range 0-40000, default 10)</li> <li>Outbound Traffic - Mbit/s - Average outbound traffic over a 2 hour period exceeding this value triggers this alert. (Range 0-10000, default 10)</li> <li>Transfer Quota - % - Percentage of network transfer quota used being greater than this value will trigger this alert. (Range 0-400, default 80)</li></ul>\n"
                    },
                    {
                      "name": "backups",
                      "description": "Displays if backups are enabled, last backup datetime if applicable, and the day/window your backups will occur. Window is prefixed by a \"W\" and an integer representing the two-hour window in 24-hour UTC time format. For example, 2AM is represented as \"W2\", 8PM as \"W20\", etc. (W0, W2, W4...W22)\n"
                    },
                    {
                      "name": "created",
                      "type": "datetime",
                      "value": "2015-09-29T11:21:01"
                    },
                    {
                      "name": "region",
                      "description": "This Linode's region.",
                      "type": "region"
                    },
                    {
                      "name": "distribution",
                      "description": "The distribution that this Linode booted to last.",
                      "type": "distribution"
                    },
                    {
                      "name": "group",
                      "description": "This Linode's display group.",
                      "editable": true,
                      "type": "string",
                      "value": "Example"
                    },
                    {
                      "name": "ipv4",
                      "description": "This Linode's IPv4 addresses.",
                      "editable": false,
                      "type": "array",
                      "value": [
                        "97.107.143.8",
                        "192.168.149.108"
                      ]
                    },
                    {
                      "name": "ipv6",
                      "description": "This Linode's IPv6 slaac address.",
                      "editable": false,
                      "type": "string",
                      "value": "2a01:7e00::f03c:91ff:fe96:46f5/64"
                    },
                    {
                      "name": "label",
                      "description": "This Linode's display label.",
                      "editable": true,
                      "type": "string",
                      "value": "Example Linode"
                    },
                    {
                      "name": "type",
                      "description": "The type of Linode.",
                      "type": "array",
                      "value": [
                        {
                          "id": {
                            "_type": "string",
                            "_value": "g5-standard-1"
                          },
                          "backups_price": {
                            "_type": "integer",
                            "_value": 250
                          },
                          "class": {
                            "_type": "string",
                            "_value": "standard"
                          },
                          "disk": {
                            "_type": "integer",
                            "_value": 24576
                          },
                          "hourly_price": {
                            "_type": "integer",
                            "_value": 1
                          },
                          "label": {
                            "_type": "string",
                            "_value": "Linode 2048"
                          },
                          "mbits_out": {
                            "_type": "integer",
                            "_value": 125
                          },
                          "monthly_price": {
                            "_type": "integer",
                            "_value": 1000
                          },
                          "ram": {
                            "_type": "integer",
                            "_value": 2048
                          },
                          "service_type": {
                            "_type": "enum",
                            "_subtype": "Service Type",
                            "_value": "linode"
                          },
                          "storage": {
                            "_type": "integer",
                            "_value": 24576
                          },
                          "transfer": {
                            "_type": "integer",
                            "_value": 2000
                          },
                          "vcpus": {
                            "_type": "integer",
                            "_value": 2
                          }
                        }
                      ]
                    },
                    {
                      "name": "status",
                      "description": "The current state of this Linode.",
                      "type": "enum",
                      "value": "running"
                    },
                    {
                      "name": "total_transfer",
                      "description": "The amount of outbound traffic used this month.",
                      "type": "integer",
                      "value": 20000
                    },
                    {
                      "name": "updated",
                      "description": "The last updated datetime for this Linode record.",
                      "type": "datetime",
                      "value": "2015-10-27T09:59:26.000Z"
                    },
                    {
                      "name": "hypervisor",
                      "description": "The hypervisor this Linode is running on.",
                      "type": "enum",
                      "value": "kvm"
                    }
                  ],
                  "enums": [
                    {
                      "offline": "The Linode is powered off.",
                      "booting": "The Linode is currently booting up.",
                      "running": "The Linode is currently running.",
                      "shutting_down": "The Linode is currently shutting down.",
                      "rebooting": "The Linode is rebooting.",
                      "provisioning": "The Linode is being created.",
                      "deleting": "The Linode is being deleted.",
                      "migrating": "The Linode is being migrated to a new host/region.",
                      "name": "Status"
                    },
                    {
                      "pending": "Backup is in the queue and waiting to begin.",
                      "running": "Linode in the process of being backed up.",
                      "needsPostProcessing": "Backups awaiting final integration into existing backup data.",
                      "successful": "Backup successfully completed.",
                      "failed": "Linode backup failed.",
                      "userAborted": "User aborted current backup process.",
                      "name": "BackupStatus"
                    },
                    {
                      "auto": "Automatic backup",
                      "snapshot": "User-initiated, manual file backup",
                      "name": "BackupType"
                    },
                    {
                      "W0": "0000 - 0200 UTC",
                      "W2": "0200 - 0400 UTC",
                      "W4": "0400 - 0600 UTC",
                      "W6": "0600 - 0800 UTC",
                      "W8": "0800 - 1000 UTC",
                      "W10": "1000 - 1200 UTC",
                      "W12": "1200 - 1400 UTC",
                      "W14": "1400 - 1600 UTC",
                      "W16": "1600 - 1800 UTC",
                      "W18": "1800 - 2000 UTC",
                      "W20": "2000 - 2200 UTC",
                      "W22": "2200 - 0000 UTC",
                      "name": "Window"
                    },
                    {
                      "kvm": "KVM",
                      "xen": "Xen",
                      "name": "Hypervisor"
                    }
                  ]
                }
              },
              {
                "money": true,
                "oauth": "linodes:create",
                "description": "Creates a new Linode.\n",
                "params": [
                  {
                    "description": "A region ID to provision this Linode in.\n",
                    "type": "region",
                    "name": "region"
                  },
                  {
                    "description": "A Linode type ID to use for this Linode.\n",
                    "type": "service",
                    "name": "type"
                  },
                  {
                    "optional": true,
                    "description": "The label to assign this Linode. Defaults to \"linode\".",
                    "limit": "3-32 ASCII characters limited to letters, numbers, underscores, and dashes, starting and ending with a letter, and without two dashes or underscores in a row",
                    "name": "label"
                  },
                  {
                    "optional": true,
                    "description": "The group to assign this Linode. Defaults to \"empty\".",
                    "limit": "0-50 characters",
                    "name": "group"
                  },
                  {
                    "optional": true,
                    "description": "The Distribution to deploy this Linode with.  May not be included if 'backup' is sent.\n",
                    "type": "distribution",
                    "name": "distribution"
                  },
                  {
                    "optional": "unless source == \"distro\"",
                    "description": "The root password to use when sourcing this Linode from a distribution. <ul><li>root_pass is required if the source provided is a distribution.</li></ul>\n",
                    "name": "root_pass"
                  },
                  {
                    "optional": true,
                    "description": "A public SSH key file to install at `/root/.ssh/authorized_keys` when creating this Linode.\n",
                    "name": "root_ssh_key"
                  },
                  {
                    "optional": true,
                    "description": "The stackscript ID to deploy with this disk. <ul><li>Must provide a distribution. Distribution must be one that the stackscript can be deployed to.</li></ul>\n",
                    "type": "stackscript",
                    "name": "stackscript"
                  },
                  {
                    "optional": true,
                    "description": "UDF (user-defined fields) for this stackscript. Defaults to \"{}\". <ul><li>Must match UDFs required by stackscript.</li></ul>\n",
                    "type": "string",
                    "name": "stackscript_udf_responses"
                  },
                  {
                    "optional": true,
                    "description": "The Backup to restore to the newly created Linode.  May not be included if 'distribution' is sent.\n",
                    "type": "backup",
                    "name": "backup"
                  },
                  {
                    "optional": true,
                    "description": "Subscribes this Linode with the Backup service. (Additional charges apply.) Defaults to \"false\".\n",
                    "name": "with_backup"
                  }
                ],
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\n        \"region\": \"us-east-1a\",\n        \"type\": \"g5-standard-1\"\n    }' \\\n    https://$api_root/$version/linode/instances\n"
                  },
                  {
                    "name": "python",
                    "value": "import linode\nTODO\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "/linode/instances",
            "formattedEndpoints": []
          },
          {
            "type": "resource",
            "resource": "linode",
            "authenticated": true,
            "description": "Manage a particular Linode your account may access.\n",
            "methods": [
              {
                "oauth": "linodes:view",
                "description": "Returns information about this Linode.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n    https://$api_root/$version/linode/instances/$linode_id\n"
                  },
                  {
                    "name": "python",
                    "value": "import linode\nTODO\n"
                  }
                ],
                "name": "GET",
                "resource": {
                  "name": "Linode",
                  "prefix": "lnde",
                  "description": "Linode objects describe a single Linode on your account.\n",
                  "schema": [
                    {
                      "name": "0",
                      "description": "This Linode's ID"
                    },
                    {
                      "name": "1",
                      "description": "Toggle and set thresholds for receiving email alerts. <ul> <li>CPU Usage - % - Average CPU usage over 2 hours exceeding this value triggers this alert. (Range 0-2000, default 90)</li> <li>Disk IO Rate - IO Ops/sec - Average Disk IO ops/sec over 2 hours exceeding this value triggers this alert. (Range 0-100000, default 10000)</li> <li>Incoming Traffic - Mbit/s - Average incoming traffic over a 2 hour period exceeding this value triggers this alert. (Range 0-40000, default 10)</li> <li>Outbound Traffic - Mbit/s - Average outbound traffic over a 2 hour period exceeding this value triggers this alert. (Range 0-10000, default 10)</li> <li>Transfer Quota - % - Percentage of network transfer quota used being greater than this value will trigger this alert. (Range 0-400, default 80)</li></ul>\n"
                    },
                    {
                      "name": "2",
                      "description": "Displays if backups are enabled, last backup datetime if applicable, and the day/window your backups will occur. Window is prefixed by a \"W\" and an integer representing the two-hour window in 24-hour UTC time format. For example, 2AM is represented as \"W2\", 8PM as \"W20\", etc. (W0, W2, W4...W22)\n"
                    },
                    {
                      "name": "3"
                    },
                    {
                      "name": "4",
                      "description": "This Linode's region."
                    },
                    {
                      "name": "5",
                      "description": "The distribution that this Linode booted to last."
                    },
                    {
                      "name": "6",
                      "description": "This Linode's display group."
                    },
                    {
                      "name": "7",
                      "description": "This Linode's IPv4 addresses."
                    },
                    {
                      "name": "8",
                      "description": "This Linode's IPv6 slaac address."
                    },
                    {
                      "name": "9",
                      "description": "This Linode's display label."
                    },
                    {
                      "name": "10",
                      "description": "The type of Linode."
                    },
                    {
                      "name": "11",
                      "description": "The current state of this Linode."
                    },
                    {
                      "name": "12",
                      "description": "The amount of outbound traffic used this month."
                    },
                    {
                      "name": "13",
                      "description": "The last updated datetime for this Linode record."
                    },
                    {
                      "name": "14",
                      "description": "The hypervisor this Linode is running on."
                    }
                  ],
                  "enums": [
                    {
                      "offline": "The Linode is powered off.",
                      "booting": "The Linode is currently booting up.",
                      "running": "The Linode is currently running.",
                      "shutting_down": "The Linode is currently shutting down.",
                      "rebooting": "The Linode is rebooting.",
                      "provisioning": "The Linode is being created.",
                      "deleting": "The Linode is being deleted.",
                      "migrating": "The Linode is being migrated to a new host/region.",
                      "name": "0"
                    },
                    {
                      "pending": "Backup is in the queue and waiting to begin.",
                      "running": "Linode in the process of being backed up.",
                      "needsPostProcessing": "Backups awaiting final integration into existing backup data.",
                      "successful": "Backup successfully completed.",
                      "failed": "Linode backup failed.",
                      "userAborted": "User aborted current backup process.",
                      "name": "1"
                    },
                    {
                      "auto": "Automatic backup",
                      "snapshot": "User-initiated, manual file backup",
                      "name": "2"
                    },
                    {
                      "W0": "0000 - 0200 UTC",
                      "W2": "0200 - 0400 UTC",
                      "W4": "0400 - 0600 UTC",
                      "W6": "0600 - 0800 UTC",
                      "W8": "0800 - 1000 UTC",
                      "W10": "1000 - 1200 UTC",
                      "W12": "1200 - 1400 UTC",
                      "W14": "1400 - 1600 UTC",
                      "W16": "1600 - 1800 UTC",
                      "W18": "1800 - 2000 UTC",
                      "W20": "2000 - 2200 UTC",
                      "W22": "2200 - 0000 UTC",
                      "name": "3"
                    },
                    {
                      "kvm": "KVM",
                      "xen": "Xen",
                      "name": "4"
                    }
                  ]
                }
              },
              {
                "oauth": "linodes:modify",
                "description": "Edits this Linode.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X PUT -d '{\n      \"label\": \"newlabel\",\n      \"schedule\": {\n        \"day\": \"Tuesday\",\n        \"window\": \"W20\"\n      }\n    }' \\\n    https://$api_root/$version/linode/instances/$linode_id\n"
                  },
                  {
                    "name": "python",
                    "value": "import linode\nTODO\n"
                  }
                ],
                "name": "PUT"
              },
              {
                "oauth": "linodes:delete",
                "dangerous": true,
                "description": "Deletes this Linode. This action cannot be undone.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n    -X DELETE \\\n    https://$api_root/$version/linode/instances/$linode_id\n"
                  },
                  {
                    "name": "python",
                    "value": "import linode\nTODO\n"
                  }
                ],
                "name": "DELETE"
              }
            ],
            "path": "/linode/instances/:id",
            "formattedEndpoints": []
          },
          {
            "type": "list",
            "resource": "linode",
            "authenticated": true,
            "description": "Manage the disks associated with this Linode.\n",
            "methods": [
              {
                "oauth": "linodes:view",
                "description": "Returns a list of disks.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n    https://$api_root/$version/linode/instances/$linode_id/disks\n"
                  },
                  {
                    "name": "python",
                    "value": "import linode\nTODO\n"
                  }
                ],
                "name": "GET",
                "resource": {
                  "name": "Linode",
                  "prefix": "lnde",
                  "description": "Linode objects describe a single Linode on your account.\n",
                  "schema": [
                    {
                      "name": "0",
                      "description": "This Linode's ID"
                    },
                    {
                      "name": "1",
                      "description": "Toggle and set thresholds for receiving email alerts. <ul> <li>CPU Usage - % - Average CPU usage over 2 hours exceeding this value triggers this alert. (Range 0-2000, default 90)</li> <li>Disk IO Rate - IO Ops/sec - Average Disk IO ops/sec over 2 hours exceeding this value triggers this alert. (Range 0-100000, default 10000)</li> <li>Incoming Traffic - Mbit/s - Average incoming traffic over a 2 hour period exceeding this value triggers this alert. (Range 0-40000, default 10)</li> <li>Outbound Traffic - Mbit/s - Average outbound traffic over a 2 hour period exceeding this value triggers this alert. (Range 0-10000, default 10)</li> <li>Transfer Quota - % - Percentage of network transfer quota used being greater than this value will trigger this alert. (Range 0-400, default 80)</li></ul>\n"
                    },
                    {
                      "name": "2",
                      "description": "Displays if backups are enabled, last backup datetime if applicable, and the day/window your backups will occur. Window is prefixed by a \"W\" and an integer representing the two-hour window in 24-hour UTC time format. For example, 2AM is represented as \"W2\", 8PM as \"W20\", etc. (W0, W2, W4...W22)\n"
                    },
                    {
                      "name": "3"
                    },
                    {
                      "name": "4",
                      "description": "This Linode's region."
                    },
                    {
                      "name": "5",
                      "description": "The distribution that this Linode booted to last."
                    },
                    {
                      "name": "6",
                      "description": "This Linode's display group."
                    },
                    {
                      "name": "7",
                      "description": "This Linode's IPv4 addresses."
                    },
                    {
                      "name": "8",
                      "description": "This Linode's IPv6 slaac address."
                    },
                    {
                      "name": "9",
                      "description": "This Linode's display label."
                    },
                    {
                      "name": "10",
                      "description": "The type of Linode."
                    },
                    {
                      "name": "11",
                      "description": "The current state of this Linode."
                    },
                    {
                      "name": "12",
                      "description": "The amount of outbound traffic used this month."
                    },
                    {
                      "name": "13",
                      "description": "The last updated datetime for this Linode record."
                    },
                    {
                      "name": "14",
                      "description": "The hypervisor this Linode is running on."
                    }
                  ],
                  "enums": [
                    {
                      "offline": "The Linode is powered off.",
                      "booting": "The Linode is currently booting up.",
                      "running": "The Linode is currently running.",
                      "shutting_down": "The Linode is currently shutting down.",
                      "rebooting": "The Linode is rebooting.",
                      "provisioning": "The Linode is being created.",
                      "deleting": "The Linode is being deleted.",
                      "migrating": "The Linode is being migrated to a new host/region.",
                      "name": "0"
                    },
                    {
                      "pending": "Backup is in the queue and waiting to begin.",
                      "running": "Linode in the process of being backed up.",
                      "needsPostProcessing": "Backups awaiting final integration into existing backup data.",
                      "successful": "Backup successfully completed.",
                      "failed": "Linode backup failed.",
                      "userAborted": "User aborted current backup process.",
                      "name": "1"
                    },
                    {
                      "auto": "Automatic backup",
                      "snapshot": "User-initiated, manual file backup",
                      "name": "2"
                    },
                    {
                      "W0": "0000 - 0200 UTC",
                      "W2": "0200 - 0400 UTC",
                      "W4": "0400 - 0600 UTC",
                      "W6": "0600 - 0800 UTC",
                      "W8": "0800 - 1000 UTC",
                      "W10": "1000 - 1200 UTC",
                      "W12": "1200 - 1400 UTC",
                      "W14": "1400 - 1600 UTC",
                      "W16": "1600 - 1800 UTC",
                      "W18": "1800 - 2000 UTC",
                      "W20": "2000 - 2200 UTC",
                      "W22": "2200 - 0000 UTC",
                      "name": "3"
                    },
                    {
                      "kvm": "KVM",
                      "xen": "Xen",
                      "name": "4"
                    }
                  ]
                }
              },
              {
                "oauth": "linodes:modify",
                "description": "Creates a new disk.\n",
                "params": [
                  {
                    "description": "Size in MB for this disk.\n",
                    "type": "integer",
                    "limit": "between 0 and the available space on the Linode",
                    "name": "size"
                  },
                  {
                    "optional": true,
                    "description": "Optional distribution to deploy with this disk. <ul><li>If no distribution is provided, a blank disk is created.</li></ul>\n",
                    "type": "distribution",
                    "name": "distribution"
                  },
                  {
                    "optional": "unless distribution is specified",
                    "description": "Root password to deploy distribution with. <ul><li>root_pass is required if a distribution is provided.</li></ul>\n",
                    "type": "string",
                    "name": "root_pass"
                  },
                  {
                    "optional": "unless distribution is not specified",
                    "description": "SSH key to add to root's authorized_keys.\n",
                    "type": "string",
                    "name": "root_ssh_key"
                  },
                  {
                    "description": "User-friendly string to name this disk.\n",
                    "type": "string",
                    "limit": "1-50 characters",
                    "name": "label"
                  },
                  {
                    "description": "A filesystem for this disk.\n",
                    "type": "string",
                    "name": "filesystem"
                  },
                  {
                    "optional": true,
                    "description": "If true, this disk is read-only.\n",
                    "type": "boolean",
                    "name": "read_only"
                  },
                  {
                    "optional": true,
                    "description": "The stackscript ID to deploy with this disk. <ul><li>Must provide a distribution. Distribution must be one that the stackscript can be deployed to.</li></ul>\n",
                    "type": "stackscript",
                    "name": "stackscript"
                  },
                  {
                    "optional": true,
                    "description": "UDF (user-defined fields) for this stackscript. Defaults to \"{}\". <ul><li>Must match UDFs required by stackscript.</li></ul>\n",
                    "type": "string",
                    "name": "stackscript_udf_responses"
                  }
                ],
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\n        \"label\": \"Example Disk\",\n        \"filesystem\": \"ext4\",\n        \"size\": 4096\n    }' \\\n    https://$api_root/$version/linode/instances/$linode_id/disks\n"
                  },
                  {
                    "name": "python",
                    "value": "import linode\nTODO\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "/linode/instances/:id/disks",
            "formattedEndpoints": []
          },
          {
            "type": "resource",
            "resource": "disk",
            "authenticated": true,
            "description": "Manage a particular disk associated with this Linode.\n",
            "methods": [
              {
                "oauth": "linodes:view",
                "description": "Returns information about this disk.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n    https://$api_root/$version/linode/instances/$linode_id/disks/$disk_id\n"
                  },
                  {
                    "name": "python",
                    "value": "import linode\nTODO\n"
                  }
                ],
                "name": "GET",
                "resource": {
                  "name": "Disk",
                  "prefix": "disk",
                  "description": "Disk objects are disk images that are attached to a Linode.\n",
                  "schema": [
                    {
                      "name": "id",
                      "type": "integer",
                      "value": 123456
                    },
                    {
                      "name": "label",
                      "description": "Human-friendly disk name.",
                      "type": "string",
                      "value": "Ubuntu 14.04 Disk"
                    },
                    {
                      "name": "status",
                      "description": "Status of the disk.",
                      "type": "enum",
                      "value": "ok"
                    },
                    {
                      "name": "size",
                      "description": "Size of this disk in MB.",
                      "editable": true,
                      "type": "integer",
                      "value": 1000
                    },
                    {
                      "name": "filesystem",
                      "description": "The filesystem on the disk.",
                      "type": "enum",
                      "value": "ext4"
                    },
                    {
                      "name": "created",
                      "type": "datetime",
                      "value": "2015-09-29T11:21:01"
                    },
                    {
                      "name": "updated",
                      "type": "datetime",
                      "value": "2015-09-29T11:21:01"
                    }
                  ],
                  "enums": [
                    {
                      "ok": "No disk jobs are running.",
                      "deleting": "This disk is being deleted.",
                      "creating": "This disk is being created.",
                      "migrating": "This disk is being migrated.",
                      "cancelling-migration": "The disk migration is being cancelled.",
                      "duplicating": "This disk is being duplicated.",
                      "resizing": "This disk is being resized.",
                      "restoring": "This disk is being restored.",
                      "copying": "This disk is being copied.",
                      "freezing": "This disk is being frozen.",
                      "thawing": "This disk is being thawed.",
                      "name": "Status"
                    },
                    {
                      "raw": "No filesystem, just a raw binary stream.",
                      "swap": "Linux swap area",
                      "ext3": "The ext3 journaling filesystem for Linux.",
                      "ext4": "The ext4 journaling filesystem for Linux.",
                      "initrd": "initrd (uncompressed initrd, ext2, max 32 MB)",
                      "name": "Filesystem"
                    }
                  ]
                }
              },
              {
                "oauth": "linodes:modify",
                "description": "Updates a disk's metadata.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X PUT -d '{\n      \"label\": \"New Disk Label\"\n    }' \\\n    https://$api_root/$version/linode/instances/$linode_id/disks/$disk_id\n"
                  },
                  {
                    "name": "python",
                    "value": "import linode\nTODO\n"
                  }
                ],
                "name": "PUT"
              },
              {
                "oauth": "linodes:create",
                "description": "Duplicates this disk.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST \\\n    https://$api_root/$version/linode/instances/$linode_id/disks/$disk_id\n"
                  },
                  {
                    "name": "python",
                    "value": "import linode\nTODO\n"
                  }
                ],
                "name": "POST"
              },
              {
                "oauth": "linodes:delete",
                "dangerous": true,
                "description": "Deletes this disk. This action cannot be undone.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n    -X DELETE \\\n    https://$api_root/$version/linode/instances/$linode_id/disks/$disk_id\n"
                  },
                  {
                    "name": "python",
                    "value": "import linode\nTODO\n"
                  }
                ],
                "name": "DELETE"
              }
            ],
            "path": "/linode/instances/:id/disks/:id",
            "formattedEndpoints": []
          },
          {
            "type": "strange",
            "authenticated": true,
            "description": "Resizes the disk.",
            "methods": [
              {
                "oauth": "linodes:modify",
                "dangerous": true,
                "params": [
                  {
                    "description": "The desired size of the disk in MB.",
                    "type": "integer",
                    "name": "size"
                  }
                ],
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\n        \"size\": 1024\n    }' \\\n    https://$api_root/$version/linode/instances/$linode_id/disks/$disk_id/resize\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "/linode/instances/:id/disks/:id/resize",
            "formattedEndpoints": []
          },
          {
            "type": "strange",
            "authenticated": true,
            "description": "Resets the root password of a disk.\n",
            "methods": [
              {
                "oauth": "linodes:modify",
                "dangerous": true,
                "params": [
                  {
                    "description": "New root password for the OS installed on this disk.\n",
                    "type": "string",
                    "name": "password"
                  }
                ],
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\n        \"password\": \"hunter2\"\n    }' \\\n    https://$api_root/$version/linode/instances/$linode_id/disks/$disk_id/password\n"
                  },
                  {
                    "name": "python",
                    "value": "import linode\nTODO\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "/linode/instances/:id/disks/:id/password",
            "formattedEndpoints": []
          },
          {
            "type": "list",
            "resource": "linode_config",
            "authenticated": true,
            "description": "Manage the boot configs on this Linode.\n",
            "methods": [
              {
                "oauth": "linodes:view",
                "description": "Returns a list of configs for a given Linode.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n    https://$api_root/$version/linode/instances/$linode_id/configs\n"
                  },
                  {
                    "name": "python",
                    "value": "import linode\nTODO\n"
                  }
                ],
                "name": "GET"
              },
              {
                "oauth": "linodes:modify",
                "description": "Creates a new config for a given Linode.\n",
                "params": [
                  {
                    "description": "A kernel ID to boot this Linode with.\n",
                    "type": "kernel",
                    "name": "kernel"
                  },
                  {
                    "description": "The user-friendly label to name this config.\n",
                    "limit": "1-48 characters",
                    "name": "label"
                  },
                  {
                    "description": "Disks attached to this Linode config.\n",
                    "name": "disks"
                  },
                  {
                    "optional": true,
                    "description": "Optional field for arbitrary user comments on this config.\n",
                    "limit": "1-255 characters",
                    "name": "comments"
                  },
                  {
                    "optional": true,
                    "description": "The maximum RAM the Linode will be given when booting this config. This defaults to the total RAM of the Linode.\n",
                    "limit": "between 0 and the Linode's total RAM",
                    "name": "ram_limit"
                  },
                  {
                    "optional": true,
                    "description": "Controls whether to mount the root disk read-only. Defaults to false.\n",
                    "name": "root_device_ro"
                  },
                  {
                    "optional": true,
                    "description": "Populates the /dev directory early during boot without udev. Defaults to false.\n",
                    "name": "devtmpfs_automount"
                  },
                  {
                    "optional": true,
                    "description": "Sets the run level for Linode boot. Defaults to \"default\".\n",
                    "name": "run_level"
                  },
                  {
                    "optional": true,
                    "description": "Controls the virtualization mode. Defaults to \"paravirt\".\n",
                    "name": "virt_mode"
                  }
                ],
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\n        \"label\": \"Arch Linux config\",\n        \"kernel\": \"linode/latest_64\",\n        \"disks\": {\n          \"sda\": 5567,\n          \"sdb\": 5568\n          }\n        }\n    }' \\\n    https://$api_root/$version/linode/instances/$linode_id/configs\n"
                  },
                  {
                    "name": "python",
                    "value": "import linode\nTODO\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "/linode/instances/:id/configs",
            "formattedEndpoints": []
          },
          {
            "type": "resource",
            "resource": "linode_config",
            "authenticated": true,
            "description": "Manage a particular config for a given Linode.\n",
            "methods": [
              {
                "oauth": "linodes:view",
                "description": "Returns information about this Linode config.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n    https://$api_root/$version/linode/instances/$linode_id/configs/$config_id\n"
                  },
                  {
                    "name": "python",
                    "value": "import linode\nTODO\n"
                  }
                ],
                "name": "GET"
              },
              {
                "oauth": "linodes:modify",
                "description": "Modifies a given Linode config.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X PUT -d '{\n        \"label\": \"Edited config\",\n        \"kernel\": {\n          \"id\": \"linode/latest_64\"\n        },\n        \"disks\": {\n          \"sda\": {\n            \"id\": 5567\n          }\n        }\n    }' \\\n    https://$api_root/$version/linode/instances/$linode_id/configs/$config_id\n"
                  },
                  {
                    "name": "python",
                    "value": "import linode TODO"
                  }
                ],
                "name": "PUT"
              },
              {
                "oauth": "linodes:modify",
                "description": "Deletes a given Linode config.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X DELETE \\\n    https://$api_root/$version/linode/instances/$linode_id/configs/$config_id\n"
                  },
                  {
                    "name": "python",
                    "value": "import linode\nTODO\n"
                  }
                ],
                "name": "DELETE"
              }
            ],
            "path": "/linode/instances/:id/configs/:id",
            "formattedEndpoints": []
          },
          {
            "type": "action",
            "authenticated": true,
            "description": "Boots a Linode.\n",
            "methods": [
              {
                "oauth": "linodes:modify",
                "dangerous": false,
                "params": [
                  {
                    "optional": true,
                    "description": "Optional config ID to boot the linode with.\n",
                    "type": "linode_config",
                    "name": "config"
                  }
                ],
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\n        \"config\": 5567\n    }' \\\n    https://$api_root/$version/linode/instances/$linode_id/boot\n"
                  },
                  {
                    "name": "python",
                    "value": "import linode\nTODO\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "/linode/instances/:id/boot",
            "formattedEndpoints": []
          },
          {
            "type": "action",
            "authenticated": true,
            "description": "Shuts down a Linode.\n",
            "methods": [
              {
                "oauth": "linodes:modify",
                "dangerous": true,
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST \\\n    https://$api_root/$version/linode/instances/$linode_id/shutdown\n"
                  },
                  {
                    "name": "python",
                    "value": "import linode\nTODO\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "/linode/instances/:id/shutdown",
            "formattedEndpoints": []
          },
          {
            "type": "action",
            "authenticated": true,
            "description": "Reboots a Linode.\n",
            "methods": [
              {
                "oauth": "linodes:modify",
                "dangerous": true,
                "params": [
                  {
                    "optional": true,
                    "description": "Optional config ID to boot the linode with.\n",
                    "type": "linode_config",
                    "name": "config"
                  }
                ],
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\n        \"config\": 5567\n\n    }' \\\n    https://$api_root/$version/linode/instances/$linode_id/reboot\n"
                  },
                  {
                    "name": "python",
                    "value": "import linode\nTODO\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "/linode/instances/:id/reboot",
            "formattedEndpoints": []
          },
          {
            "type": "action",
            "authenticated": true,
            "description": "Changes a Linode's hypervisor from Xen to KVM.\n",
            "methods": [
              {
                "oauth": "linodes:modify",
                "dangerous": true,
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST \\\n    https://$api_root/$version/linode/instances/$linode_id/kvmify\n"
                  },
                  {
                    "name": "python",
                    "value": "import linode\nTODO\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "/linode/instances/:id/kvmify",
            "formattedEndpoints": []
          },
          {
            "type": "action",
            "authenticated": true,
            "description": "Reboots a Linode in Rescue Mode.\n",
            "methods": [
              {
                "oauth": "linodes:modify",
                "dangerous": false,
                "params": [
                  {
                    "optional": true,
                    "description": "Disks to include during Rescue.\n",
                    "type": "disk",
                    "name": "disks"
                  }
                ],
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\n        \"disks\": {\n          \"sda\": 5567,\n          \"sdb\": 5568\n          }\n        }\n    }' \\\n    https://$api_root/$version/linode/instances/$linode_id/rescue\n"
                  },
                  {
                    "name": "python",
                    "value": "import linode\nTODO\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "/linode/instances/:id/rescue",
            "formattedEndpoints": []
          },
          {
            "type": "action",
            "authenticated": true,
            "description": "Resizes a Linode to a new Linode type.\n",
            "methods": [
              {
                "money": true,
                "oauth": "linodes:modify",
                "dangerous": false,
                "params": [
                  {
                    "description": "A Linode type to use for this Linode.\n",
                    "type": "service",
                    "name": "type"
                  }
                ],
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\n        \"type\": \"g5-standard-1\"\n        }\n    }' \\\n    https://$api_root/$version/linode/instances/$linode_id/resize\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "/linode/instances/:id/resize",
            "formattedEndpoints": []
          },
          {
            "type": "action",
            "authenticated": true,
            "description": "Returns information about this Linode's available backups.\n",
            "methods": [
              {
                "description": "Returns a Backups Response with information on this Linode's available backups.\n",
                "oauth": "linodes:view",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n    https://$api_root/$version/linode/instances/$linode_id/backups\n"
                  },
                  {
                    "name": "python",
                    "value": "import linode\nTODO\n"
                  }
                ],
                "name": "GET"
              },
              {
                "oauth": "linodes:modify",
                "dangerous": true,
                "description": "Creates a snapshot backup of a Linode. <div class=\"alert alert-danger\">\n  <strong>WARNING</strong>\n  <p>\n    If you already have a snapshot, this is a destructive operation.\n    The previous snapshot will be deleted.\n  </p>\n</div>\n",
                "params": [
                  {
                    "optional": true,
                    "description": "Human-friendly label for this snapshot. Must be 1-50 characters.\n",
                    "name": "label"
                  }
                ],
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\n        \"label\": \"Linode123456 snapshot\",\n    }' \\\n    https://$api_root/$version/linode/instances/$linode_id/backups\n"
                  },
                  {
                    "name": "python",
                    "value": "import linode\nTODO\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "/linode/instances/:id/backups",
            "formattedEndpoints": []
          },
          {
            "type": "action",
            "authenticated": true,
            "description": "Enables the backup service on the given Linode.\n",
            "methods": [
              {
                "money": true,
                "oauth": "linodes:modify",
                "dangerous": true,
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST \\\n    https://$api_root/$version/linode/instances/$linode_id/backups/enable\n"
                  },
                  {
                    "name": "python",
                    "value": "import linode\nTODO\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "/linode/instances/:id/backups/enable",
            "formattedEndpoints": []
          },
          {
            "type": "action",
            "authenticated": true,
            "description": "Cancels the backup service on the given Linode.\n",
            "methods": [
              {
                "oauth": "linodes:delete",
                "dangerous": true,
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST \\\n    https://$api_root/$version/linode/instances/$linode_id/backups/cancel\n"
                  },
                  {
                    "name": "python",
                    "value": "import linode\nTODO\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "/linode/instances/:id/backups/cancel",
            "formattedEndpoints": []
          },
          {
            "type": "action",
            "authenticated": true,
            "description": "Restores a backup to a Linode.\n",
            "methods": [
              {
                "oauth": "linodes:create",
                "dangerous": true,
                "params": [
                  {
                    "description": "The ID of the Linode to restore a backup to.\n",
                    "type": "linode",
                    "name": "linode"
                  },
                  {
                    "description": "If true, deletes all disks and configs on the target linode before restoring.\n",
                    "type": "boolean",
                    "optional": true,
                    "name": "overwrite"
                  }
                ],
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\n        \"linode\": 123456,\n    }' \\\n    https://$api_root/$version/linode/instances/$linode_id/backups/$backup_id/restore\n"
                  },
                  {
                    "name": "python",
                    "value": "import linode\nTODO\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "/linode/instances/:id/backups/:id/restore",
            "formattedEndpoints": []
          },
          {
            "type": "strange",
            "authenticated": true,
            "description": "View networking information for this Linode.\n",
            "methods": [
              {
                "oauth": "linodes:view",
                "description": "Returns a Linode Networking Object.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n    https://$api_root/$version/linode/instances/$linode_id/ips\n"
                  }
                ],
                "name": "GET"
              },
              {
                "money": true,
                "oauth": "linodes:modify",
                "description": "Allocates a new IP Address for this Linode.\n",
                "params": [
                  {
                    "description": "An IP Address Type for this IP Address. Public IP's incur a monthly cost.\n",
                    "type": "IPAddressType",
                    "name": "type"
                  }
                ],
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\n        \"type\": \"private\"\n    }' \\\n    https://$api_root/$version/linode/instances/$linode_id/ips\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "/linode/instances/:id/ips",
            "formattedEndpoints": []
          },
          {
            "methods": [
              {
                "description": "Sets IP Sharing for this Linode.\n",
                "params": [
                  {
                    "type": "list",
                    "subtype": "string",
                    "description": "A list of IP Addresses this Linode will share.\n",
                    "name": "ips"
                  }
                ],
                "example": {
                  "curl": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\n      \"ips\": [ \"97.107.143.29\", \"97.107.143.112\" ]\n    }' \\\n    https://$api_root/$version/linode/instances/$linode_id/ips/sharing\n"
                },
                "name": "POST"
              }
            ],
            "path": "/linode/instances/:id/ips/sharing",
            "formattedEndpoints": []
          },
          {
            "type": "action",
            "resource": "ipaddress",
            "authenticated": true,
            "description": "Manage a particular IP Address associated with this Linode.\n",
            "methods": [
              {
                "oauth": "linodes:view",
                "description": "Returns information about this IPv4 or IPv6 Address.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n    https://$api_root/$version/linode/instances/$linode_id/ips/$ip_address\n"
                  }
                ],
                "name": "GET",
                "resource": {
                  "name": "IPv4 Address",
                  "description": "An IPv4 Address\n",
                  "schema": [
                    {
                      "name": "address",
                      "description": "The IP Address.",
                      "type": "string",
                      "value": "97.107.143.8"
                    },
                    {
                      "name": "gateway",
                      "description": "The default gateway. Gateways for private IP's are always null.",
                      "type": "string",
                      "value": "97.107.143.1"
                    },
                    {
                      "name": "subnet_mask",
                      "description": "The subnet mask.",
                      "type": "string",
                      "value": "255.255.255.0"
                    },
                    {
                      "name": "prefix",
                      "description": "The network prefix.",
                      "type": "string",
                      "value": 24
                    },
                    {
                      "name": "type",
                      "description": "The type of IP Address, either public or private",
                      "type": "enum",
                      "value": "public"
                    },
                    {
                      "name": "rdns",
                      "description": "Reverse DNS address for this IP Address. Null to reset.",
                      "editable": true,
                      "type": "string",
                      "value": null
                    },
                    {
                      "name": "linode_id",
                      "type": "integer",
                      "value": 42
                    }
                  ],
                  "enums": [
                    {
                      "public": "Public IP Address",
                      "private": "Internal IP Addresses (192.168 range)",
                      "name": "IPAddressType"
                    }
                  ]
                }
              },
              {
                "oauth": "linodes:modify",
                "description": "Update this IP Address\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X PUT -d '{\n        \"rdns\":\"example.org\"\n    }' \\\n    https://$api_root/$version/linode/instances/$linode_id/ips/$ip_address\n"
                  }
                ],
                "name": "PUT"
              }
            ],
            "path": "/linode/instances/:id/ips/:ip_address",
            "formattedEndpoints": []
          },
          {
            "type": "action",
            "authenticated": true,
            "description": "Deletes all Disks and Configs on this Linode, then deploys a new Distribution to this Linode with the given attributes. Returns information about this Linode.\n",
            "methods": [
              {
                "oauth": "linodes:modify",
                "dangerous": true,
                "params": [
                  {
                    "description": "An Distribution to deploy to this Linode.\n",
                    "type": "Distribution",
                    "name": "distribution"
                  },
                  {
                    "description": "The root password for the new deployment.\n",
                    "type": "string",
                    "name": "root_pass"
                  },
                  {
                    "optional": true,
                    "description": "The key to authorize for root access to the new deployment.\n",
                    "type": "string",
                    "name": "root_ssh_key"
                  },
                  {
                    "optional": true,
                    "description": "The stackscript ID to deploy with this disk. <ul><li>Must provide a distribution. Distribution must be one that the stackscript can be deployed to.</li></ul>\n",
                    "type": "stackscript",
                    "name": "stackscript"
                  },
                  {
                    "optional": true,
                    "description": "UDF (user-defined fields) for this stackscript. Defaults to \"{}\". <ul><li>Must match UDFs required by stackscript.</li></ul>\n",
                    "type": "string",
                    "name": "stackscript_udf_responses"
                  }
                ],
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST \\\n    https://$api_root/$version/linode/instances/$linode_id/rebuild \\\n    -d '{\"distribution\":\"linode/debian8\",\"root_pass\":\"hunter7\"}'\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "/linode/instances/:id/rebuild",
            "formattedEndpoints": []
          }
        ],
        "methods": null
      },
      {
        "name": "Types",
        "sort": 1,
        "base_path": "/linode/types",
        "description": "Type endpoints provide a means of viewing service objects.\n",
        "path": "/linode",
        "formattedEndpoints": [
          {
            "type": "list",
            "resource": "types",
            "description": "Returns collection of types.\n",
            "methods": [
              {
                "description": "Returns list of services.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl https://$api_root/$version/linode/services\n"
                  },
                  {
                    "name": "python",
                    "value": "import services\nTODO\n"
                  }
                ],
                "name": "GET"
              }
            ],
            "path": "/linode/types",
            "formattedEndpoints": []
          },
          {
            "type": "resource",
            "resource": "types",
            "description": "Returns information about a specific Linode type offered by Linode.\n",
            "methods": [
              {
                "description": "Returns information about this service.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl https://$api_root/$version/linode/services/$service_id\n"
                  },
                  {
                    "name": "python",
                    "value": "import services\nTODO\n"
                  }
                ],
                "name": "GET"
              }
            ],
            "path": "/linode/types/:id",
            "formattedEndpoints": []
          }
        ],
        "methods": null
      },
      {
        "name": "StackScripts",
        "sort": 4,
        "base_path": "/linode/stackscripts",
        "description": "StackScript endpoints provide a means of managing the StackScript objects accessible from your account.\n",
        "path": "/linode",
        "formattedEndpoints": [
          {
            "type": "list",
            "resource": "stackscript",
            "description": "View public StackScripts.\n",
            "methods": [
              {
                "description": "Returns a list of public StackScripts. Results can be filtered.  Include '\"mine\": true' in the filter dict to see only StackScripts you created.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl https://$api_root/$version/linode/stackscripts\n"
                  },
                  {
                    "name": "python",
                    "value": "import stackscript\nTODO\n"
                  }
                ],
                "name": "GET",
                "resource": {
                  "name": "StackScript",
                  "prefix": "stck",
                  "description": "StackScript objects describe a StackScript which can be used to help automate deployment of new Linodes.\n",
                  "schema": [
                    {
                      "name": "id",
                      "description": "A unique ID for the StackScript.",
                      "type": "integer",
                      "value": 37
                    },
                    {
                      "name": "customer_id",
                      "description": "The customer that created this StackScript.",
                      "type": "integer",
                      "value": 123
                    },
                    {
                      "name": "user_id",
                      "description": "The user account that created this StackScript.",
                      "type": "integer",
                      "value": 456
                    },
                    {
                      "name": "label",
                      "description": "This StackScript's display label.",
                      "editable": true,
                      "type": "string",
                      "value": "Example StackScript"
                    },
                    {
                      "name": "description",
                      "description": "In-depth information on what this StackScript does.",
                      "editable": true,
                      "type": "string",
                      "value": "Installs the Linode API bindings"
                    },
                    {
                      "name": "distributions",
                      "description": "A list of distributions this StackScript is compatible with.",
                      "editable": true,
                      "type": "array",
                      "value": [
                        {
                          "id": {
                            "_type": "string",
                            "_value": "linode/debian8"
                          },
                          "label": {
                            "_type": "string",
                            "_value": "Debian 8.1"
                          },
                          "vendor": {
                            "_type": "string",
                            "_value": "Debian"
                          },
                          "x64": {
                            "_type": "boolean",
                            "_value": true
                          },
                          "recommended": {
                            "_type": "boolean",
                            "_value": true
                          },
                          "created": {
                            "_type": "datetime",
                            "_value": "2015-04-27T16:26:41.000Z"
                          },
                          "minimum_storage_size": {
                            "_type": "integer",
                            "_value": 900
                          }
                        },
                        {
                          "id": {
                            "_type": "string",
                            "_value": "linode/debian7"
                          },
                          "label": {
                            "_type": "string",
                            "_value": "Debian 7"
                          },
                          "vendor": {
                            "_type": "string",
                            "_value": "Debian"
                          },
                          "x64": {
                            "_type": "boolean",
                            "_value": true
                          },
                          "recommended": {
                            "_type": "boolean",
                            "_value": true
                          },
                          "created": {
                            "_type": "datetime",
                            "_value": "2014-09-24T13:59:32.000Z"
                          },
                          "minimum_storage_size": {
                            "_type": "integer",
                            "_value": 600
                          }
                        }
                      ]
                    },
                    {
                      "name": "deployments_total",
                      "description": "The total number of times this StackScript has been deployed.",
                      "type": "integer",
                      "value": 150
                    },
                    {
                      "name": "deployments_active",
                      "description": "The total number of active deployments.",
                      "type": "integer",
                      "value": 42
                    },
                    {
                      "name": "is_public",
                      "description": "Publicize StackScript in the Linode StackScript library. Note that StackScripts cannot be changed to private after they have been public.\n",
                      "editable": true,
                      "type": "boolean",
                      "value": true
                    },
                    {
                      "name": "created",
                      "description": "When the StackScript was initially created.",
                      "type": "datetime",
                      "value": "2015-09-29T11:21:01"
                    },
                    {
                      "name": "updated",
                      "description": "When the StackScript was last updated.",
                      "type": "datetime",
                      "value": "2015-10-15T10:02:01"
                    },
                    {
                      "name": "rev_note",
                      "description": "The most recent note about what was changed for this revision.",
                      "editable": true,
                      "type": "string",
                      "value": "Initial import"
                    },
                    {
                      "name": "script",
                      "description": "The actual script body to be executed.",
                      "editable": true,
                      "type": "string",
                      "value": "#!/bin/bash"
                    },
                    {
                      "name": "user_defined_fields",
                      "description": "Variables that can be set to customize the script per deployment.",
                      "type": "array",
                      "value": [
                        {
                          "name": {
                            "_type": "string",
                            "_value": "var1"
                          },
                          "label": {
                            "_type": "string",
                            "_value": "A question"
                          },
                          "example": {
                            "_type": "string",
                            "_value": "An example value"
                          },
                          "default": {
                            "_type": "string",
                            "_value": "Default value"
                          }
                        },
                        {
                          "name": {
                            "_type": "string",
                            "_value": "var2"
                          },
                          "label": {
                            "_type": "string",
                            "_value": "Another question"
                          },
                          "example": {
                            "_type": "string",
                            "_value": "possible"
                          },
                          "oneof": {
                            "_type": "string",
                            "_value": "possible,enum,values"
                          }
                        }
                      ]
                    }
                  ]
                }
              },
              {
                "oauth": "stackscripts:create",
                "description": "Create a new StackScript.\n",
                "params": [
                  {
                    "description": "Label of StackScript.\n",
                    "limit": "3-128 characters",
                    "name": "label"
                  },
                  {
                    "optional": true,
                    "description": "Description of the StackScript.\n",
                    "name": "description"
                  },
                  {
                    "description": "A list of distributions compatible with StackScript.\n",
                    "type": "distribution",
                    "name": "distributions"
                  },
                  {
                    "optional": true,
                    "description": "If true, this StackScript will be publicly visible in the Linode StackScript library. Defaults to False.\n",
                    "name": "is_public"
                  },
                  {
                    "optional": true,
                    "description": "Release notes for this revision.\n",
                    "limit": "0-512 characters",
                    "name": "rev_note"
                  },
                  {
                    "description": "The shell script to run on boot.\n",
                    "name": "script"
                  }
                ],
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n  -H \"Authorization: token $TOKEN\" \\\n  -X POST -d '{\n    \"label\": \"Initial Label\",\n    \"distributions\": [\"linode/ubuntu15.4\", \"linode/ubuntu15.10\"],\n    \"script\": \"#!...\"\n  }' \\\n  https://$api_root/$version/linode/stackscripts\n"
                  },
                  {
                    "name": "python",
                    "value": "import stackscript\nTODO\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "/linode/stackscripts",
            "formattedEndpoints": []
          },
          {
            "type": "list",
            "resource": "stackscript",
            "authenticated": true,
            "description": "Manage a particular StackScript.\n",
            "methods": [
              {
                "oauth": "stackscripts:view",
                "description": "Returns information about this StackScript.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n  -H \"Authorization: token $TOKEN\" \\\n  -X GET \\\n  https://$api_root/$version/linode/stackscripts/$stackscript_id\n"
                  },
                  {
                    "name": "python",
                    "value": "import stackscript\nTODO\n"
                  }
                ],
                "name": "GET",
                "resource": {
                  "name": "StackScript",
                  "prefix": "stck",
                  "description": "StackScript objects describe a StackScript which can be used to help automate deployment of new Linodes.\n",
                  "schema": [
                    {
                      "name": "0",
                      "description": "A unique ID for the StackScript."
                    },
                    {
                      "name": "1",
                      "description": "The customer that created this StackScript."
                    },
                    {
                      "name": "2",
                      "description": "The user account that created this StackScript."
                    },
                    {
                      "name": "3",
                      "description": "This StackScript's display label."
                    },
                    {
                      "name": "4",
                      "description": "In-depth information on what this StackScript does."
                    },
                    {
                      "name": "5",
                      "description": "A list of distributions this StackScript is compatible with."
                    },
                    {
                      "name": "6",
                      "description": "The total number of times this StackScript has been deployed."
                    },
                    {
                      "name": "7",
                      "description": "The total number of active deployments."
                    },
                    {
                      "name": "8",
                      "description": "Publicize StackScript in the Linode StackScript library. Note that StackScripts cannot be changed to private after they have been public.\n"
                    },
                    {
                      "name": "9",
                      "description": "When the StackScript was initially created."
                    },
                    {
                      "name": "10",
                      "description": "When the StackScript was last updated."
                    },
                    {
                      "name": "11",
                      "description": "The most recent note about what was changed for this revision."
                    },
                    {
                      "name": "12",
                      "description": "The actual script body to be executed."
                    },
                    {
                      "name": "13",
                      "description": "Variables that can be set to customize the script per deployment."
                    }
                  ]
                }
              },
              {
                "oauth": "stackscripts:modify",
                "description": "Edits this StackScript.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n  -H \"Authorization: token $TOKEN\" \\\n  -X PUT -d '{\n    \"label\": \"New Label\"\n  }' \\\n  https://$api_root/$version/linode/stackscripts/$stackscript_id\n"
                  },
                  {
                    "name": "python",
                    "value": "import stackscript\nTODO\n"
                  }
                ],
                "name": "PUT"
              },
              {
                "oauth": "stackscripts:delete",
                "description": "Deletes this StackScript.  This action cannot be undone.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n  -X DELETE \\\n  https://$api_root/$version/linode/stackscripts/$stackscript_id\n"
                  },
                  {
                    "name": "python",
                    "value": "import stackscript\nTODO\n"
                  }
                ],
                "name": "DELETE"
              }
            ],
            "path": "/linode/stackscripts/:id",
            "formattedEndpoints": []
          }
        ],
        "methods": null
      }
    ]
  },
  {
    "name": "Domains",
    "path": "/domains",
    "formattedEndpoints": [
      {
        "name": "Domains",
        "base_path": "/domains",
        "description": "Domain endpoints provide a means of managing the Domain objects on your account.\nNote: the validation rules for domain records are too complicated to document here. We'll just direct you to [RFC 1035](https://www.ietf.org/rfc/rfc1035.txt).\n",
        "path": "/domains",
        "formattedEndpoints": [
          {
            "type": "list",
            "resource": "domains",
            "authenticated": true,
            "description": "Manage the collection of Domains your account may access.\n",
            "methods": [
              {
                "oauth": "domains:view",
                "description": "Returns a list of Domains.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n    https://$api_root/$version/domains\n"
                  },
                  {
                    "name": "python",
                    "value": "import linode\nTODO\n"
                  }
                ],
                "name": "GET",
                "resource": {
                  "name": "Domains",
                  "prefix": "domain",
                  "description": "Domains\n",
                  "schema": [
                    {
                      "name": "id",
                      "type": "integer",
                      "value": 357
                    },
                    {
                      "name": "domain",
                      "description": "The Domain name.\n",
                      "editable": true,
                      "type": "string",
                      "value": "example.com"
                    },
                    {
                      "name": "soa_email",
                      "description": "Start of Authority (SOA) contact email.\n",
                      "editable": true,
                      "type": "string",
                      "value": "admin@example.com"
                    },
                    {
                      "name": "description",
                      "description": "A description to keep track of this Domain.\n",
                      "editable": true,
                      "type": "string",
                      "value": "Example Description"
                    },
                    {
                      "name": "refresh_sec",
                      "description": "Time interval before the Domain should be refreshed, in seconds.\n",
                      "editable": true,
                      "type": "integer",
                      "value": 14400
                    },
                    {
                      "name": "retry_sec",
                      "description": "Time interval that should elapse before a failed refresh should be retried, in seconds.\n",
                      "editable": true,
                      "type": "integer",
                      "value": 3600
                    },
                    {
                      "name": "expire_sec",
                      "description": "Time value that specifies the upper limit on the time interval that can elapse before the Domain is no longer authoritative, in seconds.\n",
                      "editable": true,
                      "type": "integer",
                      "value": 604800
                    },
                    {
                      "name": "ttl_sec",
                      "description": "Time interval that the resource record may be cached before\n  it should be discarded, in seconds.\n",
                      "editable": true,
                      "type": "integer",
                      "value": 3600
                    },
                    {
                      "name": "status",
                      "description": "The status of the Domain it can be disabled, active, or edit_mode.\n",
                      "editable": true,
                      "type": "enum",
                      "value": "active"
                    },
                    {
                      "name": "master_ips",
                      "description": "An array of IP addresses for this Domain.\n",
                      "editable": true,
                      "type": "array",
                      "value": [
                        "127.0.0.1",
                        "255.255.255.1",
                        "123.123.123.7"
                      ]
                    },
                    {
                      "name": "axfr_ips",
                      "description": "An array of IP addresses allowed to AXFR the entire Domain.\n",
                      "editable": true,
                      "type": "array",
                      "value": [
                        "44.55.66.77"
                      ]
                    },
                    {
                      "name": "display_group",
                      "description": "A display group to keep track of this Domain.\n",
                      "editable": true,
                      "type": "string",
                      "value": "Example Display Group"
                    },
                    {
                      "name": "type",
                      "description": "Controls the Domain type.",
                      "editable": false,
                      "type": "enum",
                      "value": "master"
                    }
                  ],
                  "enums": [
                    {
                      "active": "Turn on serving of this Domain.",
                      "disabled": "Turn off serving of this Domain.",
                      "edit_mode": "Use this mode while making edits.",
                      "name": "status"
                    },
                    {
                      "master": "A primary, authoritative Domain",
                      "slave": "A secondary Domain which gets its updates from a master Domain.",
                      "name": "domain_type"
                    }
                  ]
                }
              },
              {
                "oauth": "domains:create",
                "description": "Create a Domain.\n",
                "params": [
                  {
                    "description": "The Domain name.\n",
                    "name": "domain"
                  },
                  {
                    "description": "Domain type as master or slave.\n",
                    "name": "type"
                  },
                  {
                    "optional": true,
                    "description": "Start of Authority (SOA) contact email.\n",
                    "name": "soa_email"
                  },
                  {
                    "optional": true,
                    "description": "A description to keep track of this Domain.\n",
                    "name": "description"
                  },
                  {
                    "optional": true,
                    "description": "Time interval before the Domain should be refreshed, in seconds.\n",
                    "name": "refresh_sec"
                  },
                  {
                    "optional": true,
                    "description": "Time interval that should elapse before a failed refresh should\n  be retried, in seconds.\n",
                    "name": "retry_sec"
                  },
                  {
                    "optional": true,
                    "description": "Time value that specifies the upper limit on\n  the time interval that can elapse before the Domain is no\n  longer authoritative, in seconds.\n",
                    "name": "expire_sec"
                  },
                  {
                    "optional": true,
                    "description": "Time interval that the resource record may be cached before\n  it should be discarded, in seconds.\n",
                    "name": "ttl_sec"
                  },
                  {
                    "optional": true,
                    "description": "The status of the Domain; it can be disabled, active, or edit_mode.\n",
                    "name": "status"
                  },
                  {
                    "optional": true,
                    "description": "An array of IP addresses for this Domain.\n",
                    "name": "master_ips"
                  },
                  {
                    "optional": true,
                    "description": "An array of IP addresses allowed to AXFR the entire Domain.\n",
                    "name": "axfr_ips"
                  },
                  {
                    "optional": true,
                    "description": "A display group to keep track of this Domain.\n",
                    "name": "display_group"
                  }
                ],
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\n        \"domain\": \"example.com\",\n        \"type\": \"master\",\n        \"soa_email\": \"admin@example.com\",\n        \"description\": \"Example Description\",\n        \"refresh_sec\": 14400,\n        \"retry_sec\": 3600,\n        \"expire_sec\": 604800,\n        \"ttl_sec\": 3600,\n        \"status\": \"active\",\n        \"master_ips\": [\"127.0.0.1\",\"255.255.255.1\",\"123.123.123.7\"],\n        \"axfr_ips\": [\"44.55.66.77\"],\n        \"display_group\": \"Example Display Group\"\n    }'\n    https://$api_root/$version/domains\n"
                  },
                  {
                    "name": "python",
                    "value": "import linode\nTODO\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "/domains",
            "formattedEndpoints": []
          },
          {
            "authenticated": true,
            "resource": "domain",
            "methods": [
              {
                "oauth": "domains:view",
                "description": "Returns information for the Domain identified by :id.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n    https://$api_root/$version/domains/$domain_id\n"
                  },
                  {
                    "name": "python",
                    "value": "import linode\nTODO\n"
                  }
                ],
                "name": "GET",
                "resource": {
                  "name": "Domains",
                  "prefix": "domain",
                  "description": "Domains\n",
                  "schema": [
                    {
                      "name": "0"
                    },
                    {
                      "name": "1",
                      "description": "The Domain name.\n"
                    },
                    {
                      "name": "2",
                      "description": "Start of Authority (SOA) contact email.\n"
                    },
                    {
                      "name": "3",
                      "description": "A description to keep track of this Domain.\n"
                    },
                    {
                      "name": "4",
                      "description": "Time interval before the Domain should be refreshed, in seconds.\n"
                    },
                    {
                      "name": "5",
                      "description": "Time interval that should elapse before a failed refresh should be retried, in seconds.\n"
                    },
                    {
                      "name": "6",
                      "description": "Time value that specifies the upper limit on the time interval that can elapse before the Domain is no longer authoritative, in seconds.\n"
                    },
                    {
                      "name": "7",
                      "description": "Time interval that the resource record may be cached before\n  it should be discarded, in seconds.\n"
                    },
                    {
                      "name": "8",
                      "description": "The status of the Domain it can be disabled, active, or edit_mode.\n"
                    },
                    {
                      "name": "9",
                      "description": "An array of IP addresses for this Domain.\n"
                    },
                    {
                      "name": "10",
                      "description": "An array of IP addresses allowed to AXFR the entire Domain.\n"
                    },
                    {
                      "name": "11",
                      "description": "A display group to keep track of this Domain.\n"
                    },
                    {
                      "name": "12",
                      "description": "Controls the Domain type."
                    }
                  ],
                  "enums": [
                    {
                      "active": "Turn on serving of this Domain.",
                      "disabled": "Turn off serving of this Domain.",
                      "edit_mode": "Use this mode while making edits.",
                      "name": "0"
                    },
                    {
                      "master": "A primary, authoritative Domain",
                      "slave": "A secondary Domain which gets its updates from a master Domain.",
                      "name": "1"
                    }
                  ]
                }
              },
              {
                "oauth": "domains:modify",
                "description": "Modifies a given Domain.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n  -H \"Authorization: token TOKEN\" \\\n  -X PUT -d '{\n    \"domain\": \"examplechange.com\",\n    \"description\": \"The changed description\",\n    \"display_group\": \"New display group\",\n    \"status\": \"edit_mode\",\n    \"soa_email\": \"newemail@example.com\",\n    \"retry_sec\": 3602,\n    \"master_ips\": [\"123.456.789.101\", \"192.168.1.1\", \"127.0.0.1\"],\n    \"axfr_ips\": [\"55.66.77.88\"],\n    \"expire_sec\": 604802,\n    \"refresh_sec\": 14402,\n    \"ttl_sec\": 3602\n  }'\n  https://$api_root/$version/domains/$domain_id\n"
                  },
                  {
                    "name": "python",
                    "value": "import linode\nTODO\n"
                  }
                ],
                "name": "PUT"
              },
              {
                "oauth": "domains:modify",
                "dangerous": true,
                "description": "Deletes the Domain. This action cannot be undone.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n    -X DELETE\n    https://$api_root/$version/domains/$domain_id\n"
                  },
                  {
                    "name": "python",
                    "value": "import linode\nTODO\n"
                  }
                ],
                "name": "DELETE"
              }
            ],
            "path": "/domains/:id",
            "formattedEndpoints": []
          },
          {
            "type": "list",
            "resource": "domainrecords",
            "authenticated": true,
            "description": "Manage the collection of Domain Records your account may access.\n",
            "methods": [
              {
                "oauth": "domains:view",
                "description": "Returns a list of Domain Records.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n    https://$api_root/$version/domains/$domain_id/records\n"
                  },
                  {
                    "name": "python",
                    "value": "import linode\nTODO\n"
                  }
                ],
                "name": "GET",
                "resource": {
                  "name": "Domain Records",
                  "prefix": "zrcd",
                  "description": "Domain Records: The Domain Record fields will contain different values depending on what type of record it is.\n",
                  "schema": [
                    {
                      "name": "id",
                      "type": "integer",
                      "value": 468
                    },
                    {
                      "name": "type",
                      "description": "Type of record (A/AAAA, NS, MX, CNAME, TXT, SRV).\n",
                      "type": "string",
                      "value": "A"
                    },
                    {
                      "name": "name",
                      "description": "The hostname or FQDN. When type=MX the subdomain to delegate to the Target MX server.\n",
                      "editable": true,
                      "type": "string",
                      "value": "sub.example.com"
                    },
                    {
                      "name": "target",
                      "description": "When type=MX the hostname. When type=CNAME the target of the alias. When type=TXT the value of the record. When type=A or AAAA the token of '[remote_addr]' will be substituted with the IP address of the request.\n",
                      "editable": true,
                      "type": "string",
                      "value": "sub"
                    },
                    {
                      "name": "priority",
                      "description": "Priority for MX and SRV records.\n",
                      "editable": true,
                      "type": "integer",
                      "value": 10
                    },
                    {
                      "name": "weight",
                      "description": "A relative weight for records with the same priority, higher value means more preferred.\n",
                      "editable": true,
                      "type": "integer",
                      "value": 20
                    },
                    {
                      "name": "port",
                      "description": "The TCP or UDP port on which the service is to be found.\n",
                      "editable": true,
                      "type": "integer",
                      "value": 80
                    },
                    {
                      "name": "service",
                      "description": "The service to append to an SRV record. Must conform to RFC2782 standards.\n",
                      "editable": true,
                      "type": "string",
                      "value": "_sip"
                    },
                    {
                      "name": "protocol",
                      "description": "The protocol to append to an SRV record. Must conform to RFC2782 standards.\n",
                      "editable": true,
                      "type": "string",
                      "value": "_tcp"
                    },
                    {
                      "name": "ttl_sec",
                      "description": "Time interval that the resource record may be cached before it should be discarded, in seconds. Leave as 0 to accept our default.\n",
                      "editable": true,
                      "type": "integer",
                      "value": 86400
                    }
                  ],
                  "enums": [
                    {
                      "A": "Address Mapping Record",
                      "AAAA": "IP Version 6 Address Record",
                      "NS": "Name Server Record",
                      "MX": "Mail Exchanger Record",
                      "CNAME": "Canonical Name Record",
                      "TXT": "Text Record",
                      "SRV": "Service Record",
                      "name": "Zone Record Types"
                    }
                  ]
                }
              },
              {
                "oauth": "domains:create",
                "description": "Create a Domain Record.\n",
                "params": [
                  {
                    "description": "Type of record.\n",
                    "name": "type"
                  },
                  {
                    "optional": true,
                    "description": "The hostname or FQDN. When type=MX the subdomain to delegate to the Target MX server.\n",
                    "limit": "1-100 characters",
                    "name": "name"
                  },
                  {
                    "optional": true,
                    "description": "When Type=MX the hostname. When Type=CNAME the target of the alias. When Type=TXT the value of the record. When Type=A or AAAA the token of '[remote_addr]' will be substituted with the IP address of the request.\n",
                    "name": "target"
                  },
                  {
                    "optional": true,
                    "description": "Priority for MX and SRV records.\n",
                    "name": "priority"
                  },
                  {
                    "optional": true,
                    "description": "A relative weight for records with the same priority, higher value means more preferred.\n",
                    "name": "weight"
                  },
                  {
                    "optional": true,
                    "description": "The TCP or UDP port on which the service is to be found.\n",
                    "name": "port"
                  },
                  {
                    "optional": true,
                    "description": "The service to append to an SRV record.\n",
                    "name": "service"
                  },
                  {
                    "optional": true,
                    "description": "The protocol to append to an SRV record.\n",
                    "name": "protocol"
                  },
                  {
                    "optional": true,
                    "description": "Time interval that the resource record may be cached before\n  it should be discarded. In seconds. Leave as 0 to accept\n  our default.\n",
                    "name": "ttl"
                  }
                ],
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\n        \"type\": \"A\",\n        \"target\": \"123.456.789.101\",\n        \"name\": \"sub.example.com\"\n    }'\n    https://$api_root/$version/domains/$domain_id/records\n"
                  },
                  {
                    "name": "python",
                    "value": "import linode\nTODO\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "/domains/:id/records",
            "formattedEndpoints": []
          },
          {
            "authenticated": true,
            "resource": "domainrecord",
            "methods": [
              {
                "oauth": "domains:view",
                "description": "Returns information for the Domain Record identified by \":id\".\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n  https://$api_root/$version/domains/$domain_id/records/$record_id\n"
                  },
                  {
                    "name": "python",
                    "value": "import linode\nTODO\n"
                  }
                ],
                "name": "GET",
                "resource": {
                  "name": "Domain Records",
                  "prefix": "zrcd",
                  "description": "Domain Records: The Domain Record fields will contain different values depending on what type of record it is.\n",
                  "schema": [
                    {
                      "name": "0"
                    },
                    {
                      "name": "1",
                      "description": "Type of record (A/AAAA, NS, MX, CNAME, TXT, SRV).\n"
                    },
                    {
                      "name": "2",
                      "description": "The hostname or FQDN. When type=MX the subdomain to delegate to the Target MX server.\n"
                    },
                    {
                      "name": "3",
                      "description": "When type=MX the hostname. When type=CNAME the target of the alias. When type=TXT the value of the record. When type=A or AAAA the token of '[remote_addr]' will be substituted with the IP address of the request.\n"
                    },
                    {
                      "name": "4",
                      "description": "Priority for MX and SRV records.\n"
                    },
                    {
                      "name": "5",
                      "description": "A relative weight for records with the same priority, higher value means more preferred.\n"
                    },
                    {
                      "name": "6",
                      "description": "The TCP or UDP port on which the service is to be found.\n"
                    },
                    {
                      "name": "7",
                      "description": "The service to append to an SRV record. Must conform to RFC2782 standards.\n"
                    },
                    {
                      "name": "8",
                      "description": "The protocol to append to an SRV record. Must conform to RFC2782 standards.\n"
                    },
                    {
                      "name": "9",
                      "description": "Time interval that the resource record may be cached before it should be discarded, in seconds. Leave as 0 to accept our default.\n"
                    }
                  ],
                  "enums": [
                    {
                      "A": "Address Mapping Record",
                      "AAAA": "IP Version 6 Address Record",
                      "NS": "Name Server Record",
                      "MX": "Mail Exchanger Record",
                      "CNAME": "Canonical Name Record",
                      "TXT": "Text Record",
                      "SRV": "Service Record",
                      "name": "0"
                    }
                  ]
                }
              },
              {
                "oauth": "domains:modify",
                "description": "Modifies a given Domain Record.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n  -H \"Authorization: token TOKEN\" \\\n  -X PUT -d '{\n        \"target\": \"123.456.789.102\",\n        \"name\": \"sub2.example.com\"\n  }'\n  https://$api_root/$version/domains/$domain_id/records/$record_id\n"
                  },
                  {
                    "name": "python",
                    "value": "import linode\nTODO\n"
                  }
                ],
                "name": "PUT"
              },
              {
                "oauth": "domains:modify",
                "dangerous": true,
                "description": "Deletes the Domain Record. This action cannot be undone.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n  -X DELETE\n  https://$api_root/$version/domains/$domain_id/records/$record_id\n"
                  },
                  {
                    "name": "python",
                    "value": "import linode\nTODO\n"
                  }
                ],
                "name": "DELETE"
              }
            ],
            "path": "/domains/:id/records/:id",
            "formattedEndpoints": []
          }
        ],
        "methods": null
      }
    ]
  },
  {
    "name": "NodeBalancers",
    "path": "/nodebalancers",
    "formattedEndpoints": [
      {
        "name": "NodeBalancers",
        "base_path": "/nodebalancers",
        "description": "NodeBalancer endpoints provide a means of managing NodeBalancer objects on your account.\n",
        "path": "/nodebalancers",
        "formattedEndpoints": [
          {
            "type": "list",
            "resource": "nodebalancer",
            "authenticated": true,
            "description": "Manage the collection of NodeBalancers your account may access.\n",
            "methods": [
              {
                "oauth": "nodebalancers:view",
                "description": "Returns a list of NodeBalancers.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n    https://$api_root/$version/nodebalancers\n"
                  }
                ],
                "name": "GET",
                "resource": {
                  "name": "NodeBalancer",
                  "prefix": "lnde",
                  "description": "NodeBalancer objects describe a single NodeBalancer on your account.\n",
                  "schema": [
                    {
                      "name": "id",
                      "description": "An integer.",
                      "type": "integer",
                      "value": 123456
                    },
                    {
                      "name": "label",
                      "description": "The NodeBalancer's display label. Must be 3-32 ASCII characters limited to letters, numbers, underscores, and dashes, starting and ending with a letter, and without two dashes or underscores in a row.",
                      "editable": true,
                      "type": "string",
                      "value": "nodebalancer12345"
                    },
                    {
                      "name": "hostname",
                      "description": "The NodeBalancer's hostname.",
                      "editable": false,
                      "type": "string",
                      "value": "nb-69-164-223-4.us-east-1a.nodebalancer.linode.com"
                    },
                    {
                      "name": "client_conn_throttle",
                      "description": "Throttle connections per second. 0 to disable, max of 20.",
                      "editable": true,
                      "type": "integer",
                      "value": 10
                    }
                  ]
                }
              },
              {
                "money": true,
                "oauth": "nodebalancers:create",
                "description": "Creates a new NodeBalancer.\n",
                "params": [
                  {
                    "description": "A region ID to provision this NodeBalancer in.\n",
                    "type": "region",
                    "name": "region"
                  },
                  {
                    "optional": true,
                    "description": "The label to assign this NodeBalancer. Defaults to \"nodebalancer\" followed by its ID.",
                    "limit": "3-32 ASCII characters limited to letters, numbers, underscores, and dashes, starting and ending with a letter, and without two dashes or underscores in a row",
                    "name": "label"
                  },
                  {
                    "optional": true,
                    "description": "To help mitigate abuse, throttle connections per second, per client. 0 to disable, max of 20.\n",
                    "name": "client_conn_throttle"
                  }
                ],
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\n        \"region\": \"us-east-1a\",\n        \"label\": \"my_cool_balancer\",\n        \"client_conn_throttle\": 10\n    }' \\\n    https://$api_root/$version/nodebalancers\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "/nodebalancers",
            "formattedEndpoints": []
          },
          {
            "type": "resource",
            "resource": "nodebalancer",
            "authenticated": true,
            "description": "Manage a particular NodeBalancer your account may access.\n",
            "methods": [
              {
                "oauth": "nodebalancers:view",
                "description": "Returns information about this NodeBalancer.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n    https://$api_root/$version/nodebalancers/$nodebalancer_id\n"
                  }
                ],
                "name": "GET",
                "resource": {
                  "name": "NodeBalancer",
                  "prefix": "lnde",
                  "description": "NodeBalancer objects describe a single NodeBalancer on your account.\n",
                  "schema": [
                    {
                      "name": "0",
                      "description": "An integer."
                    },
                    {
                      "name": "1",
                      "description": "The NodeBalancer's display label. Must be 3-32 ASCII characters limited to letters, numbers, underscores, and dashes, starting and ending with a letter, and without two dashes or underscores in a row."
                    },
                    {
                      "name": "2",
                      "description": "The NodeBalancer's hostname."
                    },
                    {
                      "name": "3",
                      "description": "Throttle connections per second. 0 to disable, max of 20."
                    }
                  ]
                }
              },
              {
                "oauth": "nodebalancers:modify",
                "description": "Modifies this NodeBalancer.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X PUT -d '{\n        \"region\": \"us-east-1a\",\n        \"label\": \"awesome_new_label\",\n        \"client_conn_throttle\": 14\n    }' \\\n    https://$api_root/$version/nodebalancers/$nodebalancer_id\n"
                  }
                ],
                "name": "PUT"
              },
              {
                "oauth": "nodebalancers:delete",
                "dangerous": true,
                "description": "Deletes this NodeBalancer and all associated configs and nodes. This action cannot be undone.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n    -X DELETE \\\n    https://$api_root/$version/nodebalancers/$nodebalancer_id\n"
                  }
                ],
                "name": "DELETE"
              }
            ],
            "path": "/nodebalancers/:id",
            "formattedEndpoints": []
          },
          {
            "type": "list",
            "resource": "nodebalancer_config",
            "authenticated": true,
            "description": "Manage the configs on this NodeBalancer.\n",
            "methods": [
              {
                "oauth": "nodebalancers:view",
                "description": "Returns a list of configs for a given NodeBalancer.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n    https://$api_root/$version/nodebalancers/$nodebalancer_id/configs\n"
                  }
                ],
                "name": "GET"
              },
              {
                "oauth": "nodebalancers:create",
                "description": "Creates a NodeBalancer config.\n",
                "params": [
                  {
                    "description": "Unique label for your NodeBalancer config.",
                    "name": "label"
                  },
                  {
                    "description": "Port to bind to on the public interfaces.",
                    "limit": "1-65534",
                    "name": "port"
                  },
                  {
                    "description": "The protocol used for the config.",
                    "name": "protocol"
                  },
                  {
                    "description": "Balancing algorithm.",
                    "name": "algorithm"
                  },
                  {
                    "description": "Session persistence. Route subsequent requests from a client to the same backend.",
                    "name": "stickiness"
                  },
                  {
                    "description": "Perform active health checks on the backend nodes.",
                    "name": "check"
                  },
                  {
                    "description": "Seconds between health check probes.",
                    "name": "check_interval"
                  },
                  {
                    "description": "Seconds to wait before considering the probe a failure.",
                    "limit": "1-30. Must be less than check_interval",
                    "name": "check_timeout"
                  },
                  {
                    "description": "Number of failed probes before taking a node out of rotation.",
                    "limit": "1-30",
                    "name": "check_attempts"
                  },
                  {
                    "description": "When check is \"http\", the path to request.",
                    "name": "check_path"
                  },
                  {
                    "description": "When check is \"http\", a regex to match within the first 16,384 bytes of the response body.",
                    "name": "check_body"
                  },
                  {
                    "description": "Enable passive checks based on observing communication with back-end nodes.",
                    "name": "check_passive"
                  },
                  {
                    "description": "SSL cipher suite to enforce.",
                    "name": "cipher_suite"
                  }
                ],
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\n        \"label\": \"myNodeBalancer\",\n        \"port\": 80,\n        \"protocol\": \"http\",\n        \"algorithm\": \"roundrobin\",\n        \"stickiness\": \"none\",\n        \"check\": \"http_body\",\n        \"check_interval\": 5,\n        \"check_timeout\": 3,\n        \"check_attempts\": 10,\n        \"check_path\": \"/path/to/check\",\n        \"check_body\": \"we got some stuff back\",\n        \"cipher_suite\": \"legacy\"\n    }' \\\n    https://$api_root/$version/nodebalancers\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "/nodebalancers/:id/configs",
            "formattedEndpoints": []
          },
          {
            "type": "resource",
            "authenticated": true,
            "description": "Manage a particular NodeBalancer config.\n",
            "methods": [
              {
                "oauth": "nodebalancers:view",
                "description": "Returns information about this NodeBalancer config.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n    https://$api_root/$version/nodebalancers/$nodebalancer_id/configs/$config_id\n"
                  }
                ],
                "name": "GET"
              },
              {
                "oauth": "nodebalancers:modify",
                "description": "Deletes a NodeBalancer config and all associated nodes. This action cannot be undone.\n",
                "dangerous": true,
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n    -X DELETE \\\n    https://$api_root/$version/nodebalancers/$nodebalancer_id/configs/$config_id\n"
                  }
                ],
                "name": "DELETE"
              }
            ],
            "path": "/nodebalancers/:id/configs/:id",
            "formattedEndpoints": []
          },
          {
            "type": "resource",
            "authenticated": true,
            "description": "Add or update SSL certificate and https protocol to an existing config profile.\n",
            "methods": [
              {
                "oauth": "nodebaalancers:modify",
                "description": "Adds/updates SSL certificates",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\n      \"ssl_cert\": \"----- BEGIN CERTIFICATE ----- < etc...> ----- END CERTIFICATE -----\",\n      \"ssl_key\": \"----- BEGIN PRIVATE KEY ----- < etc...> ----- END PRIVATE KEY -----\"\n    }' \\\n    https://$api_root/$version/nodebalancers/$nodebalancer_id/configs/$config_id/ssl\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "/nodebalancers/:id/configs/:id/ssl",
            "formattedEndpoints": []
          },
          {
            "type": "list",
            "resource": "nodebalancer_config_nodes",
            "authenticated": true,
            "description": "Manage the nodes for a specified NodeBalancer config.\n",
            "methods": [
              {
                "oauth": "nodebalancers:view",
                "description": "Returns a list of config nodes for a given NodeBalancer.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n    https://$api_root/$version/nodebalancers/$nodebalancer_id/configs/$config_id/nodes\n"
                  }
                ],
                "name": "GET"
              },
              {
                "oauth": "nodebalancers:create",
                "description": "Creates a new NodeBalancer config node.",
                "params": [
                  {
                    "description": "Unique label for your NodeBalancer config node.",
                    "name": "label"
                  },
                  {
                    "description": "The address:port combination used to communicate with this node.",
                    "name": "address"
                  },
                  {
                    "description": "Load balancing weight, 1-255. Higher means more connections.",
                    "name": "weight"
                  },
                  {
                    "description": "The connections mode for this node. One of 'accept', 'reject', or 'drain'.",
                    "name": "mode"
                  },
                  {
                    "description": "The status of this node.",
                    "name": "status"
                  }
                ],
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n  -H \"Authorization: token $TOKEN\" \\\n  -X POST -d '{\n      \"label\": \"greatest_node_ever\",\n      \"address\": \"192.168.4.5:80\",\n      \"weight\": 40,\n      \"mode\": \"accept\",\n      \"status\": \"online\"\n  }' \\\n  https://$api_root/$version/nodebalancers/$nodebalancer_id/configs/$config_id/nodes\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "/nodebalancers/:id/configs/:id/nodes",
            "formattedEndpoints": []
          },
          {
            "type": "resource",
            "authenticated": true,
            "description": "Manage a particular NodeBalancer config node.\n",
            "methods": [
              {
                "oauth": "nodebalancers:view",
                "description": "Returns information about this node..\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n    https://$api_root/$version/nodebalancers/$nodebalancer_id/configs/$config_id/nodes/$node_id\n"
                  }
                ],
                "name": "GET"
              },
              {
                "oauth": "nodebalancers:modify",
                "description": "Modifies this node\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n  -H \"Authorization: token $TOKEN\" \\\n  -X PUT -d '{\n      \"label\": \"node001\",\n      \"address\": \"192.168.12.12:100\",\n      \"weight\": 40,\n      \"mode\": \"accept\",\n      \"status\": \"online\"\n  }' \\\n  https://$api_root/$version/nodebalancers/$nodebalancer_id/configs/$config_id/nodes/$node_id\n"
                  }
                ],
                "name": "PUT"
              },
              {
                "oauth": "nodebalancers:modify",
                "description": "Deletes a NodeBalancer config. This action cannot be undone.\n",
                "dangerous": true,
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n    -X DELETE \\\n    https://$api_root/$version/nodebalancers/$nodebalancer_id/configs/$config_id/nodes/$node_id\n"
                  }
                ],
                "name": "DELETE"
              }
            ],
            "path": "/nodebalancers/:id/configs/:id/nodes/:id",
            "formattedEndpoints": []
          }
        ],
        "methods": null
      }
    ]
  },
  {
    "name": "Networking",
    "path": "/networking",
    "formattedEndpoints": [
      {
        "name": "Networking",
        "sort": 1,
        "base_path": "/networking",
        "description": "Networking endpoints provide a means of viewing networking objects.\n",
        "path": "/networking",
        "formattedEndpoints": [
          {
            "type": "list",
            "authenticated": true,
            "description": "View and manage IPv4 Addresses you own.\n",
            "methods": [
              {
                "oauth": "ips:view",
                "description": "Returns a list of IPv4 Addresses\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n  https://api.alpha.linode.com/v4/networking/ipv4\n"
                  }
                ],
                "name": "GET"
              },
              {
                "money": true,
                "oauth": "ips:create",
                "description": "Create a new Public IPv4 Address\n",
                "params": [
                  {
                    "description": "The Linode ID to assign this IP to.\n",
                    "type": "int",
                    "name": "linode"
                  }
                ],
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\"linode\":123}' \\\n    https://api.alpha.linode.com/v4/networking/ipv4\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "/networking/ipv4",
            "formattedEndpoints": []
          },
          {
            "type": "resource",
            "authenticated": true,
            "description": "Manage a single IPv4 Address\n",
            "methods": [
              {
                "oauth": "ips:get",
                "description": "Returns a single IPv4 Address\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n  https://$api_root/$version/networking/ipv4/97.107.143.37\n"
                  }
                ],
                "name": "GET"
              },
              {
                "oauth": "ips:modify",
                "description": "Update RDNS on one IPv4 Address.  Set RDNS to null to reset.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X PUT -d '{\"rdns\":\"example.org\"}' \\\n    https://$api_root/$version/networking/ipv4/97.107.143.37\n"
                  }
                ],
                "name": "PUT"
              }
            ],
            "path": "/networking/ipv4/:address",
            "formattedEndpoints": []
          },
          {
            "type": "list",
            "authenticated": true,
            "description": "Manage IPv6 Global Pools.\n",
            "methods": [
              {
                "oauth": "ips:view",
                "description": "Returns a list of IPv6 Pools.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n    https://$api_root/$version/networking/ipv6\n"
                  }
                ],
                "name": "GET"
              }
            ],
            "path": "/networking/ipv6",
            "formattedEndpoints": []
          },
          {
            "type": "resource",
            "authenticated": true,
            "description": "Manage a single IPv6 Address.  Address in URL can be as compressed as you want.\n",
            "methods": [
              {
                "oauth": "ips:view",
                "description": "Return a single IPv6 Address.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n    https://$api_root/$version/networkint/ipv6/2600:3c01::2:5001\n"
                  }
                ],
                "name": "GET"
              },
              {
                "oauth": "ips:modify",
                "description": "Set RDNS on a single IPv6 Address.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X PUT -d '{\"rdns\":\"example.org\"}' \\\n    https://$api_root/$version/networking/ipv6/2600:3c01::2:5001\n"
                  }
                ],
                "name": "PUT"
              }
            ],
            "path": "/networking/ipv6/:address",
            "formattedEndpoints": []
          },
          {
            "type": "strange",
            "authenticated": true,
            "description": "Assigns an IPv4 address to a Linode.\n",
            "methods": [
              {
                "oauth": "linodes:access",
                "dangerous": true,
                "params": [
                  {
                    "description": "The region where the IPv4 address and Linode are located.\n",
                    "type": "region",
                    "name": "region"
                  },
                  {
                    "description": "An array of IPv4 addresses and the Linode IDs they will be assigned to\n",
                    "type": "array",
                    "name": "assignments"
                  }
                ],
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\n        \"region\": \"us-east-1a\",\n        \"assignments\": [\n          {\"address\": \"210.111.22.95\", \"linode_id\": 134504},\n          {\"address\": \"190.12.207.11\", \"linode_id\": 119034},\n        ]\n    }' \\\nhttps://$api_root/$version/networking/ip-assign\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "/networking/ip-assign",
            "formattedEndpoints": []
          }
        ],
        "methods": null
      }
    ]
  },
  {
    "name": "Regions",
    "path": "/regions",
    "formattedEndpoints": [
      {
        "name": "Regions",
        "base_path": "/regions",
        "description": "Region endpoints provide a means of viewing region objects.\n",
        "path": "/regions",
        "formattedEndpoints": [
          {
            "type": "list",
            "resource": "regions",
            "description": "Returns collection of regions.\n",
            "methods": [
              {
                "description": "Returns list of regions.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl https://$api_root/$version/regions\n"
                  },
                  {
                    "name": "python",
                    "value": "import regions\nTODO\n"
                  }
                ],
                "name": "GET"
              }
            ],
            "path": "/regions",
            "formattedEndpoints": []
          },
          {
            "type": "resource",
            "resource": "region",
            "description": "Return a particular region.\n",
            "methods": [
              {
                "description": "Returns information about this region.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl https://$api_root/$version/region/$region_id\n"
                  },
                  {
                    "name": "python",
                    "value": "import regions\nTODO\n"
                  }
                ],
                "name": "GET"
              }
            ],
            "path": "/regions/:id",
            "formattedEndpoints": []
          }
        ],
        "methods": null
      }
    ]
  },
  {
    "name": "Support",
    "path": "/support",
    "formattedEndpoints": [
      {
        "name": "Support Tickets",
        "sort": 0,
        "base_path": "/support/tickets",
        "description": "Support tickets allow you to view, submit, and manage requests for help to the Linode support team.\n",
        "path": "/support/tickets",
        "formattedEndpoints": [
          {
            "type": "list",
            "resource": "supportticket",
            "authenticated": true,
            "description": "Manage the support tickets your account can access.\n",
            "methods": [
              {
                "oauth": "tickets:view",
                "description": "Returns a list of Support Tickets.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n    https://$api_root/$version/support/tickets\n"
                  }
                ],
                "name": "GET",
                "resource": {
                  "name": "Support Ticket",
                  "description": "Support ticket objects describe requests to the Linode support team.\n",
                  "schema": [
                    {
                      "name": "id",
                      "description": "This ticket's ID",
                      "type": "integer",
                      "value": 1234
                    },
                    {
                      "name": "summary",
                      "description": "This is summary or title for the ticket.",
                      "type": "string",
                      "value": "A summary of the ticket."
                    },
                    {
                      "name": "description",
                      "description": "The full details of the issue or question.",
                      "type": "string",
                      "value": "More details about the ticket."
                    },
                    {
                      "name": "status",
                      "description": "The status of the ticket.",
                      "type": "enum",
                      "value": "open"
                    },
                    {
                      "name": "opened",
                      "type": "datetime",
                      "value": "2017-02-23T11:21:01"
                    },
                    {
                      "name": "closed",
                      "type": "datetime",
                      "value": "2017-02-25T03:20:00"
                    },
                    {
                      "name": "closed_by",
                      "description": "The user who closed this ticket.",
                      "type": "string",
                      "value": "some_user"
                    },
                    {
                      "name": "updated",
                      "type": "datetime",
                      "value": "2017-02-23T11:21:01"
                    },
                    {
                      "name": "updated_by",
                      "description": "The user who last updated this ticket.",
                      "type": "string",
                      "value": "some_other_user"
                    },
                    {
                      "name": "entity",
                      "description": "The entity this ticket was opened regarding"
                    }
                  ],
                  "enums": [
                    {
                      "new": "The support ticket has just been opened.",
                      "open": "The support ticket is open and can be replied to.",
                      "closed": "The support ticket is completed and closed.",
                      "name": "Status"
                    }
                  ]
                }
              },
              {
                "oauth": "tickets:create",
                "description": "Submit a new question and request help from the Linode support team. Only one of domain_id, linode_id, and nodebalancer_id can be set on a single ticket.\n",
                "params": [
                  {
                    "description": "A short summary or title for the support ticket.\n",
                    "type": "string",
                    "name": "summary"
                  },
                  {
                    "description": "The complete details of the support request.\n",
                    "type": "string",
                    "name": "description"
                  },
                  {
                    "description": "The Domain this ticket is regarding, if relevant.\n",
                    "type": "int",
                    "optional": true,
                    "name": "domain_id"
                  },
                  {
                    "description": "The Linode this ticket is regarding, if relevant.\n",
                    "type": "int",
                    "optional": true,
                    "name": "linode_id"
                  },
                  {
                    "description": "The NodeBalancer this ticket is regarding, if relevant.\n",
                    "type": "int",
                    "optional": true,
                    "name": "nodebalancer_id"
                  }
                ],
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\n        \"summary\": \"A question about a Linode\",\n        \"description\": \"More details about the question\",\n        \"linode_id\": 123,\n    }' \\\n    https://$api_root/$version/support/tickets\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "/support/tickets",
            "formattedEndpoints": []
          },
          {
            "type": "resource",
            "resource": "supportticket",
            "authenticated": true,
            "description": "Manage a particular support ticket your account can access.\n",
            "methods": [
              {
                "oauth": "tickets:view",
                "description": "Returns information about this support ticket.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n    https://$api_root/$version/support/ticket/$ticket_id\n"
                  }
                ],
                "name": "GET",
                "resource": {
                  "name": "Support Ticket",
                  "description": "Support ticket objects describe requests to the Linode support team.\n",
                  "schema": [
                    {
                      "name": "0",
                      "description": "This ticket's ID"
                    },
                    {
                      "name": "1",
                      "description": "This is summary or title for the ticket."
                    },
                    {
                      "name": "2",
                      "description": "The full details of the issue or question."
                    },
                    {
                      "name": "3",
                      "description": "The status of the ticket."
                    },
                    {
                      "name": "4"
                    },
                    {
                      "name": "5"
                    },
                    {
                      "name": "6",
                      "description": "The user who closed this ticket."
                    },
                    {
                      "name": "7"
                    },
                    {
                      "name": "8",
                      "description": "The user who last updated this ticket."
                    },
                    {
                      "name": "9",
                      "description": "The entity this ticket was opened regarding"
                    }
                  ],
                  "enums": [
                    {
                      "new": "The support ticket has just been opened.",
                      "open": "The support ticket is open and can be replied to.",
                      "closed": "The support ticket is completed and closed.",
                      "name": "0"
                    }
                  ]
                }
              }
            ],
            "path": "/support/tickets/:id",
            "formattedEndpoints": []
          },
          {
            "type": "list",
            "resource": "supportticketreply",
            "authenticated": true,
            "description": "Manage the replies to a particular support ticket.\n",
            "methods": [
              {
                "oauth": "tickets:view",
                "description": "Returns a list of support ticket replies.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n    https://$api_root/$version/support/tickets/$ticket_id/replies\n"
                  }
                ],
                "name": "GET",
                "resource": {
                  "name": "Support Ticket Reply",
                  "description": "This represents a reply to a support ticket.\n",
                  "schema": [
                    {
                      "name": "id",
                      "description": "This ticket's ID",
                      "type": "int",
                      "value": 1234
                    },
                    {
                      "name": "description",
                      "description": "The body of this ticket reply.",
                      "type": "string",
                      "value": "More details about the ticket."
                    },
                    {
                      "name": "created",
                      "description": "A timestamp for when the reply was submitted.",
                      "type": "datetime",
                      "value": "2017-02-23T11:21:01"
                    },
                    {
                      "name": "created_by",
                      "description": "The user who submitted this reply.",
                      "type": "string",
                      "value": "some_other_user"
                    }
                  ]
                }
              },
              {
                "oauth": "tickets:modify",
                "description": "Add a new reply to an existing support ticket.\n",
                "params": [
                  {
                    "description": "The reply to attach to the support ticket.\n",
                    "type": "string",
                    "name": "description"
                  }
                ],
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\n        \"description\": \"More details about the ticket\",\n    }' \\\n    https://$api_root/$version/support/tickets/$ticket_id/replies\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "/support/tickets/:id/replies",
            "formattedEndpoints": []
          },
          {
            "type": "list",
            "resource": "supportticket",
            "authenticated": true,
            "methods": [
              {
                "oauth": "tickets:modify",
                "description": "Add a file attachment to a particular support ticket.\n",
                "params": [
                  {
                    "description": "The file to attach. There is a 5MB size limit.\n",
                    "type": "string",
                    "name": "file"
                  }
                ],
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: multipart/form-data\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST \\\n    -F file=@/path/to/file \\\n    https://$api_root/$version/support/tickets/$ticket_id/attachments\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "/support/tickets/:id/attachments",
            "formattedEndpoints": []
          }
        ],
        "methods": null
      }
    ]
  },
  {
    "name": "Account",
    "path": "/account",
    "formattedEndpoints": [
      {
        "name": "",
        "sort": 1,
        "base_path": "/account",
        "description": "Account endpoints provide a means of viewing user profile objects, as well as managing OAuth Clients and Tokens.\n",
        "path": "/account",
        "formattedEndpoints": [
          {
            "type": "resource",
            "resource": "account",
            "description": "Manage your user information.\n",
            "methods": [
              {
                "description": "Returns your user information.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl https://$api_root/$version/account/profile\n"
                  }
                ],
                "name": "GET",
                "resource": {
                  "name": "Profile",
                  "prefix": "account/profile",
                  "description": "Your User profile information.\n",
                  "schema": [
                    {
                      "name": "username",
                      "description": "The username of the user.\n",
                      "type": "string",
                      "value": "example_user"
                    },
                    {
                      "name": "email",
                      "description": "The email address of the user.\n",
                      "editable": true,
                      "type": "string",
                      "value": "person@place.com"
                    },
                    {
                      "name": "timezone",
                      "description": "The selected timezone of the user location.",
                      "editable": true,
                      "type": "string",
                      "value": "US/Eastern"
                    },
                    {
                      "name": "email_notifications",
                      "description": "Toggles to determine if the user receives email notifications",
                      "editable": true,
                      "type": "boolean",
                      "value": true
                    },
                    {
                      "name": "referrals",
                      "description": "Displays information related to referral signups attributed to the user.\n"
                    },
                    {
                      "name": "ip_whitelist_enabled",
                      "description": "When enabled, you can only log in from an IP address on your whitelist.\n",
                      "editable": true,
                      "type": "boolean",
                      "value": true
                    },
                    {
                      "name": "lish_auth_method",
                      "description": "Controls what authentication methods are allowed to connect to the Lish console servers.\n",
                      "editable": true,
                      "type": "enum",
                      "value": "password_keys"
                    },
                    {
                      "name": "authorized_keys",
                      "description": "Comma-delimited list of authorized SSH public keys",
                      "editable": true,
                      "type": "string",
                      "value": "ssh-rsa AADDDDB3NzaC1yc2EAAAADAQABAAACAQDzP5sZlvUR9nZPy0WrklktNXffq+nQoEYUdVJ0hpIzZs+KqjZ3CDbsJZF0g0pn1/gpY9oSEeXzFpWasdkjlfasdf09asldf+O+y8w6rbPe8IyP1mext4cmBe6g/nHAjw/k0rS6cuUFZu++snG0qubymE9gMZ3X0ac92TP7tk0dEwq1fbjumhqNmNyqSbt5j8pLuLRhYHhVszmwnuKjeGjm9mJLJGnd5V6IdZWEIhCjrNgNr1H+fVNI87ryFE31i/i/bnHcbnkNdAmDc2EQ2gJ33vXg8D8Nf2aI+K+e3t9MiFVTJmzAILQpvZQj2YV4mfOt+GSTUJ4VdgH9dNC/3lA0yoP6YoFYw0cdTKhJ0MotmR9iZepbJfbuXxAFOECJuC1bxFtUam3fIsGqj3vXi1R6CzRzxNERqPGLiFcXH8z0VTwXA1v+iflVd4KqihnwNtU+45TXTtFY0twLQRauB9qo9slvnhYlHqQZb8SBYw5WltX3MBQpyLTSZLQLqIKZVgQRKKF413fT52vMF54zk5SpImm5qY5Q1E4od00UJ1x4kFe0fTUQWVgeYvL8AgFx/idUsVs9r3jRPVTUnQZNB2D+7Cyf9dUFjjpiuH3AMMZyRYfJbh/Chg8J6QXYZyEQCxMRa9/lm2rRCVfGbcfb5zgKsV/HRHI/O1F9cZ9JvykwQ== someguy@someplace.com"
                    },
                    {
                      "name": "two_factor_auth",
                      "description": "Toggles whether two factor authentication (TFA) is enabled or disabled.",
                      "editable": true,
                      "type": "boolean",
                      "value": true
                    }
                  ],
                  "enums": [
                    {
                      "password_keys": "Allow both password and key authentication",
                      "keys_only": "Allow key authentication only",
                      "disabled": "Disable Lish",
                      "name": "LishSetting"
                    }
                  ]
                }
              },
              {
                "description": "Edits your account profile.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n  -H \"Authorization: token $TOKEN\" \\\n  -X PUT -d '{\n        \"username\": \"jsmith\",\n        \"email\": \"jsmith@mycompany.com\",\n        \"timezone\": \"US/Eastern\",\n        \"email_notifications\": true,\n        \"ip_whitelist_enabled\": true,\n        \"lish_auth_method\": \"password_keys\",\n        \"authorized_keys\": \"\"\n      }\n    }' \\\n    https://$api_root/$version/account/profile\n"
                  }
                ],
                "name": "PUT"
              }
            ],
            "path": "/account/profile",
            "formattedEndpoints": []
          },
          {
            "methods": [
              {
                "description": "Change your password.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n  -H \"Authorization: token $TOKEN\" \\\n  -X POST -d '{\n      \"password\":\"hunter7\"\n  }' \\\n  https://$api_root/$version/account/profile/password\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "/account/profile/password",
            "formattedEndpoints": []
          },
          {
            "methods": [
              {
                "description": "Begin enabling TFA on your account.  Returns a two-factor secret that you must validate with the tfa-enable-confirm endpoint to require two-factor for future logins.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n  -H \"Authorization: token $TOKEN\" \\\n  -X POST \\\n  https://$api_root/$version/account/profile/tfa-enable\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "/account/profile/tfa-enable",
            "formattedEndpoints": []
          },
          {
            "methods": [
              {
                "description": "Confirm your two-factor secret and require TFA for future logins.\n",
                "params": [
                  {
                    "type": "string",
                    "description": "The code generated using the two-factor secret you got from tfa-enable\n",
                    "name": "tfa_code"
                  }
                ],
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n  -H \"Authorization: token $TOKEN\" \\\n  -X POST -d '{\n    \"tfa_code\": \"123456\"\n  }' \\\n  https://$api_root/$version/account/profile/tfa-enable-confirm\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "/account/profile/tfa-enable-confirm",
            "formattedEndpoints": []
          },
          {
            "methods": [
              {
                "description": "Disable TFA on your account.  Future logins will not require TFA.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n  -H \"Authorization: token $TOKEN\" \\\n  -X POST \\\n  https://$api_root/$version/account/profile/tfa-disable\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "/account/profile/tfa-disable",
            "formattedEndpoints": []
          },
          {
            "methods": [
              {
                "description": "Get grants for the current user.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n    https://$api_root/$version/account/profile/grants\n"
                  }
                ],
                "name": "GET"
              }
            ],
            "path": "/account/profile/grants",
            "formattedEndpoints": []
          },
          {
            "type": "list",
            "resource": "oauthtoken",
            "description": "Manage OAuth Tokens created for your user.\n",
            "methods": [
              {
                "oauth": "tokens:view",
                "description": "Get a list of all OAuth Tokens active for your user.  This includes first-party (manager) tokens, third-party OAuth Tokens, and Personal Access Tokens.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n    https://$api_root/$version/account/tokens\n"
                  }
                ],
                "name": "GET",
                "resource": {
                  "name": "OAuth Token",
                  "prefix": "account/tokens",
                  "description": "An OAuth Token granting access to your user.\n",
                  "schema": [
                    {
                      "name": "id",
                      "description": "This token's ID.\n",
                      "type": "integer",
                      "value": 123
                    },
                    {
                      "name": "client",
                      "description": "The OAuthClient this token is associated with, or null if this is a Personal Access Token.\n",
                      "type": "oauthclient",
                      "value": null
                    },
                    {
                      "name": "type",
                      "description": "If this is a Client Token or a Personal Access Token.\n",
                      "type": "enum",
                      "value": "personal_access_token"
                    },
                    {
                      "name": "scopes",
                      "description": "The OAuth Scopes this token has.\n",
                      "type": "string",
                      "value": "*"
                    },
                    {
                      "name": "label",
                      "description": "The label given to this token.\n",
                      "type": "string",
                      "value": "cli-token"
                    },
                    {
                      "name": "created",
                      "type": "datetime",
                      "value": "2017-01-01T13:46:32.000Z"
                    },
                    {
                      "name": "token",
                      "description": "The OAuth Token that you can use in API requests.  Except for the inital creation of the token, this field is truncated to 16 characters.\n",
                      "type": "string",
                      "value": "cd224292c853fe27..."
                    },
                    {
                      "name": "expiry",
                      "description": "When this token expires.\n",
                      "type": "datetime",
                      "value": "2018-01-01T13:46:32.000Z"
                    }
                  ],
                  "enums": [
                    {
                      "client_token": "A token created by a client application with an OAuth Authentication flow.",
                      "personal_access_token": "A token created through the API for use without a client application.",
                      "name": "OAuthTokenType"
                    }
                  ]
                }
              },
              {
                "oauth": "tokens:create",
                "dangerous": true,
                "description": "Creates a new Personal Access Token for your user with the given scopes and expiry.  This token can subsequently be used to access the API and make any requests it has OAuth Scopes for.\n",
                "params": [
                  {
                    "type": "string",
                    "value": "my-token",
                    "optional": true,
                    "description": "The label for this Personal Access Token.  For your reference only.\n",
                    "name": "label"
                  },
                  {
                    "type": "datetime",
                    "value": "2017-12-31T01:00:00.000Z",
                    "optional": true,
                    "description": "If provided, when this Personal Access Token will expire.  If omitted, the resulting token will be valid until it is revoked.\n",
                    "name": "expiry"
                  },
                  {
                    "type": "string",
                    "value": "linodes:view",
                    "optional": true,
                    "description": "The OAuth Scopes this token will be created with.  If omitted, the resulting token will have all OAuth Scopes.\n",
                    "name": "scopes"
                  }
                ],
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\n      \"scopes\": \"linodes:view;domains:view\"\n    }' \\\n    https://$api_root/$version/account/tokens\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "/account/tokens",
            "formattedEndpoints": []
          },
          {
            "type": "resource",
            "resource": "oauthtoken",
            "description": "Manage individual OAuth Tokens for your user.\n",
            "methods": [
              {
                "oauth": "tokens:view",
                "description": "Get a single token.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n    https://$api_root/$version/account/tokens/123\n"
                  }
                ],
                "name": "GET",
                "resource": {
                  "name": "OAuth Token",
                  "prefix": "account/tokens",
                  "description": "An OAuth Token granting access to your user.\n",
                  "schema": [
                    {
                      "name": "0",
                      "description": "This token's ID.\n"
                    },
                    {
                      "name": "1",
                      "description": "The OAuthClient this token is associated with, or null if this is a Personal Access Token.\n"
                    },
                    {
                      "name": "2",
                      "description": "If this is a Client Token or a Personal Access Token.\n"
                    },
                    {
                      "name": "3",
                      "description": "The OAuth Scopes this token has.\n"
                    },
                    {
                      "name": "4",
                      "description": "The label given to this token.\n"
                    },
                    {
                      "name": "5"
                    },
                    {
                      "name": "6",
                      "description": "The OAuth Token that you can use in API requests.  Except for the inital creation of the token, this field is truncated to 16 characters.\n"
                    },
                    {
                      "name": "7",
                      "description": "When this token expires.\n"
                    }
                  ],
                  "enums": [
                    {
                      "client_token": "A token created by a client application with an OAuth Authentication flow.",
                      "personal_access_token": "A token created through the API for use without a client application.",
                      "name": "0"
                    }
                  ]
                }
              },
              {
                "oauth": "tokens:modify",
                "description": "Edit a token's label.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X PUT -d '{\n      \"label\": \"test-new-label\"\n    }' \\\n    https://$api_root/$version/account/tokens/123\n"
                  }
                ],
                "name": "PUT"
              },
              {
                "oauth": "tokens:delete",
                "description": "Expire an OAuth Token for your user.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n    -X DELETE \\\n    https://$api_root/$version/account/tokens/123\n"
                  }
                ],
                "name": "DELETE"
              }
            ],
            "path": "/account/tokens/:id",
            "formattedEndpoints": []
          },
          {
            "type": "resource",
            "resource": "account",
            "description": "Manage your account settings.\n",
            "methods": [
              {
                "description": "Returns your account settings.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl https://$api_root/$version/account/settings\n"
                  }
                ],
                "name": "GET",
                "resource": {
                  "name": "Profile",
                  "prefix": "account/profile",
                  "description": "Your User profile information.\n",
                  "schema": [
                    {
                      "name": "0",
                      "description": "The username of the user.\n"
                    },
                    {
                      "name": "1",
                      "description": "The email address of the user.\n"
                    },
                    {
                      "name": "2",
                      "description": "The selected timezone of the user location."
                    },
                    {
                      "name": "3",
                      "description": "Toggles to determine if the user receives email notifications"
                    },
                    {
                      "name": "4",
                      "description": "Displays information related to referral signups attributed to the user.\n"
                    },
                    {
                      "name": "5",
                      "description": "When enabled, you can only log in from an IP address on your whitelist.\n"
                    },
                    {
                      "name": "6",
                      "description": "Controls what authentication methods are allowed to connect to the Lish console servers.\n"
                    },
                    {
                      "name": "7",
                      "description": "Comma-delimited list of authorized SSH public keys"
                    },
                    {
                      "name": "8",
                      "description": "Toggles whether two factor authentication (TFA) is enabled or disabled."
                    }
                  ],
                  "enums": [
                    {
                      "password_keys": "Allow both password and key authentication",
                      "keys_only": "Allow key authentication only",
                      "disabled": "Disable Lish",
                      "name": "0"
                    }
                  ]
                }
              },
              {
                "description": "Edits your account settings.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X PUT -d '{\n      \"address_1\": \"123 Main St.\",\n      \"address_2\": \"Suite 101\",\n      \"city\": \"Philadelphia\",\n      \"company\": \"My Company, LLC\",\n      \"country\": \"US\",\n      \"email\": \"jsmith@mycompany.com\",\n      \"first_name\": \"John\",\n      \"last_name\": \"Smith\",\n      \"network_helper\": true,\n      \"phone\": \"555-555-1212\",\n      \"state\": \"PA\",\n      \"zip\": 19102\n      }\n    }' \\\n    https://$api_root/$version/account/settings\n"
                  }
                ],
                "name": "PUT"
              }
            ],
            "path": "/account/settings",
            "formattedEndpoints": []
          },
          {
            "type": "list",
            "resource": "client",
            "authenticated": true,
            "description": "Manage the collection of OAuth client applications your account may access.\n",
            "methods": [
              {
                "oauth": "clients:view",
                "description": "Returns a list of clients.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization; token $TOKEN\" \\\n    https://$api_root/$version/account/clients\n"
                  }
                ],
                "name": "GET"
              },
              {
                "oauth": "clients:create",
                "description": "Registers a new OAuth client application.\n",
                "params": [
                  {
                    "description": "A name for the new client application.",
                    "type": "string",
                    "limit": "1-128 characters",
                    "name": "name"
                  },
                  {
                    "description": "A URL to redirect to after the OAuth flow has completed.",
                    "type": "string",
                    "limit": "1-512 characters",
                    "name": "redirect_uri"
                  }
                ],
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\n        \"name\": \"Example app\",\n        \"redirect_uri\": \"https://oauthreturn.example.org/\",\n    }' \\\n    https://$api_root/$version/account/clients\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "/account/clients",
            "formattedEndpoints": []
          },
          {
            "type": "resource",
            "resource": "client",
            "authenticated": true,
            "description": "Manage a particular OAuth client application your account may access.\n",
            "methods": [
              {
                "oauth": "clients:view",
                "description": "Returns information about this OAuth client.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n    https://$api_root/$version/account/clients/$client_id\n"
                  }
                ],
                "name": "GET"
              },
              {
                "oauth": "clients:modify",
                "description": "Edits this OAuth client.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X PUT -d '{\n        \"name\": \"Updated app name\",\n        \"redirect_uri\": \"https://newredirect.example.org/\",\n    }' \\\n    https://$api_root/$version/account/clients/$client_id\n"
                  }
                ],
                "name": "PUT"
              },
              {
                "oauth": "clients:delete",
                "dangerous": true,
                "description": "Delete this OAuth application. This action cannot be undone.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n    -X DELETE \\\n    https://$api_root/$version/account/clients/$client_id\n"
                  }
                ],
                "name": "DELETE"
              }
            ],
            "path": "/account/clients/:id",
            "formattedEndpoints": []
          },
          {
            "type": "action",
            "authenticated": true,
            "description": "Reset the OAuth application's client secret.\n",
            "methods": [
              {
                "oauth": "clients:modify",
                "dangerous": true,
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST \\\n    https://$api_root/$version/account/clients/$client_id/reset_secret\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "/account/clients/:id/reset_secret",
            "formattedEndpoints": []
          },
          {
            "type": "action",
            "authenticated": true,
            "description": "Manage the OAuth application's thumbnail image.\n",
            "methods": [
              {
                "oauth": "clients:view",
                "description": "Retrieve the OAuth application's current thumbnail image.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n    https://$api_root/$version/account/clients/$client_id/thumbnail\n"
                  }
                ],
                "name": "GET"
              },
              {
                "oauth": "clients:modify",
                "description": "Set or update the OAuth application's thumbnail image. If the image is larger than 128x128 it will be scaled down.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: image/png\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X PUT \\\n    --data-binary \"@/path/to/image\"\n    https://$api_root/$version/account/clients/$client_id/thumbnail\n"
                  }
                ],
                "name": "PUT"
              }
            ],
            "path": "/account/clients/:id/thumbnail",
            "formattedEndpoints": []
          },
          {
            "type": "list",
            "resource": "account",
            "description": "Returns a list of User objects associated with your account.\n",
            "methods": [
              {
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl https://$api_root/$version/account/users\n"
                  }
                ],
                "name": "GET",
                "resource": {
                  "name": "Profile",
                  "prefix": "account/profile",
                  "description": "Your User profile information.\n",
                  "schema": [
                    {
                      "name": "0",
                      "description": "The username of the user.\n"
                    },
                    {
                      "name": "1",
                      "description": "The email address of the user.\n"
                    },
                    {
                      "name": "2",
                      "description": "The selected timezone of the user location."
                    },
                    {
                      "name": "3",
                      "description": "Toggles to determine if the user receives email notifications"
                    },
                    {
                      "name": "4",
                      "description": "Displays information related to referral signups attributed to the user.\n"
                    },
                    {
                      "name": "5",
                      "description": "When enabled, you can only log in from an IP address on your whitelist.\n"
                    },
                    {
                      "name": "6",
                      "description": "Controls what authentication methods are allowed to connect to the Lish console servers.\n"
                    },
                    {
                      "name": "7",
                      "description": "Comma-delimited list of authorized SSH public keys"
                    },
                    {
                      "name": "8",
                      "description": "Toggles whether two factor authentication (TFA) is enabled or disabled."
                    }
                  ],
                  "enums": [
                    {
                      "password_keys": "Allow both password and key authentication",
                      "keys_only": "Allow key authentication only",
                      "disabled": "Disable Lish",
                      "name": "0"
                    }
                  ]
                }
              },
              {
                "description": "Creates a new user.\n",
                "params": [
                  {
                    "type": "string",
                    "description": "The username for the new user.",
                    "name": "username"
                  },
                  {
                    "type": "string",
                    "description": "The user's email.",
                    "name": "email"
                  },
                  {
                    "type": "string",
                    "description": "The user's password.",
                    "name": "password"
                  },
                  {
                    "optinoal": true,
                    "type": "bool",
                    "description": "If false, this user has access to the entire account.  Defaults to true.",
                    "name": "restricted"
                  }
                ],
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\n        \"username\": \"testguy\",\n        \"password\": \"hunter7\",\n        \"email\": \"testguy@linode.com\"\n    }' \\\n    https://$api_root/$version/account/users\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "/account/users",
            "formattedEndpoints": []
          },
          {
            "type": "resource",
            "resource": "account",
            "description": "Returns information about a specific user associated with your account.\n",
            "methods": [
              {
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl https://$api_root/$version/account/users/$username\n"
                  }
                ],
                "name": "GET",
                "resource": {
                  "name": "Profile",
                  "prefix": "account/profile",
                  "description": "Your User profile information.\n",
                  "schema": [
                    {
                      "name": "0",
                      "description": "The username of the user.\n"
                    },
                    {
                      "name": "1",
                      "description": "The email address of the user.\n"
                    },
                    {
                      "name": "2",
                      "description": "The selected timezone of the user location."
                    },
                    {
                      "name": "3",
                      "description": "Toggles to determine if the user receives email notifications"
                    },
                    {
                      "name": "4",
                      "description": "Displays information related to referral signups attributed to the user.\n"
                    },
                    {
                      "name": "5",
                      "description": "When enabled, you can only log in from an IP address on your whitelist.\n"
                    },
                    {
                      "name": "6",
                      "description": "Controls what authentication methods are allowed to connect to the Lish console servers.\n"
                    },
                    {
                      "name": "7",
                      "description": "Comma-delimited list of authorized SSH public keys"
                    },
                    {
                      "name": "8",
                      "description": "Toggles whether two factor authentication (TFA) is enabled or disabled."
                    }
                  ],
                  "enums": [
                    {
                      "password_keys": "Allow both password and key authentication",
                      "keys_only": "Allow key authentication only",
                      "disabled": "Disable Lish",
                      "name": "0"
                    }
                  ]
                }
              },
              {
                "description": "Update a user.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X PUT -d '{\n        \"email\": \"newemail@linode.com\"\n      }\n    }' \\\n    https://$api_root/$version/account/users/testguy\n"
                  }
                ],
                "name": "PUT"
              },
              {
                "description": "Deletes a user.  May not delete the last unrestricted user on the account.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n    -X DELETE \\\n    https://$api_root/$version/account/users/testguy\n"
                  }
                ],
                "name": "DELETE"
              }
            ],
            "path": "/account/users/:username",
            "formattedEndpoints": []
          },
          {
            "type": "action",
            "description": "Update a user's password\n",
            "methods": [
              {
                "params": [
                  {
                    "type": "string",
                    "description": "The user's new password.",
                    "name": "password"
                  }
                ],
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\n        \"password\": \"hunter7\",\n    }' \\\n    https://$api_root/$version/account/users/testguy/password\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "/account/users/:username/password",
            "formattedEndpoints": []
          },
          {
            "type": "resource",
            "resource": "usergrants",
            "description": "Manage grants for restricted users.  It is an error to call this endpoint for unrestrcited users.  Only unrestricted users may access this endpoint.\n",
            "methods": [
              {
                "description": "Get grants for a restricted user.",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n    https://$api_root/$version/account/users/testguy/grants\n"
                  }
                ],
                "name": "GET",
                "resource": {
                  "name": "UserGrants",
                  "description": "Information about a restricted user's grants.\n",
                  "schema": [
                    {
                      "name": "global",
                      "description": "Grants involving global permissions, such as creating resources."
                    },
                    {
                      "name": "customer",
                      "description": "Grants related to modifying the account."
                    },
                    {
                      "name": "stackscript",
                      "description": "Individual grants to StackScripts you own.  Grants include all, use, edit and delete",
                      "type": "array"
                    },
                    {
                      "name": "nodebalancer",
                      "description": "Individual grants to NodeBalancers you own.  Grants inlcude all, access, and delete",
                      "type": "array"
                    },
                    {
                      "name": "linode",
                      "description": "Individual grants to a Linode you own.  Grants incldue all, access, resize, and delete",
                      "type": "array",
                      "value": [
                        {
                          "all": {
                            "_type": "boolean",
                            "_value": false
                          },
                          "access": {
                            "_type": "boolean",
                            "_value": true
                          },
                          "delete": {
                            "_type": "boolean",
                            "_value": false
                          },
                          "id": {
                            "_type": "integer",
                            "_value": 123
                          },
                          "label": {
                            "_type": "string",
                            "_value": "linode123"
                          }
                        },
                        {
                          "all": {
                            "_type": "boolean",
                            "_value": true
                          },
                          "access": {
                            "_type": "boolean",
                            "_value": false
                          },
                          "delete": {
                            "_type": "boolean",
                            "_value": false
                          },
                          "id": {
                            "_type": "integer",
                            "_value": 324
                          },
                          "label": {
                            "_type": "string",
                            "_value": "linode324"
                          }
                        }
                      ]
                    },
                    {
                      "name": "domain",
                      "description": "Individual grants to a Domain you own.  Grants include all, access and delete",
                      "type": "array"
                    }
                  ]
                }
              },
              {
                "description": "Update grants for a restricted user.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n    -X PUT -d '{\n        \"global\": {\n            \"add_linodes\": true\n        }\n    }' \\\n    https://$api_root/$version/account/users/testguy/grants\n"
                  }
                ],
                "name": "PUT"
              }
            ],
            "path": "/account/users/:username/grants",
            "formattedEndpoints": []
          }
        ],
        "methods": null
      },
      {
        "name": "Events",
        "base_path": "/account/events",
        "description": "Event endpoints provide a means of viewing event notifications.\n",
        "path": "/account",
        "formattedEndpoints": [
          {
            "type": "list",
            "resource": "events",
            "authenticated": true,
            "description": "View the collection of events.\n",
            "methods": [
              {
                "description": "Returns a list of events.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl https://$api_root/$version/account/events\n"
                  }
                ],
                "name": "GET",
                "resource": {
                  "name": "Event",
                  "prefix": "event",
                  "description": "Event objects describe a notification on a user's account timeline.\n",
                  "schema": [
                    {
                      "name": "id",
                      "type": "integer",
                      "value": 1234
                    },
                    {
                      "name": "entity",
                      "description": "Detailed inforrmation about the event's entity, including id, type, label, and URL used to access it.\n"
                    },
                    {
                      "name": "action",
                      "description": "The action that caused this event.\n",
                      "type": "enum",
                      "value": "linode_reboot"
                    },
                    {
                      "name": "username",
                      "description": "The username of the user who initiated this event.\n",
                      "type": "string",
                      "value": "example_user"
                    },
                    {
                      "name": "status",
                      "description": "The current status of this event.  \n",
                      "type": "enum",
                      "value": "finished"
                    },
                    {
                      "name": "percent_complete",
                      "description": "A percentage estimating the amount of time remaining for an event.  Returns null for notification events.\n",
                      "type": "integer",
                      "value": 20
                    },
                    {
                      "name": "rate",
                      "description": "The rate of completion of the event.  Currently only returned for migration and resize events.\n",
                      "type": "string",
                      "value": null
                    },
                    {
                      "name": "time_remaining",
                      "description": "The estimated time remaining until the completion of this event.  Currently only returned for in progress migrations or resizes.\n",
                      "type": "string",
                      "value": null
                    },
                    {
                      "name": "seen",
                      "description": "If this event has been seen.",
                      "type": "boolean",
                      "value": false
                    },
                    {
                      "name": "read",
                      "description": "If this event has been read.",
                      "type": "boolean",
                      "value": false
                    },
                    {
                      "name": "created",
                      "type": "datetime",
                      "value": "2014-12-24T18:00:09.000Z"
                    },
                    {
                      "name": "updated",
                      "type": "datetime",
                      "value": "2014-12-24T19:00:09.000Z"
                    },
                    {
                      "name": "user_id",
                      "description": "The ID of the user who initiated this event.\n",
                      "type": "integer",
                      "value": 234567
                    }
                  ],
                  "enums": [
                    {
                      "linode_boot": "Linode boot",
                      "linode_create": "Linode create",
                      "linode_delete": "Linode delete",
                      "linode_shutdown": "Linode shutdown",
                      "linode_reboot": "Linode reboot",
                      "linode_snapshot": "Linode snapshot",
                      "linode_addip": "Linode addip",
                      "linode_migrate": "Linode migrate",
                      "linode_rebuild": "Linode rebuild",
                      "linode_clone": "Linode clone",
                      "disk_create": "Disk create",
                      "disk_delete": "Disk delete",
                      "disk_duplicate": "Disk duplicate",
                      "disk_resize": "Disk resize",
                      "backups_enable": "Backups enable",
                      "backups_cancel": "Backups cancel",
                      "backups_restore": "Backups restore",
                      "password_reset": "Password reset",
                      "dns_zone_create": "Domain create",
                      "dns_zone_delete": "Domain delete",
                      "dns_record_create": "Domain Record create",
                      "dns_record_delete": "Domain Record delete",
                      "stackscript_create": "Stackscript create",
                      "stackscript_publicize": "Stackscript publicize",
                      "stackscript_revise": "Stackscript revise",
                      "stackscript_delete": "Stackscript delete",
                      "name": "EventType"
                    },
                    {
                      "scheduled": "Event has not yet started.",
                      "started": "Event is in progress.",
                      "finished": "Event is completed.",
                      "failed": "Something went wrong.",
                      "notification": "Stateless event.",
                      "name": "EventStatus"
                    }
                  ]
                }
              }
            ],
            "path": "/account/events",
            "formattedEndpoints": []
          },
          {
            "type": "resource",
            "resource": "events",
            "authenticated": true,
            "description": "Returns information about a specific event.\n",
            "methods": [
              {
                "description": "Returns information about this event.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl https://$api_root/$version/account/event/123\n"
                  }
                ],
                "name": "GET",
                "resource": {
                  "name": "Event",
                  "prefix": "event",
                  "description": "Event objects describe a notification on a user's account timeline.\n",
                  "schema": [
                    {
                      "name": "0"
                    },
                    {
                      "name": "1",
                      "description": "Detailed inforrmation about the event's entity, including id, type, label, and URL used to access it.\n"
                    },
                    {
                      "name": "2",
                      "description": "The action that caused this event.\n"
                    },
                    {
                      "name": "3",
                      "description": "The username of the user who initiated this event.\n"
                    },
                    {
                      "name": "4",
                      "description": "The current status of this event.  \n"
                    },
                    {
                      "name": "5",
                      "description": "A percentage estimating the amount of time remaining for an event.  Returns null for notification events.\n"
                    },
                    {
                      "name": "6",
                      "description": "The rate of completion of the event.  Currently only returned for migration and resize events.\n"
                    },
                    {
                      "name": "7",
                      "description": "The estimated time remaining until the completion of this event.  Currently only returned for in progress migrations or resizes.\n"
                    },
                    {
                      "name": "8",
                      "description": "If this event has been seen."
                    },
                    {
                      "name": "9",
                      "description": "If this event has been read."
                    },
                    {
                      "name": "10"
                    },
                    {
                      "name": "11"
                    },
                    {
                      "name": "12",
                      "description": "The ID of the user who initiated this event.\n"
                    }
                  ],
                  "enums": [
                    {
                      "linode_boot": "Linode boot",
                      "linode_create": "Linode create",
                      "linode_delete": "Linode delete",
                      "linode_shutdown": "Linode shutdown",
                      "linode_reboot": "Linode reboot",
                      "linode_snapshot": "Linode snapshot",
                      "linode_addip": "Linode addip",
                      "linode_migrate": "Linode migrate",
                      "linode_rebuild": "Linode rebuild",
                      "linode_clone": "Linode clone",
                      "disk_create": "Disk create",
                      "disk_delete": "Disk delete",
                      "disk_duplicate": "Disk duplicate",
                      "disk_resize": "Disk resize",
                      "backups_enable": "Backups enable",
                      "backups_cancel": "Backups cancel",
                      "backups_restore": "Backups restore",
                      "password_reset": "Password reset",
                      "dns_zone_create": "Domain create",
                      "dns_zone_delete": "Domain delete",
                      "dns_record_create": "Domain Record create",
                      "dns_record_delete": "Domain Record delete",
                      "stackscript_create": "Stackscript create",
                      "stackscript_publicize": "Stackscript publicize",
                      "stackscript_revise": "Stackscript revise",
                      "stackscript_delete": "Stackscript delete",
                      "name": "0"
                    },
                    {
                      "scheduled": "Event has not yet started.",
                      "started": "Event is in progress.",
                      "finished": "Event is completed.",
                      "failed": "Something went wrong.",
                      "notification": "Stateless event.",
                      "name": "1"
                    }
                  ]
                }
              }
            ],
            "path": "/account/events/:id",
            "formattedEndpoints": []
          },
          {
            "type": "resource",
            "resource": "events",
            "authenticated": true,
            "methods": [
              {
                "description": "Marks all events up to and including :id as seen.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl https://$api_root/$version/account/event/123/seen\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "/account/events/:id/seen",
            "formattedEndpoints": []
          },
          {
            "type": "resource",
            "resource": "events",
            "authenticated": true,
            "methods": [
              {
                "description": "Updates specific event to designate that it has been read.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl https://$api_root/$version/account/event/123/read\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "/account/events/:id/read",
            "formattedEndpoints": []
          }
        ],
        "methods": null
      }
    ]
  }
] };