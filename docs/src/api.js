
  /**
  *   Generated Docs Source -- DO NOT EDIT
  */
  module.exports = { endpoints: [
  {
    "name": "Linodes",
    "path": "/linode",
    "routePath": "/reference/linode",
    "endpoints": [
      {
        "name": "Distributions",
        "sort": 2,
        "base_path": "/linode/distributions",
        "description": "Distribution endpoints provide a means of viewing distribution objects.\n",
        "path": "/linode",
        "methods": null,
        "endpoints": [
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
                    "value": "client.linode.get_distributions()\n"
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
                      "value": "linode/Arch2014.10",
                      "schema": null
                    },
                    {
                      "name": "created",
                      "type": "datetime",
                      "value": "2014-12-24T18:00:09.000Z",
                      "schema": null
                    },
                    {
                      "name": "label",
                      "description": "The user-friendly name of this distribution.",
                      "filterable": true,
                      "type": "string",
                      "value": "Arch Linux 2014.10",
                      "schema": null
                    },
                    {
                      "name": "minimum_storage_size",
                      "description": "The minimum size required for the distrbution image.",
                      "filterable": true,
                      "type": "integer",
                      "value": 800,
                      "schema": null
                    },
                    {
                      "name": "recommended",
                      "description": "True if this distribution is recommended by Linode.",
                      "filterable": true,
                      "type": "boolean",
                      "value": true,
                      "schema": null
                    },
                    {
                      "name": "vendor",
                      "description": "The upstream distribution vendor. Consistent between releases of a distro.",
                      "filterable": true,
                      "type": "string",
                      "value": "Arch",
                      "schema": null
                    },
                    {
                      "name": "x64",
                      "description": "True if this is a 64-bit distribution.",
                      "type": "boolean",
                      "value": true,
                      "schema": null
                    }
                  ],
                  "example": {
                    "id": "linode/Arch2014.10",
                    "created": "2014-12-24T18:00:09.000Z",
                    "label": "Arch Linux 2014.10",
                    "minimum_storage_size": 800,
                    "recommended": true,
                    "vendor": "Arch",
                    "x64": true
                  }
                }
              }
            ],
            "path": "linode/distributions",
            "routePath": "/reference/endpoints/linode/distributions",
            "endpoints": []
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
                    "value": "distro = linode.Distribution(client, 'linode/debian8')\n"
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
                      "value": "linode/Arch2014.10",
                      "schema": null
                    },
                    {
                      "name": "created",
                      "type": "datetime",
                      "value": "2014-12-24T18:00:09.000Z",
                      "schema": null
                    },
                    {
                      "name": "label",
                      "description": "The user-friendly name of this distribution.",
                      "filterable": true,
                      "type": "string",
                      "value": "Arch Linux 2014.10",
                      "schema": null
                    },
                    {
                      "name": "minimum_storage_size",
                      "description": "The minimum size required for the distrbution image.",
                      "filterable": true,
                      "type": "integer",
                      "value": 800,
                      "schema": null
                    },
                    {
                      "name": "recommended",
                      "description": "True if this distribution is recommended by Linode.",
                      "filterable": true,
                      "type": "boolean",
                      "value": true,
                      "schema": null
                    },
                    {
                      "name": "vendor",
                      "description": "The upstream distribution vendor. Consistent between releases of a distro.",
                      "filterable": true,
                      "type": "string",
                      "value": "Arch",
                      "schema": null
                    },
                    {
                      "name": "x64",
                      "description": "True if this is a 64-bit distribution.",
                      "type": "boolean",
                      "value": true,
                      "schema": null
                    }
                  ],
                  "example": {
                    "id": "linode/Arch2014.10",
                    "created": "2014-12-24T18:00:09.000Z",
                    "label": "Arch Linux 2014.10",
                    "minimum_storage_size": 800,
                    "recommended": true,
                    "vendor": "Arch",
                    "x64": true
                  }
                }
              }
            ],
            "path": "linode/distributions/:id",
            "routePath": "/reference/endpoints/linode/distributions/:id",
            "endpoints": []
          }
        ]
      },
      {
        "name": "Kernels",
        "sort": 3,
        "base_path": "/linode/kernels",
        "description": "Kernel endpoints provide a means of viewing kernel objects.\n",
        "path": "/linode",
        "methods": null,
        "endpoints": [
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
                    "value": "client.linode.get_kernels()\n"
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
                      "value": "linode/3.5.2-x86_64-linode26",
                      "schema": null
                    },
                    {
                      "name": "description",
                      "description": "Additional, descriptive text about the kernel.",
                      "type": "string",
                      "value": "null",
                      "schema": null
                    },
                    {
                      "name": "xen",
                      "description": "If this kernel is suitable for Xen Linodes.",
                      "filterable": true,
                      "type": "boolean",
                      "value": false,
                      "schema": null
                    },
                    {
                      "name": "kvm",
                      "description": "If this kernel is suitable for KVM Linodes.",
                      "filterable": true,
                      "type": "boolean",
                      "value": true,
                      "schema": null
                    },
                    {
                      "name": "label",
                      "description": "The friendly name of this kernel.",
                      "filterable": true,
                      "type": "string",
                      "value": "3.5.2-x86_64-linode26",
                      "schema": null
                    },
                    {
                      "name": "version",
                      "description": "Linux Kernel version.",
                      "filterable": true,
                      "type": "string",
                      "value": "3.5.2",
                      "schema": null
                    },
                    {
                      "name": "x64",
                      "description": "True if this is a 64-bit kernel, false for 32-bit.",
                      "filterable": true,
                      "type": "boolean",
                      "value": true,
                      "schema": null
                    },
                    {
                      "name": "current",
                      "filterable": true,
                      "type": "boolean",
                      "value": true,
                      "schema": null
                    },
                    {
                      "name": "deprecated",
                      "filterable": true,
                      "type": "boolean",
                      "value": false,
                      "schema": null
                    },
                    {
                      "name": "latest",
                      "type": "boolean",
                      "value": true,
                      "schema": null
                    }
                  ],
                  "example": {
                    "id": "linode/3.5.2-x86_64-linode26",
                    "description": "null",
                    "xen": false,
                    "kvm": true,
                    "label": "3.5.2-x86_64-linode26",
                    "version": "3.5.2",
                    "x64": true,
                    "current": true,
                    "deprecated": false,
                    "latest": true
                  }
                }
              }
            ],
            "path": "linode/kernels",
            "routePath": "/reference/endpoints/linode/kernels",
            "endpoints": []
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
                    "value": "kernel = linode.Kernel(client, 'linode/latest')\n"
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
                      "value": "linode/3.5.2-x86_64-linode26",
                      "schema": null
                    },
                    {
                      "name": "description",
                      "description": "Additional, descriptive text about the kernel.",
                      "type": "string",
                      "value": "null",
                      "schema": null
                    },
                    {
                      "name": "xen",
                      "description": "If this kernel is suitable for Xen Linodes.",
                      "filterable": true,
                      "type": "boolean",
                      "value": false,
                      "schema": null
                    },
                    {
                      "name": "kvm",
                      "description": "If this kernel is suitable for KVM Linodes.",
                      "filterable": true,
                      "type": "boolean",
                      "value": true,
                      "schema": null
                    },
                    {
                      "name": "label",
                      "description": "The friendly name of this kernel.",
                      "filterable": true,
                      "type": "string",
                      "value": "3.5.2-x86_64-linode26",
                      "schema": null
                    },
                    {
                      "name": "version",
                      "description": "Linux Kernel version.",
                      "filterable": true,
                      "type": "string",
                      "value": "3.5.2",
                      "schema": null
                    },
                    {
                      "name": "x64",
                      "description": "True if this is a 64-bit kernel, false for 32-bit.",
                      "filterable": true,
                      "type": "boolean",
                      "value": true,
                      "schema": null
                    },
                    {
                      "name": "current",
                      "filterable": true,
                      "type": "boolean",
                      "value": true,
                      "schema": null
                    },
                    {
                      "name": "deprecated",
                      "filterable": true,
                      "type": "boolean",
                      "value": false,
                      "schema": null
                    },
                    {
                      "name": "latest",
                      "type": "boolean",
                      "value": true,
                      "schema": null
                    }
                  ],
                  "example": {
                    "id": "linode/3.5.2-x86_64-linode26",
                    "description": "null",
                    "xen": false,
                    "kvm": true,
                    "label": "3.5.2-x86_64-linode26",
                    "version": "3.5.2",
                    "x64": true,
                    "current": true,
                    "deprecated": false,
                    "latest": true
                  }
                }
              }
            ],
            "path": "linode/kernels/:id",
            "routePath": "/reference/endpoints/linode/kernels/:id",
            "endpoints": []
          }
        ]
      },
      {
        "name": "Linodes",
        "sort": 0,
        "base_path": "/linode/instances",
        "description": "Linode endpoints provide a means of managing the Linode objects on your account.\n",
        "path": "/linode",
        "methods": null,
        "endpoints": [
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
                    "value": "my_linodes = client.linode.get_instances()\n"
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
                      "value": 123456,
                      "schema": null
                    },
                    {
                      "name": "alerts",
                      "description": {
                        "descText": "Toggle and set thresholds for receiving email alerts. \n",
                        "listItems": [
                          "CPU Usage - % - Average CPU usage over 2 hours exceeding this value triggers this alert. (Range 0-2000, default 90)",
                          "Disk IO Rate - IO Ops/sec - Average Disk IO ops/sec over 2 hours exceeding this value triggers this alert. (Range 0-100000, default 10000)",
                          "Incoming Traffic - Mbit/s - Average incoming traffic over a 2 hour period exceeding this value triggers this alert. (Range 0-40000, default 10)",
                          "Outbound Traffic - Mbit/s - Average outbound traffic over a 2 hour period exceeding this value triggers this alert. (Range 0-10000, default 10)",
                          "Transfer Quota - % - Percentage of network transfer quota used being greater than this value will trigger this alert. (Range 0-400, default 80)"
                        ]
                      },
                      "schema": [
                        {
                          "name": "cpu",
                          "description": "Average CPU usage over 2 hours exceeding this value triggers this alert.",
                          "schema": [
                            {
                              "name": "enabled",
                              "type": "boolean",
                              "value": true,
                              "schema": null
                            },
                            {
                              "name": "threshold",
                              "description": "CPU Usage % (Range 0-2000, default 90).",
                              "type": "integer",
                              "value": 90,
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "io",
                          "description": "Average Disk IO ops/sec over 2 hours exceeding this value triggers this alert.",
                          "schema": [
                            {
                              "name": "enabled",
                              "type": "boolean",
                              "value": true,
                              "schema": null
                            },
                            {
                              "name": "threshold",
                              "description": "Disk IO Rate ops/sec (Range 0-100000, default 10000).",
                              "type": "integer",
                              "value": 10000,
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "transfer_in",
                          "description": "Average incoming traffic over a 2 hour period exceeding this value triggers this alert.",
                          "schema": [
                            {
                              "name": "enabled",
                              "type": "boolean",
                              "value": true,
                              "schema": null
                            },
                            {
                              "name": "threshold",
                              "description": "Incoming Traffic Mbit/s (Range 0-40000, default 10).",
                              "type": "integer",
                              "value": 10,
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "transfer_out",
                          "description": "Average outbound traffic over a 2 hour period exceeding this value triggers this alert.",
                          "schema": [
                            {
                              "name": "enabled",
                              "type": "boolean",
                              "value": true,
                              "schema": null
                            },
                            {
                              "name": "threshold",
                              "description": "Outbound Traffic Mbit/s (Range 0-10000, default 10).",
                              "type": "integer",
                              "value": 10,
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "transfer_quota",
                          "description": "Percentage of network transfer quota used being greater than this value will trigger this alert.",
                          "schema": [
                            {
                              "name": "enabled",
                              "type": "boolean",
                              "value": true,
                              "schema": null
                            },
                            {
                              "name": "threshold",
                              "description": "Transfer Quota % (Range 0-400, default 80).",
                              "type": "integer",
                              "value": 80,
                              "schema": null
                            }
                          ]
                        }
                      ]
                    },
                    {
                      "name": "backups",
                      "description": "Displays if backups are enabled, last backup datetime if applicable, and the day/window your backups will occur. Window is prefixed by a \"W\" and an integer representing the two-hour window in 24-hour UTC time format. For example, 2AM is represented as \"W2\", 8PM as \"W20\", etc. (W0, W2, W4...W22)\n",
                      "schema": [
                        {
                          "name": "enabled",
                          "type": "boolean",
                          "value": true,
                          "schema": null
                        },
                        {
                          "name": "schedule",
                          "description": "The day and window of a Linode's automatic backups.",
                          "schema": [
                            {
                              "name": "day",
                              "type": "string",
                              "value": "Tuesday",
                              "schema": null
                            },
                            {
                              "name": "window",
                              "type": "string",
                              "value": "W20",
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "last_backup",
                          "description": "If enabled, the last backup that was successfully taken.",
                          "type": "backup",
                          "schema": [
                            {
                              "name": "id",
                              "type": "integer",
                              "value": 123456,
                              "schema": null
                            },
                            {
                              "name": "label",
                              "description": "Human-friendly backup name.",
                              "filterable": false,
                              "type": "string",
                              "value": "A label for your snapshot",
                              "schema": null
                            },
                            {
                              "name": "status",
                              "description": "Status of the backup.",
                              "filterable": false,
                              "type": "enum",
                              "subType": "Status",
                              "value": "successful",
                              "schema": [
                                {
                                  "name": "offline",
                                  "description": "The Linode is powered off."
                                },
                                {
                                  "name": "booting",
                                  "description": "The Linode is currently booting up."
                                },
                                {
                                  "name": "running",
                                  "description": "The Linode is currently running."
                                },
                                {
                                  "name": "shutting_down",
                                  "description": "The Linode is currently shutting down."
                                },
                                {
                                  "name": "rebooting",
                                  "description": "The Linode is rebooting."
                                },
                                {
                                  "name": "provisioning",
                                  "description": "The Linode is being created."
                                },
                                {
                                  "name": "deleting",
                                  "description": "The Linode is being deleted."
                                },
                                {
                                  "name": "migrating",
                                  "description": "The Linode is being migrated to a new host/region."
                                }
                              ]
                            },
                            {
                              "name": "type",
                              "description": "Whether this is a snapshot or an auto backup.",
                              "type": "enum",
                              "subType": "Type",
                              "value": "snapshot",
                              "schema": null
                            },
                            {
                              "name": "region",
                              "description": "This backup  region.",
                              "filterable": false,
                              "type": "region",
                              "schema": [
                                {
                                  "name": "id",
                                  "type": "string",
                                  "value": "us-east-1a",
                                  "schema": null
                                },
                                {
                                  "name": "label",
                                  "description": "Human-friendly region name.",
                                  "filterable": true,
                                  "type": "string",
                                  "value": "Newark, NJ",
                                  "schema": null
                                },
                                {
                                  "name": "country",
                                  "description": "Country",
                                  "filterable": true,
                                  "type": "string",
                                  "value": "US",
                                  "schema": null
                                }
                              ]
                            },
                            {
                              "name": "created",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            },
                            {
                              "name": "updated",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            },
                            {
                              "name": "finished",
                              "description": "An ISO 8601 datetime of when the backup completed.",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            },
                            {
                              "name": "configs",
                              "description": "A JSON Array of config labels that were included in this backup.",
                              "type": "array",
                              "subType": "string",
                              "value": [
                                "My Debian8 Profile"
                              ],
                              "schema": null
                            },
                            {
                              "name": "disks",
                              "description": "A JSON Array of JSON Objects describing the disks included in this backup.",
                              "type": "array",
                              "subType": "disk",
                              "value": [
                                [
                                  {
                                    "name": "label",
                                    "type": "string",
                                    "value": "My Debian8 Disk",
                                    "schema": null
                                  },
                                  {
                                    "name": "size",
                                    "type": "integer",
                                    "value": 24064,
                                    "schema": null
                                  },
                                  {
                                    "name": "filesystem",
                                    "type": "string",
                                    "value": "ext4",
                                    "schema": null
                                  }
                                ],
                                [
                                  {
                                    "name": "label",
                                    "type": "string",
                                    "value": "swap",
                                    "schema": null
                                  },
                                  {
                                    "name": "size",
                                    "type": "integer",
                                    "value": 512,
                                    "schema": null
                                  },
                                  {
                                    "name": "filesystem",
                                    "type": "string",
                                    "value": "swap",
                                    "schema": null
                                  }
                                ]
                              ],
                              "schema": [
                                {
                                  "name": "label",
                                  "type": "string",
                                  "value": "My Debian8 Disk",
                                  "schema": null
                                },
                                {
                                  "name": "size",
                                  "type": "integer",
                                  "value": 24064,
                                  "schema": null
                                },
                                {
                                  "name": "filesystem",
                                  "type": "string",
                                  "value": "ext4",
                                  "schema": null
                                }
                              ]
                            },
                            {
                              "name": "availability",
                              "description": "If this backup is available, which backup slot it is in.  Otherwise, unavailable.",
                              "type": "enum",
                              "subType": "BackupAvailability",
                              "value": "daily",
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "snapshot",
                          "description": "If enabled, the last snapshot that was successfully taken.",
                          "type": "backup",
                          "schema": [
                            {
                              "name": "id",
                              "type": "integer",
                              "value": 123456,
                              "schema": null
                            },
                            {
                              "name": "label",
                              "description": "Human-friendly backup name.",
                              "filterable": false,
                              "type": "string",
                              "value": "A label for your snapshot",
                              "schema": null
                            },
                            {
                              "name": "status",
                              "description": "Status of the backup.",
                              "filterable": false,
                              "type": "enum",
                              "subType": "Status",
                              "value": "successful",
                              "schema": [
                                {
                                  "name": "offline",
                                  "description": "The Linode is powered off."
                                },
                                {
                                  "name": "booting",
                                  "description": "The Linode is currently booting up."
                                },
                                {
                                  "name": "running",
                                  "description": "The Linode is currently running."
                                },
                                {
                                  "name": "shutting_down",
                                  "description": "The Linode is currently shutting down."
                                },
                                {
                                  "name": "rebooting",
                                  "description": "The Linode is rebooting."
                                },
                                {
                                  "name": "provisioning",
                                  "description": "The Linode is being created."
                                },
                                {
                                  "name": "deleting",
                                  "description": "The Linode is being deleted."
                                },
                                {
                                  "name": "migrating",
                                  "description": "The Linode is being migrated to a new host/region."
                                }
                              ]
                            },
                            {
                              "name": "type",
                              "description": "Whether this is a snapshot or an auto backup.",
                              "type": "enum",
                              "subType": "Type",
                              "value": "snapshot",
                              "schema": null
                            },
                            {
                              "name": "region",
                              "description": "This backup  region.",
                              "filterable": false,
                              "type": "region",
                              "schema": [
                                {
                                  "name": "id",
                                  "type": "string",
                                  "value": "us-east-1a",
                                  "schema": null
                                },
                                {
                                  "name": "label",
                                  "description": "Human-friendly region name.",
                                  "filterable": true,
                                  "type": "string",
                                  "value": "Newark, NJ",
                                  "schema": null
                                },
                                {
                                  "name": "country",
                                  "description": "Country",
                                  "filterable": true,
                                  "type": "string",
                                  "value": "US",
                                  "schema": null
                                }
                              ]
                            },
                            {
                              "name": "created",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            },
                            {
                              "name": "updated",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            },
                            {
                              "name": "finished",
                              "description": "An ISO 8601 datetime of when the backup completed.",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            },
                            {
                              "name": "configs",
                              "description": "A JSON Array of config labels that were included in this backup.",
                              "type": "array",
                              "subType": "string",
                              "value": [
                                "My Debian8 Profile"
                              ],
                              "schema": null
                            },
                            {
                              "name": "disks",
                              "description": "A JSON Array of JSON Objects describing the disks included in this backup.",
                              "type": "array",
                              "subType": "disk",
                              "value": [
                                [
                                  {
                                    "name": "label",
                                    "type": "string",
                                    "value": "My Debian8 Disk",
                                    "schema": null
                                  },
                                  {
                                    "name": "size",
                                    "type": "integer",
                                    "value": 24064,
                                    "schema": null
                                  },
                                  {
                                    "name": "filesystem",
                                    "type": "string",
                                    "value": "ext4",
                                    "schema": null
                                  }
                                ],
                                [
                                  {
                                    "name": "label",
                                    "type": "string",
                                    "value": "swap",
                                    "schema": null
                                  },
                                  {
                                    "name": "size",
                                    "type": "integer",
                                    "value": 512,
                                    "schema": null
                                  },
                                  {
                                    "name": "filesystem",
                                    "type": "string",
                                    "value": "swap",
                                    "schema": null
                                  }
                                ]
                              ],
                              "schema": [
                                {
                                  "name": "label",
                                  "type": "string",
                                  "value": "My Debian8 Disk",
                                  "schema": null
                                },
                                {
                                  "name": "size",
                                  "type": "integer",
                                  "value": 24064,
                                  "schema": null
                                },
                                {
                                  "name": "filesystem",
                                  "type": "string",
                                  "value": "ext4",
                                  "schema": null
                                }
                              ]
                            },
                            {
                              "name": "availability",
                              "description": "If this backup is available, which backup slot it is in.  Otherwise, unavailable.",
                              "type": "enum",
                              "subType": "BackupAvailability",
                              "value": "daily",
                              "schema": null
                            }
                          ]
                        }
                      ]
                    },
                    {
                      "name": "created",
                      "type": "datetime",
                      "value": "2015-09-29T11:21:01",
                      "schema": null
                    },
                    {
                      "name": "region",
                      "description": "This Linode's region.",
                      "filterable": true,
                      "type": "region",
                      "schema": [
                        {
                          "name": "id",
                          "type": "string",
                          "value": "us-east-1a",
                          "schema": null
                        },
                        {
                          "name": "label",
                          "description": "Human-friendly region name.",
                          "filterable": true,
                          "type": "string",
                          "value": "Newark, NJ",
                          "schema": null
                        },
                        {
                          "name": "country",
                          "description": "Country",
                          "filterable": true,
                          "type": "string",
                          "value": "US",
                          "schema": null
                        }
                      ]
                    },
                    {
                      "name": "distribution",
                      "description": "The distribution that this Linode booted to last.",
                      "filterable": true,
                      "type": "distribution",
                      "schema": [
                        {
                          "name": "id",
                          "type": "string",
                          "value": "linode/Arch2014.10",
                          "schema": null
                        },
                        {
                          "name": "created",
                          "type": "datetime",
                          "value": "2014-12-24T18:00:09.000Z",
                          "schema": null
                        },
                        {
                          "name": "label",
                          "description": "The user-friendly name of this distribution.",
                          "filterable": true,
                          "type": "string",
                          "value": "Arch Linux 2014.10",
                          "schema": null
                        },
                        {
                          "name": "minimum_storage_size",
                          "description": "The minimum size required for the distrbution image.",
                          "filterable": true,
                          "type": "integer",
                          "value": 800,
                          "schema": null
                        },
                        {
                          "name": "recommended",
                          "description": "True if this distribution is recommended by Linode.",
                          "filterable": true,
                          "type": "boolean",
                          "value": true,
                          "schema": null
                        },
                        {
                          "name": "vendor",
                          "description": "The upstream distribution vendor. Consistent between releases of a distro.",
                          "filterable": true,
                          "type": "string",
                          "value": "Arch",
                          "schema": null
                        },
                        {
                          "name": "x64",
                          "description": "True if this is a 64-bit distribution.",
                          "type": "boolean",
                          "value": true,
                          "schema": null
                        }
                      ]
                    },
                    {
                      "name": "group",
                      "description": "This Linode's display group.",
                      "editable": true,
                      "filterable": true,
                      "type": "string",
                      "value": "Example",
                      "schema": null
                    },
                    {
                      "name": "ipv4",
                      "description": "This Linode's IPv4 addresses.",
                      "editable": false,
                      "type": "array",
                      "subType": "string",
                      "value": [
                        "97.107.143.8",
                        "192.168.149.108"
                      ],
                      "schema": null
                    },
                    {
                      "name": "ipv6",
                      "description": "This Linode's IPv6 slaac address.",
                      "editable": false,
                      "type": "string",
                      "value": "2a01:7e00::f03c:91ff:fe96:46f5/64",
                      "schema": null
                    },
                    {
                      "name": "label",
                      "description": "This Linode's display label.",
                      "editable": true,
                      "filterable": true,
                      "type": "string",
                      "value": "Example Linode",
                      "schema": null
                    },
                    {
                      "name": "type",
                      "description": "The type of Linode.",
                      "type": "array",
                      "subType": "service",
                      "value": [
                        [
                          {
                            "name": "id",
                            "type": "string",
                            "value": "g5-standard-1",
                            "schema": null
                          },
                          {
                            "name": "backups_price",
                            "type": "integer",
                            "value": 250,
                            "schema": null
                          },
                          {
                            "name": "class",
                            "type": "string",
                            "value": "standard",
                            "schema": null
                          },
                          {
                            "name": "disk",
                            "type": "integer",
                            "value": 24576,
                            "schema": null
                          },
                          {
                            "name": "hourly_price",
                            "type": "integer",
                            "value": 1,
                            "schema": null
                          },
                          {
                            "name": "label",
                            "type": "string",
                            "value": "Linode 2048",
                            "schema": null
                          },
                          {
                            "name": "mbits_out",
                            "type": "integer",
                            "value": 125,
                            "schema": null
                          },
                          {
                            "name": "monthly_price",
                            "type": "integer",
                            "value": 1000,
                            "schema": null
                          },
                          {
                            "name": "ram",
                            "type": "integer",
                            "value": 2048,
                            "schema": null
                          },
                          {
                            "name": "service_type",
                            "type": "enum",
                            "subType": "Service Type",
                            "value": "linode",
                            "schema": null
                          },
                          {
                            "name": "storage",
                            "type": "integer",
                            "value": 24576,
                            "schema": null
                          },
                          {
                            "name": "transfer",
                            "type": "integer",
                            "value": 2000,
                            "schema": null
                          },
                          {
                            "name": "vcpus",
                            "type": "integer",
                            "value": 2,
                            "schema": null
                          }
                        ]
                      ],
                      "schema": [
                        {
                          "name": "id",
                          "type": "string",
                          "value": "g5-standard-1",
                          "schema": null
                        },
                        {
                          "name": "backups_price",
                          "type": "integer",
                          "value": 250,
                          "schema": null
                        },
                        {
                          "name": "class",
                          "type": "string",
                          "value": "standard",
                          "schema": null
                        },
                        {
                          "name": "disk",
                          "type": "integer",
                          "value": 24576,
                          "schema": null
                        },
                        {
                          "name": "hourly_price",
                          "type": "integer",
                          "value": 1,
                          "schema": null
                        },
                        {
                          "name": "label",
                          "type": "string",
                          "value": "Linode 2048",
                          "schema": null
                        },
                        {
                          "name": "mbits_out",
                          "type": "integer",
                          "value": 125,
                          "schema": null
                        },
                        {
                          "name": "monthly_price",
                          "type": "integer",
                          "value": 1000,
                          "schema": null
                        },
                        {
                          "name": "ram",
                          "type": "integer",
                          "value": 2048,
                          "schema": null
                        },
                        {
                          "name": "service_type",
                          "type": "enum",
                          "subType": "Service Type",
                          "value": "linode",
                          "schema": null
                        },
                        {
                          "name": "storage",
                          "type": "integer",
                          "value": 24576,
                          "schema": null
                        },
                        {
                          "name": "transfer",
                          "type": "integer",
                          "value": 2000,
                          "schema": null
                        },
                        {
                          "name": "vcpus",
                          "type": "integer",
                          "value": 2,
                          "schema": null
                        }
                      ]
                    },
                    {
                      "name": "status",
                      "description": "The current state of this Linode.",
                      "filterable": true,
                      "type": "enum",
                      "subType": "Status",
                      "value": "running",
                      "schema": [
                        {
                          "name": "offline",
                          "description": "The Linode is powered off."
                        },
                        {
                          "name": "booting",
                          "description": "The Linode is currently booting up."
                        },
                        {
                          "name": "running",
                          "description": "The Linode is currently running."
                        },
                        {
                          "name": "shutting_down",
                          "description": "The Linode is currently shutting down."
                        },
                        {
                          "name": "rebooting",
                          "description": "The Linode is rebooting."
                        },
                        {
                          "name": "provisioning",
                          "description": "The Linode is being created."
                        },
                        {
                          "name": "deleting",
                          "description": "The Linode is being deleted."
                        },
                        {
                          "name": "migrating",
                          "description": "The Linode is being migrated to a new host/region."
                        }
                      ]
                    },
                    {
                      "name": "total_transfer",
                      "description": "The amount of outbound traffic used this month.",
                      "type": "integer",
                      "value": 20000,
                      "schema": null
                    },
                    {
                      "name": "updated",
                      "description": "The last updated datetime for this Linode record.",
                      "type": "datetime",
                      "value": "2015-10-27T09:59:26.000Z",
                      "schema": null
                    },
                    {
                      "name": "hypervisor",
                      "description": "The hypervisor this Linode is running on.",
                      "type": "enum",
                      "subType": "Hypervisor",
                      "value": "kvm",
                      "schema": [
                        {
                          "name": "kvm",
                          "description": "KVM"
                        },
                        {
                          "name": "xen",
                          "description": "Xen"
                        }
                      ]
                    }
                  ],
                  "enums": {
                    "Status": {
                      "offline": "The Linode is powered off.",
                      "booting": "The Linode is currently booting up.",
                      "running": "The Linode is currently running.",
                      "shutting_down": "The Linode is currently shutting down.",
                      "rebooting": "The Linode is rebooting.",
                      "provisioning": "The Linode is being created.",
                      "deleting": "The Linode is being deleted.",
                      "migrating": "The Linode is being migrated to a new host/region."
                    },
                    "BackupStatus": {
                      "pending": "Backup is in the queue and waiting to begin.",
                      "running": "Linode in the process of being backed up.",
                      "needsPostProcessing": "Backups awaiting final integration into existing backup data.",
                      "successful": "Backup successfully completed.",
                      "failed": "Linode backup failed.",
                      "userAborted": "User aborted current backup process."
                    },
                    "BackupType": {
                      "auto": "Automatic backup",
                      "snapshot": "User-initiated, manual file backup"
                    },
                    "Window": {
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
                      "W22": "2200 - 0000 UTC"
                    },
                    "Hypervisor": {
                      "kvm": "KVM",
                      "xen": "Xen"
                    }
                  },
                  "example": {
                    "id": 123456,
                    "alerts": {
                      "cpu": {
                        "enabled": true,
                        "threshold": 90
                      },
                      "io": {
                        "enabled": true,
                        "threshold": 10000
                      },
                      "transfer_in": {
                        "enabled": true,
                        "threshold": 10
                      },
                      "transfer_out": {
                        "enabled": true,
                        "threshold": 10
                      },
                      "transfer_quota": {
                        "enabled": true,
                        "threshold": 80
                      }
                    },
                    "backups": {
                      "enabled": true,
                      "schedule": {
                        "day": "Tuesday",
                        "window": "W20"
                      },
                      "last_backup": {
                        "id": 123456,
                        "label": "A label for your snapshot",
                        "status": "successful",
                        "type": "snapshot",
                        "region": {
                          "id": "us-east-1a",
                          "label": "Newark, NJ",
                          "country": "US"
                        },
                        "created": "2015-09-29T11:21:01",
                        "updated": "2015-09-29T11:21:01",
                        "finished": "2015-09-29T11:21:01",
                        "configs": [
                          "My Debian8 Profile"
                        ],
                        "disks": [
                          {
                            "label": "My Debian8 Disk",
                            "size": 24064,
                            "filesystem": "ext4"
                          },
                          {
                            "label": "swap",
                            "size": 512,
                            "filesystem": "swap"
                          }
                        ],
                        "availability": "daily"
                      },
                      "snapshot": {
                        "id": 123456,
                        "label": "A label for your snapshot",
                        "status": "successful",
                        "type": "snapshot",
                        "region": {
                          "id": "us-east-1a",
                          "label": "Newark, NJ",
                          "country": "US"
                        },
                        "created": "2015-09-29T11:21:01",
                        "updated": "2015-09-29T11:21:01",
                        "finished": "2015-09-29T11:21:01",
                        "configs": [
                          "My Debian8 Profile"
                        ],
                        "disks": [
                          {
                            "label": "My Debian8 Disk",
                            "size": 24064,
                            "filesystem": "ext4"
                          },
                          {
                            "label": "swap",
                            "size": 512,
                            "filesystem": "swap"
                          }
                        ],
                        "availability": "daily"
                      }
                    },
                    "created": "2015-09-29T11:21:01",
                    "region": {
                      "id": "us-east-1a",
                      "label": "Newark, NJ",
                      "country": "US"
                    },
                    "distribution": {
                      "id": "linode/Arch2014.10",
                      "created": "2014-12-24T18:00:09.000Z",
                      "label": "Arch Linux 2014.10",
                      "minimum_storage_size": 800,
                      "recommended": true,
                      "vendor": "Arch",
                      "x64": true
                    },
                    "group": "Example",
                    "ipv4": [
                      "97.107.143.8",
                      "192.168.149.108"
                    ],
                    "ipv6": "2a01:7e00::f03c:91ff:fe96:46f5/64",
                    "label": "Example Linode",
                    "type": [
                      {
                        "id": "g5-standard-1",
                        "backups_price": 250,
                        "class": "standard",
                        "disk": 24576,
                        "hourly_price": 1,
                        "label": "Linode 2048",
                        "mbits_out": 125,
                        "monthly_price": 1000,
                        "ram": 2048,
                        "service_type": "linode",
                        "storage": 24576,
                        "transfer": 2000,
                        "vcpus": 2
                      }
                    ],
                    "status": "running",
                    "total_transfer": 20000,
                    "updated": "2015-10-27T09:59:26.000Z",
                    "hypervisor": "kvm"
                  }
                }
              },
              {
                "money": true,
                "oauth": "linodes:create",
                "description": "Creates a new Linode.\n",
                "params": [
                  {
                    "description": "A region ID to provision this Linode in.\n",
                    "type": "integer",
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
                    "type": "integer",
                    "name": "distribution"
                  },
                  {
                    "optional": "unless source == \"distro\"",
                    "description": {
                      "descText": "The root password to use when sourcing this Linode from a distribution. \n",
                      "listItems": [
                        "root_pass is required if the source provided is a distribution."
                      ]
                    },
                    "name": "root_pass"
                  },
                  {
                    "optional": true,
                    "description": "A public SSH key file to install at `/root/.ssh/authorized_keys` when creating this Linode.\n",
                    "name": "root_ssh_key"
                  },
                  {
                    "optional": true,
                    "description": {
                      "descText": "The stackscript ID to deploy with this disk. \n",
                      "listItems": [
                        "Must provide a distribution. Distribution must be one that the stackscript can be deployed to."
                      ]
                    },
                    "type": "integer",
                    "name": "stackscript"
                  },
                  {
                    "optional": true,
                    "description": {
                      "descText": "UDF (user-defined fields) for this stackscript. Defaults to \"{}\". \n",
                      "listItems": [
                        "Must match UDFs required by stackscript."
                      ]
                    },
                    "type": "string",
                    "name": "stackscript_udf_responses"
                  },
                  {
                    "optional": true,
                    "description": "The Backup to restore to the newly created Linode.  May not be included if 'distribution' is sent.\n",
                    "type": "integer",
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
                    "value": "my_linode = client.linode.create_instance(client.get_regions().first(), 'g5-nanode-1')\n\ndistro = client.linode.get_distributons(linode.Distribution.vendor == 'debian').first()\n( my_linode_2, password ) = client.linode.create_instance('us-east-1a', 'g5-standard-1', distribtuion=distro)\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "linode/instances",
            "routePath": "/reference/endpoints/linode/instances",
            "endpoints": []
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
                    "value": "my_linode = linode.Linode(client, 123)\n"
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
                      "value": 123456,
                      "schema": null
                    },
                    {
                      "name": "alerts",
                      "description": {
                        "descText": "Toggle and set thresholds for receiving email alerts. \n",
                        "listItems": [
                          "CPU Usage - % - Average CPU usage over 2 hours exceeding this value triggers this alert. (Range 0-2000, default 90)",
                          "Disk IO Rate - IO Ops/sec - Average Disk IO ops/sec over 2 hours exceeding this value triggers this alert. (Range 0-100000, default 10000)",
                          "Incoming Traffic - Mbit/s - Average incoming traffic over a 2 hour period exceeding this value triggers this alert. (Range 0-40000, default 10)",
                          "Outbound Traffic - Mbit/s - Average outbound traffic over a 2 hour period exceeding this value triggers this alert. (Range 0-10000, default 10)",
                          "Transfer Quota - % - Percentage of network transfer quota used being greater than this value will trigger this alert. (Range 0-400, default 80)"
                        ]
                      },
                      "schema": [
                        {
                          "name": "cpu",
                          "description": "Average CPU usage over 2 hours exceeding this value triggers this alert.",
                          "schema": [
                            {
                              "name": "enabled",
                              "type": "boolean",
                              "value": true,
                              "schema": null
                            },
                            {
                              "name": "threshold",
                              "description": "CPU Usage % (Range 0-2000, default 90).",
                              "type": "integer",
                              "value": 90,
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "io",
                          "description": "Average Disk IO ops/sec over 2 hours exceeding this value triggers this alert.",
                          "schema": [
                            {
                              "name": "enabled",
                              "type": "boolean",
                              "value": true,
                              "schema": null
                            },
                            {
                              "name": "threshold",
                              "description": "Disk IO Rate ops/sec (Range 0-100000, default 10000).",
                              "type": "integer",
                              "value": 10000,
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "transfer_in",
                          "description": "Average incoming traffic over a 2 hour period exceeding this value triggers this alert.",
                          "schema": [
                            {
                              "name": "enabled",
                              "type": "boolean",
                              "value": true,
                              "schema": null
                            },
                            {
                              "name": "threshold",
                              "description": "Incoming Traffic Mbit/s (Range 0-40000, default 10).",
                              "type": "integer",
                              "value": 10,
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "transfer_out",
                          "description": "Average outbound traffic over a 2 hour period exceeding this value triggers this alert.",
                          "schema": [
                            {
                              "name": "enabled",
                              "type": "boolean",
                              "value": true,
                              "schema": null
                            },
                            {
                              "name": "threshold",
                              "description": "Outbound Traffic Mbit/s (Range 0-10000, default 10).",
                              "type": "integer",
                              "value": 10,
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "transfer_quota",
                          "description": "Percentage of network transfer quota used being greater than this value will trigger this alert.",
                          "schema": [
                            {
                              "name": "enabled",
                              "type": "boolean",
                              "value": true,
                              "schema": null
                            },
                            {
                              "name": "threshold",
                              "description": "Transfer Quota % (Range 0-400, default 80).",
                              "type": "integer",
                              "value": 80,
                              "schema": null
                            }
                          ]
                        }
                      ]
                    },
                    {
                      "name": "backups",
                      "description": "Displays if backups are enabled, last backup datetime if applicable, and the day/window your backups will occur. Window is prefixed by a \"W\" and an integer representing the two-hour window in 24-hour UTC time format. For example, 2AM is represented as \"W2\", 8PM as \"W20\", etc. (W0, W2, W4...W22)\n",
                      "schema": [
                        {
                          "name": "enabled",
                          "type": "boolean",
                          "value": true,
                          "schema": null
                        },
                        {
                          "name": "schedule",
                          "description": "The day and window of a Linode's automatic backups.",
                          "schema": [
                            {
                              "name": "day",
                              "type": "string",
                              "value": "Tuesday",
                              "schema": null
                            },
                            {
                              "name": "window",
                              "type": "string",
                              "value": "W20",
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "last_backup",
                          "description": "If enabled, the last backup that was successfully taken.",
                          "type": "backup",
                          "schema": [
                            {
                              "name": "id",
                              "type": "integer",
                              "value": 123456,
                              "schema": null
                            },
                            {
                              "name": "label",
                              "description": "Human-friendly backup name.",
                              "filterable": false,
                              "type": "string",
                              "value": "A label for your snapshot",
                              "schema": null
                            },
                            {
                              "name": "status",
                              "description": "Status of the backup.",
                              "filterable": false,
                              "type": "enum",
                              "subType": "Status",
                              "value": "successful",
                              "schema": [
                                {
                                  "name": "offline",
                                  "description": "The Linode is powered off."
                                },
                                {
                                  "name": "booting",
                                  "description": "The Linode is currently booting up."
                                },
                                {
                                  "name": "running",
                                  "description": "The Linode is currently running."
                                },
                                {
                                  "name": "shutting_down",
                                  "description": "The Linode is currently shutting down."
                                },
                                {
                                  "name": "rebooting",
                                  "description": "The Linode is rebooting."
                                },
                                {
                                  "name": "provisioning",
                                  "description": "The Linode is being created."
                                },
                                {
                                  "name": "deleting",
                                  "description": "The Linode is being deleted."
                                },
                                {
                                  "name": "migrating",
                                  "description": "The Linode is being migrated to a new host/region."
                                }
                              ]
                            },
                            {
                              "name": "type",
                              "description": "Whether this is a snapshot or an auto backup.",
                              "type": "enum",
                              "subType": "Type",
                              "value": "snapshot",
                              "schema": null
                            },
                            {
                              "name": "region",
                              "description": "This backup  region.",
                              "filterable": false,
                              "type": "region",
                              "schema": [
                                {
                                  "name": "id",
                                  "type": "string",
                                  "value": "us-east-1a",
                                  "schema": null
                                },
                                {
                                  "name": "label",
                                  "description": "Human-friendly region name.",
                                  "filterable": true,
                                  "type": "string",
                                  "value": "Newark, NJ",
                                  "schema": null
                                },
                                {
                                  "name": "country",
                                  "description": "Country",
                                  "filterable": true,
                                  "type": "string",
                                  "value": "US",
                                  "schema": null
                                }
                              ]
                            },
                            {
                              "name": "created",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            },
                            {
                              "name": "updated",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            },
                            {
                              "name": "finished",
                              "description": "An ISO 8601 datetime of when the backup completed.",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            },
                            {
                              "name": "configs",
                              "description": "A JSON Array of config labels that were included in this backup.",
                              "type": "array",
                              "subType": "string",
                              "value": [
                                "My Debian8 Profile"
                              ],
                              "schema": null
                            },
                            {
                              "name": "disks",
                              "description": "A JSON Array of JSON Objects describing the disks included in this backup.",
                              "type": "array",
                              "subType": "disk",
                              "value": [
                                [
                                  {
                                    "name": "label",
                                    "type": "string",
                                    "value": "My Debian8 Disk",
                                    "schema": null
                                  },
                                  {
                                    "name": "size",
                                    "type": "integer",
                                    "value": 24064,
                                    "schema": null
                                  },
                                  {
                                    "name": "filesystem",
                                    "type": "string",
                                    "value": "ext4",
                                    "schema": null
                                  }
                                ],
                                [
                                  {
                                    "name": "label",
                                    "type": "string",
                                    "value": "swap",
                                    "schema": null
                                  },
                                  {
                                    "name": "size",
                                    "type": "integer",
                                    "value": 512,
                                    "schema": null
                                  },
                                  {
                                    "name": "filesystem",
                                    "type": "string",
                                    "value": "swap",
                                    "schema": null
                                  }
                                ]
                              ],
                              "schema": [
                                {
                                  "name": "label",
                                  "type": "string",
                                  "value": "My Debian8 Disk",
                                  "schema": null
                                },
                                {
                                  "name": "size",
                                  "type": "integer",
                                  "value": 24064,
                                  "schema": null
                                },
                                {
                                  "name": "filesystem",
                                  "type": "string",
                                  "value": "ext4",
                                  "schema": null
                                }
                              ]
                            },
                            {
                              "name": "availability",
                              "description": "If this backup is available, which backup slot it is in.  Otherwise, unavailable.",
                              "type": "enum",
                              "subType": "BackupAvailability",
                              "value": "daily",
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "snapshot",
                          "description": "If enabled, the last snapshot that was successfully taken.",
                          "type": "backup",
                          "schema": [
                            {
                              "name": "id",
                              "type": "integer",
                              "value": 123456,
                              "schema": null
                            },
                            {
                              "name": "label",
                              "description": "Human-friendly backup name.",
                              "filterable": false,
                              "type": "string",
                              "value": "A label for your snapshot",
                              "schema": null
                            },
                            {
                              "name": "status",
                              "description": "Status of the backup.",
                              "filterable": false,
                              "type": "enum",
                              "subType": "Status",
                              "value": "successful",
                              "schema": [
                                {
                                  "name": "offline",
                                  "description": "The Linode is powered off."
                                },
                                {
                                  "name": "booting",
                                  "description": "The Linode is currently booting up."
                                },
                                {
                                  "name": "running",
                                  "description": "The Linode is currently running."
                                },
                                {
                                  "name": "shutting_down",
                                  "description": "The Linode is currently shutting down."
                                },
                                {
                                  "name": "rebooting",
                                  "description": "The Linode is rebooting."
                                },
                                {
                                  "name": "provisioning",
                                  "description": "The Linode is being created."
                                },
                                {
                                  "name": "deleting",
                                  "description": "The Linode is being deleted."
                                },
                                {
                                  "name": "migrating",
                                  "description": "The Linode is being migrated to a new host/region."
                                }
                              ]
                            },
                            {
                              "name": "type",
                              "description": "Whether this is a snapshot or an auto backup.",
                              "type": "enum",
                              "subType": "Type",
                              "value": "snapshot",
                              "schema": null
                            },
                            {
                              "name": "region",
                              "description": "This backup  region.",
                              "filterable": false,
                              "type": "region",
                              "schema": [
                                {
                                  "name": "id",
                                  "type": "string",
                                  "value": "us-east-1a",
                                  "schema": null
                                },
                                {
                                  "name": "label",
                                  "description": "Human-friendly region name.",
                                  "filterable": true,
                                  "type": "string",
                                  "value": "Newark, NJ",
                                  "schema": null
                                },
                                {
                                  "name": "country",
                                  "description": "Country",
                                  "filterable": true,
                                  "type": "string",
                                  "value": "US",
                                  "schema": null
                                }
                              ]
                            },
                            {
                              "name": "created",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            },
                            {
                              "name": "updated",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            },
                            {
                              "name": "finished",
                              "description": "An ISO 8601 datetime of when the backup completed.",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            },
                            {
                              "name": "configs",
                              "description": "A JSON Array of config labels that were included in this backup.",
                              "type": "array",
                              "subType": "string",
                              "value": [
                                "My Debian8 Profile"
                              ],
                              "schema": null
                            },
                            {
                              "name": "disks",
                              "description": "A JSON Array of JSON Objects describing the disks included in this backup.",
                              "type": "array",
                              "subType": "disk",
                              "value": [
                                [
                                  {
                                    "name": "label",
                                    "type": "string",
                                    "value": "My Debian8 Disk",
                                    "schema": null
                                  },
                                  {
                                    "name": "size",
                                    "type": "integer",
                                    "value": 24064,
                                    "schema": null
                                  },
                                  {
                                    "name": "filesystem",
                                    "type": "string",
                                    "value": "ext4",
                                    "schema": null
                                  }
                                ],
                                [
                                  {
                                    "name": "label",
                                    "type": "string",
                                    "value": "swap",
                                    "schema": null
                                  },
                                  {
                                    "name": "size",
                                    "type": "integer",
                                    "value": 512,
                                    "schema": null
                                  },
                                  {
                                    "name": "filesystem",
                                    "type": "string",
                                    "value": "swap",
                                    "schema": null
                                  }
                                ]
                              ],
                              "schema": [
                                {
                                  "name": "label",
                                  "type": "string",
                                  "value": "My Debian8 Disk",
                                  "schema": null
                                },
                                {
                                  "name": "size",
                                  "type": "integer",
                                  "value": 24064,
                                  "schema": null
                                },
                                {
                                  "name": "filesystem",
                                  "type": "string",
                                  "value": "ext4",
                                  "schema": null
                                }
                              ]
                            },
                            {
                              "name": "availability",
                              "description": "If this backup is available, which backup slot it is in.  Otherwise, unavailable.",
                              "type": "enum",
                              "subType": "BackupAvailability",
                              "value": "daily",
                              "schema": null
                            }
                          ]
                        }
                      ]
                    },
                    {
                      "name": "created",
                      "type": "datetime",
                      "value": "2015-09-29T11:21:01",
                      "schema": null
                    },
                    {
                      "name": "region",
                      "description": "This Linode's region.",
                      "filterable": true,
                      "type": "region",
                      "schema": [
                        {
                          "name": "id",
                          "type": "string",
                          "value": "us-east-1a",
                          "schema": null
                        },
                        {
                          "name": "label",
                          "description": "Human-friendly region name.",
                          "filterable": true,
                          "type": "string",
                          "value": "Newark, NJ",
                          "schema": null
                        },
                        {
                          "name": "country",
                          "description": "Country",
                          "filterable": true,
                          "type": "string",
                          "value": "US",
                          "schema": null
                        }
                      ]
                    },
                    {
                      "name": "distribution",
                      "description": "The distribution that this Linode booted to last.",
                      "filterable": true,
                      "type": "distribution",
                      "schema": [
                        {
                          "name": "id",
                          "type": "string",
                          "value": "linode/Arch2014.10",
                          "schema": null
                        },
                        {
                          "name": "created",
                          "type": "datetime",
                          "value": "2014-12-24T18:00:09.000Z",
                          "schema": null
                        },
                        {
                          "name": "label",
                          "description": "The user-friendly name of this distribution.",
                          "filterable": true,
                          "type": "string",
                          "value": "Arch Linux 2014.10",
                          "schema": null
                        },
                        {
                          "name": "minimum_storage_size",
                          "description": "The minimum size required for the distrbution image.",
                          "filterable": true,
                          "type": "integer",
                          "value": 800,
                          "schema": null
                        },
                        {
                          "name": "recommended",
                          "description": "True if this distribution is recommended by Linode.",
                          "filterable": true,
                          "type": "boolean",
                          "value": true,
                          "schema": null
                        },
                        {
                          "name": "vendor",
                          "description": "The upstream distribution vendor. Consistent between releases of a distro.",
                          "filterable": true,
                          "type": "string",
                          "value": "Arch",
                          "schema": null
                        },
                        {
                          "name": "x64",
                          "description": "True if this is a 64-bit distribution.",
                          "type": "boolean",
                          "value": true,
                          "schema": null
                        }
                      ]
                    },
                    {
                      "name": "group",
                      "description": "This Linode's display group.",
                      "editable": true,
                      "filterable": true,
                      "type": "string",
                      "value": "Example",
                      "schema": null
                    },
                    {
                      "name": "ipv4",
                      "description": "This Linode's IPv4 addresses.",
                      "editable": false,
                      "type": "array",
                      "subType": "string",
                      "value": [
                        "97.107.143.8",
                        "192.168.149.108"
                      ],
                      "schema": null
                    },
                    {
                      "name": "ipv6",
                      "description": "This Linode's IPv6 slaac address.",
                      "editable": false,
                      "type": "string",
                      "value": "2a01:7e00::f03c:91ff:fe96:46f5/64",
                      "schema": null
                    },
                    {
                      "name": "label",
                      "description": "This Linode's display label.",
                      "editable": true,
                      "filterable": true,
                      "type": "string",
                      "value": "Example Linode",
                      "schema": null
                    },
                    {
                      "name": "type",
                      "description": "The type of Linode.",
                      "type": "array",
                      "subType": "service",
                      "value": [
                        [
                          {
                            "name": "id",
                            "type": "string",
                            "value": "g5-standard-1",
                            "schema": null
                          },
                          {
                            "name": "backups_price",
                            "type": "integer",
                            "value": 250,
                            "schema": null
                          },
                          {
                            "name": "class",
                            "type": "string",
                            "value": "standard",
                            "schema": null
                          },
                          {
                            "name": "disk",
                            "type": "integer",
                            "value": 24576,
                            "schema": null
                          },
                          {
                            "name": "hourly_price",
                            "type": "integer",
                            "value": 1,
                            "schema": null
                          },
                          {
                            "name": "label",
                            "type": "string",
                            "value": "Linode 2048",
                            "schema": null
                          },
                          {
                            "name": "mbits_out",
                            "type": "integer",
                            "value": 125,
                            "schema": null
                          },
                          {
                            "name": "monthly_price",
                            "type": "integer",
                            "value": 1000,
                            "schema": null
                          },
                          {
                            "name": "ram",
                            "type": "integer",
                            "value": 2048,
                            "schema": null
                          },
                          {
                            "name": "service_type",
                            "type": "enum",
                            "subType": "Service Type",
                            "value": "linode",
                            "schema": null
                          },
                          {
                            "name": "storage",
                            "type": "integer",
                            "value": 24576,
                            "schema": null
                          },
                          {
                            "name": "transfer",
                            "type": "integer",
                            "value": 2000,
                            "schema": null
                          },
                          {
                            "name": "vcpus",
                            "type": "integer",
                            "value": 2,
                            "schema": null
                          }
                        ]
                      ],
                      "schema": [
                        {
                          "name": "id",
                          "type": "string",
                          "value": "g5-standard-1",
                          "schema": null
                        },
                        {
                          "name": "backups_price",
                          "type": "integer",
                          "value": 250,
                          "schema": null
                        },
                        {
                          "name": "class",
                          "type": "string",
                          "value": "standard",
                          "schema": null
                        },
                        {
                          "name": "disk",
                          "type": "integer",
                          "value": 24576,
                          "schema": null
                        },
                        {
                          "name": "hourly_price",
                          "type": "integer",
                          "value": 1,
                          "schema": null
                        },
                        {
                          "name": "label",
                          "type": "string",
                          "value": "Linode 2048",
                          "schema": null
                        },
                        {
                          "name": "mbits_out",
                          "type": "integer",
                          "value": 125,
                          "schema": null
                        },
                        {
                          "name": "monthly_price",
                          "type": "integer",
                          "value": 1000,
                          "schema": null
                        },
                        {
                          "name": "ram",
                          "type": "integer",
                          "value": 2048,
                          "schema": null
                        },
                        {
                          "name": "service_type",
                          "type": "enum",
                          "subType": "Service Type",
                          "value": "linode",
                          "schema": null
                        },
                        {
                          "name": "storage",
                          "type": "integer",
                          "value": 24576,
                          "schema": null
                        },
                        {
                          "name": "transfer",
                          "type": "integer",
                          "value": 2000,
                          "schema": null
                        },
                        {
                          "name": "vcpus",
                          "type": "integer",
                          "value": 2,
                          "schema": null
                        }
                      ]
                    },
                    {
                      "name": "status",
                      "description": "The current state of this Linode.",
                      "filterable": true,
                      "type": "enum",
                      "subType": "Status",
                      "value": "running",
                      "schema": [
                        {
                          "name": "offline",
                          "description": "The Linode is powered off."
                        },
                        {
                          "name": "booting",
                          "description": "The Linode is currently booting up."
                        },
                        {
                          "name": "running",
                          "description": "The Linode is currently running."
                        },
                        {
                          "name": "shutting_down",
                          "description": "The Linode is currently shutting down."
                        },
                        {
                          "name": "rebooting",
                          "description": "The Linode is rebooting."
                        },
                        {
                          "name": "provisioning",
                          "description": "The Linode is being created."
                        },
                        {
                          "name": "deleting",
                          "description": "The Linode is being deleted."
                        },
                        {
                          "name": "migrating",
                          "description": "The Linode is being migrated to a new host/region."
                        }
                      ]
                    },
                    {
                      "name": "total_transfer",
                      "description": "The amount of outbound traffic used this month.",
                      "type": "integer",
                      "value": 20000,
                      "schema": null
                    },
                    {
                      "name": "updated",
                      "description": "The last updated datetime for this Linode record.",
                      "type": "datetime",
                      "value": "2015-10-27T09:59:26.000Z",
                      "schema": null
                    },
                    {
                      "name": "hypervisor",
                      "description": "The hypervisor this Linode is running on.",
                      "type": "enum",
                      "subType": "Hypervisor",
                      "value": "kvm",
                      "schema": [
                        {
                          "name": "kvm",
                          "description": "KVM"
                        },
                        {
                          "name": "xen",
                          "description": "Xen"
                        }
                      ]
                    }
                  ],
                  "enums": {
                    "Status": {
                      "offline": "The Linode is powered off.",
                      "booting": "The Linode is currently booting up.",
                      "running": "The Linode is currently running.",
                      "shutting_down": "The Linode is currently shutting down.",
                      "rebooting": "The Linode is rebooting.",
                      "provisioning": "The Linode is being created.",
                      "deleting": "The Linode is being deleted.",
                      "migrating": "The Linode is being migrated to a new host/region."
                    },
                    "BackupStatus": {
                      "pending": "Backup is in the queue and waiting to begin.",
                      "running": "Linode in the process of being backed up.",
                      "needsPostProcessing": "Backups awaiting final integration into existing backup data.",
                      "successful": "Backup successfully completed.",
                      "failed": "Linode backup failed.",
                      "userAborted": "User aborted current backup process."
                    },
                    "BackupType": {
                      "auto": "Automatic backup",
                      "snapshot": "User-initiated, manual file backup"
                    },
                    "Window": {
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
                      "W22": "2200 - 0000 UTC"
                    },
                    "Hypervisor": {
                      "kvm": "KVM",
                      "xen": "Xen"
                    }
                  },
                  "example": {
                    "id": 123456,
                    "alerts": {
                      "cpu": {
                        "enabled": true,
                        "threshold": 90
                      },
                      "io": {
                        "enabled": true,
                        "threshold": 10000
                      },
                      "transfer_in": {
                        "enabled": true,
                        "threshold": 10
                      },
                      "transfer_out": {
                        "enabled": true,
                        "threshold": 10
                      },
                      "transfer_quota": {
                        "enabled": true,
                        "threshold": 80
                      }
                    },
                    "backups": {
                      "enabled": true,
                      "schedule": {
                        "day": "Tuesday",
                        "window": "W20"
                      },
                      "last_backup": {
                        "id": 123456,
                        "label": "A label for your snapshot",
                        "status": "successful",
                        "type": "snapshot",
                        "region": {
                          "id": "us-east-1a",
                          "label": "Newark, NJ",
                          "country": "US"
                        },
                        "created": "2015-09-29T11:21:01",
                        "updated": "2015-09-29T11:21:01",
                        "finished": "2015-09-29T11:21:01",
                        "configs": [
                          "My Debian8 Profile"
                        ],
                        "disks": [
                          {
                            "label": "My Debian8 Disk",
                            "size": 24064,
                            "filesystem": "ext4"
                          },
                          {
                            "label": "swap",
                            "size": 512,
                            "filesystem": "swap"
                          }
                        ],
                        "availability": "daily"
                      },
                      "snapshot": {
                        "id": 123456,
                        "label": "A label for your snapshot",
                        "status": "successful",
                        "type": "snapshot",
                        "region": {
                          "id": "us-east-1a",
                          "label": "Newark, NJ",
                          "country": "US"
                        },
                        "created": "2015-09-29T11:21:01",
                        "updated": "2015-09-29T11:21:01",
                        "finished": "2015-09-29T11:21:01",
                        "configs": [
                          "My Debian8 Profile"
                        ],
                        "disks": [
                          {
                            "label": "My Debian8 Disk",
                            "size": 24064,
                            "filesystem": "ext4"
                          },
                          {
                            "label": "swap",
                            "size": 512,
                            "filesystem": "swap"
                          }
                        ],
                        "availability": "daily"
                      }
                    },
                    "created": "2015-09-29T11:21:01",
                    "region": {
                      "id": "us-east-1a",
                      "label": "Newark, NJ",
                      "country": "US"
                    },
                    "distribution": {
                      "id": "linode/Arch2014.10",
                      "created": "2014-12-24T18:00:09.000Z",
                      "label": "Arch Linux 2014.10",
                      "minimum_storage_size": 800,
                      "recommended": true,
                      "vendor": "Arch",
                      "x64": true
                    },
                    "group": "Example",
                    "ipv4": [
                      "97.107.143.8",
                      "192.168.149.108"
                    ],
                    "ipv6": "2a01:7e00::f03c:91ff:fe96:46f5/64",
                    "label": "Example Linode",
                    "type": [
                      {
                        "id": "g5-standard-1",
                        "backups_price": 250,
                        "class": "standard",
                        "disk": 24576,
                        "hourly_price": 1,
                        "label": "Linode 2048",
                        "mbits_out": 125,
                        "monthly_price": 1000,
                        "ram": 2048,
                        "service_type": "linode",
                        "storage": 24576,
                        "transfer": 2000,
                        "vcpus": 2
                      }
                    ],
                    "status": "running",
                    "total_transfer": 20000,
                    "updated": "2015-10-27T09:59:26.000Z",
                    "hypervisor": "kvm"
                  }
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
                    "value": "my_linode.label = 'newlabel'\nmy_linode.save()\n"
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
                    "value": "my_linode.delete()\n"
                  }
                ],
                "name": "DELETE"
              }
            ],
            "path": "linode/instances/:id",
            "routePath": "/reference/endpoints/linode/instances/:id",
            "endpoints": []
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
                    "value": "disks = my_linode.disks\n"
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
                      "value": 123456,
                      "schema": null
                    },
                    {
                      "name": "alerts",
                      "description": {
                        "descText": "Toggle and set thresholds for receiving email alerts. \n",
                        "listItems": [
                          "CPU Usage - % - Average CPU usage over 2 hours exceeding this value triggers this alert. (Range 0-2000, default 90)",
                          "Disk IO Rate - IO Ops/sec - Average Disk IO ops/sec over 2 hours exceeding this value triggers this alert. (Range 0-100000, default 10000)",
                          "Incoming Traffic - Mbit/s - Average incoming traffic over a 2 hour period exceeding this value triggers this alert. (Range 0-40000, default 10)",
                          "Outbound Traffic - Mbit/s - Average outbound traffic over a 2 hour period exceeding this value triggers this alert. (Range 0-10000, default 10)",
                          "Transfer Quota - % - Percentage of network transfer quota used being greater than this value will trigger this alert. (Range 0-400, default 80)"
                        ]
                      },
                      "schema": [
                        {
                          "name": "cpu",
                          "description": "Average CPU usage over 2 hours exceeding this value triggers this alert.",
                          "schema": [
                            {
                              "name": "enabled",
                              "type": "boolean",
                              "value": true,
                              "schema": null
                            },
                            {
                              "name": "threshold",
                              "description": "CPU Usage % (Range 0-2000, default 90).",
                              "type": "integer",
                              "value": 90,
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "io",
                          "description": "Average Disk IO ops/sec over 2 hours exceeding this value triggers this alert.",
                          "schema": [
                            {
                              "name": "enabled",
                              "type": "boolean",
                              "value": true,
                              "schema": null
                            },
                            {
                              "name": "threshold",
                              "description": "Disk IO Rate ops/sec (Range 0-100000, default 10000).",
                              "type": "integer",
                              "value": 10000,
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "transfer_in",
                          "description": "Average incoming traffic over a 2 hour period exceeding this value triggers this alert.",
                          "schema": [
                            {
                              "name": "enabled",
                              "type": "boolean",
                              "value": true,
                              "schema": null
                            },
                            {
                              "name": "threshold",
                              "description": "Incoming Traffic Mbit/s (Range 0-40000, default 10).",
                              "type": "integer",
                              "value": 10,
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "transfer_out",
                          "description": "Average outbound traffic over a 2 hour period exceeding this value triggers this alert.",
                          "schema": [
                            {
                              "name": "enabled",
                              "type": "boolean",
                              "value": true,
                              "schema": null
                            },
                            {
                              "name": "threshold",
                              "description": "Outbound Traffic Mbit/s (Range 0-10000, default 10).",
                              "type": "integer",
                              "value": 10,
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "transfer_quota",
                          "description": "Percentage of network transfer quota used being greater than this value will trigger this alert.",
                          "schema": [
                            {
                              "name": "enabled",
                              "type": "boolean",
                              "value": true,
                              "schema": null
                            },
                            {
                              "name": "threshold",
                              "description": "Transfer Quota % (Range 0-400, default 80).",
                              "type": "integer",
                              "value": 80,
                              "schema": null
                            }
                          ]
                        }
                      ]
                    },
                    {
                      "name": "backups",
                      "description": "Displays if backups are enabled, last backup datetime if applicable, and the day/window your backups will occur. Window is prefixed by a \"W\" and an integer representing the two-hour window in 24-hour UTC time format. For example, 2AM is represented as \"W2\", 8PM as \"W20\", etc. (W0, W2, W4...W22)\n",
                      "schema": [
                        {
                          "name": "enabled",
                          "type": "boolean",
                          "value": true,
                          "schema": null
                        },
                        {
                          "name": "schedule",
                          "description": "The day and window of a Linode's automatic backups.",
                          "schema": [
                            {
                              "name": "day",
                              "type": "string",
                              "value": "Tuesday",
                              "schema": null
                            },
                            {
                              "name": "window",
                              "type": "string",
                              "value": "W20",
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "last_backup",
                          "description": "If enabled, the last backup that was successfully taken.",
                          "type": "backup",
                          "schema": [
                            {
                              "name": "id",
                              "type": "integer",
                              "value": 123456,
                              "schema": null
                            },
                            {
                              "name": "label",
                              "description": "Human-friendly backup name.",
                              "filterable": false,
                              "type": "string",
                              "value": "A label for your snapshot",
                              "schema": null
                            },
                            {
                              "name": "status",
                              "description": "Status of the backup.",
                              "filterable": false,
                              "type": "enum",
                              "subType": "Status",
                              "value": "successful",
                              "schema": [
                                {
                                  "name": "offline",
                                  "description": "The Linode is powered off."
                                },
                                {
                                  "name": "booting",
                                  "description": "The Linode is currently booting up."
                                },
                                {
                                  "name": "running",
                                  "description": "The Linode is currently running."
                                },
                                {
                                  "name": "shutting_down",
                                  "description": "The Linode is currently shutting down."
                                },
                                {
                                  "name": "rebooting",
                                  "description": "The Linode is rebooting."
                                },
                                {
                                  "name": "provisioning",
                                  "description": "The Linode is being created."
                                },
                                {
                                  "name": "deleting",
                                  "description": "The Linode is being deleted."
                                },
                                {
                                  "name": "migrating",
                                  "description": "The Linode is being migrated to a new host/region."
                                }
                              ]
                            },
                            {
                              "name": "type",
                              "description": "Whether this is a snapshot or an auto backup.",
                              "type": "enum",
                              "subType": "Type",
                              "value": "snapshot",
                              "schema": null
                            },
                            {
                              "name": "region",
                              "description": "This backup  region.",
                              "filterable": false,
                              "type": "region",
                              "schema": [
                                {
                                  "name": "id",
                                  "type": "string",
                                  "value": "us-east-1a",
                                  "schema": null
                                },
                                {
                                  "name": "label",
                                  "description": "Human-friendly region name.",
                                  "filterable": true,
                                  "type": "string",
                                  "value": "Newark, NJ",
                                  "schema": null
                                },
                                {
                                  "name": "country",
                                  "description": "Country",
                                  "filterable": true,
                                  "type": "string",
                                  "value": "US",
                                  "schema": null
                                }
                              ]
                            },
                            {
                              "name": "created",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            },
                            {
                              "name": "updated",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            },
                            {
                              "name": "finished",
                              "description": "An ISO 8601 datetime of when the backup completed.",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            },
                            {
                              "name": "configs",
                              "description": "A JSON Array of config labels that were included in this backup.",
                              "type": "array",
                              "subType": "string",
                              "value": [
                                "My Debian8 Profile"
                              ],
                              "schema": null
                            },
                            {
                              "name": "disks",
                              "description": "A JSON Array of JSON Objects describing the disks included in this backup.",
                              "type": "array",
                              "subType": "disk",
                              "value": [
                                [
                                  {
                                    "name": "label",
                                    "type": "string",
                                    "value": "My Debian8 Disk",
                                    "schema": null
                                  },
                                  {
                                    "name": "size",
                                    "type": "integer",
                                    "value": 24064,
                                    "schema": null
                                  },
                                  {
                                    "name": "filesystem",
                                    "type": "string",
                                    "value": "ext4",
                                    "schema": null
                                  }
                                ],
                                [
                                  {
                                    "name": "label",
                                    "type": "string",
                                    "value": "swap",
                                    "schema": null
                                  },
                                  {
                                    "name": "size",
                                    "type": "integer",
                                    "value": 512,
                                    "schema": null
                                  },
                                  {
                                    "name": "filesystem",
                                    "type": "string",
                                    "value": "swap",
                                    "schema": null
                                  }
                                ]
                              ],
                              "schema": [
                                {
                                  "name": "label",
                                  "type": "string",
                                  "value": "My Debian8 Disk",
                                  "schema": null
                                },
                                {
                                  "name": "size",
                                  "type": "integer",
                                  "value": 24064,
                                  "schema": null
                                },
                                {
                                  "name": "filesystem",
                                  "type": "string",
                                  "value": "ext4",
                                  "schema": null
                                }
                              ]
                            },
                            {
                              "name": "availability",
                              "description": "If this backup is available, which backup slot it is in.  Otherwise, unavailable.",
                              "type": "enum",
                              "subType": "BackupAvailability",
                              "value": "daily",
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "snapshot",
                          "description": "If enabled, the last snapshot that was successfully taken.",
                          "type": "backup",
                          "schema": [
                            {
                              "name": "id",
                              "type": "integer",
                              "value": 123456,
                              "schema": null
                            },
                            {
                              "name": "label",
                              "description": "Human-friendly backup name.",
                              "filterable": false,
                              "type": "string",
                              "value": "A label for your snapshot",
                              "schema": null
                            },
                            {
                              "name": "status",
                              "description": "Status of the backup.",
                              "filterable": false,
                              "type": "enum",
                              "subType": "Status",
                              "value": "successful",
                              "schema": [
                                {
                                  "name": "offline",
                                  "description": "The Linode is powered off."
                                },
                                {
                                  "name": "booting",
                                  "description": "The Linode is currently booting up."
                                },
                                {
                                  "name": "running",
                                  "description": "The Linode is currently running."
                                },
                                {
                                  "name": "shutting_down",
                                  "description": "The Linode is currently shutting down."
                                },
                                {
                                  "name": "rebooting",
                                  "description": "The Linode is rebooting."
                                },
                                {
                                  "name": "provisioning",
                                  "description": "The Linode is being created."
                                },
                                {
                                  "name": "deleting",
                                  "description": "The Linode is being deleted."
                                },
                                {
                                  "name": "migrating",
                                  "description": "The Linode is being migrated to a new host/region."
                                }
                              ]
                            },
                            {
                              "name": "type",
                              "description": "Whether this is a snapshot or an auto backup.",
                              "type": "enum",
                              "subType": "Type",
                              "value": "snapshot",
                              "schema": null
                            },
                            {
                              "name": "region",
                              "description": "This backup  region.",
                              "filterable": false,
                              "type": "region",
                              "schema": [
                                {
                                  "name": "id",
                                  "type": "string",
                                  "value": "us-east-1a",
                                  "schema": null
                                },
                                {
                                  "name": "label",
                                  "description": "Human-friendly region name.",
                                  "filterable": true,
                                  "type": "string",
                                  "value": "Newark, NJ",
                                  "schema": null
                                },
                                {
                                  "name": "country",
                                  "description": "Country",
                                  "filterable": true,
                                  "type": "string",
                                  "value": "US",
                                  "schema": null
                                }
                              ]
                            },
                            {
                              "name": "created",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            },
                            {
                              "name": "updated",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            },
                            {
                              "name": "finished",
                              "description": "An ISO 8601 datetime of when the backup completed.",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            },
                            {
                              "name": "configs",
                              "description": "A JSON Array of config labels that were included in this backup.",
                              "type": "array",
                              "subType": "string",
                              "value": [
                                "My Debian8 Profile"
                              ],
                              "schema": null
                            },
                            {
                              "name": "disks",
                              "description": "A JSON Array of JSON Objects describing the disks included in this backup.",
                              "type": "array",
                              "subType": "disk",
                              "value": [
                                [
                                  {
                                    "name": "label",
                                    "type": "string",
                                    "value": "My Debian8 Disk",
                                    "schema": null
                                  },
                                  {
                                    "name": "size",
                                    "type": "integer",
                                    "value": 24064,
                                    "schema": null
                                  },
                                  {
                                    "name": "filesystem",
                                    "type": "string",
                                    "value": "ext4",
                                    "schema": null
                                  }
                                ],
                                [
                                  {
                                    "name": "label",
                                    "type": "string",
                                    "value": "swap",
                                    "schema": null
                                  },
                                  {
                                    "name": "size",
                                    "type": "integer",
                                    "value": 512,
                                    "schema": null
                                  },
                                  {
                                    "name": "filesystem",
                                    "type": "string",
                                    "value": "swap",
                                    "schema": null
                                  }
                                ]
                              ],
                              "schema": [
                                {
                                  "name": "label",
                                  "type": "string",
                                  "value": "My Debian8 Disk",
                                  "schema": null
                                },
                                {
                                  "name": "size",
                                  "type": "integer",
                                  "value": 24064,
                                  "schema": null
                                },
                                {
                                  "name": "filesystem",
                                  "type": "string",
                                  "value": "ext4",
                                  "schema": null
                                }
                              ]
                            },
                            {
                              "name": "availability",
                              "description": "If this backup is available, which backup slot it is in.  Otherwise, unavailable.",
                              "type": "enum",
                              "subType": "BackupAvailability",
                              "value": "daily",
                              "schema": null
                            }
                          ]
                        }
                      ]
                    },
                    {
                      "name": "created",
                      "type": "datetime",
                      "value": "2015-09-29T11:21:01",
                      "schema": null
                    },
                    {
                      "name": "region",
                      "description": "This Linode's region.",
                      "filterable": true,
                      "type": "region",
                      "schema": [
                        {
                          "name": "id",
                          "type": "string",
                          "value": "us-east-1a",
                          "schema": null
                        },
                        {
                          "name": "label",
                          "description": "Human-friendly region name.",
                          "filterable": true,
                          "type": "string",
                          "value": "Newark, NJ",
                          "schema": null
                        },
                        {
                          "name": "country",
                          "description": "Country",
                          "filterable": true,
                          "type": "string",
                          "value": "US",
                          "schema": null
                        }
                      ]
                    },
                    {
                      "name": "distribution",
                      "description": "The distribution that this Linode booted to last.",
                      "filterable": true,
                      "type": "distribution",
                      "schema": [
                        {
                          "name": "id",
                          "type": "string",
                          "value": "linode/Arch2014.10",
                          "schema": null
                        },
                        {
                          "name": "created",
                          "type": "datetime",
                          "value": "2014-12-24T18:00:09.000Z",
                          "schema": null
                        },
                        {
                          "name": "label",
                          "description": "The user-friendly name of this distribution.",
                          "filterable": true,
                          "type": "string",
                          "value": "Arch Linux 2014.10",
                          "schema": null
                        },
                        {
                          "name": "minimum_storage_size",
                          "description": "The minimum size required for the distrbution image.",
                          "filterable": true,
                          "type": "integer",
                          "value": 800,
                          "schema": null
                        },
                        {
                          "name": "recommended",
                          "description": "True if this distribution is recommended by Linode.",
                          "filterable": true,
                          "type": "boolean",
                          "value": true,
                          "schema": null
                        },
                        {
                          "name": "vendor",
                          "description": "The upstream distribution vendor. Consistent between releases of a distro.",
                          "filterable": true,
                          "type": "string",
                          "value": "Arch",
                          "schema": null
                        },
                        {
                          "name": "x64",
                          "description": "True if this is a 64-bit distribution.",
                          "type": "boolean",
                          "value": true,
                          "schema": null
                        }
                      ]
                    },
                    {
                      "name": "group",
                      "description": "This Linode's display group.",
                      "editable": true,
                      "filterable": true,
                      "type": "string",
                      "value": "Example",
                      "schema": null
                    },
                    {
                      "name": "ipv4",
                      "description": "This Linode's IPv4 addresses.",
                      "editable": false,
                      "type": "array",
                      "subType": "string",
                      "value": [
                        "97.107.143.8",
                        "192.168.149.108"
                      ],
                      "schema": null
                    },
                    {
                      "name": "ipv6",
                      "description": "This Linode's IPv6 slaac address.",
                      "editable": false,
                      "type": "string",
                      "value": "2a01:7e00::f03c:91ff:fe96:46f5/64",
                      "schema": null
                    },
                    {
                      "name": "label",
                      "description": "This Linode's display label.",
                      "editable": true,
                      "filterable": true,
                      "type": "string",
                      "value": "Example Linode",
                      "schema": null
                    },
                    {
                      "name": "type",
                      "description": "The type of Linode.",
                      "type": "array",
                      "subType": "service",
                      "value": [
                        [
                          {
                            "name": "id",
                            "type": "string",
                            "value": "g5-standard-1",
                            "schema": null
                          },
                          {
                            "name": "backups_price",
                            "type": "integer",
                            "value": 250,
                            "schema": null
                          },
                          {
                            "name": "class",
                            "type": "string",
                            "value": "standard",
                            "schema": null
                          },
                          {
                            "name": "disk",
                            "type": "integer",
                            "value": 24576,
                            "schema": null
                          },
                          {
                            "name": "hourly_price",
                            "type": "integer",
                            "value": 1,
                            "schema": null
                          },
                          {
                            "name": "label",
                            "type": "string",
                            "value": "Linode 2048",
                            "schema": null
                          },
                          {
                            "name": "mbits_out",
                            "type": "integer",
                            "value": 125,
                            "schema": null
                          },
                          {
                            "name": "monthly_price",
                            "type": "integer",
                            "value": 1000,
                            "schema": null
                          },
                          {
                            "name": "ram",
                            "type": "integer",
                            "value": 2048,
                            "schema": null
                          },
                          {
                            "name": "service_type",
                            "type": "enum",
                            "subType": "Service Type",
                            "value": "linode",
                            "schema": null
                          },
                          {
                            "name": "storage",
                            "type": "integer",
                            "value": 24576,
                            "schema": null
                          },
                          {
                            "name": "transfer",
                            "type": "integer",
                            "value": 2000,
                            "schema": null
                          },
                          {
                            "name": "vcpus",
                            "type": "integer",
                            "value": 2,
                            "schema": null
                          }
                        ]
                      ],
                      "schema": [
                        {
                          "name": "id",
                          "type": "string",
                          "value": "g5-standard-1",
                          "schema": null
                        },
                        {
                          "name": "backups_price",
                          "type": "integer",
                          "value": 250,
                          "schema": null
                        },
                        {
                          "name": "class",
                          "type": "string",
                          "value": "standard",
                          "schema": null
                        },
                        {
                          "name": "disk",
                          "type": "integer",
                          "value": 24576,
                          "schema": null
                        },
                        {
                          "name": "hourly_price",
                          "type": "integer",
                          "value": 1,
                          "schema": null
                        },
                        {
                          "name": "label",
                          "type": "string",
                          "value": "Linode 2048",
                          "schema": null
                        },
                        {
                          "name": "mbits_out",
                          "type": "integer",
                          "value": 125,
                          "schema": null
                        },
                        {
                          "name": "monthly_price",
                          "type": "integer",
                          "value": 1000,
                          "schema": null
                        },
                        {
                          "name": "ram",
                          "type": "integer",
                          "value": 2048,
                          "schema": null
                        },
                        {
                          "name": "service_type",
                          "type": "enum",
                          "subType": "Service Type",
                          "value": "linode",
                          "schema": null
                        },
                        {
                          "name": "storage",
                          "type": "integer",
                          "value": 24576,
                          "schema": null
                        },
                        {
                          "name": "transfer",
                          "type": "integer",
                          "value": 2000,
                          "schema": null
                        },
                        {
                          "name": "vcpus",
                          "type": "integer",
                          "value": 2,
                          "schema": null
                        }
                      ]
                    },
                    {
                      "name": "status",
                      "description": "The current state of this Linode.",
                      "filterable": true,
                      "type": "enum",
                      "subType": "Status",
                      "value": "running",
                      "schema": [
                        {
                          "name": "offline",
                          "description": "The Linode is powered off."
                        },
                        {
                          "name": "booting",
                          "description": "The Linode is currently booting up."
                        },
                        {
                          "name": "running",
                          "description": "The Linode is currently running."
                        },
                        {
                          "name": "shutting_down",
                          "description": "The Linode is currently shutting down."
                        },
                        {
                          "name": "rebooting",
                          "description": "The Linode is rebooting."
                        },
                        {
                          "name": "provisioning",
                          "description": "The Linode is being created."
                        },
                        {
                          "name": "deleting",
                          "description": "The Linode is being deleted."
                        },
                        {
                          "name": "migrating",
                          "description": "The Linode is being migrated to a new host/region."
                        }
                      ]
                    },
                    {
                      "name": "total_transfer",
                      "description": "The amount of outbound traffic used this month.",
                      "type": "integer",
                      "value": 20000,
                      "schema": null
                    },
                    {
                      "name": "updated",
                      "description": "The last updated datetime for this Linode record.",
                      "type": "datetime",
                      "value": "2015-10-27T09:59:26.000Z",
                      "schema": null
                    },
                    {
                      "name": "hypervisor",
                      "description": "The hypervisor this Linode is running on.",
                      "type": "enum",
                      "subType": "Hypervisor",
                      "value": "kvm",
                      "schema": [
                        {
                          "name": "kvm",
                          "description": "KVM"
                        },
                        {
                          "name": "xen",
                          "description": "Xen"
                        }
                      ]
                    }
                  ],
                  "enums": {
                    "Status": {
                      "offline": "The Linode is powered off.",
                      "booting": "The Linode is currently booting up.",
                      "running": "The Linode is currently running.",
                      "shutting_down": "The Linode is currently shutting down.",
                      "rebooting": "The Linode is rebooting.",
                      "provisioning": "The Linode is being created.",
                      "deleting": "The Linode is being deleted.",
                      "migrating": "The Linode is being migrated to a new host/region."
                    },
                    "BackupStatus": {
                      "pending": "Backup is in the queue and waiting to begin.",
                      "running": "Linode in the process of being backed up.",
                      "needsPostProcessing": "Backups awaiting final integration into existing backup data.",
                      "successful": "Backup successfully completed.",
                      "failed": "Linode backup failed.",
                      "userAborted": "User aborted current backup process."
                    },
                    "BackupType": {
                      "auto": "Automatic backup",
                      "snapshot": "User-initiated, manual file backup"
                    },
                    "Window": {
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
                      "W22": "2200 - 0000 UTC"
                    },
                    "Hypervisor": {
                      "kvm": "KVM",
                      "xen": "Xen"
                    }
                  },
                  "example": {
                    "id": 123456,
                    "alerts": {
                      "cpu": {
                        "enabled": true,
                        "threshold": 90
                      },
                      "io": {
                        "enabled": true,
                        "threshold": 10000
                      },
                      "transfer_in": {
                        "enabled": true,
                        "threshold": 10
                      },
                      "transfer_out": {
                        "enabled": true,
                        "threshold": 10
                      },
                      "transfer_quota": {
                        "enabled": true,
                        "threshold": 80
                      }
                    },
                    "backups": {
                      "enabled": true,
                      "schedule": {
                        "day": "Tuesday",
                        "window": "W20"
                      },
                      "last_backup": {
                        "id": 123456,
                        "label": "A label for your snapshot",
                        "status": "successful",
                        "type": "snapshot",
                        "region": {
                          "id": "us-east-1a",
                          "label": "Newark, NJ",
                          "country": "US"
                        },
                        "created": "2015-09-29T11:21:01",
                        "updated": "2015-09-29T11:21:01",
                        "finished": "2015-09-29T11:21:01",
                        "configs": [
                          "My Debian8 Profile"
                        ],
                        "disks": [
                          {
                            "label": "My Debian8 Disk",
                            "size": 24064,
                            "filesystem": "ext4"
                          },
                          {
                            "label": "swap",
                            "size": 512,
                            "filesystem": "swap"
                          }
                        ],
                        "availability": "daily"
                      },
                      "snapshot": {
                        "id": 123456,
                        "label": "A label for your snapshot",
                        "status": "successful",
                        "type": "snapshot",
                        "region": {
                          "id": "us-east-1a",
                          "label": "Newark, NJ",
                          "country": "US"
                        },
                        "created": "2015-09-29T11:21:01",
                        "updated": "2015-09-29T11:21:01",
                        "finished": "2015-09-29T11:21:01",
                        "configs": [
                          "My Debian8 Profile"
                        ],
                        "disks": [
                          {
                            "label": "My Debian8 Disk",
                            "size": 24064,
                            "filesystem": "ext4"
                          },
                          {
                            "label": "swap",
                            "size": 512,
                            "filesystem": "swap"
                          }
                        ],
                        "availability": "daily"
                      }
                    },
                    "created": "2015-09-29T11:21:01",
                    "region": {
                      "id": "us-east-1a",
                      "label": "Newark, NJ",
                      "country": "US"
                    },
                    "distribution": {
                      "id": "linode/Arch2014.10",
                      "created": "2014-12-24T18:00:09.000Z",
                      "label": "Arch Linux 2014.10",
                      "minimum_storage_size": 800,
                      "recommended": true,
                      "vendor": "Arch",
                      "x64": true
                    },
                    "group": "Example",
                    "ipv4": [
                      "97.107.143.8",
                      "192.168.149.108"
                    ],
                    "ipv6": "2a01:7e00::f03c:91ff:fe96:46f5/64",
                    "label": "Example Linode",
                    "type": [
                      {
                        "id": "g5-standard-1",
                        "backups_price": 250,
                        "class": "standard",
                        "disk": 24576,
                        "hourly_price": 1,
                        "label": "Linode 2048",
                        "mbits_out": 125,
                        "monthly_price": 1000,
                        "ram": 2048,
                        "service_type": "linode",
                        "storage": 24576,
                        "transfer": 2000,
                        "vcpus": 2
                      }
                    ],
                    "status": "running",
                    "total_transfer": 20000,
                    "updated": "2015-10-27T09:59:26.000Z",
                    "hypervisor": "kvm"
                  }
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
                    "description": {
                      "descText": "Optional distribution to deploy with this disk. \n",
                      "listItems": [
                        "If no distribution is provided, a blank disk is created."
                      ]
                    },
                    "type": "integer",
                    "name": "distribution"
                  },
                  {
                    "optional": "unless distribution is specified",
                    "description": {
                      "descText": "Root password to deploy distribution with. \n",
                      "listItems": [
                        "root_pass is required if a distribution is provided."
                      ]
                    },
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
                    "description": {
                      "descText": "The stackscript ID to deploy with this disk. \n",
                      "listItems": [
                        "Must provide a distribution. Distribution must be one that the stackscript can be deployed to."
                      ]
                    },
                    "type": "integer",
                    "name": "stackscript"
                  },
                  {
                    "optional": true,
                    "description": {
                      "descText": "UDF (user-defined fields) for this stackscript. Defaults to \"{}\". \n",
                      "listItems": [
                        "Must match UDFs required by stackscript."
                      ]
                    },
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
                    "value": "new_disk = my_linode.create_disk(4096, filesystem='ext4', label='Example Disk')\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "linode/instances/:id/disks",
            "routePath": "/reference/endpoints/linode/instances/:id/disks",
            "endpoints": []
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
                    "value": "disk = my_linode.Disk(client, 456, 123) # linode_client, disk_id, linode_id\n"
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
                      "value": 123456,
                      "schema": null
                    },
                    {
                      "name": "label",
                      "description": "Human-friendly disk name.",
                      "filterable": true,
                      "type": "string",
                      "value": "Ubuntu 14.04 Disk",
                      "schema": null
                    },
                    {
                      "name": "status",
                      "description": "Status of the disk.",
                      "filterable": false,
                      "type": "enum",
                      "subType": "Status",
                      "value": "ok",
                      "schema": [
                        {
                          "name": "ok",
                          "description": "No disk jobs are running."
                        },
                        {
                          "name": "deleting",
                          "description": "This disk is being deleted."
                        },
                        {
                          "name": "creating",
                          "description": "This disk is being created."
                        },
                        {
                          "name": "migrating",
                          "description": "This disk is being migrated."
                        },
                        {
                          "name": "cancelling-migration",
                          "description": "The disk migration is being cancelled."
                        },
                        {
                          "name": "duplicating",
                          "description": "This disk is being duplicated."
                        },
                        {
                          "name": "resizing",
                          "description": "This disk is being resized."
                        },
                        {
                          "name": "restoring",
                          "description": "This disk is being restored."
                        },
                        {
                          "name": "copying",
                          "description": "This disk is being copied."
                        },
                        {
                          "name": "freezing",
                          "description": "This disk is being frozen."
                        },
                        {
                          "name": "thawing",
                          "description": "This disk is being thawed."
                        }
                      ]
                    },
                    {
                      "name": "size",
                      "description": "Size of this disk in MB.",
                      "editable": true,
                      "filterable": true,
                      "type": "integer",
                      "value": 1000,
                      "schema": null
                    },
                    {
                      "name": "filesystem",
                      "description": "The filesystem on the disk.",
                      "type": "enum",
                      "subType": "Filesystem",
                      "value": "ext4",
                      "schema": [
                        {
                          "name": "raw",
                          "description": "No filesystem, just a raw binary stream."
                        },
                        {
                          "name": "swap",
                          "description": "Linux swap area"
                        },
                        {
                          "name": "ext3",
                          "description": "The ext3 journaling filesystem for Linux."
                        },
                        {
                          "name": "ext4",
                          "description": "The ext4 journaling filesystem for Linux."
                        },
                        {
                          "name": "initrd",
                          "description": "initrd (uncompressed initrd, ext2, max 32 MB)"
                        }
                      ]
                    },
                    {
                      "name": "created",
                      "type": "datetime",
                      "value": "2015-09-29T11:21:01",
                      "schema": null
                    },
                    {
                      "name": "updated",
                      "type": "datetime",
                      "value": "2015-09-29T11:21:01",
                      "schema": null
                    }
                  ],
                  "enums": {
                    "Status": {
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
                      "thawing": "This disk is being thawed."
                    },
                    "Filesystem": {
                      "raw": "No filesystem, just a raw binary stream.",
                      "swap": "Linux swap area",
                      "ext3": "The ext3 journaling filesystem for Linux.",
                      "ext4": "The ext4 journaling filesystem for Linux.",
                      "initrd": "initrd (uncompressed initrd, ext2, max 32 MB)"
                    }
                  },
                  "example": {
                    "id": 123456,
                    "label": "Ubuntu 14.04 Disk",
                    "status": "ok",
                    "size": 1000,
                    "filesystem": "ext4",
                    "created": "2015-09-29T11:21:01",
                    "updated": "2015-09-29T11:21:01"
                  }
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
                    "value": "disk.label = 'New Disk Label'\ndisk.save()\n"
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
                    "value": "new_disk = disk.duplicate()\n"
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
                    "value": "disk.delete()\n"
                  }
                ],
                "name": "DELETE"
              }
            ],
            "path": "linode/instances/:id/disks/:id",
            "routePath": "/reference/endpoints/linode/instances/:id/disks/:id",
            "endpoints": []
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
            "path": "linode/instances/:id/disks/:id/resize",
            "routePath": "/reference/endpoints/linode/instances/:id/disks/:id/resize",
            "endpoints": []
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
                    "value": "disk.reset_root_password('hunter2')\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "linode/instances/:id/disks/:id/password",
            "routePath": "/reference/endpoints/linode/instances/:id/disks/:id/password",
            "endpoints": []
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
                    "value": "configs = my_linode.configs\n"
                  }
                ],
                "name": "GET",
                "resource": {
                  "name": "Linode Config",
                  "prefix": "conf",
                  "description": "Describes a configuration for booting up a Linode. This includes the disk mapping, kernel, and so on for booting a Linode. Note that <code>sd*</code> will be replaced by <code>xvd*</code> for deprecated Xen Linodes.\n",
                  "schema": [
                    {
                      "name": "id",
                      "type": "integer",
                      "value": 804,
                      "schema": null
                    },
                    {
                      "name": "comments",
                      "description": "User-supplied comments about this config.",
                      "editable": true,
                      "type": "string",
                      "value": "Example Linode configuration",
                      "schema": null
                    },
                    {
                      "name": "created",
                      "type": "datetime",
                      "value": "2015-09-29T11:21:38.000Z",
                      "schema": null
                    },
                    {
                      "name": "devtmpfs_automount",
                      "description": "Populates the /dev directory early during boot without udev.",
                      "editable": true,
                      "type": "boolean",
                      "value": false,
                      "schema": null
                    },
                    {
                      "name": "disks",
                      "description": "<a href=\"#object-disk\">Disks</a> attached to this Linode config.",
                      "editable": true,
                      "schema": [
                        {
                          "name": "sda",
                          "description": "The disk mapped to /dev/sda.",
                          "type": "disk",
                          "schema": [
                            {
                              "name": "id",
                              "type": "integer",
                              "value": 123456,
                              "schema": null
                            },
                            {
                              "name": "label",
                              "description": "Human-friendly disk name.",
                              "filterable": true,
                              "type": "string",
                              "value": "Ubuntu 14.04 Disk",
                              "schema": null
                            },
                            {
                              "name": "status",
                              "description": "Status of the disk.",
                              "filterable": false,
                              "type": "enum",
                              "subType": "Status",
                              "value": "ok",
                              "schema": [
                                {
                                  "name": "ok",
                                  "description": "No disk jobs are running."
                                },
                                {
                                  "name": "deleting",
                                  "description": "This disk is being deleted."
                                },
                                {
                                  "name": "creating",
                                  "description": "This disk is being created."
                                },
                                {
                                  "name": "migrating",
                                  "description": "This disk is being migrated."
                                },
                                {
                                  "name": "cancelling-migration",
                                  "description": "The disk migration is being cancelled."
                                },
                                {
                                  "name": "duplicating",
                                  "description": "This disk is being duplicated."
                                },
                                {
                                  "name": "resizing",
                                  "description": "This disk is being resized."
                                },
                                {
                                  "name": "restoring",
                                  "description": "This disk is being restored."
                                },
                                {
                                  "name": "copying",
                                  "description": "This disk is being copied."
                                },
                                {
                                  "name": "freezing",
                                  "description": "This disk is being frozen."
                                },
                                {
                                  "name": "thawing",
                                  "description": "This disk is being thawed."
                                }
                              ]
                            },
                            {
                              "name": "size",
                              "description": "Size of this disk in MB.",
                              "editable": true,
                              "filterable": true,
                              "type": "integer",
                              "value": 1000,
                              "schema": null
                            },
                            {
                              "name": "filesystem",
                              "description": "The filesystem on the disk.",
                              "type": "enum",
                              "subType": "Filesystem",
                              "value": "ext4",
                              "schema": [
                                {
                                  "name": "raw",
                                  "description": "No filesystem, just a raw binary stream."
                                },
                                {
                                  "name": "swap",
                                  "description": "Linux swap area"
                                },
                                {
                                  "name": "ext3",
                                  "description": "The ext3 journaling filesystem for Linux."
                                },
                                {
                                  "name": "ext4",
                                  "description": "The ext4 journaling filesystem for Linux."
                                },
                                {
                                  "name": "initrd",
                                  "description": "initrd (uncompressed initrd, ext2, max 32 MB)"
                                }
                              ]
                            },
                            {
                              "name": "created",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            },
                            {
                              "name": "updated",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "sdb",
                          "description": "The disk mapped to /dev/sdb.",
                          "type": "disk",
                          "value": "null",
                          "schema": [
                            {
                              "name": "id",
                              "type": "integer",
                              "value": 123456,
                              "schema": null
                            },
                            {
                              "name": "label",
                              "description": "Human-friendly disk name.",
                              "filterable": true,
                              "type": "string",
                              "value": "Ubuntu 14.04 Disk",
                              "schema": null
                            },
                            {
                              "name": "status",
                              "description": "Status of the disk.",
                              "filterable": false,
                              "type": "enum",
                              "subType": "Status",
                              "value": "ok",
                              "schema": [
                                {
                                  "name": "ok",
                                  "description": "No disk jobs are running."
                                },
                                {
                                  "name": "deleting",
                                  "description": "This disk is being deleted."
                                },
                                {
                                  "name": "creating",
                                  "description": "This disk is being created."
                                },
                                {
                                  "name": "migrating",
                                  "description": "This disk is being migrated."
                                },
                                {
                                  "name": "cancelling-migration",
                                  "description": "The disk migration is being cancelled."
                                },
                                {
                                  "name": "duplicating",
                                  "description": "This disk is being duplicated."
                                },
                                {
                                  "name": "resizing",
                                  "description": "This disk is being resized."
                                },
                                {
                                  "name": "restoring",
                                  "description": "This disk is being restored."
                                },
                                {
                                  "name": "copying",
                                  "description": "This disk is being copied."
                                },
                                {
                                  "name": "freezing",
                                  "description": "This disk is being frozen."
                                },
                                {
                                  "name": "thawing",
                                  "description": "This disk is being thawed."
                                }
                              ]
                            },
                            {
                              "name": "size",
                              "description": "Size of this disk in MB.",
                              "editable": true,
                              "filterable": true,
                              "type": "integer",
                              "value": 1000,
                              "schema": null
                            },
                            {
                              "name": "filesystem",
                              "description": "The filesystem on the disk.",
                              "type": "enum",
                              "subType": "Filesystem",
                              "value": "ext4",
                              "schema": [
                                {
                                  "name": "raw",
                                  "description": "No filesystem, just a raw binary stream."
                                },
                                {
                                  "name": "swap",
                                  "description": "Linux swap area"
                                },
                                {
                                  "name": "ext3",
                                  "description": "The ext3 journaling filesystem for Linux."
                                },
                                {
                                  "name": "ext4",
                                  "description": "The ext4 journaling filesystem for Linux."
                                },
                                {
                                  "name": "initrd",
                                  "description": "initrd (uncompressed initrd, ext2, max 32 MB)"
                                }
                              ]
                            },
                            {
                              "name": "created",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            },
                            {
                              "name": "updated",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "sdc",
                          "description": "The disk mapped to /dev/sdc.",
                          "type": "disk",
                          "value": "null",
                          "schema": [
                            {
                              "name": "id",
                              "type": "integer",
                              "value": 123456,
                              "schema": null
                            },
                            {
                              "name": "label",
                              "description": "Human-friendly disk name.",
                              "filterable": true,
                              "type": "string",
                              "value": "Ubuntu 14.04 Disk",
                              "schema": null
                            },
                            {
                              "name": "status",
                              "description": "Status of the disk.",
                              "filterable": false,
                              "type": "enum",
                              "subType": "Status",
                              "value": "ok",
                              "schema": [
                                {
                                  "name": "ok",
                                  "description": "No disk jobs are running."
                                },
                                {
                                  "name": "deleting",
                                  "description": "This disk is being deleted."
                                },
                                {
                                  "name": "creating",
                                  "description": "This disk is being created."
                                },
                                {
                                  "name": "migrating",
                                  "description": "This disk is being migrated."
                                },
                                {
                                  "name": "cancelling-migration",
                                  "description": "The disk migration is being cancelled."
                                },
                                {
                                  "name": "duplicating",
                                  "description": "This disk is being duplicated."
                                },
                                {
                                  "name": "resizing",
                                  "description": "This disk is being resized."
                                },
                                {
                                  "name": "restoring",
                                  "description": "This disk is being restored."
                                },
                                {
                                  "name": "copying",
                                  "description": "This disk is being copied."
                                },
                                {
                                  "name": "freezing",
                                  "description": "This disk is being frozen."
                                },
                                {
                                  "name": "thawing",
                                  "description": "This disk is being thawed."
                                }
                              ]
                            },
                            {
                              "name": "size",
                              "description": "Size of this disk in MB.",
                              "editable": true,
                              "filterable": true,
                              "type": "integer",
                              "value": 1000,
                              "schema": null
                            },
                            {
                              "name": "filesystem",
                              "description": "The filesystem on the disk.",
                              "type": "enum",
                              "subType": "Filesystem",
                              "value": "ext4",
                              "schema": [
                                {
                                  "name": "raw",
                                  "description": "No filesystem, just a raw binary stream."
                                },
                                {
                                  "name": "swap",
                                  "description": "Linux swap area"
                                },
                                {
                                  "name": "ext3",
                                  "description": "The ext3 journaling filesystem for Linux."
                                },
                                {
                                  "name": "ext4",
                                  "description": "The ext4 journaling filesystem for Linux."
                                },
                                {
                                  "name": "initrd",
                                  "description": "initrd (uncompressed initrd, ext2, max 32 MB)"
                                }
                              ]
                            },
                            {
                              "name": "created",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            },
                            {
                              "name": "updated",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "sdd",
                          "description": "The disk mapped to /dev/sdd.",
                          "type": "disk",
                          "value": "null",
                          "schema": [
                            {
                              "name": "id",
                              "type": "integer",
                              "value": 123456,
                              "schema": null
                            },
                            {
                              "name": "label",
                              "description": "Human-friendly disk name.",
                              "filterable": true,
                              "type": "string",
                              "value": "Ubuntu 14.04 Disk",
                              "schema": null
                            },
                            {
                              "name": "status",
                              "description": "Status of the disk.",
                              "filterable": false,
                              "type": "enum",
                              "subType": "Status",
                              "value": "ok",
                              "schema": [
                                {
                                  "name": "ok",
                                  "description": "No disk jobs are running."
                                },
                                {
                                  "name": "deleting",
                                  "description": "This disk is being deleted."
                                },
                                {
                                  "name": "creating",
                                  "description": "This disk is being created."
                                },
                                {
                                  "name": "migrating",
                                  "description": "This disk is being migrated."
                                },
                                {
                                  "name": "cancelling-migration",
                                  "description": "The disk migration is being cancelled."
                                },
                                {
                                  "name": "duplicating",
                                  "description": "This disk is being duplicated."
                                },
                                {
                                  "name": "resizing",
                                  "description": "This disk is being resized."
                                },
                                {
                                  "name": "restoring",
                                  "description": "This disk is being restored."
                                },
                                {
                                  "name": "copying",
                                  "description": "This disk is being copied."
                                },
                                {
                                  "name": "freezing",
                                  "description": "This disk is being frozen."
                                },
                                {
                                  "name": "thawing",
                                  "description": "This disk is being thawed."
                                }
                              ]
                            },
                            {
                              "name": "size",
                              "description": "Size of this disk in MB.",
                              "editable": true,
                              "filterable": true,
                              "type": "integer",
                              "value": 1000,
                              "schema": null
                            },
                            {
                              "name": "filesystem",
                              "description": "The filesystem on the disk.",
                              "type": "enum",
                              "subType": "Filesystem",
                              "value": "ext4",
                              "schema": [
                                {
                                  "name": "raw",
                                  "description": "No filesystem, just a raw binary stream."
                                },
                                {
                                  "name": "swap",
                                  "description": "Linux swap area"
                                },
                                {
                                  "name": "ext3",
                                  "description": "The ext3 journaling filesystem for Linux."
                                },
                                {
                                  "name": "ext4",
                                  "description": "The ext4 journaling filesystem for Linux."
                                },
                                {
                                  "name": "initrd",
                                  "description": "initrd (uncompressed initrd, ext2, max 32 MB)"
                                }
                              ]
                            },
                            {
                              "name": "created",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            },
                            {
                              "name": "updated",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "sde",
                          "description": "The disk mapped to /dev/sde.",
                          "type": "disk",
                          "value": "null",
                          "schema": [
                            {
                              "name": "id",
                              "type": "integer",
                              "value": 123456,
                              "schema": null
                            },
                            {
                              "name": "label",
                              "description": "Human-friendly disk name.",
                              "filterable": true,
                              "type": "string",
                              "value": "Ubuntu 14.04 Disk",
                              "schema": null
                            },
                            {
                              "name": "status",
                              "description": "Status of the disk.",
                              "filterable": false,
                              "type": "enum",
                              "subType": "Status",
                              "value": "ok",
                              "schema": [
                                {
                                  "name": "ok",
                                  "description": "No disk jobs are running."
                                },
                                {
                                  "name": "deleting",
                                  "description": "This disk is being deleted."
                                },
                                {
                                  "name": "creating",
                                  "description": "This disk is being created."
                                },
                                {
                                  "name": "migrating",
                                  "description": "This disk is being migrated."
                                },
                                {
                                  "name": "cancelling-migration",
                                  "description": "The disk migration is being cancelled."
                                },
                                {
                                  "name": "duplicating",
                                  "description": "This disk is being duplicated."
                                },
                                {
                                  "name": "resizing",
                                  "description": "This disk is being resized."
                                },
                                {
                                  "name": "restoring",
                                  "description": "This disk is being restored."
                                },
                                {
                                  "name": "copying",
                                  "description": "This disk is being copied."
                                },
                                {
                                  "name": "freezing",
                                  "description": "This disk is being frozen."
                                },
                                {
                                  "name": "thawing",
                                  "description": "This disk is being thawed."
                                }
                              ]
                            },
                            {
                              "name": "size",
                              "description": "Size of this disk in MB.",
                              "editable": true,
                              "filterable": true,
                              "type": "integer",
                              "value": 1000,
                              "schema": null
                            },
                            {
                              "name": "filesystem",
                              "description": "The filesystem on the disk.",
                              "type": "enum",
                              "subType": "Filesystem",
                              "value": "ext4",
                              "schema": [
                                {
                                  "name": "raw",
                                  "description": "No filesystem, just a raw binary stream."
                                },
                                {
                                  "name": "swap",
                                  "description": "Linux swap area"
                                },
                                {
                                  "name": "ext3",
                                  "description": "The ext3 journaling filesystem for Linux."
                                },
                                {
                                  "name": "ext4",
                                  "description": "The ext4 journaling filesystem for Linux."
                                },
                                {
                                  "name": "initrd",
                                  "description": "initrd (uncompressed initrd, ext2, max 32 MB)"
                                }
                              ]
                            },
                            {
                              "name": "created",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            },
                            {
                              "name": "updated",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "sdf",
                          "description": "The disk mapped to /dev/sdf.",
                          "type": "disk",
                          "value": "null",
                          "schema": [
                            {
                              "name": "id",
                              "type": "integer",
                              "value": 123456,
                              "schema": null
                            },
                            {
                              "name": "label",
                              "description": "Human-friendly disk name.",
                              "filterable": true,
                              "type": "string",
                              "value": "Ubuntu 14.04 Disk",
                              "schema": null
                            },
                            {
                              "name": "status",
                              "description": "Status of the disk.",
                              "filterable": false,
                              "type": "enum",
                              "subType": "Status",
                              "value": "ok",
                              "schema": [
                                {
                                  "name": "ok",
                                  "description": "No disk jobs are running."
                                },
                                {
                                  "name": "deleting",
                                  "description": "This disk is being deleted."
                                },
                                {
                                  "name": "creating",
                                  "description": "This disk is being created."
                                },
                                {
                                  "name": "migrating",
                                  "description": "This disk is being migrated."
                                },
                                {
                                  "name": "cancelling-migration",
                                  "description": "The disk migration is being cancelled."
                                },
                                {
                                  "name": "duplicating",
                                  "description": "This disk is being duplicated."
                                },
                                {
                                  "name": "resizing",
                                  "description": "This disk is being resized."
                                },
                                {
                                  "name": "restoring",
                                  "description": "This disk is being restored."
                                },
                                {
                                  "name": "copying",
                                  "description": "This disk is being copied."
                                },
                                {
                                  "name": "freezing",
                                  "description": "This disk is being frozen."
                                },
                                {
                                  "name": "thawing",
                                  "description": "This disk is being thawed."
                                }
                              ]
                            },
                            {
                              "name": "size",
                              "description": "Size of this disk in MB.",
                              "editable": true,
                              "filterable": true,
                              "type": "integer",
                              "value": 1000,
                              "schema": null
                            },
                            {
                              "name": "filesystem",
                              "description": "The filesystem on the disk.",
                              "type": "enum",
                              "subType": "Filesystem",
                              "value": "ext4",
                              "schema": [
                                {
                                  "name": "raw",
                                  "description": "No filesystem, just a raw binary stream."
                                },
                                {
                                  "name": "swap",
                                  "description": "Linux swap area"
                                },
                                {
                                  "name": "ext3",
                                  "description": "The ext3 journaling filesystem for Linux."
                                },
                                {
                                  "name": "ext4",
                                  "description": "The ext4 journaling filesystem for Linux."
                                },
                                {
                                  "name": "initrd",
                                  "description": "initrd (uncompressed initrd, ext2, max 32 MB)"
                                }
                              ]
                            },
                            {
                              "name": "created",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            },
                            {
                              "name": "updated",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "sdg",
                          "description": "The disk mapped to /dev/sdg.",
                          "type": "disk",
                          "value": "null",
                          "schema": [
                            {
                              "name": "id",
                              "type": "integer",
                              "value": 123456,
                              "schema": null
                            },
                            {
                              "name": "label",
                              "description": "Human-friendly disk name.",
                              "filterable": true,
                              "type": "string",
                              "value": "Ubuntu 14.04 Disk",
                              "schema": null
                            },
                            {
                              "name": "status",
                              "description": "Status of the disk.",
                              "filterable": false,
                              "type": "enum",
                              "subType": "Status",
                              "value": "ok",
                              "schema": [
                                {
                                  "name": "ok",
                                  "description": "No disk jobs are running."
                                },
                                {
                                  "name": "deleting",
                                  "description": "This disk is being deleted."
                                },
                                {
                                  "name": "creating",
                                  "description": "This disk is being created."
                                },
                                {
                                  "name": "migrating",
                                  "description": "This disk is being migrated."
                                },
                                {
                                  "name": "cancelling-migration",
                                  "description": "The disk migration is being cancelled."
                                },
                                {
                                  "name": "duplicating",
                                  "description": "This disk is being duplicated."
                                },
                                {
                                  "name": "resizing",
                                  "description": "This disk is being resized."
                                },
                                {
                                  "name": "restoring",
                                  "description": "This disk is being restored."
                                },
                                {
                                  "name": "copying",
                                  "description": "This disk is being copied."
                                },
                                {
                                  "name": "freezing",
                                  "description": "This disk is being frozen."
                                },
                                {
                                  "name": "thawing",
                                  "description": "This disk is being thawed."
                                }
                              ]
                            },
                            {
                              "name": "size",
                              "description": "Size of this disk in MB.",
                              "editable": true,
                              "filterable": true,
                              "type": "integer",
                              "value": 1000,
                              "schema": null
                            },
                            {
                              "name": "filesystem",
                              "description": "The filesystem on the disk.",
                              "type": "enum",
                              "subType": "Filesystem",
                              "value": "ext4",
                              "schema": [
                                {
                                  "name": "raw",
                                  "description": "No filesystem, just a raw binary stream."
                                },
                                {
                                  "name": "swap",
                                  "description": "Linux swap area"
                                },
                                {
                                  "name": "ext3",
                                  "description": "The ext3 journaling filesystem for Linux."
                                },
                                {
                                  "name": "ext4",
                                  "description": "The ext4 journaling filesystem for Linux."
                                },
                                {
                                  "name": "initrd",
                                  "description": "initrd (uncompressed initrd, ext2, max 32 MB)"
                                }
                              ]
                            },
                            {
                              "name": "created",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            },
                            {
                              "name": "updated",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "sdh",
                          "description": "The disk mapped to /dev/sdh.",
                          "type": "disk",
                          "value": "null",
                          "schema": [
                            {
                              "name": "id",
                              "type": "integer",
                              "value": 123456,
                              "schema": null
                            },
                            {
                              "name": "label",
                              "description": "Human-friendly disk name.",
                              "filterable": true,
                              "type": "string",
                              "value": "Ubuntu 14.04 Disk",
                              "schema": null
                            },
                            {
                              "name": "status",
                              "description": "Status of the disk.",
                              "filterable": false,
                              "type": "enum",
                              "subType": "Status",
                              "value": "ok",
                              "schema": [
                                {
                                  "name": "ok",
                                  "description": "No disk jobs are running."
                                },
                                {
                                  "name": "deleting",
                                  "description": "This disk is being deleted."
                                },
                                {
                                  "name": "creating",
                                  "description": "This disk is being created."
                                },
                                {
                                  "name": "migrating",
                                  "description": "This disk is being migrated."
                                },
                                {
                                  "name": "cancelling-migration",
                                  "description": "The disk migration is being cancelled."
                                },
                                {
                                  "name": "duplicating",
                                  "description": "This disk is being duplicated."
                                },
                                {
                                  "name": "resizing",
                                  "description": "This disk is being resized."
                                },
                                {
                                  "name": "restoring",
                                  "description": "This disk is being restored."
                                },
                                {
                                  "name": "copying",
                                  "description": "This disk is being copied."
                                },
                                {
                                  "name": "freezing",
                                  "description": "This disk is being frozen."
                                },
                                {
                                  "name": "thawing",
                                  "description": "This disk is being thawed."
                                }
                              ]
                            },
                            {
                              "name": "size",
                              "description": "Size of this disk in MB.",
                              "editable": true,
                              "filterable": true,
                              "type": "integer",
                              "value": 1000,
                              "schema": null
                            },
                            {
                              "name": "filesystem",
                              "description": "The filesystem on the disk.",
                              "type": "enum",
                              "subType": "Filesystem",
                              "value": "ext4",
                              "schema": [
                                {
                                  "name": "raw",
                                  "description": "No filesystem, just a raw binary stream."
                                },
                                {
                                  "name": "swap",
                                  "description": "Linux swap area"
                                },
                                {
                                  "name": "ext3",
                                  "description": "The ext3 journaling filesystem for Linux."
                                },
                                {
                                  "name": "ext4",
                                  "description": "The ext4 journaling filesystem for Linux."
                                },
                                {
                                  "name": "initrd",
                                  "description": "initrd (uncompressed initrd, ext2, max 32 MB)"
                                }
                              ]
                            },
                            {
                              "name": "created",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            },
                            {
                              "name": "updated",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            }
                          ]
                        }
                      ]
                    },
                    {
                      "name": "helpers",
                      "description": "Helpers enabled when booting to this Linode config.",
                      "schema": [
                        {
                          "name": "disable_updatedb",
                          "description": "Disables updatedb cron job to avoid disk thrashing.",
                          "editable": true,
                          "type": "boolean",
                          "value": true,
                          "schema": null
                        },
                        {
                          "name": "enable_distro_helper",
                          "description": "Helps maintain correct inittab/upstart console device.",
                          "editable": true,
                          "type": "boolean",
                          "value": true,
                          "schema": null
                        },
                        {
                          "name": "enable_modules_dep_helper",
                          "description": "Creates a modules dependency file for the kernel you run.",
                          "editable": true,
                          "type": "boolean",
                          "value": true,
                          "schema": null
                        },
                        {
                          "name": "enable_network_helper",
                          "description": "Automatically configure static networking <a href=\"https://www.linode.com/docs/platform/network-helper\">\n  (more info)\n</a>.\n",
                          "editable": true,
                          "type": "boolean",
                          "value": true,
                          "schema": null
                        }
                      ]
                    },
                    {
                      "name": "initrd",
                      "description": "An initrd <a href=\"#object-disk\">disk</a> attached to this Linode config.",
                      "editable": true,
                      "type": "integer",
                      "value": "null",
                      "schema": null
                    },
                    {
                      "name": "kernel",
                      "editable": true,
                      "type": "kernel",
                      "schema": [
                        {
                          "name": "id",
                          "type": "string",
                          "value": "linode/3.5.2-x86_64-linode26",
                          "schema": null
                        },
                        {
                          "name": "description",
                          "description": "Additional, descriptive text about the kernel.",
                          "type": "string",
                          "value": "null",
                          "schema": null
                        },
                        {
                          "name": "xen",
                          "description": "If this kernel is suitable for Xen Linodes.",
                          "filterable": true,
                          "type": "boolean",
                          "value": false,
                          "schema": null
                        },
                        {
                          "name": "kvm",
                          "description": "If this kernel is suitable for KVM Linodes.",
                          "filterable": true,
                          "type": "boolean",
                          "value": true,
                          "schema": null
                        },
                        {
                          "name": "label",
                          "description": "The friendly name of this kernel.",
                          "filterable": true,
                          "type": "string",
                          "value": "3.5.2-x86_64-linode26",
                          "schema": null
                        },
                        {
                          "name": "version",
                          "description": "Linux Kernel version.",
                          "filterable": true,
                          "type": "string",
                          "value": "3.5.2",
                          "schema": null
                        },
                        {
                          "name": "x64",
                          "description": "True if this is a 64-bit kernel, false for 32-bit.",
                          "filterable": true,
                          "type": "boolean",
                          "value": true,
                          "schema": null
                        },
                        {
                          "name": "current",
                          "filterable": true,
                          "type": "boolean",
                          "value": true,
                          "schema": null
                        },
                        {
                          "name": "deprecated",
                          "filterable": true,
                          "type": "boolean",
                          "value": false,
                          "schema": null
                        },
                        {
                          "name": "latest",
                          "type": "boolean",
                          "value": true,
                          "schema": null
                        }
                      ]
                    },
                    {
                      "name": "label",
                      "description": "Human-friendly label for this config.",
                      "editable": true,
                      "filterable": true,
                      "type": "string",
                      "value": "My openSUSE 13.2 Profile",
                      "schema": null
                    },
                    {
                      "name": "ram_limit",
                      "description": "Optional RAM limit in MB for uncommon operating systems.",
                      "editable": true,
                      "type": "integer",
                      "value": 512,
                      "schema": null
                    },
                    {
                      "name": "root_device",
                      "description": "Root device to boot. Corresponding disk must be attached.",
                      "editable": true,
                      "type": "string",
                      "value": "/dev/sda",
                      "schema": null
                    },
                    {
                      "name": "root_device_ro",
                      "description": "Controls whether to mount the root disk read-only.",
                      "editable": true,
                      "type": "boolean",
                      "value": false,
                      "schema": null
                    },
                    {
                      "name": "run_level",
                      "description": "Sets the <a href=\"#object-run_level-enum\">run level</a> for Linode boot.",
                      "editable": true,
                      "type": "enum",
                      "subType": "run_level",
                      "value": "default",
                      "schema": [
                        {
                          "name": "default",
                          "description": "Normal multi-user boot mode"
                        },
                        {
                          "name": "single",
                          "description": "Single user boot mode"
                        },
                        {
                          "name": "binbash",
                          "description": "Boots to a root bash shell"
                        }
                      ]
                    },
                    {
                      "name": "updated",
                      "type": "datetime",
                      "value": "2015-09-29T11:21:38.000Z",
                      "schema": null
                    },
                    {
                      "name": "virt_mode",
                      "description": "Controls the <a href=\"#object-virt_mode-enum\">virtualization mode</a>.",
                      "editable": true,
                      "type": "enum",
                      "subType": "virt_mode",
                      "value": "paravirt",
                      "schema": [
                        {
                          "name": "fullvirt",
                          "description": "Complete system virtualization"
                        },
                        {
                          "name": "paravirt",
                          "description": "Some hardware is unvirtualized; often faster than fullvirt"
                        }
                      ]
                    }
                  ],
                  "enums": {
                    "run_level": {
                      "default": "Normal multi-user boot mode",
                      "single": "Single user boot mode",
                      "binbash": "Boots to a root bash shell"
                    },
                    "virt_mode": {
                      "fullvirt": "Complete system virtualization",
                      "paravirt": "Some hardware is unvirtualized; often faster than fullvirt"
                    }
                  },
                  "example": {
                    "id": 804,
                    "comments": "Example Linode configuration",
                    "created": "2015-09-29T11:21:38.000Z",
                    "devtmpfs_automount": false,
                    "disks": {
                      "sda": {
                        "id": 123456,
                        "label": "Ubuntu 14.04 Disk",
                        "status": "ok",
                        "size": 1000,
                        "filesystem": "ext4",
                        "created": "2015-09-29T11:21:01",
                        "updated": "2015-09-29T11:21:01"
                      },
                      "sdb": "null",
                      "sdc": "null",
                      "sdd": "null",
                      "sde": "null",
                      "sdf": "null",
                      "sdg": "null",
                      "sdh": "null"
                    },
                    "helpers": {
                      "disable_updatedb": true,
                      "enable_distro_helper": true,
                      "enable_modules_dep_helper": true,
                      "enable_network_helper": true
                    },
                    "initrd": "null",
                    "kernel": {
                      "id": "linode/3.5.2-x86_64-linode26",
                      "description": "null",
                      "xen": false,
                      "kvm": true,
                      "label": "3.5.2-x86_64-linode26",
                      "version": "3.5.2",
                      "x64": true,
                      "current": true,
                      "deprecated": false,
                      "latest": true
                    },
                    "label": "My openSUSE 13.2 Profile",
                    "ram_limit": 512,
                    "root_device": "/dev/sda",
                    "root_device_ro": false,
                    "run_level": "default",
                    "updated": "2015-09-29T11:21:38.000Z",
                    "virt_mode": "paravirt"
                  }
                }
              },
              {
                "oauth": "linodes:modify",
                "description": "Creates a new config for a given Linode.\n",
                "params": [
                  {
                    "description": "A kernel ID to boot this Linode with.\n",
                    "type": "integer",
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
                    "value": "config = my_linode.create_config('linode/latest_64', disks=linode.disks, label='Arch Linux Config')\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "linode/instances/:id/configs",
            "routePath": "/reference/endpoints/linode/instances/:id/configs",
            "endpoints": []
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
                    "value": "config = my_linode.Config(client, 567, 123) # linode_client, config_id, linode_id\n"
                  }
                ],
                "name": "GET",
                "resource": {
                  "name": "Linode Config",
                  "prefix": "conf",
                  "description": "Describes a configuration for booting up a Linode. This includes the disk mapping, kernel, and so on for booting a Linode. Note that <code>sd*</code> will be replaced by <code>xvd*</code> for deprecated Xen Linodes.\n",
                  "schema": [
                    {
                      "name": "id",
                      "type": "integer",
                      "value": 804,
                      "schema": null
                    },
                    {
                      "name": "comments",
                      "description": "User-supplied comments about this config.",
                      "editable": true,
                      "type": "string",
                      "value": "Example Linode configuration",
                      "schema": null
                    },
                    {
                      "name": "created",
                      "type": "datetime",
                      "value": "2015-09-29T11:21:38.000Z",
                      "schema": null
                    },
                    {
                      "name": "devtmpfs_automount",
                      "description": "Populates the /dev directory early during boot without udev.",
                      "editable": true,
                      "type": "boolean",
                      "value": false,
                      "schema": null
                    },
                    {
                      "name": "disks",
                      "description": "<a href=\"#object-disk\">Disks</a> attached to this Linode config.",
                      "editable": true,
                      "schema": [
                        {
                          "name": "sda",
                          "description": "The disk mapped to /dev/sda.",
                          "type": "disk",
                          "schema": [
                            {
                              "name": "id",
                              "type": "integer",
                              "value": 123456,
                              "schema": null
                            },
                            {
                              "name": "label",
                              "description": "Human-friendly disk name.",
                              "filterable": true,
                              "type": "string",
                              "value": "Ubuntu 14.04 Disk",
                              "schema": null
                            },
                            {
                              "name": "status",
                              "description": "Status of the disk.",
                              "filterable": false,
                              "type": "enum",
                              "subType": "Status",
                              "value": "ok",
                              "schema": [
                                {
                                  "name": "ok",
                                  "description": "No disk jobs are running."
                                },
                                {
                                  "name": "deleting",
                                  "description": "This disk is being deleted."
                                },
                                {
                                  "name": "creating",
                                  "description": "This disk is being created."
                                },
                                {
                                  "name": "migrating",
                                  "description": "This disk is being migrated."
                                },
                                {
                                  "name": "cancelling-migration",
                                  "description": "The disk migration is being cancelled."
                                },
                                {
                                  "name": "duplicating",
                                  "description": "This disk is being duplicated."
                                },
                                {
                                  "name": "resizing",
                                  "description": "This disk is being resized."
                                },
                                {
                                  "name": "restoring",
                                  "description": "This disk is being restored."
                                },
                                {
                                  "name": "copying",
                                  "description": "This disk is being copied."
                                },
                                {
                                  "name": "freezing",
                                  "description": "This disk is being frozen."
                                },
                                {
                                  "name": "thawing",
                                  "description": "This disk is being thawed."
                                }
                              ]
                            },
                            {
                              "name": "size",
                              "description": "Size of this disk in MB.",
                              "editable": true,
                              "filterable": true,
                              "type": "integer",
                              "value": 1000,
                              "schema": null
                            },
                            {
                              "name": "filesystem",
                              "description": "The filesystem on the disk.",
                              "type": "enum",
                              "subType": "Filesystem",
                              "value": "ext4",
                              "schema": [
                                {
                                  "name": "raw",
                                  "description": "No filesystem, just a raw binary stream."
                                },
                                {
                                  "name": "swap",
                                  "description": "Linux swap area"
                                },
                                {
                                  "name": "ext3",
                                  "description": "The ext3 journaling filesystem for Linux."
                                },
                                {
                                  "name": "ext4",
                                  "description": "The ext4 journaling filesystem for Linux."
                                },
                                {
                                  "name": "initrd",
                                  "description": "initrd (uncompressed initrd, ext2, max 32 MB)"
                                }
                              ]
                            },
                            {
                              "name": "created",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            },
                            {
                              "name": "updated",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "sdb",
                          "description": "The disk mapped to /dev/sdb.",
                          "type": "disk",
                          "value": "null",
                          "schema": [
                            {
                              "name": "id",
                              "type": "integer",
                              "value": 123456,
                              "schema": null
                            },
                            {
                              "name": "label",
                              "description": "Human-friendly disk name.",
                              "filterable": true,
                              "type": "string",
                              "value": "Ubuntu 14.04 Disk",
                              "schema": null
                            },
                            {
                              "name": "status",
                              "description": "Status of the disk.",
                              "filterable": false,
                              "type": "enum",
                              "subType": "Status",
                              "value": "ok",
                              "schema": [
                                {
                                  "name": "ok",
                                  "description": "No disk jobs are running."
                                },
                                {
                                  "name": "deleting",
                                  "description": "This disk is being deleted."
                                },
                                {
                                  "name": "creating",
                                  "description": "This disk is being created."
                                },
                                {
                                  "name": "migrating",
                                  "description": "This disk is being migrated."
                                },
                                {
                                  "name": "cancelling-migration",
                                  "description": "The disk migration is being cancelled."
                                },
                                {
                                  "name": "duplicating",
                                  "description": "This disk is being duplicated."
                                },
                                {
                                  "name": "resizing",
                                  "description": "This disk is being resized."
                                },
                                {
                                  "name": "restoring",
                                  "description": "This disk is being restored."
                                },
                                {
                                  "name": "copying",
                                  "description": "This disk is being copied."
                                },
                                {
                                  "name": "freezing",
                                  "description": "This disk is being frozen."
                                },
                                {
                                  "name": "thawing",
                                  "description": "This disk is being thawed."
                                }
                              ]
                            },
                            {
                              "name": "size",
                              "description": "Size of this disk in MB.",
                              "editable": true,
                              "filterable": true,
                              "type": "integer",
                              "value": 1000,
                              "schema": null
                            },
                            {
                              "name": "filesystem",
                              "description": "The filesystem on the disk.",
                              "type": "enum",
                              "subType": "Filesystem",
                              "value": "ext4",
                              "schema": [
                                {
                                  "name": "raw",
                                  "description": "No filesystem, just a raw binary stream."
                                },
                                {
                                  "name": "swap",
                                  "description": "Linux swap area"
                                },
                                {
                                  "name": "ext3",
                                  "description": "The ext3 journaling filesystem for Linux."
                                },
                                {
                                  "name": "ext4",
                                  "description": "The ext4 journaling filesystem for Linux."
                                },
                                {
                                  "name": "initrd",
                                  "description": "initrd (uncompressed initrd, ext2, max 32 MB)"
                                }
                              ]
                            },
                            {
                              "name": "created",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            },
                            {
                              "name": "updated",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "sdc",
                          "description": "The disk mapped to /dev/sdc.",
                          "type": "disk",
                          "value": "null",
                          "schema": [
                            {
                              "name": "id",
                              "type": "integer",
                              "value": 123456,
                              "schema": null
                            },
                            {
                              "name": "label",
                              "description": "Human-friendly disk name.",
                              "filterable": true,
                              "type": "string",
                              "value": "Ubuntu 14.04 Disk",
                              "schema": null
                            },
                            {
                              "name": "status",
                              "description": "Status of the disk.",
                              "filterable": false,
                              "type": "enum",
                              "subType": "Status",
                              "value": "ok",
                              "schema": [
                                {
                                  "name": "ok",
                                  "description": "No disk jobs are running."
                                },
                                {
                                  "name": "deleting",
                                  "description": "This disk is being deleted."
                                },
                                {
                                  "name": "creating",
                                  "description": "This disk is being created."
                                },
                                {
                                  "name": "migrating",
                                  "description": "This disk is being migrated."
                                },
                                {
                                  "name": "cancelling-migration",
                                  "description": "The disk migration is being cancelled."
                                },
                                {
                                  "name": "duplicating",
                                  "description": "This disk is being duplicated."
                                },
                                {
                                  "name": "resizing",
                                  "description": "This disk is being resized."
                                },
                                {
                                  "name": "restoring",
                                  "description": "This disk is being restored."
                                },
                                {
                                  "name": "copying",
                                  "description": "This disk is being copied."
                                },
                                {
                                  "name": "freezing",
                                  "description": "This disk is being frozen."
                                },
                                {
                                  "name": "thawing",
                                  "description": "This disk is being thawed."
                                }
                              ]
                            },
                            {
                              "name": "size",
                              "description": "Size of this disk in MB.",
                              "editable": true,
                              "filterable": true,
                              "type": "integer",
                              "value": 1000,
                              "schema": null
                            },
                            {
                              "name": "filesystem",
                              "description": "The filesystem on the disk.",
                              "type": "enum",
                              "subType": "Filesystem",
                              "value": "ext4",
                              "schema": [
                                {
                                  "name": "raw",
                                  "description": "No filesystem, just a raw binary stream."
                                },
                                {
                                  "name": "swap",
                                  "description": "Linux swap area"
                                },
                                {
                                  "name": "ext3",
                                  "description": "The ext3 journaling filesystem for Linux."
                                },
                                {
                                  "name": "ext4",
                                  "description": "The ext4 journaling filesystem for Linux."
                                },
                                {
                                  "name": "initrd",
                                  "description": "initrd (uncompressed initrd, ext2, max 32 MB)"
                                }
                              ]
                            },
                            {
                              "name": "created",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            },
                            {
                              "name": "updated",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "sdd",
                          "description": "The disk mapped to /dev/sdd.",
                          "type": "disk",
                          "value": "null",
                          "schema": [
                            {
                              "name": "id",
                              "type": "integer",
                              "value": 123456,
                              "schema": null
                            },
                            {
                              "name": "label",
                              "description": "Human-friendly disk name.",
                              "filterable": true,
                              "type": "string",
                              "value": "Ubuntu 14.04 Disk",
                              "schema": null
                            },
                            {
                              "name": "status",
                              "description": "Status of the disk.",
                              "filterable": false,
                              "type": "enum",
                              "subType": "Status",
                              "value": "ok",
                              "schema": [
                                {
                                  "name": "ok",
                                  "description": "No disk jobs are running."
                                },
                                {
                                  "name": "deleting",
                                  "description": "This disk is being deleted."
                                },
                                {
                                  "name": "creating",
                                  "description": "This disk is being created."
                                },
                                {
                                  "name": "migrating",
                                  "description": "This disk is being migrated."
                                },
                                {
                                  "name": "cancelling-migration",
                                  "description": "The disk migration is being cancelled."
                                },
                                {
                                  "name": "duplicating",
                                  "description": "This disk is being duplicated."
                                },
                                {
                                  "name": "resizing",
                                  "description": "This disk is being resized."
                                },
                                {
                                  "name": "restoring",
                                  "description": "This disk is being restored."
                                },
                                {
                                  "name": "copying",
                                  "description": "This disk is being copied."
                                },
                                {
                                  "name": "freezing",
                                  "description": "This disk is being frozen."
                                },
                                {
                                  "name": "thawing",
                                  "description": "This disk is being thawed."
                                }
                              ]
                            },
                            {
                              "name": "size",
                              "description": "Size of this disk in MB.",
                              "editable": true,
                              "filterable": true,
                              "type": "integer",
                              "value": 1000,
                              "schema": null
                            },
                            {
                              "name": "filesystem",
                              "description": "The filesystem on the disk.",
                              "type": "enum",
                              "subType": "Filesystem",
                              "value": "ext4",
                              "schema": [
                                {
                                  "name": "raw",
                                  "description": "No filesystem, just a raw binary stream."
                                },
                                {
                                  "name": "swap",
                                  "description": "Linux swap area"
                                },
                                {
                                  "name": "ext3",
                                  "description": "The ext3 journaling filesystem for Linux."
                                },
                                {
                                  "name": "ext4",
                                  "description": "The ext4 journaling filesystem for Linux."
                                },
                                {
                                  "name": "initrd",
                                  "description": "initrd (uncompressed initrd, ext2, max 32 MB)"
                                }
                              ]
                            },
                            {
                              "name": "created",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            },
                            {
                              "name": "updated",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "sde",
                          "description": "The disk mapped to /dev/sde.",
                          "type": "disk",
                          "value": "null",
                          "schema": [
                            {
                              "name": "id",
                              "type": "integer",
                              "value": 123456,
                              "schema": null
                            },
                            {
                              "name": "label",
                              "description": "Human-friendly disk name.",
                              "filterable": true,
                              "type": "string",
                              "value": "Ubuntu 14.04 Disk",
                              "schema": null
                            },
                            {
                              "name": "status",
                              "description": "Status of the disk.",
                              "filterable": false,
                              "type": "enum",
                              "subType": "Status",
                              "value": "ok",
                              "schema": [
                                {
                                  "name": "ok",
                                  "description": "No disk jobs are running."
                                },
                                {
                                  "name": "deleting",
                                  "description": "This disk is being deleted."
                                },
                                {
                                  "name": "creating",
                                  "description": "This disk is being created."
                                },
                                {
                                  "name": "migrating",
                                  "description": "This disk is being migrated."
                                },
                                {
                                  "name": "cancelling-migration",
                                  "description": "The disk migration is being cancelled."
                                },
                                {
                                  "name": "duplicating",
                                  "description": "This disk is being duplicated."
                                },
                                {
                                  "name": "resizing",
                                  "description": "This disk is being resized."
                                },
                                {
                                  "name": "restoring",
                                  "description": "This disk is being restored."
                                },
                                {
                                  "name": "copying",
                                  "description": "This disk is being copied."
                                },
                                {
                                  "name": "freezing",
                                  "description": "This disk is being frozen."
                                },
                                {
                                  "name": "thawing",
                                  "description": "This disk is being thawed."
                                }
                              ]
                            },
                            {
                              "name": "size",
                              "description": "Size of this disk in MB.",
                              "editable": true,
                              "filterable": true,
                              "type": "integer",
                              "value": 1000,
                              "schema": null
                            },
                            {
                              "name": "filesystem",
                              "description": "The filesystem on the disk.",
                              "type": "enum",
                              "subType": "Filesystem",
                              "value": "ext4",
                              "schema": [
                                {
                                  "name": "raw",
                                  "description": "No filesystem, just a raw binary stream."
                                },
                                {
                                  "name": "swap",
                                  "description": "Linux swap area"
                                },
                                {
                                  "name": "ext3",
                                  "description": "The ext3 journaling filesystem for Linux."
                                },
                                {
                                  "name": "ext4",
                                  "description": "The ext4 journaling filesystem for Linux."
                                },
                                {
                                  "name": "initrd",
                                  "description": "initrd (uncompressed initrd, ext2, max 32 MB)"
                                }
                              ]
                            },
                            {
                              "name": "created",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            },
                            {
                              "name": "updated",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "sdf",
                          "description": "The disk mapped to /dev/sdf.",
                          "type": "disk",
                          "value": "null",
                          "schema": [
                            {
                              "name": "id",
                              "type": "integer",
                              "value": 123456,
                              "schema": null
                            },
                            {
                              "name": "label",
                              "description": "Human-friendly disk name.",
                              "filterable": true,
                              "type": "string",
                              "value": "Ubuntu 14.04 Disk",
                              "schema": null
                            },
                            {
                              "name": "status",
                              "description": "Status of the disk.",
                              "filterable": false,
                              "type": "enum",
                              "subType": "Status",
                              "value": "ok",
                              "schema": [
                                {
                                  "name": "ok",
                                  "description": "No disk jobs are running."
                                },
                                {
                                  "name": "deleting",
                                  "description": "This disk is being deleted."
                                },
                                {
                                  "name": "creating",
                                  "description": "This disk is being created."
                                },
                                {
                                  "name": "migrating",
                                  "description": "This disk is being migrated."
                                },
                                {
                                  "name": "cancelling-migration",
                                  "description": "The disk migration is being cancelled."
                                },
                                {
                                  "name": "duplicating",
                                  "description": "This disk is being duplicated."
                                },
                                {
                                  "name": "resizing",
                                  "description": "This disk is being resized."
                                },
                                {
                                  "name": "restoring",
                                  "description": "This disk is being restored."
                                },
                                {
                                  "name": "copying",
                                  "description": "This disk is being copied."
                                },
                                {
                                  "name": "freezing",
                                  "description": "This disk is being frozen."
                                },
                                {
                                  "name": "thawing",
                                  "description": "This disk is being thawed."
                                }
                              ]
                            },
                            {
                              "name": "size",
                              "description": "Size of this disk in MB.",
                              "editable": true,
                              "filterable": true,
                              "type": "integer",
                              "value": 1000,
                              "schema": null
                            },
                            {
                              "name": "filesystem",
                              "description": "The filesystem on the disk.",
                              "type": "enum",
                              "subType": "Filesystem",
                              "value": "ext4",
                              "schema": [
                                {
                                  "name": "raw",
                                  "description": "No filesystem, just a raw binary stream."
                                },
                                {
                                  "name": "swap",
                                  "description": "Linux swap area"
                                },
                                {
                                  "name": "ext3",
                                  "description": "The ext3 journaling filesystem for Linux."
                                },
                                {
                                  "name": "ext4",
                                  "description": "The ext4 journaling filesystem for Linux."
                                },
                                {
                                  "name": "initrd",
                                  "description": "initrd (uncompressed initrd, ext2, max 32 MB)"
                                }
                              ]
                            },
                            {
                              "name": "created",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            },
                            {
                              "name": "updated",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "sdg",
                          "description": "The disk mapped to /dev/sdg.",
                          "type": "disk",
                          "value": "null",
                          "schema": [
                            {
                              "name": "id",
                              "type": "integer",
                              "value": 123456,
                              "schema": null
                            },
                            {
                              "name": "label",
                              "description": "Human-friendly disk name.",
                              "filterable": true,
                              "type": "string",
                              "value": "Ubuntu 14.04 Disk",
                              "schema": null
                            },
                            {
                              "name": "status",
                              "description": "Status of the disk.",
                              "filterable": false,
                              "type": "enum",
                              "subType": "Status",
                              "value": "ok",
                              "schema": [
                                {
                                  "name": "ok",
                                  "description": "No disk jobs are running."
                                },
                                {
                                  "name": "deleting",
                                  "description": "This disk is being deleted."
                                },
                                {
                                  "name": "creating",
                                  "description": "This disk is being created."
                                },
                                {
                                  "name": "migrating",
                                  "description": "This disk is being migrated."
                                },
                                {
                                  "name": "cancelling-migration",
                                  "description": "The disk migration is being cancelled."
                                },
                                {
                                  "name": "duplicating",
                                  "description": "This disk is being duplicated."
                                },
                                {
                                  "name": "resizing",
                                  "description": "This disk is being resized."
                                },
                                {
                                  "name": "restoring",
                                  "description": "This disk is being restored."
                                },
                                {
                                  "name": "copying",
                                  "description": "This disk is being copied."
                                },
                                {
                                  "name": "freezing",
                                  "description": "This disk is being frozen."
                                },
                                {
                                  "name": "thawing",
                                  "description": "This disk is being thawed."
                                }
                              ]
                            },
                            {
                              "name": "size",
                              "description": "Size of this disk in MB.",
                              "editable": true,
                              "filterable": true,
                              "type": "integer",
                              "value": 1000,
                              "schema": null
                            },
                            {
                              "name": "filesystem",
                              "description": "The filesystem on the disk.",
                              "type": "enum",
                              "subType": "Filesystem",
                              "value": "ext4",
                              "schema": [
                                {
                                  "name": "raw",
                                  "description": "No filesystem, just a raw binary stream."
                                },
                                {
                                  "name": "swap",
                                  "description": "Linux swap area"
                                },
                                {
                                  "name": "ext3",
                                  "description": "The ext3 journaling filesystem for Linux."
                                },
                                {
                                  "name": "ext4",
                                  "description": "The ext4 journaling filesystem for Linux."
                                },
                                {
                                  "name": "initrd",
                                  "description": "initrd (uncompressed initrd, ext2, max 32 MB)"
                                }
                              ]
                            },
                            {
                              "name": "created",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            },
                            {
                              "name": "updated",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "sdh",
                          "description": "The disk mapped to /dev/sdh.",
                          "type": "disk",
                          "value": "null",
                          "schema": [
                            {
                              "name": "id",
                              "type": "integer",
                              "value": 123456,
                              "schema": null
                            },
                            {
                              "name": "label",
                              "description": "Human-friendly disk name.",
                              "filterable": true,
                              "type": "string",
                              "value": "Ubuntu 14.04 Disk",
                              "schema": null
                            },
                            {
                              "name": "status",
                              "description": "Status of the disk.",
                              "filterable": false,
                              "type": "enum",
                              "subType": "Status",
                              "value": "ok",
                              "schema": [
                                {
                                  "name": "ok",
                                  "description": "No disk jobs are running."
                                },
                                {
                                  "name": "deleting",
                                  "description": "This disk is being deleted."
                                },
                                {
                                  "name": "creating",
                                  "description": "This disk is being created."
                                },
                                {
                                  "name": "migrating",
                                  "description": "This disk is being migrated."
                                },
                                {
                                  "name": "cancelling-migration",
                                  "description": "The disk migration is being cancelled."
                                },
                                {
                                  "name": "duplicating",
                                  "description": "This disk is being duplicated."
                                },
                                {
                                  "name": "resizing",
                                  "description": "This disk is being resized."
                                },
                                {
                                  "name": "restoring",
                                  "description": "This disk is being restored."
                                },
                                {
                                  "name": "copying",
                                  "description": "This disk is being copied."
                                },
                                {
                                  "name": "freezing",
                                  "description": "This disk is being frozen."
                                },
                                {
                                  "name": "thawing",
                                  "description": "This disk is being thawed."
                                }
                              ]
                            },
                            {
                              "name": "size",
                              "description": "Size of this disk in MB.",
                              "editable": true,
                              "filterable": true,
                              "type": "integer",
                              "value": 1000,
                              "schema": null
                            },
                            {
                              "name": "filesystem",
                              "description": "The filesystem on the disk.",
                              "type": "enum",
                              "subType": "Filesystem",
                              "value": "ext4",
                              "schema": [
                                {
                                  "name": "raw",
                                  "description": "No filesystem, just a raw binary stream."
                                },
                                {
                                  "name": "swap",
                                  "description": "Linux swap area"
                                },
                                {
                                  "name": "ext3",
                                  "description": "The ext3 journaling filesystem for Linux."
                                },
                                {
                                  "name": "ext4",
                                  "description": "The ext4 journaling filesystem for Linux."
                                },
                                {
                                  "name": "initrd",
                                  "description": "initrd (uncompressed initrd, ext2, max 32 MB)"
                                }
                              ]
                            },
                            {
                              "name": "created",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            },
                            {
                              "name": "updated",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "schema": null
                            }
                          ]
                        }
                      ]
                    },
                    {
                      "name": "helpers",
                      "description": "Helpers enabled when booting to this Linode config.",
                      "schema": [
                        {
                          "name": "disable_updatedb",
                          "description": "Disables updatedb cron job to avoid disk thrashing.",
                          "editable": true,
                          "type": "boolean",
                          "value": true,
                          "schema": null
                        },
                        {
                          "name": "enable_distro_helper",
                          "description": "Helps maintain correct inittab/upstart console device.",
                          "editable": true,
                          "type": "boolean",
                          "value": true,
                          "schema": null
                        },
                        {
                          "name": "enable_modules_dep_helper",
                          "description": "Creates a modules dependency file for the kernel you run.",
                          "editable": true,
                          "type": "boolean",
                          "value": true,
                          "schema": null
                        },
                        {
                          "name": "enable_network_helper",
                          "description": "Automatically configure static networking <a href=\"https://www.linode.com/docs/platform/network-helper\">\n  (more info)\n</a>.\n",
                          "editable": true,
                          "type": "boolean",
                          "value": true,
                          "schema": null
                        }
                      ]
                    },
                    {
                      "name": "initrd",
                      "description": "An initrd <a href=\"#object-disk\">disk</a> attached to this Linode config.",
                      "editable": true,
                      "type": "integer",
                      "value": "null",
                      "schema": null
                    },
                    {
                      "name": "kernel",
                      "editable": true,
                      "type": "kernel",
                      "schema": [
                        {
                          "name": "id",
                          "type": "string",
                          "value": "linode/3.5.2-x86_64-linode26",
                          "schema": null
                        },
                        {
                          "name": "description",
                          "description": "Additional, descriptive text about the kernel.",
                          "type": "string",
                          "value": "null",
                          "schema": null
                        },
                        {
                          "name": "xen",
                          "description": "If this kernel is suitable for Xen Linodes.",
                          "filterable": true,
                          "type": "boolean",
                          "value": false,
                          "schema": null
                        },
                        {
                          "name": "kvm",
                          "description": "If this kernel is suitable for KVM Linodes.",
                          "filterable": true,
                          "type": "boolean",
                          "value": true,
                          "schema": null
                        },
                        {
                          "name": "label",
                          "description": "The friendly name of this kernel.",
                          "filterable": true,
                          "type": "string",
                          "value": "3.5.2-x86_64-linode26",
                          "schema": null
                        },
                        {
                          "name": "version",
                          "description": "Linux Kernel version.",
                          "filterable": true,
                          "type": "string",
                          "value": "3.5.2",
                          "schema": null
                        },
                        {
                          "name": "x64",
                          "description": "True if this is a 64-bit kernel, false for 32-bit.",
                          "filterable": true,
                          "type": "boolean",
                          "value": true,
                          "schema": null
                        },
                        {
                          "name": "current",
                          "filterable": true,
                          "type": "boolean",
                          "value": true,
                          "schema": null
                        },
                        {
                          "name": "deprecated",
                          "filterable": true,
                          "type": "boolean",
                          "value": false,
                          "schema": null
                        },
                        {
                          "name": "latest",
                          "type": "boolean",
                          "value": true,
                          "schema": null
                        }
                      ]
                    },
                    {
                      "name": "label",
                      "description": "Human-friendly label for this config.",
                      "editable": true,
                      "filterable": true,
                      "type": "string",
                      "value": "My openSUSE 13.2 Profile",
                      "schema": null
                    },
                    {
                      "name": "ram_limit",
                      "description": "Optional RAM limit in MB for uncommon operating systems.",
                      "editable": true,
                      "type": "integer",
                      "value": 512,
                      "schema": null
                    },
                    {
                      "name": "root_device",
                      "description": "Root device to boot. Corresponding disk must be attached.",
                      "editable": true,
                      "type": "string",
                      "value": "/dev/sda",
                      "schema": null
                    },
                    {
                      "name": "root_device_ro",
                      "description": "Controls whether to mount the root disk read-only.",
                      "editable": true,
                      "type": "boolean",
                      "value": false,
                      "schema": null
                    },
                    {
                      "name": "run_level",
                      "description": "Sets the <a href=\"#object-run_level-enum\">run level</a> for Linode boot.",
                      "editable": true,
                      "type": "enum",
                      "subType": "run_level",
                      "value": "default",
                      "schema": [
                        {
                          "name": "default",
                          "description": "Normal multi-user boot mode"
                        },
                        {
                          "name": "single",
                          "description": "Single user boot mode"
                        },
                        {
                          "name": "binbash",
                          "description": "Boots to a root bash shell"
                        }
                      ]
                    },
                    {
                      "name": "updated",
                      "type": "datetime",
                      "value": "2015-09-29T11:21:38.000Z",
                      "schema": null
                    },
                    {
                      "name": "virt_mode",
                      "description": "Controls the <a href=\"#object-virt_mode-enum\">virtualization mode</a>.",
                      "editable": true,
                      "type": "enum",
                      "subType": "virt_mode",
                      "value": "paravirt",
                      "schema": [
                        {
                          "name": "fullvirt",
                          "description": "Complete system virtualization"
                        },
                        {
                          "name": "paravirt",
                          "description": "Some hardware is unvirtualized; often faster than fullvirt"
                        }
                      ]
                    }
                  ],
                  "enums": {
                    "run_level": {
                      "default": "Normal multi-user boot mode",
                      "single": "Single user boot mode",
                      "binbash": "Boots to a root bash shell"
                    },
                    "virt_mode": {
                      "fullvirt": "Complete system virtualization",
                      "paravirt": "Some hardware is unvirtualized; often faster than fullvirt"
                    }
                  },
                  "example": {
                    "id": 804,
                    "comments": "Example Linode configuration",
                    "created": "2015-09-29T11:21:38.000Z",
                    "devtmpfs_automount": false,
                    "disks": {
                      "sda": {
                        "id": 123456,
                        "label": "Ubuntu 14.04 Disk",
                        "status": "ok",
                        "size": 1000,
                        "filesystem": "ext4",
                        "created": "2015-09-29T11:21:01",
                        "updated": "2015-09-29T11:21:01"
                      },
                      "sdb": "null",
                      "sdc": "null",
                      "sdd": "null",
                      "sde": "null",
                      "sdf": "null",
                      "sdg": "null",
                      "sdh": "null"
                    },
                    "helpers": {
                      "disable_updatedb": true,
                      "enable_distro_helper": true,
                      "enable_modules_dep_helper": true,
                      "enable_network_helper": true
                    },
                    "initrd": "null",
                    "kernel": {
                      "id": "linode/3.5.2-x86_64-linode26",
                      "description": "null",
                      "xen": false,
                      "kvm": true,
                      "label": "3.5.2-x86_64-linode26",
                      "version": "3.5.2",
                      "x64": true,
                      "current": true,
                      "deprecated": false,
                      "latest": true
                    },
                    "label": "My openSUSE 13.2 Profile",
                    "ram_limit": 512,
                    "root_device": "/dev/sda",
                    "root_device_ro": false,
                    "run_level": "default",
                    "updated": "2015-09-29T11:21:38.000Z",
                    "virt_mode": "paravirt"
                  }
                }
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
                    "value": "config.label = 'Edited config' config.kernel = linode.Kernel(client, 'linode/latest_64') config.save()"
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
                    "value": "config.delete()\n"
                  }
                ],
                "name": "DELETE"
              }
            ],
            "path": "linode/instances/:id/configs/:id",
            "routePath": "/reference/endpoints/linode/instances/:id/configs/:id",
            "endpoints": []
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
                    "type": "integer",
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
                    "value": "my_linode.boot()\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "linode/instances/:id/boot",
            "routePath": "/reference/endpoints/linode/instances/:id/boot",
            "endpoints": []
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
                    "value": "my_linode.shutdown()\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "linode/instances/:id/shutdown",
            "routePath": "/reference/endpoints/linode/instances/:id/shutdown",
            "endpoints": []
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
                    "type": "integer",
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
                    "value": "my_linode.reboot()\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "linode/instances/:id/reboot",
            "routePath": "/reference/endpoints/linode/instances/:id/reboot",
            "endpoints": []
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
                    "value": "my_linode.kvmify()\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "linode/instances/:id/kvmify",
            "routePath": "/reference/endpoints/linode/instances/:id/kvmify",
            "endpoints": []
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
                    "type": "integer",
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
                    "value": "my_linode.rescue()\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "linode/instances/:id/rescue",
            "routePath": "/reference/endpoints/linode/instances/:id/rescue",
            "endpoints": []
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
            "path": "linode/instances/:id/resize",
            "routePath": "/reference/endpoints/linode/instances/:id/resize",
            "endpoints": []
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
                    "value": "backups = my_linode.available_backups\n"
                  }
                ],
                "name": "GET"
              },
              {
                "oauth": "linodes:modify",
                "dangerous": true,
                "description": "Creates a snapshot backup of a Linode. WARNING: If you already have a snapshot, this is a destructive operation. The previous snapshot will be deleted.\n",
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
                    "value": "my_linode.snapshot()\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "linode/instances/:id/backups",
            "routePath": "/reference/endpoints/linode/instances/:id/backups",
            "endpoints": []
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
                    "value": "my_linode.enable_backups()\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "linode/instances/:id/backups/enable",
            "routePath": "/reference/endpoints/linode/instances/:id/backups/enable",
            "endpoints": []
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
                    "value": "my_linode.cancel_backups()\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "linode/instances/:id/backups/cancel",
            "routePath": "/reference/endpoints/linode/instances/:id/backups/cancel",
            "endpoints": []
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
                    "type": "integer",
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
                    "value": "backup = my_linode.available_backups.daily\nbackup.restore()\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "linode/instances/:id/backups/:id/restore",
            "routePath": "/reference/endpoints/linode/instances/:id/backups/:id/restore",
            "endpoints": []
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
            "path": "linode/instances/:id/ips",
            "routePath": "/reference/endpoints/linode/instances/:id/ips",
            "endpoints": []
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
            "path": "linode/instances/:id/ips/sharing",
            "routePath": "/reference/endpoints/linode/instances/:id/ips/sharing",
            "endpoints": []
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
                      "value": "97.107.143.8",
                      "schema": null
                    },
                    {
                      "name": "gateway",
                      "description": "The default gateway. Gateways for private IP's are always null.",
                      "type": "string",
                      "value": "97.107.143.1",
                      "schema": null
                    },
                    {
                      "name": "subnet_mask",
                      "description": "The subnet mask.",
                      "type": "string",
                      "value": "255.255.255.0",
                      "schema": null
                    },
                    {
                      "name": "prefix",
                      "description": "The network prefix.",
                      "type": "string",
                      "value": 24,
                      "schema": null
                    },
                    {
                      "name": "type",
                      "description": "The type of IP Address, either public or private",
                      "type": "enum",
                      "subType": "IPAddressType",
                      "value": "public",
                      "schema": [
                        {
                          "name": "public",
                          "description": "Public IP Address"
                        },
                        {
                          "name": "private",
                          "description": "Internal IP Addresses (192.168 range)"
                        }
                      ]
                    },
                    {
                      "name": "rdns",
                      "description": "Reverse DNS address for this IP Address. Null to reset.",
                      "editable": true,
                      "type": "string",
                      "value": null,
                      "schema": null
                    },
                    {
                      "name": "linode_id",
                      "type": "integer",
                      "value": 42,
                      "schema": null
                    }
                  ],
                  "enums": {
                    "IPAddressType": {
                      "public": "Public IP Address",
                      "private": "Internal IP Addresses (192.168 range)"
                    }
                  },
                  "example": {
                    "address": "97.107.143.8",
                    "gateway": "97.107.143.1",
                    "subnet_mask": "255.255.255.0",
                    "prefix": 24,
                    "type": "public",
                    "rdns": null,
                    "linode_id": 42
                  }
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
            "path": "linode/instances/:id/ips/:ip_address",
            "routePath": "/reference/endpoints/linode/instances/:id/ips/:ip_address",
            "endpoints": []
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
                    "description": {
                      "descText": "The stackscript ID to deploy with this disk. \n",
                      "listItems": [
                        "Must provide a distribution. Distribution must be one that the stackscript can be deployed to."
                      ]
                    },
                    "type": "integer",
                    "name": "stackscript"
                  },
                  {
                    "optional": true,
                    "description": {
                      "descText": "UDF (user-defined fields) for this stackscript. Defaults to \"{}\". \n",
                      "listItems": [
                        "Must match UDFs required by stackscript."
                      ]
                    },
                    "type": "string",
                    "name": "stackscript_udf_responses"
                  }
                ],
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST \\\n    https://$api_root/$version/linode/instances/$linode_id/rebuild \\\n    -d '{\"distribution\":\"linode/debian8\",\"root_pass\":\"hunter7\"}'\n"
                  },
                  {
                    "name": "python",
                    "value": "my_linode.rebuild('linode/ubuntu16.04LTS', root_pass='hunter7')\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "linode/instances/:id/rebuild",
            "routePath": "/reference/endpoints/linode/instances/:id/rebuild",
            "endpoints": []
          }
        ]
      },
      {
        "name": "StackScripts",
        "sort": 4,
        "base_path": "/linode/stackscripts",
        "description": "StackScript endpoints provide a means of managing the StackScript objects accessible from your account.\n",
        "path": "/linode",
        "methods": null,
        "endpoints": [
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
                      "value": 37,
                      "schema": null
                    },
                    {
                      "name": "customer_id",
                      "description": "The customer that created this StackScript.",
                      "type": "integer",
                      "value": 123,
                      "schema": null
                    },
                    {
                      "name": "user_id",
                      "description": "The user account that created this StackScript.",
                      "type": "integer",
                      "value": 456,
                      "schema": null
                    },
                    {
                      "name": "label",
                      "description": "This StackScript's display label.",
                      "editable": true,
                      "filterable": true,
                      "type": "string",
                      "value": "Example StackScript",
                      "schema": null
                    },
                    {
                      "name": "description",
                      "description": "In-depth information on what this StackScript does.",
                      "editable": true,
                      "filterable": true,
                      "type": "string",
                      "value": "Installs the Linode API bindings",
                      "schema": null
                    },
                    {
                      "name": "distributions",
                      "description": "A list of distributions this StackScript is compatible with.",
                      "editable": true,
                      "filterable": true,
                      "type": "array",
                      "subType": "distribution",
                      "value": [
                        [
                          {
                            "name": "id",
                            "type": "string",
                            "value": "linode/debian8",
                            "schema": null
                          },
                          {
                            "name": "label",
                            "type": "string",
                            "value": "Debian 8.1",
                            "schema": null
                          },
                          {
                            "name": "vendor",
                            "type": "string",
                            "value": "Debian",
                            "schema": null
                          },
                          {
                            "name": "x64",
                            "type": "boolean",
                            "value": true,
                            "schema": null
                          },
                          {
                            "name": "recommended",
                            "type": "boolean",
                            "value": true,
                            "schema": null
                          },
                          {
                            "name": "created",
                            "type": "datetime",
                            "value": "2015-04-27T16:26:41.000Z",
                            "schema": null
                          },
                          {
                            "name": "minimum_storage_size",
                            "type": "integer",
                            "value": 900,
                            "schema": null
                          }
                        ],
                        [
                          {
                            "name": "id",
                            "type": "string",
                            "value": "linode/debian7",
                            "schema": null
                          },
                          {
                            "name": "label",
                            "type": "string",
                            "value": "Debian 7",
                            "schema": null
                          },
                          {
                            "name": "vendor",
                            "type": "string",
                            "value": "Debian",
                            "schema": null
                          },
                          {
                            "name": "x64",
                            "type": "boolean",
                            "value": true,
                            "schema": null
                          },
                          {
                            "name": "recommended",
                            "type": "boolean",
                            "value": true,
                            "schema": null
                          },
                          {
                            "name": "created",
                            "type": "datetime",
                            "value": "2014-09-24T13:59:32.000Z",
                            "schema": null
                          },
                          {
                            "name": "minimum_storage_size",
                            "type": "integer",
                            "value": 600,
                            "schema": null
                          }
                        ]
                      ],
                      "schema": [
                        {
                          "name": "id",
                          "type": "string",
                          "value": "linode/debian8",
                          "schema": null
                        },
                        {
                          "name": "label",
                          "type": "string",
                          "value": "Debian 8.1",
                          "schema": null
                        },
                        {
                          "name": "vendor",
                          "type": "string",
                          "value": "Debian",
                          "schema": null
                        },
                        {
                          "name": "x64",
                          "type": "boolean",
                          "value": true,
                          "schema": null
                        },
                        {
                          "name": "recommended",
                          "type": "boolean",
                          "value": true,
                          "schema": null
                        },
                        {
                          "name": "created",
                          "type": "datetime",
                          "value": "2015-04-27T16:26:41.000Z",
                          "schema": null
                        },
                        {
                          "name": "minimum_storage_size",
                          "type": "integer",
                          "value": 900,
                          "schema": null
                        }
                      ]
                    },
                    {
                      "name": "deployments_total",
                      "description": "The total number of times this StackScript has been deployed.",
                      "type": "integer",
                      "value": 150,
                      "schema": null
                    },
                    {
                      "name": "deployments_active",
                      "description": "The total number of active deployments.",
                      "type": "integer",
                      "value": 42,
                      "schema": null
                    },
                    {
                      "name": "is_public",
                      "description": "Publicize StackScript in the Linode StackScript library. Note that StackScripts cannot be changed to private after they have been public.\n",
                      "editable": true,
                      "filterable": true,
                      "type": "boolean",
                      "value": true,
                      "schema": null
                    },
                    {
                      "name": "created",
                      "description": "When the StackScript was initially created.",
                      "type": "datetime",
                      "value": "2015-09-29T11:21:01",
                      "schema": null
                    },
                    {
                      "name": "updated",
                      "description": "When the StackScript was last updated.",
                      "type": "datetime",
                      "value": "2015-10-15T10:02:01",
                      "schema": null
                    },
                    {
                      "name": "rev_note",
                      "description": "The most recent note about what was changed for this revision.",
                      "editable": true,
                      "type": "string",
                      "value": "Initial import",
                      "schema": null
                    },
                    {
                      "name": "script",
                      "description": "The actual script body to be executed.",
                      "editable": true,
                      "type": "string",
                      "value": "#!/bin/bash",
                      "schema": null
                    },
                    {
                      "name": "user_defined_fields",
                      "description": "Variables that can be set to customize the script per deployment.",
                      "type": "array",
                      "value": [
                        [
                          {
                            "name": "name",
                            "type": "string",
                            "value": "var1",
                            "schema": null
                          },
                          {
                            "name": "label",
                            "type": "string",
                            "value": "A question",
                            "schema": null
                          },
                          {
                            "name": "example",
                            "type": "string",
                            "value": "An example value",
                            "schema": null
                          },
                          {
                            "name": "default",
                            "type": "string",
                            "value": "Default value",
                            "schema": null
                          }
                        ],
                        [
                          {
                            "name": "name",
                            "type": "string",
                            "value": "var2",
                            "schema": null
                          },
                          {
                            "name": "label",
                            "type": "string",
                            "value": "Another question",
                            "schema": null
                          },
                          {
                            "name": "example",
                            "type": "string",
                            "value": "possible",
                            "schema": null
                          },
                          {
                            "name": "oneof",
                            "type": "string",
                            "value": "possible,enum,values",
                            "schema": null
                          }
                        ]
                      ],
                      "schema": [
                        {
                          "name": "name",
                          "type": "string",
                          "value": "var1",
                          "schema": null
                        },
                        {
                          "name": "label",
                          "type": "string",
                          "value": "A question",
                          "schema": null
                        },
                        {
                          "name": "example",
                          "type": "string",
                          "value": "An example value",
                          "schema": null
                        },
                        {
                          "name": "default",
                          "type": "string",
                          "value": "Default value",
                          "schema": null
                        }
                      ]
                    }
                  ],
                  "example": {
                    "id": 37,
                    "customer_id": 123,
                    "user_id": 456,
                    "label": "Example StackScript",
                    "description": "Installs the Linode API bindings",
                    "distributions": [
                      {
                        "id": "linode/debian8",
                        "label": "Debian 8.1",
                        "vendor": "Debian",
                        "x64": true,
                        "recommended": true,
                        "created": "2015-04-27T16:26:41.000Z",
                        "minimum_storage_size": 900
                      },
                      {
                        "id": "linode/debian7",
                        "label": "Debian 7",
                        "vendor": "Debian",
                        "x64": true,
                        "recommended": true,
                        "created": "2014-09-24T13:59:32.000Z",
                        "minimum_storage_size": 600
                      }
                    ],
                    "deployments_total": 150,
                    "deployments_active": 42,
                    "is_public": true,
                    "created": "2015-09-29T11:21:01",
                    "updated": "2015-10-15T10:02:01",
                    "rev_note": "Initial import",
                    "script": "#!/bin/bash",
                    "user_defined_fields": [
                      {
                        "name": "var1",
                        "label": "A question",
                        "example": "An example value",
                        "default": "Default value"
                      },
                      {
                        "name": "var2",
                        "label": "Another question",
                        "example": "possible",
                        "oneof": "possible,enum,values"
                      }
                    ]
                  }
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
                    "type": "integer",
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
            "path": "linode/stackscripts",
            "routePath": "/reference/endpoints/linode/stackscripts",
            "endpoints": []
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
                      "name": "id",
                      "description": "A unique ID for the StackScript.",
                      "type": "integer",
                      "value": 37,
                      "schema": null
                    },
                    {
                      "name": "customer_id",
                      "description": "The customer that created this StackScript.",
                      "type": "integer",
                      "value": 123,
                      "schema": null
                    },
                    {
                      "name": "user_id",
                      "description": "The user account that created this StackScript.",
                      "type": "integer",
                      "value": 456,
                      "schema": null
                    },
                    {
                      "name": "label",
                      "description": "This StackScript's display label.",
                      "editable": true,
                      "filterable": true,
                      "type": "string",
                      "value": "Example StackScript",
                      "schema": null
                    },
                    {
                      "name": "description",
                      "description": "In-depth information on what this StackScript does.",
                      "editable": true,
                      "filterable": true,
                      "type": "string",
                      "value": "Installs the Linode API bindings",
                      "schema": null
                    },
                    {
                      "name": "distributions",
                      "description": "A list of distributions this StackScript is compatible with.",
                      "editable": true,
                      "filterable": true,
                      "type": "array",
                      "subType": "distribution",
                      "value": [
                        [
                          {
                            "name": "id",
                            "type": "string",
                            "value": "linode/debian8",
                            "schema": null
                          },
                          {
                            "name": "label",
                            "type": "string",
                            "value": "Debian 8.1",
                            "schema": null
                          },
                          {
                            "name": "vendor",
                            "type": "string",
                            "value": "Debian",
                            "schema": null
                          },
                          {
                            "name": "x64",
                            "type": "boolean",
                            "value": true,
                            "schema": null
                          },
                          {
                            "name": "recommended",
                            "type": "boolean",
                            "value": true,
                            "schema": null
                          },
                          {
                            "name": "created",
                            "type": "datetime",
                            "value": "2015-04-27T16:26:41.000Z",
                            "schema": null
                          },
                          {
                            "name": "minimum_storage_size",
                            "type": "integer",
                            "value": 900,
                            "schema": null
                          }
                        ],
                        [
                          {
                            "name": "id",
                            "type": "string",
                            "value": "linode/debian7",
                            "schema": null
                          },
                          {
                            "name": "label",
                            "type": "string",
                            "value": "Debian 7",
                            "schema": null
                          },
                          {
                            "name": "vendor",
                            "type": "string",
                            "value": "Debian",
                            "schema": null
                          },
                          {
                            "name": "x64",
                            "type": "boolean",
                            "value": true,
                            "schema": null
                          },
                          {
                            "name": "recommended",
                            "type": "boolean",
                            "value": true,
                            "schema": null
                          },
                          {
                            "name": "created",
                            "type": "datetime",
                            "value": "2014-09-24T13:59:32.000Z",
                            "schema": null
                          },
                          {
                            "name": "minimum_storage_size",
                            "type": "integer",
                            "value": 600,
                            "schema": null
                          }
                        ]
                      ],
                      "schema": [
                        {
                          "name": "id",
                          "type": "string",
                          "value": "linode/debian8",
                          "schema": null
                        },
                        {
                          "name": "label",
                          "type": "string",
                          "value": "Debian 8.1",
                          "schema": null
                        },
                        {
                          "name": "vendor",
                          "type": "string",
                          "value": "Debian",
                          "schema": null
                        },
                        {
                          "name": "x64",
                          "type": "boolean",
                          "value": true,
                          "schema": null
                        },
                        {
                          "name": "recommended",
                          "type": "boolean",
                          "value": true,
                          "schema": null
                        },
                        {
                          "name": "created",
                          "type": "datetime",
                          "value": "2015-04-27T16:26:41.000Z",
                          "schema": null
                        },
                        {
                          "name": "minimum_storage_size",
                          "type": "integer",
                          "value": 900,
                          "schema": null
                        }
                      ]
                    },
                    {
                      "name": "deployments_total",
                      "description": "The total number of times this StackScript has been deployed.",
                      "type": "integer",
                      "value": 150,
                      "schema": null
                    },
                    {
                      "name": "deployments_active",
                      "description": "The total number of active deployments.",
                      "type": "integer",
                      "value": 42,
                      "schema": null
                    },
                    {
                      "name": "is_public",
                      "description": "Publicize StackScript in the Linode StackScript library. Note that StackScripts cannot be changed to private after they have been public.\n",
                      "editable": true,
                      "filterable": true,
                      "type": "boolean",
                      "value": true,
                      "schema": null
                    },
                    {
                      "name": "created",
                      "description": "When the StackScript was initially created.",
                      "type": "datetime",
                      "value": "2015-09-29T11:21:01",
                      "schema": null
                    },
                    {
                      "name": "updated",
                      "description": "When the StackScript was last updated.",
                      "type": "datetime",
                      "value": "2015-10-15T10:02:01",
                      "schema": null
                    },
                    {
                      "name": "rev_note",
                      "description": "The most recent note about what was changed for this revision.",
                      "editable": true,
                      "type": "string",
                      "value": "Initial import",
                      "schema": null
                    },
                    {
                      "name": "script",
                      "description": "The actual script body to be executed.",
                      "editable": true,
                      "type": "string",
                      "value": "#!/bin/bash",
                      "schema": null
                    },
                    {
                      "name": "user_defined_fields",
                      "description": "Variables that can be set to customize the script per deployment.",
                      "type": "array",
                      "value": [
                        [
                          {
                            "name": "name",
                            "type": "string",
                            "value": "var1",
                            "schema": null
                          },
                          {
                            "name": "label",
                            "type": "string",
                            "value": "A question",
                            "schema": null
                          },
                          {
                            "name": "example",
                            "type": "string",
                            "value": "An example value",
                            "schema": null
                          },
                          {
                            "name": "default",
                            "type": "string",
                            "value": "Default value",
                            "schema": null
                          }
                        ],
                        [
                          {
                            "name": "name",
                            "type": "string",
                            "value": "var2",
                            "schema": null
                          },
                          {
                            "name": "label",
                            "type": "string",
                            "value": "Another question",
                            "schema": null
                          },
                          {
                            "name": "example",
                            "type": "string",
                            "value": "possible",
                            "schema": null
                          },
                          {
                            "name": "oneof",
                            "type": "string",
                            "value": "possible,enum,values",
                            "schema": null
                          }
                        ]
                      ],
                      "schema": [
                        {
                          "name": "name",
                          "type": "string",
                          "value": "var1",
                          "schema": null
                        },
                        {
                          "name": "label",
                          "type": "string",
                          "value": "A question",
                          "schema": null
                        },
                        {
                          "name": "example",
                          "type": "string",
                          "value": "An example value",
                          "schema": null
                        },
                        {
                          "name": "default",
                          "type": "string",
                          "value": "Default value",
                          "schema": null
                        }
                      ]
                    }
                  ],
                  "example": {
                    "id": 37,
                    "customer_id": 123,
                    "user_id": 456,
                    "label": "Example StackScript",
                    "description": "Installs the Linode API bindings",
                    "distributions": [
                      {
                        "id": "linode/debian8",
                        "label": "Debian 8.1",
                        "vendor": "Debian",
                        "x64": true,
                        "recommended": true,
                        "created": "2015-04-27T16:26:41.000Z",
                        "minimum_storage_size": 900
                      },
                      {
                        "id": "linode/debian7",
                        "label": "Debian 7",
                        "vendor": "Debian",
                        "x64": true,
                        "recommended": true,
                        "created": "2014-09-24T13:59:32.000Z",
                        "minimum_storage_size": 600
                      }
                    ],
                    "deployments_total": 150,
                    "deployments_active": 42,
                    "is_public": true,
                    "created": "2015-09-29T11:21:01",
                    "updated": "2015-10-15T10:02:01",
                    "rev_note": "Initial import",
                    "script": "#!/bin/bash",
                    "user_defined_fields": [
                      {
                        "name": "var1",
                        "label": "A question",
                        "example": "An example value",
                        "default": "Default value"
                      },
                      {
                        "name": "var2",
                        "label": "Another question",
                        "example": "possible",
                        "oneof": "possible,enum,values"
                      }
                    ]
                  }
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
            "path": "linode/stackscripts/:id",
            "routePath": "/reference/endpoints/linode/stackscripts/:id",
            "endpoints": []
          }
        ]
      },
      {
        "name": "Types",
        "sort": 1,
        "base_path": "/linode/types",
        "description": "Type endpoints provide a means of viewing type objects.\n",
        "path": "/linode",
        "methods": null,
        "endpoints": [
          {
            "type": "list",
            "resource": "types",
            "description": "Returns collection of types.\n",
            "methods": [
              {
                "description": "Returns list of types.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl https://$api_root/$version/linode/types\n"
                  },
                  {
                    "name": "python",
                    "value": "client.linode.get_types()\n"
                  }
                ],
                "name": "GET",
                "resource": {
                  "name": "Type",
                  "description": "Type objects describe a service available for purchase from Linode. Provisioning new infrastructure generally involves including a service ID with the request.\n",
                  "schema": [
                    {
                      "name": "id",
                      "type": "string",
                      "value": "linode2048.5",
                      "schema": null
                    },
                    {
                      "name": "storage",
                      "description": "If applicable, disk space in MB.",
                      "filterable": true,
                      "type": "integer",
                      "value": 24576,
                      "schema": null
                    },
                    {
                      "name": "backups_price",
                      "description": "Cost (in US dollars) per month if backups are enabled.",
                      "filterable": false,
                      "type": "integer",
                      "value": 250,
                      "schema": null
                    },
                    {
                      "name": "class",
                      "type": "enum",
                      "subType": "Class",
                      "schema": [
                        {
                          "name": "standard",
                          "description": "Standard class"
                        },
                        {
                          "name": "highmem",
                          "description": "High memory class"
                        }
                      ]
                    },
                    {
                      "name": "hourly_price",
                      "description": "Cost (in cents) per hour.",
                      "filterable": true,
                      "type": "integer",
                      "value": 1,
                      "schema": null
                    },
                    {
                      "name": "label",
                      "description": "Human-friendly name of this type.",
                      "filterable": true,
                      "type": "string",
                      "value": "Linode 2048",
                      "schema": null
                    },
                    {
                      "name": "mbits_out",
                      "description": "If applicable, Mbits outbound bandwidth.",
                      "filterable": true,
                      "type": "integer",
                      "value": 125,
                      "schema": null
                    },
                    {
                      "name": "monthly_price",
                      "description": "Cost (in US dollars) per month.",
                      "filterable": true,
                      "type": "integer",
                      "value": 1000,
                      "schema": null
                    },
                    {
                      "name": "ram",
                      "description": "Amount of RAM included in this type.",
                      "filterable": true,
                      "type": "integer",
                      "value": 2048,
                      "schema": null
                    },
                    {
                      "name": "transfer",
                      "description": "If applicable, outbound transfer in MB.",
                      "filterable": true,
                      "type": "integer",
                      "value": 2000,
                      "schema": null
                    },
                    {
                      "name": "vcpus",
                      "description": "If applicable, number of CPU cores.",
                      "filterable": true,
                      "type": "integer",
                      "value": 2,
                      "schema": null
                    }
                  ],
                  "enums": {
                    "Class": {
                      "standard": "Standard class",
                      "highmem": "High memory class"
                    }
                  },
                  "example": {
                    "id": "linode2048.5",
                    "storage": 24576,
                    "backups_price": 250,
                    "class": {},
                    "hourly_price": 1,
                    "label": "Linode 2048",
                    "mbits_out": 125,
                    "monthly_price": 1000,
                    "ram": 2048,
                    "transfer": 2000,
                    "vcpus": 2
                  }
                }
              }
            ],
            "path": "linode/types",
            "routePath": "/reference/endpoints/linode/types",
            "endpoints": []
          },
          {
            "type": "resource",
            "resource": "types",
            "description": "Returns information about a specific Linode type offered by Linode.\n",
            "methods": [
              {
                "description": "Returns information about this type.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl https://$api_root/$version/linode/types/$type_id\n"
                  },
                  {
                    "name": "python",
                    "value": "type = linode.Type(client, 'g5-standard=1')\n"
                  }
                ],
                "name": "GET",
                "resource": {
                  "name": "Type",
                  "description": "Type objects describe a service available for purchase from Linode. Provisioning new infrastructure generally involves including a service ID with the request.\n",
                  "schema": [
                    {
                      "name": "id",
                      "type": "string",
                      "value": "linode2048.5",
                      "schema": null
                    },
                    {
                      "name": "storage",
                      "description": "If applicable, disk space in MB.",
                      "filterable": true,
                      "type": "integer",
                      "value": 24576,
                      "schema": null
                    },
                    {
                      "name": "backups_price",
                      "description": "Cost (in US dollars) per month if backups are enabled.",
                      "filterable": false,
                      "type": "integer",
                      "value": 250,
                      "schema": null
                    },
                    {
                      "name": "class",
                      "type": "enum",
                      "subType": "Class",
                      "schema": [
                        {
                          "name": "standard",
                          "description": "Standard class"
                        },
                        {
                          "name": "highmem",
                          "description": "High memory class"
                        }
                      ]
                    },
                    {
                      "name": "hourly_price",
                      "description": "Cost (in cents) per hour.",
                      "filterable": true,
                      "type": "integer",
                      "value": 1,
                      "schema": null
                    },
                    {
                      "name": "label",
                      "description": "Human-friendly name of this type.",
                      "filterable": true,
                      "type": "string",
                      "value": "Linode 2048",
                      "schema": null
                    },
                    {
                      "name": "mbits_out",
                      "description": "If applicable, Mbits outbound bandwidth.",
                      "filterable": true,
                      "type": "integer",
                      "value": 125,
                      "schema": null
                    },
                    {
                      "name": "monthly_price",
                      "description": "Cost (in US dollars) per month.",
                      "filterable": true,
                      "type": "integer",
                      "value": 1000,
                      "schema": null
                    },
                    {
                      "name": "ram",
                      "description": "Amount of RAM included in this type.",
                      "filterable": true,
                      "type": "integer",
                      "value": 2048,
                      "schema": null
                    },
                    {
                      "name": "transfer",
                      "description": "If applicable, outbound transfer in MB.",
                      "filterable": true,
                      "type": "integer",
                      "value": 2000,
                      "schema": null
                    },
                    {
                      "name": "vcpus",
                      "description": "If applicable, number of CPU cores.",
                      "filterable": true,
                      "type": "integer",
                      "value": 2,
                      "schema": null
                    }
                  ],
                  "enums": {
                    "Class": {
                      "standard": "Standard class",
                      "highmem": "High memory class"
                    }
                  },
                  "example": {
                    "id": "linode2048.5",
                    "storage": 24576,
                    "backups_price": 250,
                    "class": {},
                    "hourly_price": 1,
                    "label": "Linode 2048",
                    "mbits_out": 125,
                    "monthly_price": 1000,
                    "ram": 2048,
                    "transfer": 2000,
                    "vcpus": 2
                  }
                }
              }
            ],
            "path": "linode/types/:id",
            "routePath": "/reference/endpoints/linode/types/:id",
            "endpoints": []
          }
        ]
      }
    ]
  },
  {
    "name": "Domains",
    "path": "/domains",
    "routePath": "/reference/domains",
    "endpoints": [
      {
        "name": "Domains",
        "base_path": "/domains",
        "description": "Domain endpoints provide a means of managing the Domain objects on your account.\nNote: the validation rules for domain records are too complicated to document here. We'll just direct you to [RFC 1035](https://www.ietf.org/rfc/rfc1035.txt).\n",
        "path": "/domains",
        "methods": null,
        "endpoints": [
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
                      "value": 357,
                      "schema": null
                    },
                    {
                      "name": "domain",
                      "description": "The Domain name.\n",
                      "editable": true,
                      "filterable": true,
                      "type": "string",
                      "value": "example.com",
                      "schema": null
                    },
                    {
                      "name": "soa_email",
                      "description": "Start of Authority (SOA) contact email.\n",
                      "editable": true,
                      "type": "string",
                      "value": "admin@example.com",
                      "schema": null
                    },
                    {
                      "name": "description",
                      "description": "A description to keep track of this Domain.\n",
                      "editable": true,
                      "type": "string",
                      "value": "Example Description",
                      "schema": null
                    },
                    {
                      "name": "refresh_sec",
                      "description": "Time interval before the Domain should be refreshed, in seconds.\n",
                      "editable": true,
                      "type": "integer",
                      "value": 14400,
                      "schema": null
                    },
                    {
                      "name": "retry_sec",
                      "description": "Time interval that should elapse before a failed refresh should be retried, in seconds.\n",
                      "editable": true,
                      "type": "integer",
                      "value": 3600,
                      "schema": null
                    },
                    {
                      "name": "expire_sec",
                      "description": "Time value that specifies the upper limit on the time interval that can elapse before the Domain is no longer authoritative, in seconds.\n",
                      "editable": true,
                      "type": "integer",
                      "value": 604800,
                      "schema": null
                    },
                    {
                      "name": "ttl_sec",
                      "description": "Time interval that the resource record may be cached before\n  it should be discarded, in seconds.\n",
                      "editable": true,
                      "type": "integer",
                      "value": 3600,
                      "schema": null
                    },
                    {
                      "name": "status",
                      "description": "The status of the Domain it can be disabled, active, or edit_mode.\n",
                      "editable": true,
                      "type": "enum",
                      "subType": "status",
                      "value": "active",
                      "schema": [
                        {
                          "name": "active",
                          "description": "Turn on serving of this Domain."
                        },
                        {
                          "name": "disabled",
                          "description": "Turn off serving of this Domain."
                        },
                        {
                          "name": "edit_mode",
                          "description": "Use this mode while making edits."
                        }
                      ]
                    },
                    {
                      "name": "master_ips",
                      "description": "An array of IP addresses for this Domain.\n",
                      "editable": true,
                      "filterable": true,
                      "type": "array",
                      "subType": "string",
                      "value": [
                        "127.0.0.1",
                        "255.255.255.1",
                        "123.123.123.7"
                      ],
                      "schema": null
                    },
                    {
                      "name": "axfr_ips",
                      "description": "An array of IP addresses allowed to AXFR the entire Domain.\n",
                      "editable": true,
                      "type": "array",
                      "subType": "string",
                      "value": [
                        "44.55.66.77"
                      ],
                      "schema": null
                    },
                    {
                      "name": "display_group",
                      "description": "A display group to keep track of this Domain.\n",
                      "editable": true,
                      "filterable": true,
                      "type": "string",
                      "value": "Example Display Group",
                      "schema": null
                    },
                    {
                      "name": "type",
                      "description": "Controls the Domain type.",
                      "editable": false,
                      "filterable": true,
                      "type": "enum",
                      "subType": "domain_type",
                      "value": "master",
                      "schema": [
                        {
                          "name": "master",
                          "description": "A primary, authoritative Domain"
                        },
                        {
                          "name": "slave",
                          "description": "A secondary Domain which gets its updates from a master Domain."
                        }
                      ]
                    }
                  ],
                  "enums": {
                    "status": {
                      "active": "Turn on serving of this Domain.",
                      "disabled": "Turn off serving of this Domain.",
                      "edit_mode": "Use this mode while making edits."
                    },
                    "domain_type": {
                      "master": "A primary, authoritative Domain",
                      "slave": "A secondary Domain which gets its updates from a master Domain."
                    }
                  },
                  "example": {
                    "id": 357,
                    "domain": "example.com",
                    "soa_email": "admin@example.com",
                    "description": "Example Description",
                    "refresh_sec": 14400,
                    "retry_sec": 3600,
                    "expire_sec": 604800,
                    "ttl_sec": 3600,
                    "status": "active",
                    "master_ips": [
                      "127.0.0.1",
                      "255.255.255.1",
                      "123.123.123.7"
                    ],
                    "axfr_ips": [
                      "44.55.66.77"
                    ],
                    "display_group": "Example Display Group",
                    "type": "master"
                  }
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
            "path": "domains",
            "routePath": "/reference/endpoints/domains",
            "endpoints": []
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
                      "name": "id",
                      "type": "integer",
                      "value": 357,
                      "schema": null
                    },
                    {
                      "name": "domain",
                      "description": "The Domain name.\n",
                      "editable": true,
                      "filterable": true,
                      "type": "string",
                      "value": "example.com",
                      "schema": null
                    },
                    {
                      "name": "soa_email",
                      "description": "Start of Authority (SOA) contact email.\n",
                      "editable": true,
                      "type": "string",
                      "value": "admin@example.com",
                      "schema": null
                    },
                    {
                      "name": "description",
                      "description": "A description to keep track of this Domain.\n",
                      "editable": true,
                      "type": "string",
                      "value": "Example Description",
                      "schema": null
                    },
                    {
                      "name": "refresh_sec",
                      "description": "Time interval before the Domain should be refreshed, in seconds.\n",
                      "editable": true,
                      "type": "integer",
                      "value": 14400,
                      "schema": null
                    },
                    {
                      "name": "retry_sec",
                      "description": "Time interval that should elapse before a failed refresh should be retried, in seconds.\n",
                      "editable": true,
                      "type": "integer",
                      "value": 3600,
                      "schema": null
                    },
                    {
                      "name": "expire_sec",
                      "description": "Time value that specifies the upper limit on the time interval that can elapse before the Domain is no longer authoritative, in seconds.\n",
                      "editable": true,
                      "type": "integer",
                      "value": 604800,
                      "schema": null
                    },
                    {
                      "name": "ttl_sec",
                      "description": "Time interval that the resource record may be cached before\n  it should be discarded, in seconds.\n",
                      "editable": true,
                      "type": "integer",
                      "value": 3600,
                      "schema": null
                    },
                    {
                      "name": "status",
                      "description": "The status of the Domain it can be disabled, active, or edit_mode.\n",
                      "editable": true,
                      "type": "enum",
                      "subType": "status",
                      "value": "active",
                      "schema": [
                        {
                          "name": "active",
                          "description": "Turn on serving of this Domain."
                        },
                        {
                          "name": "disabled",
                          "description": "Turn off serving of this Domain."
                        },
                        {
                          "name": "edit_mode",
                          "description": "Use this mode while making edits."
                        }
                      ]
                    },
                    {
                      "name": "master_ips",
                      "description": "An array of IP addresses for this Domain.\n",
                      "editable": true,
                      "filterable": true,
                      "type": "array",
                      "subType": "string",
                      "value": [
                        "127.0.0.1",
                        "255.255.255.1",
                        "123.123.123.7"
                      ],
                      "schema": null
                    },
                    {
                      "name": "axfr_ips",
                      "description": "An array of IP addresses allowed to AXFR the entire Domain.\n",
                      "editable": true,
                      "type": "array",
                      "subType": "string",
                      "value": [
                        "44.55.66.77"
                      ],
                      "schema": null
                    },
                    {
                      "name": "display_group",
                      "description": "A display group to keep track of this Domain.\n",
                      "editable": true,
                      "filterable": true,
                      "type": "string",
                      "value": "Example Display Group",
                      "schema": null
                    },
                    {
                      "name": "type",
                      "description": "Controls the Domain type.",
                      "editable": false,
                      "filterable": true,
                      "type": "enum",
                      "subType": "domain_type",
                      "value": "master",
                      "schema": [
                        {
                          "name": "master",
                          "description": "A primary, authoritative Domain"
                        },
                        {
                          "name": "slave",
                          "description": "A secondary Domain which gets its updates from a master Domain."
                        }
                      ]
                    }
                  ],
                  "enums": {
                    "status": {
                      "active": "Turn on serving of this Domain.",
                      "disabled": "Turn off serving of this Domain.",
                      "edit_mode": "Use this mode while making edits."
                    },
                    "domain_type": {
                      "master": "A primary, authoritative Domain",
                      "slave": "A secondary Domain which gets its updates from a master Domain."
                    }
                  },
                  "example": {
                    "id": 357,
                    "domain": "example.com",
                    "soa_email": "admin@example.com",
                    "description": "Example Description",
                    "refresh_sec": 14400,
                    "retry_sec": 3600,
                    "expire_sec": 604800,
                    "ttl_sec": 3600,
                    "status": "active",
                    "master_ips": [
                      "127.0.0.1",
                      "255.255.255.1",
                      "123.123.123.7"
                    ],
                    "axfr_ips": [
                      "44.55.66.77"
                    ],
                    "display_group": "Example Display Group",
                    "type": "master"
                  }
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
            "path": "domains/:id",
            "routePath": "/reference/endpoints/domains/:id",
            "endpoints": []
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
                      "value": 468,
                      "schema": null
                    },
                    {
                      "name": "type",
                      "description": "Type of record (A/AAAA, NS, MX, CNAME, TXT, SRV).\n",
                      "type": "string",
                      "value": "A",
                      "schema": null
                    },
                    {
                      "name": "name",
                      "description": "The hostname or FQDN. When type=MX the subdomain to delegate to the Target MX server.\n",
                      "editable": true,
                      "filterable": true,
                      "type": "string",
                      "value": "sub.example.com",
                      "schema": null
                    },
                    {
                      "name": "target",
                      "description": "When type=MX the hostname. When type=CNAME the target of the alias. When type=TXT the value of the record. When type=A or AAAA the token of '[remote_addr]' will be substituted with the IP address of the request.\n",
                      "editable": true,
                      "filterable": true,
                      "type": "string",
                      "value": "sub",
                      "schema": null
                    },
                    {
                      "name": "priority",
                      "description": "Priority for MX and SRV records.\n",
                      "editable": true,
                      "type": "integer",
                      "value": 10,
                      "schema": null
                    },
                    {
                      "name": "weight",
                      "description": "A relative weight for records with the same priority, higher value means more preferred.\n",
                      "editable": true,
                      "type": "integer",
                      "value": 20,
                      "schema": null
                    },
                    {
                      "name": "port",
                      "description": "The TCP or UDP port on which the service is to be found.\n",
                      "editable": true,
                      "type": "integer",
                      "value": 80,
                      "schema": null
                    },
                    {
                      "name": "service",
                      "description": "The service to append to an SRV record. Must conform to RFC2782 standards.\n",
                      "editable": true,
                      "type": "string",
                      "value": "_sip",
                      "schema": null
                    },
                    {
                      "name": "protocol",
                      "description": "The protocol to append to an SRV record. Must conform to RFC2782 standards.\n",
                      "editable": true,
                      "type": "string",
                      "value": "_tcp",
                      "schema": null
                    },
                    {
                      "name": "ttl_sec",
                      "description": "Time interval that the resource record may be cached before it should be discarded, in seconds. Leave as 0 to accept our default.\n",
                      "editable": true,
                      "type": "integer",
                      "value": 86400,
                      "schema": null
                    }
                  ],
                  "enums": {
                    "Zone Record Types": {
                      "A": "Address Mapping Record",
                      "AAAA": "IP Version 6 Address Record",
                      "NS": "Name Server Record",
                      "MX": "Mail Exchanger Record",
                      "CNAME": "Canonical Name Record",
                      "TXT": "Text Record",
                      "SRV": "Service Record"
                    }
                  },
                  "example": {
                    "id": 468,
                    "type": "A",
                    "name": "sub.example.com",
                    "target": "sub",
                    "priority": 10,
                    "weight": 20,
                    "port": 80,
                    "service": "_sip",
                    "protocol": "_tcp",
                    "ttl_sec": 86400
                  }
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
            "path": "domains/:id/records",
            "routePath": "/reference/endpoints/domains/:id/records",
            "endpoints": []
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
                      "name": "id",
                      "type": "integer",
                      "value": 468,
                      "schema": null
                    },
                    {
                      "name": "type",
                      "description": "Type of record (A/AAAA, NS, MX, CNAME, TXT, SRV).\n",
                      "type": "string",
                      "value": "A",
                      "schema": null
                    },
                    {
                      "name": "name",
                      "description": "The hostname or FQDN. When type=MX the subdomain to delegate to the Target MX server.\n",
                      "editable": true,
                      "filterable": true,
                      "type": "string",
                      "value": "sub.example.com",
                      "schema": null
                    },
                    {
                      "name": "target",
                      "description": "When type=MX the hostname. When type=CNAME the target of the alias. When type=TXT the value of the record. When type=A or AAAA the token of '[remote_addr]' will be substituted with the IP address of the request.\n",
                      "editable": true,
                      "filterable": true,
                      "type": "string",
                      "value": "sub",
                      "schema": null
                    },
                    {
                      "name": "priority",
                      "description": "Priority for MX and SRV records.\n",
                      "editable": true,
                      "type": "integer",
                      "value": 10,
                      "schema": null
                    },
                    {
                      "name": "weight",
                      "description": "A relative weight for records with the same priority, higher value means more preferred.\n",
                      "editable": true,
                      "type": "integer",
                      "value": 20,
                      "schema": null
                    },
                    {
                      "name": "port",
                      "description": "The TCP or UDP port on which the service is to be found.\n",
                      "editable": true,
                      "type": "integer",
                      "value": 80,
                      "schema": null
                    },
                    {
                      "name": "service",
                      "description": "The service to append to an SRV record. Must conform to RFC2782 standards.\n",
                      "editable": true,
                      "type": "string",
                      "value": "_sip",
                      "schema": null
                    },
                    {
                      "name": "protocol",
                      "description": "The protocol to append to an SRV record. Must conform to RFC2782 standards.\n",
                      "editable": true,
                      "type": "string",
                      "value": "_tcp",
                      "schema": null
                    },
                    {
                      "name": "ttl_sec",
                      "description": "Time interval that the resource record may be cached before it should be discarded, in seconds. Leave as 0 to accept our default.\n",
                      "editable": true,
                      "type": "integer",
                      "value": 86400,
                      "schema": null
                    }
                  ],
                  "enums": {
                    "Zone Record Types": {
                      "A": "Address Mapping Record",
                      "AAAA": "IP Version 6 Address Record",
                      "NS": "Name Server Record",
                      "MX": "Mail Exchanger Record",
                      "CNAME": "Canonical Name Record",
                      "TXT": "Text Record",
                      "SRV": "Service Record"
                    }
                  },
                  "example": {
                    "id": 468,
                    "type": "A",
                    "name": "sub.example.com",
                    "target": "sub",
                    "priority": 10,
                    "weight": 20,
                    "port": 80,
                    "service": "_sip",
                    "protocol": "_tcp",
                    "ttl_sec": 86400
                  }
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
            "path": "domains/:id/records/:id",
            "routePath": "/reference/endpoints/domains/:id/records/:id",
            "endpoints": []
          }
        ]
      }
    ]
  },
  {
    "name": "NodeBalancers",
    "path": "/nodebalancers",
    "routePath": "/reference/nodebalancers",
    "endpoints": [
      {
        "name": "NodeBalancers",
        "base_path": "/nodebalancers",
        "description": "NodeBalancer endpoints provide a means of managing NodeBalancer objects on your account.\n",
        "path": "/nodebalancers",
        "methods": null,
        "endpoints": [
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
                  },
                  {
                    "name": "python",
                    "value": "my_nodebalancers = client.get_nodebalancers()\n"
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
                      "value": 123456,
                      "schema": null
                    },
                    {
                      "name": "label",
                      "description": "The NodeBalancer's display label. Must be 3-32 ASCII characters limited to letters, numbers, underscores, and dashes, starting and ending with a letter, and without two dashes or underscores in a row.",
                      "editable": true,
                      "type": "string",
                      "value": "nodebalancer12345",
                      "schema": null
                    },
                    {
                      "name": "hostname",
                      "description": "The NodeBalancer's hostname.",
                      "editable": false,
                      "type": "string",
                      "value": "nb-69-164-223-4.us-east-1a.nodebalancer.linode.com",
                      "schema": null
                    },
                    {
                      "name": "client_conn_throttle",
                      "description": "Throttle connections per second. 0 to disable, max of 20.",
                      "editable": true,
                      "type": "integer",
                      "value": 10,
                      "schema": null
                    }
                  ],
                  "example": {
                    "id": 123456,
                    "label": "nodebalancer12345",
                    "hostname": "nb-69-164-223-4.us-east-1a.nodebalancer.linode.com",
                    "client_conn_throttle": 10
                  }
                }
              },
              {
                "money": true,
                "oauth": "nodebalancers:create",
                "description": "Creates a new NodeBalancer.\n",
                "params": [
                  {
                    "description": "A region ID to provision this NodeBalancer in.\n",
                    "type": "integer",
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
                  },
                  {
                    "name": "python",
                    "value": "new_nodebalancer = client.create_nodebalancer('us-east-1a', label='my_cool_balancer', client_conn_throttle=10)\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "nodebalancers",
            "routePath": "/reference/endpoints/nodebalancers",
            "endpoints": []
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
                  },
                  {
                    "name": "python",
                    "value": "my_nodebalancer = linode.NodeBalancer(client, 123)\n"
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
                      "value": 123456,
                      "schema": null
                    },
                    {
                      "name": "label",
                      "description": "The NodeBalancer's display label. Must be 3-32 ASCII characters limited to letters, numbers, underscores, and dashes, starting and ending with a letter, and without two dashes or underscores in a row.",
                      "editable": true,
                      "type": "string",
                      "value": "nodebalancer12345",
                      "schema": null
                    },
                    {
                      "name": "hostname",
                      "description": "The NodeBalancer's hostname.",
                      "editable": false,
                      "type": "string",
                      "value": "nb-69-164-223-4.us-east-1a.nodebalancer.linode.com",
                      "schema": null
                    },
                    {
                      "name": "client_conn_throttle",
                      "description": "Throttle connections per second. 0 to disable, max of 20.",
                      "editable": true,
                      "type": "integer",
                      "value": 10,
                      "schema": null
                    }
                  ],
                  "example": {
                    "id": 123456,
                    "label": "nodebalancer12345",
                    "hostname": "nb-69-164-223-4.us-east-1a.nodebalancer.linode.com",
                    "client_conn_throttle": 10
                  }
                }
              },
              {
                "oauth": "nodebalancers:modify",
                "description": "Modifies this NodeBalancer.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X PUT -d '{\n        \"region\": \"us-east-1a\",\n        \"label\": \"awesome_new_label\",\n        \"client_conn_throttle\": 14\n    }' \\\n    https://$api_root/$version/nodebalancers/$nodebalancer_id\n"
                  },
                  {
                    "name": "python",
                    "value": "my_nodebalancer = linode.NodeBalancer(client, 123)\nmy_nodebalancer.label = 'awesome_new_label'\nmy_nodebalancer.client_conn_throttle = 14\nmy_nodebalancer.save()\n"
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
                  },
                  {
                    "name": "python",
                    "value": "my_nodebalancer = linode.NodeBalancer(client, 123)\nmy_nodebalancer.delete()\n"
                  }
                ],
                "name": "DELETE"
              }
            ],
            "path": "nodebalancers/:id",
            "routePath": "/reference/endpoints/nodebalancers/:id",
            "endpoints": []
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
                  },
                  {
                    "name": "python",
                    "value": "my_nodebalancer = linode.NodeBalancer(client, 123)\nnb_configs = my_nodebalancer.configs\n"
                  }
                ],
                "name": "GET",
                "resource": {
                  "name": "NodeBalancer Config",
                  "description": "Describes a configuration for a NodeBalancer.\n",
                  "schema": [
                    {
                      "name": "id",
                      "description": "An integer",
                      "editable": false,
                      "type": "integer",
                      "value": 804,
                      "schema": null
                    },
                    {
                      "name": "label",
                      "description": "Unique label for your NodeBalancer config",
                      "editable": true,
                      "type": "string",
                      "value": "balancerconfig123",
                      "schema": null
                    },
                    {
                      "name": "port",
                      "description": "Port to bind to on the public interfaces. 1-65534",
                      "editable": true,
                      "type": "integer",
                      "value": 80,
                      "schema": null
                    },
                    {
                      "name": "protocol",
                      "description": "The protocol used for the config.",
                      "editable": true,
                      "type": "enum",
                      "subType": "protocol",
                      "value": "https",
                      "schema": [
                        {
                          "name": "http",
                          "description": "http"
                        },
                        {
                          "name": "https",
                          "description": "https"
                        },
                        {
                          "name": "tcp",
                          "description": "tcp"
                        }
                      ]
                    },
                    {
                      "name": "algorithm",
                      "description": "Balancing algorithm",
                      "editable": true,
                      "type": "enum",
                      "subType": "algorithm",
                      "value": "roundrobin",
                      "schema": [
                        {
                          "name": "roundrobin",
                          "description": "Round robin"
                        },
                        {
                          "name": "leastconn",
                          "description": "Assigns connections to the backend with the least connections."
                        },
                        {
                          "name": "source",
                          "description": "Uses the client's IPv4 address."
                        }
                      ]
                    },
                    {
                      "name": "stickiness",
                      "description": "Session persistence. Route subsequent requests from a client to the same backend.",
                      "editable": true,
                      "type": "enum",
                      "subType": "stickiness",
                      "value": "table",
                      "schema": [
                        {
                          "name": "none",
                          "description": "None"
                        },
                        {
                          "name": "table",
                          "description": "Table"
                        },
                        {
                          "name": "http_cookie",
                          "description": "Http cookie"
                        }
                      ]
                    },
                    {
                      "name": "check",
                      "description": "Perform active health checks on the backend nodes.",
                      "editable": true,
                      "type": "enum",
                      "subType": "check",
                      "value": "connection",
                      "schema": [
                        {
                          "name": "none",
                          "description": "None"
                        },
                        {
                          "name": "connection",
                          "description": "Requires a successful TCP handshake."
                        },
                        {
                          "name": "http",
                          "description": "Requires a 2xx or 3xx response from the backend node."
                        },
                        {
                          "name": "http_body",
                          "description": "Uses a regex to match against an expected result body."
                        }
                      ]
                    },
                    {
                      "name": "check_interval",
                      "description": "Seconds between health check probes.",
                      "editable": true,
                      "type": "integer",
                      "value": 5,
                      "schema": null
                    },
                    {
                      "name": "check_timeout",
                      "description": "Seconds to wait before considering the probe a failure. 1-30. Must be less than check_interval.",
                      "editable": true,
                      "type": "integer",
                      "value": 3,
                      "schema": null
                    },
                    {
                      "name": "check_attempts",
                      "description": "Number of failed probes before taking a node out of rotation. 1-30.",
                      "editable": true,
                      "type": "integer",
                      "value": 20,
                      "schema": null
                    },
                    {
                      "name": "check_path",
                      "description": "When check is \"http\", the path to request.",
                      "editable": true,
                      "type": "string",
                      "value": "/",
                      "schema": null
                    },
                    {
                      "name": "check_body",
                      "description": "When check is \"http\", a regex to match within the first 16,384 bytes of the response body.",
                      "editable": true,
                      "type": "string",
                      "value": null,
                      "schema": null
                    },
                    {
                      "name": "check_passive",
                      "description": "Enable passive checks based on observing communication with back-end nodes.",
                      "editable": true,
                      "type": "boolean",
                      "value": true,
                      "schema": null
                    },
                    {
                      "name": "ssl_cert",
                      "description": "SSL certificate served by the NodeBalancer when the protocol is \"https\".",
                      "editable": true,
                      "type": "string",
                      "value": null,
                      "schema": null
                    },
                    {
                      "name": "ssl_key",
                      "description": "Unpassphrased private key for the SSL certificate when the protocol is \"https\".",
                      "editable": true,
                      "type": "string",
                      "value": null,
                      "schema": null
                    },
                    {
                      "name": "cipher_suite",
                      "description": "SSL cipher suite to enforce.",
                      "editable": true,
                      "type": "enum",
                      "subType": "cipher_suite",
                      "value": "recommended",
                      "schema": [
                        {
                          "name": "recommended",
                          "description": "Recommended"
                        },
                        {
                          "name": "legacy",
                          "description": "Legacy"
                        }
                      ]
                    }
                  ],
                  "enums": {
                    "protocol": {
                      "http": "http",
                      "https": "https",
                      "tcp": "tcp"
                    },
                    "algorithm": {
                      "roundrobin": "Round robin",
                      "leastconn": "Assigns connections to the backend with the least connections.",
                      "source": "Uses the client's IPv4 address."
                    },
                    "stickiness": {
                      "none": "None",
                      "table": "Table",
                      "http_cookie": "Http cookie"
                    },
                    "check": {
                      "none": "None",
                      "connection": "Requires a successful TCP handshake.",
                      "http": "Requires a 2xx or 3xx response from the backend node.",
                      "http_body": "Uses a regex to match against an expected result body."
                    },
                    "cipher_suite": {
                      "recommended": "Recommended",
                      "legacy": "Legacy"
                    }
                  },
                  "example": {
                    "id": 804,
                    "label": "balancerconfig123",
                    "port": 80,
                    "protocol": "https",
                    "algorithm": "roundrobin",
                    "stickiness": "table",
                    "check": "connection",
                    "check_interval": 5,
                    "check_timeout": 3,
                    "check_attempts": 20,
                    "check_path": "/",
                    "check_body": null,
                    "check_passive": true,
                    "ssl_cert": null,
                    "ssl_key": null,
                    "cipher_suite": "recommended"
                  }
                }
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
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\n        \"label\": \"myNodeBalancer\",\n        \"port\": 80,\n        \"protocol\": \"http\",\n        \"algorithm\": \"roundrobin\",\n        \"stickiness\": \"none\",\n        \"check\": \"http_body\",\n        \"check_interval\": 5,\n        \"check_timeout\": 3,\n        \"check_attempts\": 10,\n        \"check_path\": \"/path/to/check\",\n        \"check_body\": \"we got some stuff back\",\n        \"cipher_suite\": \"legacy\"\n    }' \\\n    https://$api_root/$version/nodebalancers/$nodebalancer_id/configs\n"
                  },
                  {
                    "name": "python",
                    "value": "my_nodebalancer = linode.NodeBalancer(client, 123)\nnew_config = my_nodebalancer.create_config(port=80, label='myNodeBalancerConfig', protocol='http',\n        algorithm='roundrobin', stickiness='none', check='http_body', check_interval=5, check_timeout=3,\n        check_attempts=10, check_path='/path/to/check', check_body='we got some stuff back',\n        cipher_suite='legacy')\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "nodebalancers/:id/configs",
            "routePath": "/reference/endpoints/nodebalancers/:id/configs",
            "endpoints": []
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
                  },
                  {
                    "name": "python",
                    "value": "nb_config = linode.NodeBalancerConfig(client, 456, 123) # linode_client, nodebalancer_config_id, nodebalancer_id\n"
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
                  },
                  {
                    "name": "python",
                    "value": "nb_config = linode.NodeBalancerConfig(client, 456, 123) # linode_client, nodebalancer_config_id, nodebalancer_id\nnb_config.delete()\n"
                  }
                ],
                "name": "DELETE"
              }
            ],
            "path": "nodebalancers/:id/configs/:id",
            "routePath": "/reference/endpoints/nodebalancers/:id/configs/:id",
            "endpoints": []
          },
          {
            "type": "resource",
            "authenticated": true,
            "description": "Add or update SSL certificate and https protocol to an existing config profile.\n",
            "methods": [
              {
                "oauth": "nodebalancers:modify",
                "description": "Adds/updates SSL certificates",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\n      \"ssl_cert\": \"----- BEGIN CERTIFICATE ----- < etc...> ----- END CERTIFICATE -----\",\n      \"ssl_key\": \"----- BEGIN PRIVATE KEY ----- < etc...> ----- END PRIVATE KEY -----\"\n    }' \\\n    https://$api_root/$version/nodebalancers/$nodebalancer_id/configs/$config_id/ssl\n"
                  },
                  {
                    "name": "python",
                    "value": "# currently unimplemented\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "nodebalancers/:id/configs/:id/ssl",
            "routePath": "/reference/endpoints/nodebalancers/:id/configs/:id/ssl",
            "endpoints": []
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
                  },
                  {
                    "name": "python",
                    "value": "my_nodebalancer = linode.NodeBalancer(client, 123)\nnb_config = my_nodebalancer.configs[0]\nnb_nodes = nb_config.nodes\n"
                  }
                ],
                "name": "GET",
                "resource": {
                  "name": "NodeBalancer Config Node",
                  "description": "Describes a configuration node for a NodeBalancer.\n",
                  "schema": [
                    {
                      "name": "id",
                      "description": "An integer",
                      "editable": false,
                      "type": "integer",
                      "value": 804,
                      "schema": null
                    },
                    {
                      "name": "label",
                      "description": "Unique label for your NodeBalancer config",
                      "editable": true,
                      "type": "string",
                      "value": "node001",
                      "schema": null
                    },
                    {
                      "name": "address",
                      "description": "The address:port combination used to communicate with this Node.",
                      "editable": true,
                      "type": "string",
                      "value": "192.168.12.12:80",
                      "schema": null
                    },
                    {
                      "name": "weight",
                      "description": "Load balancing weight, 1-255. Higher means more connections.",
                      "editable": true,
                      "type": "integer",
                      "value": 20,
                      "schema": null
                    },
                    {
                      "name": "mode",
                      "description": "The connections mode for this node. One of 'accept', 'reject', or 'drain'.",
                      "editable": true,
                      "type": "enum",
                      "subType": "mode",
                      "value": "accept",
                      "schema": [
                        {
                          "name": "accept",
                          "description": "accept"
                        },
                        {
                          "name": "reject",
                          "description": "reject"
                        },
                        {
                          "name": "drain",
                          "description": "drain"
                        }
                      ]
                    },
                    {
                      "name": "status",
                      "description": "The status of this node.",
                      "type": "string",
                      "value": "UP",
                      "schema": null
                    }
                  ],
                  "enums": {
                    "mode": {
                      "accept": "accept",
                      "reject": "reject",
                      "drain": "drain"
                    },
                    "status": {
                      "UP": "UP",
                      "DOWN": "DOWN",
                      "MAINT": "Under Maintenance",
                      "Unknown": "Unknown"
                    }
                  },
                  "example": {
                    "id": 804,
                    "label": "node001",
                    "address": "192.168.12.12:80",
                    "weight": 20,
                    "mode": "accept",
                    "status": "UP"
                  }
                }
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
                  }
                ],
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n  -H \"Authorization: token $TOKEN\" \\\n  -X POST -d '{\n      \"label\": \"greatest_node_ever\",\n      \"address\": \"192.168.4.5:80\",\n      \"weight\": 40,\n      \"mode\": \"accept\"\n  }' \\\n  https://$api_root/$version/nodebalancers/$nodebalancer_id/configs/$config_id/nodes\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "nodebalancers/:id/configs/:id/nodes",
            "routePath": "/reference/endpoints/nodebalancers/:id/configs/:id/nodes",
            "endpoints": []
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
                  },
                  {
                    "name": "python",
                    "value": "nb_node = linode.NodeBalancerNode(client, 789, 456, 123) # linode_client, node_id, config_id, nodebalancer_id\n"
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
                    "value": "curl -H \"Content-Type: application/json\" \\\n  -H \"Authorization: token $TOKEN\" \\\n  -X PUT -d '{\n      \"label\": \"node001\",\n      \"address\": \"192.168.12.12:100\",\n      \"weight\": 40,\n      \"mode\": \"accept\",\n  }' \\\n  https://$api_root/$version/nodebalancers/$nodebalancer_id/configs/$config_id/nodes/$node_id\n"
                  },
                  {
                    "name": "python",
                    "value": "nb_node = linode.NodeBalancerNode(client, 789, 456, 123) # linode_client, node_id, config_id, nodebalancer_id\nnb_node.label = 'node001'\nnb_node.address = '192.168.12.12:100'\nnb_node.save()\n"
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
                  },
                  {
                    "name": "python",
                    "value": "nb_node = linode.NodeBalancerNode(client, 789, 456, 123) # linode_client, node_id, config_id, nodebalancer_id\nnb_node.delete()\n"
                  }
                ],
                "name": "DELETE"
              }
            ],
            "path": "nodebalancers/:id/configs/:id/nodes/:id",
            "routePath": "/reference/endpoints/nodebalancers/:id/configs/:id/nodes/:id",
            "endpoints": []
          }
        ]
      }
    ]
  },
  {
    "name": "Networking",
    "path": "/networking",
    "routePath": "/reference/networking",
    "endpoints": [
      {
        "name": "Networking",
        "sort": 1,
        "base_path": "/networking",
        "description": "Networking endpoints provide a means of viewing networking objects.\n",
        "path": "/networking",
        "methods": null,
        "endpoints": [
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
                  },
                  {
                    "name": "python",
                    "value": "my_ipv4s = client.networking.get_ipv4()\n"
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
                  },
                  {
                    "name": "python",
                    "value": "# presently unsupported\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "networking/ipv4",
            "routePath": "/reference/endpoints/networking/ipv4",
            "endpoints": []
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
                  },
                  {
                    "name": "python",
                    "value": "my_ipv4 = linode.IPAddress(client, '97.107.143.37')\n"
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
                  },
                  {
                    "name": "python",
                    "value": "my_ipv4.rdns = 'example.org'\nmy_ipv4.save()\n"
                  }
                ],
                "name": "PUT"
              }
            ],
            "path": "networking/ipv4/:address",
            "routePath": "/reference/endpoints/networking/ipv4/:address",
            "endpoints": []
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
                  },
                  {
                    "name": "python",
                    "value": "my_ipv6s = client.networking.get_ipv6()\n"
                  }
                ],
                "name": "GET"
              }
            ],
            "path": "networking/ipv6",
            "routePath": "/reference/endpoints/networking/ipv6",
            "endpoints": []
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
                  },
                  {
                    "name": "python",
                    "value": "my_ipv6 = linode.IPv6Address(client, '2600:3c01::2:5001')\n"
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
                  },
                  {
                    "name": "python",
                    "value": "my_ipv6.rdns = 'example.org'\nmy_ipv6.save()\n"
                  }
                ],
                "name": "PUT"
              }
            ],
            "path": "networking/ipv6/:address",
            "routePath": "/reference/endpoints/networking/ipv6/:address",
            "endpoints": []
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
                    "type": "integer",
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
                  },
                  {
                    "name": "python",
                    "value": "linode_1 = linode.Linode(client, 134504)\nip1 = linode_1.ips.ipv4.public[0]\n\nlinode_2 = linode.Linode(client, 119034)\nip2 = linode_2.ips.ipv4.public[0]\n\nclient.networking.assign_ips(linode_1.region, ip1.to(linode_2), ip2.to(linode_1))\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "networking/ip-assign",
            "routePath": "/reference/endpoints/networking/ip-assign",
            "endpoints": []
          }
        ]
      }
    ]
  },
  {
    "name": "Regions",
    "path": "/regions",
    "routePath": "/reference/regions",
    "endpoints": [
      {
        "name": "Regions",
        "base_path": "/regions",
        "description": "Region endpoints provide a means of viewing region objects.\n",
        "path": "/regions",
        "methods": null,
        "endpoints": [
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
                    "value": "all_regions = client.get_regions()\n"
                  }
                ],
                "name": "GET",
                "resource": {
                  "name": "Region",
                  "prefix": "dctr",
                  "description": "Region objects describe the regions available for Linode services.\n",
                  "schema": [
                    {
                      "name": "id",
                      "type": "string",
                      "value": "us-east-1a",
                      "schema": null
                    },
                    {
                      "name": "label",
                      "description": "Human-friendly region name.",
                      "filterable": true,
                      "type": "string",
                      "value": "Newark, NJ",
                      "schema": null
                    },
                    {
                      "name": "country",
                      "description": "Country",
                      "filterable": true,
                      "type": "string",
                      "value": "US",
                      "schema": null
                    }
                  ],
                  "example": {
                    "id": "us-east-1a",
                    "label": "Newark, NJ",
                    "country": "US"
                  }
                }
              }
            ],
            "path": "regions",
            "routePath": "/reference/endpoints/regions",
            "endpoints": []
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
                    "value": "region = linode.Region(client, 'us-east-1a')\n"
                  }
                ],
                "name": "GET",
                "resource": {
                  "name": "Region",
                  "prefix": "dctr",
                  "description": "Region objects describe the regions available for Linode services.\n",
                  "schema": [
                    {
                      "name": "id",
                      "type": "string",
                      "value": "us-east-1a",
                      "schema": null
                    },
                    {
                      "name": "label",
                      "description": "Human-friendly region name.",
                      "filterable": true,
                      "type": "string",
                      "value": "Newark, NJ",
                      "schema": null
                    },
                    {
                      "name": "country",
                      "description": "Country",
                      "filterable": true,
                      "type": "string",
                      "value": "US",
                      "schema": null
                    }
                  ],
                  "example": {
                    "id": "us-east-1a",
                    "label": "Newark, NJ",
                    "country": "US"
                  }
                }
              }
            ],
            "path": "regions/:id",
            "routePath": "/reference/endpoints/regions/:id",
            "endpoints": []
          }
        ]
      }
    ]
  },
  {
    "name": "Support",
    "path": "/support",
    "routePath": "/reference/support",
    "endpoints": [
      {
        "name": "Support Tickets",
        "sort": 0,
        "base_path": "/support/tickets",
        "description": "Support tickets allow you to view, submit, and manage requests for help to the Linode support team.\n",
        "path": "/support/tickets",
        "methods": null,
        "endpoints": [
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
                      "value": 1234,
                      "schema": null
                    },
                    {
                      "name": "summary",
                      "description": "This is summary or title for the ticket.",
                      "type": "string",
                      "value": "A summary of the ticket.",
                      "schema": null
                    },
                    {
                      "name": "description",
                      "description": "The full details of the issue or question.",
                      "type": "string",
                      "value": "More details about the ticket.",
                      "schema": null
                    },
                    {
                      "name": "status",
                      "description": "The status of the ticket.",
                      "filterable": true,
                      "type": "enum",
                      "subType": "Status",
                      "value": "open",
                      "schema": [
                        {
                          "name": "new",
                          "description": "The support ticket has just been opened."
                        },
                        {
                          "name": "open",
                          "description": "The support ticket is open and can be replied to."
                        },
                        {
                          "name": "closed",
                          "description": "The support ticket is completed and closed."
                        }
                      ]
                    },
                    {
                      "name": "opened",
                      "filterable": true,
                      "type": "datetime",
                      "value": "2017-02-23T11:21:01",
                      "schema": null
                    },
                    {
                      "name": "closed",
                      "filterable": true,
                      "type": "datetime",
                      "value": "2017-02-25T03:20:00",
                      "schema": null
                    },
                    {
                      "name": "closed_by",
                      "description": "The user who closed this ticket.",
                      "type": "string",
                      "value": "some_user",
                      "schema": null
                    },
                    {
                      "name": "updated",
                      "filterable": true,
                      "type": "datetime",
                      "value": "2017-02-23T11:21:01",
                      "schema": null
                    },
                    {
                      "name": "updated_by",
                      "description": "The user who last updated this ticket.",
                      "type": "string",
                      "value": "some_other_user",
                      "schema": null
                    },
                    {
                      "name": "entity",
                      "description": "The entity this ticket was opened regarding",
                      "schema": [
                        {
                          "name": "id",
                          "description": "The entity's ID that this event is for.  This is meaningless without a type.\n",
                          "type": "integer",
                          "value": 9302,
                          "schema": null
                        },
                        {
                          "name": "label",
                          "description": "The current label of this object.  This will reflect changes in label.\n",
                          "type": "string",
                          "value": "linode123",
                          "schema": null
                        },
                        {
                          "name": "type",
                          "description": "The type of entity this is related to.\n",
                          "type": "string",
                          "value": "linode",
                          "schema": null
                        },
                        {
                          "name": "url",
                          "description": "The URL where you can access the object this event is for.  If a relative URL, it is relative to the domain you retrieved the event from.\n",
                          "type": "string",
                          "value": "/v4/linode/instances/123",
                          "schema": null
                        }
                      ]
                    }
                  ],
                  "enums": {
                    "Status": {
                      "new": "The support ticket has just been opened.",
                      "open": "The support ticket is open and can be replied to.",
                      "closed": "The support ticket is completed and closed."
                    }
                  },
                  "example": {
                    "id": 1234,
                    "summary": "A summary of the ticket.",
                    "description": "More details about the ticket.",
                    "status": "open",
                    "opened": "2017-02-23T11:21:01",
                    "closed": "2017-02-25T03:20:00",
                    "closed_by": "some_user",
                    "updated": "2017-02-23T11:21:01",
                    "updated_by": "some_other_user",
                    "entity": {
                      "id": 9302,
                      "label": "linode123",
                      "type": "linode",
                      "url": "/v4/linode/instances/123"
                    }
                  }
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
            "path": "support/tickets",
            "routePath": "/reference/endpoints/support/tickets",
            "endpoints": []
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
                      "name": "id",
                      "description": "This ticket's ID",
                      "type": "integer",
                      "value": 1234,
                      "schema": null
                    },
                    {
                      "name": "summary",
                      "description": "This is summary or title for the ticket.",
                      "type": "string",
                      "value": "A summary of the ticket.",
                      "schema": null
                    },
                    {
                      "name": "description",
                      "description": "The full details of the issue or question.",
                      "type": "string",
                      "value": "More details about the ticket.",
                      "schema": null
                    },
                    {
                      "name": "status",
                      "description": "The status of the ticket.",
                      "filterable": true,
                      "type": "enum",
                      "subType": "Status",
                      "value": "open",
                      "schema": [
                        {
                          "name": "new",
                          "description": "The support ticket has just been opened."
                        },
                        {
                          "name": "open",
                          "description": "The support ticket is open and can be replied to."
                        },
                        {
                          "name": "closed",
                          "description": "The support ticket is completed and closed."
                        }
                      ]
                    },
                    {
                      "name": "opened",
                      "filterable": true,
                      "type": "datetime",
                      "value": "2017-02-23T11:21:01",
                      "schema": null
                    },
                    {
                      "name": "closed",
                      "filterable": true,
                      "type": "datetime",
                      "value": "2017-02-25T03:20:00",
                      "schema": null
                    },
                    {
                      "name": "closed_by",
                      "description": "The user who closed this ticket.",
                      "type": "string",
                      "value": "some_user",
                      "schema": null
                    },
                    {
                      "name": "updated",
                      "filterable": true,
                      "type": "datetime",
                      "value": "2017-02-23T11:21:01",
                      "schema": null
                    },
                    {
                      "name": "updated_by",
                      "description": "The user who last updated this ticket.",
                      "type": "string",
                      "value": "some_other_user",
                      "schema": null
                    },
                    {
                      "name": "entity",
                      "description": "The entity this ticket was opened regarding",
                      "schema": [
                        {
                          "name": "id",
                          "description": "The entity's ID that this event is for.  This is meaningless without a type.\n",
                          "type": "integer",
                          "value": 9302,
                          "schema": null
                        },
                        {
                          "name": "label",
                          "description": "The current label of this object.  This will reflect changes in label.\n",
                          "type": "string",
                          "value": "linode123",
                          "schema": null
                        },
                        {
                          "name": "type",
                          "description": "The type of entity this is related to.\n",
                          "type": "string",
                          "value": "linode",
                          "schema": null
                        },
                        {
                          "name": "url",
                          "description": "The URL where you can access the object this event is for.  If a relative URL, it is relative to the domain you retrieved the event from.\n",
                          "type": "string",
                          "value": "/v4/linode/instances/123",
                          "schema": null
                        }
                      ]
                    }
                  ],
                  "enums": {
                    "Status": {
                      "new": "The support ticket has just been opened.",
                      "open": "The support ticket is open and can be replied to.",
                      "closed": "The support ticket is completed and closed."
                    }
                  },
                  "example": {
                    "id": 1234,
                    "summary": "A summary of the ticket.",
                    "description": "More details about the ticket.",
                    "status": "open",
                    "opened": "2017-02-23T11:21:01",
                    "closed": "2017-02-25T03:20:00",
                    "closed_by": "some_user",
                    "updated": "2017-02-23T11:21:01",
                    "updated_by": "some_other_user",
                    "entity": {
                      "id": 9302,
                      "label": "linode123",
                      "type": "linode",
                      "url": "/v4/linode/instances/123"
                    }
                  }
                }
              }
            ],
            "path": "support/tickets/:id",
            "routePath": "/reference/endpoints/support/tickets/:id",
            "endpoints": []
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
                      "value": 1234,
                      "schema": null
                    },
                    {
                      "name": "description",
                      "description": "The body of this ticket reply.",
                      "type": "string",
                      "value": "More details about the ticket.",
                      "schema": null
                    },
                    {
                      "name": "created",
                      "description": "A timestamp for when the reply was submitted.",
                      "type": "datetime",
                      "value": "2017-02-23T11:21:01",
                      "schema": null
                    },
                    {
                      "name": "created_by",
                      "description": "The user who submitted this reply.",
                      "type": "string",
                      "value": "some_other_user",
                      "schema": null
                    }
                  ],
                  "example": {
                    "id": 1234,
                    "description": "More details about the ticket.",
                    "created": "2017-02-23T11:21:01",
                    "created_by": "some_other_user"
                  }
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
            "path": "support/tickets/:id/replies",
            "routePath": "/reference/endpoints/support/tickets/:id/replies",
            "endpoints": []
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
            "path": "support/tickets/:id/attachments",
            "routePath": "/reference/endpoints/support/tickets/:id/attachments",
            "endpoints": []
          }
        ]
      }
    ]
  },
  {
    "name": "Account",
    "path": "/account",
    "routePath": "/reference/account",
    "endpoints": [
      {
        "name": "Account",
        "sort": 1,
        "base_path": "/account",
        "description": "Account endpoints provide a means of viewing user profile objects, as well as managing OAuth Clients and Tokens.\n",
        "path": "/account",
        "methods": null,
        "endpoints": [
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
                  },
                  {
                    "name": "python",
                    "value": "my_profile = client.account.get_profile()\n"
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
                      "value": "example_user",
                      "schema": null
                    },
                    {
                      "name": "email",
                      "description": "The email address of the user.\n",
                      "editable": true,
                      "type": "string",
                      "value": "person@place.com",
                      "schema": null
                    },
                    {
                      "name": "timezone",
                      "description": "The selected timezone of the user location.",
                      "editable": true,
                      "type": "string",
                      "value": "US/Eastern",
                      "schema": null
                    },
                    {
                      "name": "email_notifications",
                      "description": "Toggles to determine if the user receives email notifications",
                      "editable": true,
                      "type": "boolean",
                      "value": true,
                      "schema": null
                    },
                    {
                      "name": "referrals",
                      "description": "Displays information related to referral signups attributed to the user.\n",
                      "schema": [
                        {
                          "name": "code",
                          "description": "an alphanumeric code unique to each user for use in creating referral URLs.",
                          "type": "string",
                          "value": "rcg3340777c21fa49a5beb971ca1aec44bc584333",
                          "schema": null
                        },
                        {
                          "name": "url",
                          "description": "referral URL based on `code`.",
                          "type": "string",
                          "value": "https://www.linode.com/?r=rcg3340777c21fa49a5beb971ca1aec44bc584333",
                          "schema": null
                        },
                        {
                          "name": "total",
                          "description": "total number of referrals attributed to user.",
                          "type": "integer",
                          "value": 10,
                          "schema": null
                        },
                        {
                          "name": "completed",
                          "description": "total number of referrals attributed to user that have converted to full accounts.",
                          "type": "integer",
                          "value": 8,
                          "schema": null
                        },
                        {
                          "name": "pending",
                          "description": "total number of referrals attributed to user that have not yet converted to full accounts.",
                          "type": "integer",
                          "value": 2,
                          "schema": null
                        },
                        {
                          "name": "credit",
                          "description": "dollar amount of credit based on completed referrals.",
                          "type": "integer",
                          "value": 160,
                          "schema": null
                        }
                      ]
                    },
                    {
                      "name": "ip_whitelist_enabled",
                      "description": "When enabled, you can only log in from an IP address on your whitelist.\n",
                      "editable": true,
                      "type": "boolean",
                      "value": true,
                      "schema": null
                    },
                    {
                      "name": "lish_auth_method",
                      "description": "Controls what authentication methods are allowed to connect to the Lish console servers.\n",
                      "editable": true,
                      "type": "enum",
                      "subType": "LishSetting",
                      "value": "password_keys",
                      "schema": [
                        {
                          "name": "password_keys",
                          "description": "Allow both password and key authentication"
                        },
                        {
                          "name": "keys_only",
                          "description": "Allow key authentication only"
                        },
                        {
                          "name": "disabled",
                          "description": "Disable Lish"
                        }
                      ]
                    },
                    {
                      "name": "authorized_keys",
                      "description": "Comma-delimited list of authorized SSH public keys",
                      "editable": true,
                      "type": "string",
                      "value": "ssh-rsa AADDDDB3NzaC1yc2EAAAADAQABAAACAQDzP5sZlvUR9nZPy0WrklktNXffq+nQoEYUdVJ0hpIzZs+KqjZ3CDbsJZF0g0pn1/gpY9oSEeXzFpWasdkjlfasdf09asldf+O+y8w6rbPe8IyP1mext4cmBe6g/nHAjw/k0rS6cuUFZu++snG0qubymE9gMZ3X0ac92TP7tk0dEwq1fbjumhqNmNyqSbt5j8pLuLRhYHhVszmwnuKjeGjm9mJLJGnd5V6IdZWEIhCjrNgNr1H+fVNI87ryFE31i/i/bnHcbnkNdAmDc2EQ2gJ33vXg8D8Nf2aI+K+e3t9MiFVTJmzAILQpvZQj2YV4mfOt+GSTUJ4VdgH9dNC/3lA0yoP6YoFYw0cdTKhJ0MotmR9iZepbJfbuXxAFOECJuC1bxFtUam3fIsGqj3vXi1R6CzRzxNERqPGLiFcXH8z0VTwXA1v+iflVd4KqihnwNtU+45TXTtFY0twLQRauB9qo9slvnhYlHqQZb8SBYw5WltX3MBQpyLTSZLQLqIKZVgQRKKF413fT52vMF54zk5SpImm5qY5Q1E4od00UJ1x4kFe0fTUQWVgeYvL8AgFx/idUsVs9r3jRPVTUnQZNB2D+7Cyf9dUFjjpiuH3AMMZyRYfJbh/Chg8J6QXYZyEQCxMRa9/lm2rRCVfGbcfb5zgKsV/HRHI/O1F9cZ9JvykwQ== someguy@someplace.com",
                      "schema": null
                    },
                    {
                      "name": "two_factor_auth",
                      "description": "Toggles whether two factor authentication (TFA) is enabled or disabled.",
                      "editable": true,
                      "type": "boolean",
                      "value": true,
                      "schema": null
                    }
                  ],
                  "enums": {
                    "LishSetting": {
                      "password_keys": "Allow both password and key authentication",
                      "keys_only": "Allow key authentication only",
                      "disabled": "Disable Lish"
                    }
                  },
                  "example": {
                    "username": "example_user",
                    "email": "person@place.com",
                    "timezone": "US/Eastern",
                    "email_notifications": true,
                    "referrals": {
                      "code": "rcg3340777c21fa49a5beb971ca1aec44bc584333",
                      "url": "https://www.linode.com/?r=rcg3340777c21fa49a5beb971ca1aec44bc584333",
                      "total": 10,
                      "completed": 8,
                      "pending": 2,
                      "credit": 160
                    },
                    "ip_whitelist_enabled": true,
                    "lish_auth_method": "password_keys",
                    "authorized_keys": "ssh-rsa AADDDDB3NzaC1yc2EAAAADAQABAAACAQDzP5sZlvUR9nZPy0WrklktNXffq+nQoEYUdVJ0hpIzZs+KqjZ3CDbsJZF0g0pn1/gpY9oSEeXzFpWasdkjlfasdf09asldf+O+y8w6rbPe8IyP1mext4cmBe6g/nHAjw/k0rS6cuUFZu++snG0qubymE9gMZ3X0ac92TP7tk0dEwq1fbjumhqNmNyqSbt5j8pLuLRhYHhVszmwnuKjeGjm9mJLJGnd5V6IdZWEIhCjrNgNr1H+fVNI87ryFE31i/i/bnHcbnkNdAmDc2EQ2gJ33vXg8D8Nf2aI+K+e3t9MiFVTJmzAILQpvZQj2YV4mfOt+GSTUJ4VdgH9dNC/3lA0yoP6YoFYw0cdTKhJ0MotmR9iZepbJfbuXxAFOECJuC1bxFtUam3fIsGqj3vXi1R6CzRzxNERqPGLiFcXH8z0VTwXA1v+iflVd4KqihnwNtU+45TXTtFY0twLQRauB9qo9slvnhYlHqQZb8SBYw5WltX3MBQpyLTSZLQLqIKZVgQRKKF413fT52vMF54zk5SpImm5qY5Q1E4od00UJ1x4kFe0fTUQWVgeYvL8AgFx/idUsVs9r3jRPVTUnQZNB2D+7Cyf9dUFjjpiuH3AMMZyRYfJbh/Chg8J6QXYZyEQCxMRa9/lm2rRCVfGbcfb5zgKsV/HRHI/O1F9cZ9JvykwQ== someguy@someplace.com",
                    "two_factor_auth": true
                  }
                }
              },
              {
                "description": "Edits your account profile.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n  -H \"Authorization: token $TOKEN\" \\\n  -X PUT -d '{\n        \"username\": \"jsmith\",\n        \"email\": \"jsmith@mycompany.com\",\n        \"timezone\": \"US/Eastern\",\n        \"email_notifications\": true,\n        \"ip_whitelist_enabled\": true,\n        \"lish_auth_method\": \"password_keys\",\n        \"authorized_keys\": \"\"\n      }\n    }' \\\n    https://$api_root/$version/account/profile\n"
                  },
                  {
                    "name": "python",
                    "value": "my_profile.email = 'jsmith@mycompany.com'\nmy_profile.timezone = 'US/Eastern'\nmy_profile.email_notifications = True\nmy_profile.ip_whitelist_enabled = True\nmy_profile.lish_auth_method = 'password_keys'\nmy_profile.save()\n"
                  }
                ],
                "name": "PUT"
              }
            ],
            "path": "account/profile",
            "routePath": "/reference/endpoints/account/profile",
            "endpoints": []
          },
          {
            "methods": [
              {
                "description": "Change your password.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n  -H \"Authorization: token $TOKEN\" \\\n  -X POST -d '{\n      \"password\":\"hunter7\"\n  }' \\\n  https://$api_root/$version/account/profile/password\n"
                  },
                  {
                    "name": "python",
                    "value": "my_profile = client.account.get_profile()\nmy_profile.reset_password('hunter7')\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "account/profile/password",
            "routePath": "/reference/endpoints/account/profile/password",
            "endpoints": []
          },
          {
            "methods": [
              {
                "description": "Begin enabling TFA on your account.  Returns a two-factor secret that you must validate with the tfa-enable-confirm endpoint to require two-factor for future logins.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n  -H \"Authorization: token $TOKEN\" \\\n  -X POST \\\n  https://$api_root/$version/account/profile/tfa-enable\n"
                  },
                  {
                    "name": "python",
                    "value": "my_profile = client.account.get_profile()\nsecret = my_profile.enable_tfa()\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "account/profile/tfa-enable",
            "routePath": "/reference/endpoints/account/profile/tfa-enable",
            "endpoints": []
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
                  },
                  {
                    "name": "python",
                    "value": "my_profile = client.account.get_profile()\nmy_profile.confirm_tfa('123456')\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "account/profile/tfa-enable-confirm",
            "routePath": "/reference/endpoints/account/profile/tfa-enable-confirm",
            "endpoints": []
          },
          {
            "methods": [
              {
                "description": "Disable TFA on your account.  Future logins will not require TFA.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n  -H \"Authorization: token $TOKEN\" \\\n  -X POST \\\n  https://$api_root/$version/account/profile/tfa-disable\n"
                  },
                  {
                    "name": "python",
                    "value": "my_profile = client.account.get_profile()\nmy_profile.disable_tfa()\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "account/profile/tfa-disable",
            "routePath": "/reference/endpoints/account/profile/tfa-disable",
            "endpoints": []
          },
          {
            "methods": [
              {
                "description": "Get grants for the current user.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n    https://$api_root/$version/account/profile/grants\n"
                  },
                  {
                    "name": "python",
                    "value": "my_profile = client.account.get_profile()\nmy_grants = my_profile.grants\n"
                  }
                ],
                "name": "GET"
              }
            ],
            "path": "account/profile/grants",
            "routePath": "/reference/endpoints/account/profile/grants",
            "endpoints": []
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
                  },
                  {
                    "name": "python",
                    "value": "my_tokens = client.account.get_tokens()\n"
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
                      "value": 123,
                      "schema": null
                    },
                    {
                      "name": "client",
                      "description": "The OAuthClient this token is associated with, or null if this is a Personal Access Token.\n",
                      "type": "oauthclient",
                      "value": null,
                      "schema": [
                        {
                          "name": "id",
                          "description": "This application's OAuth client ID",
                          "type": "string",
                          "value": "0123456789abcdef0123",
                          "schema": null
                        },
                        {
                          "name": "name",
                          "description": "Human-friendly client name.",
                          "editable": true,
                          "filterable": true,
                          "type": "string",
                          "value": "Example OAuth app",
                          "schema": null
                        },
                        {
                          "name": "secret",
                          "description": "The app's client secret, used in the OAuth flow. Visible only on app creation.",
                          "type": "string",
                          "value": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
                          "schema": null
                        },
                        {
                          "name": "redirect_uri",
                          "description": "The URL to redirect to after the OAuth flow.",
                          "editable": true,
                          "type": "string",
                          "value": "https://oauthreturn.example.org/",
                          "schema": null
                        },
                        {
                          "name": "status",
                          "description": "The status of the client application.",
                          "type": "enum",
                          "subType": "Status",
                          "value": "active",
                          "schema": null
                        }
                      ]
                    },
                    {
                      "name": "type",
                      "description": "If this is a Client Token or a Personal Access Token.\n",
                      "type": "enum",
                      "subType": "OAuthTokenType",
                      "value": "personal_access_token",
                      "schema": [
                        {
                          "name": "client_token",
                          "description": "A token created by a client application with an OAuth Authentication flow."
                        },
                        {
                          "name": "personal_access_token",
                          "description": "A token created through the API for use without a client application."
                        }
                      ]
                    },
                    {
                      "name": "scopes",
                      "description": "The OAuth Scopes this token has.\n",
                      "type": "string",
                      "value": "*",
                      "schema": null
                    },
                    {
                      "name": "label",
                      "description": "The label given to this token.\n",
                      "type": "string",
                      "value": "cli-token",
                      "schema": null
                    },
                    {
                      "name": "created",
                      "type": "datetime",
                      "value": "2017-01-01T13:46:32.000Z",
                      "schema": null
                    },
                    {
                      "name": "token",
                      "description": "The OAuth Token that you can use in API requests.  Except for the inital creation of the token, this field is truncated to 16 characters.\n",
                      "type": "string",
                      "value": "cd224292c853fe27...",
                      "schema": null
                    },
                    {
                      "name": "expiry",
                      "description": "When this token expires.\n",
                      "type": "datetime",
                      "value": "2018-01-01T13:46:32.000Z",
                      "schema": null
                    }
                  ],
                  "enums": {
                    "OAuthTokenType": {
                      "client_token": "A token created by a client application with an OAuth Authentication flow.",
                      "personal_access_token": "A token created through the API for use without a client application."
                    }
                  },
                  "example": {
                    "id": 123,
                    "client": null,
                    "type": "personal_access_token",
                    "scopes": "*",
                    "label": "cli-token",
                    "created": "2017-01-01T13:46:32.000Z",
                    "token": "cd224292c853fe27...",
                    "expiry": "2018-01-01T13:46:32.000Z"
                  }
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
                  },
                  {
                    "name": "python",
                    "value": "from linode import OAuthScopes\nnew_token = client.account.create_personal_access_token(scopes=[OAuthScopes.Linodes.view, OAuthScopes.Domains.view])\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "account/tokens",
            "routePath": "/reference/endpoints/account/tokens",
            "endpoints": []
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
                  },
                  {
                    "name": "python",
                    "value": "my_token = linode.OAuthToken(client, 123)\n"
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
                      "value": 123,
                      "schema": null
                    },
                    {
                      "name": "client",
                      "description": "The OAuthClient this token is associated with, or null if this is a Personal Access Token.\n",
                      "type": "oauthclient",
                      "value": null,
                      "schema": [
                        {
                          "name": "id",
                          "description": "This application's OAuth client ID",
                          "type": "string",
                          "value": "0123456789abcdef0123",
                          "schema": null
                        },
                        {
                          "name": "name",
                          "description": "Human-friendly client name.",
                          "editable": true,
                          "filterable": true,
                          "type": "string",
                          "value": "Example OAuth app",
                          "schema": null
                        },
                        {
                          "name": "secret",
                          "description": "The app's client secret, used in the OAuth flow. Visible only on app creation.",
                          "type": "string",
                          "value": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
                          "schema": null
                        },
                        {
                          "name": "redirect_uri",
                          "description": "The URL to redirect to after the OAuth flow.",
                          "editable": true,
                          "type": "string",
                          "value": "https://oauthreturn.example.org/",
                          "schema": null
                        },
                        {
                          "name": "status",
                          "description": "The status of the client application.",
                          "type": "enum",
                          "subType": "Status",
                          "value": "active",
                          "schema": null
                        }
                      ]
                    },
                    {
                      "name": "type",
                      "description": "If this is a Client Token or a Personal Access Token.\n",
                      "type": "enum",
                      "subType": "OAuthTokenType",
                      "value": "personal_access_token",
                      "schema": [
                        {
                          "name": "client_token",
                          "description": "A token created by a client application with an OAuth Authentication flow."
                        },
                        {
                          "name": "personal_access_token",
                          "description": "A token created through the API for use without a client application."
                        }
                      ]
                    },
                    {
                      "name": "scopes",
                      "description": "The OAuth Scopes this token has.\n",
                      "type": "string",
                      "value": "*",
                      "schema": null
                    },
                    {
                      "name": "label",
                      "description": "The label given to this token.\n",
                      "type": "string",
                      "value": "cli-token",
                      "schema": null
                    },
                    {
                      "name": "created",
                      "type": "datetime",
                      "value": "2017-01-01T13:46:32.000Z",
                      "schema": null
                    },
                    {
                      "name": "token",
                      "description": "The OAuth Token that you can use in API requests.  Except for the inital creation of the token, this field is truncated to 16 characters.\n",
                      "type": "string",
                      "value": "cd224292c853fe27...",
                      "schema": null
                    },
                    {
                      "name": "expiry",
                      "description": "When this token expires.\n",
                      "type": "datetime",
                      "value": "2018-01-01T13:46:32.000Z",
                      "schema": null
                    }
                  ],
                  "enums": {
                    "OAuthTokenType": {
                      "client_token": "A token created by a client application with an OAuth Authentication flow.",
                      "personal_access_token": "A token created through the API for use without a client application."
                    }
                  },
                  "example": {
                    "id": 123,
                    "client": null,
                    "type": "personal_access_token",
                    "scopes": "*",
                    "label": "cli-token",
                    "created": "2017-01-01T13:46:32.000Z",
                    "token": "cd224292c853fe27...",
                    "expiry": "2018-01-01T13:46:32.000Z"
                  }
                }
              },
              {
                "oauth": "tokens:modify",
                "description": "Edit a token's label.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X PUT -d '{\n      \"label\": \"test-new-label\"\n    }' \\\n    https://$api_root/$version/account/tokens/123\n"
                  },
                  {
                    "name": "python",
                    "value": "my_token.label = 'test-new-label'\nmy_token.save()\n"
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
                  },
                  {
                    "name": "python",
                    "value": "my_token.delete()\n"
                  }
                ],
                "name": "DELETE"
              }
            ],
            "path": "account/tokens/:id",
            "routePath": "/reference/endpoints/account/tokens/:id",
            "endpoints": []
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
                  },
                  {
                    "name": "python",
                    "value": "my_settings = client.account.get_settings()\n"
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
                      "value": "example_user",
                      "schema": null
                    },
                    {
                      "name": "email",
                      "description": "The email address of the user.\n",
                      "editable": true,
                      "type": "string",
                      "value": "person@place.com",
                      "schema": null
                    },
                    {
                      "name": "timezone",
                      "description": "The selected timezone of the user location.",
                      "editable": true,
                      "type": "string",
                      "value": "US/Eastern",
                      "schema": null
                    },
                    {
                      "name": "email_notifications",
                      "description": "Toggles to determine if the user receives email notifications",
                      "editable": true,
                      "type": "boolean",
                      "value": true,
                      "schema": null
                    },
                    {
                      "name": "referrals",
                      "description": "Displays information related to referral signups attributed to the user.\n",
                      "schema": [
                        {
                          "name": "code",
                          "description": "an alphanumeric code unique to each user for use in creating referral URLs.",
                          "type": "string",
                          "value": "rcg3340777c21fa49a5beb971ca1aec44bc584333",
                          "schema": null
                        },
                        {
                          "name": "url",
                          "description": "referral URL based on `code`.",
                          "type": "string",
                          "value": "https://www.linode.com/?r=rcg3340777c21fa49a5beb971ca1aec44bc584333",
                          "schema": null
                        },
                        {
                          "name": "total",
                          "description": "total number of referrals attributed to user.",
                          "type": "integer",
                          "value": 10,
                          "schema": null
                        },
                        {
                          "name": "completed",
                          "description": "total number of referrals attributed to user that have converted to full accounts.",
                          "type": "integer",
                          "value": 8,
                          "schema": null
                        },
                        {
                          "name": "pending",
                          "description": "total number of referrals attributed to user that have not yet converted to full accounts.",
                          "type": "integer",
                          "value": 2,
                          "schema": null
                        },
                        {
                          "name": "credit",
                          "description": "dollar amount of credit based on completed referrals.",
                          "type": "integer",
                          "value": 160,
                          "schema": null
                        }
                      ]
                    },
                    {
                      "name": "ip_whitelist_enabled",
                      "description": "When enabled, you can only log in from an IP address on your whitelist.\n",
                      "editable": true,
                      "type": "boolean",
                      "value": true,
                      "schema": null
                    },
                    {
                      "name": "lish_auth_method",
                      "description": "Controls what authentication methods are allowed to connect to the Lish console servers.\n",
                      "editable": true,
                      "type": "enum",
                      "subType": "LishSetting",
                      "value": "password_keys",
                      "schema": [
                        {
                          "name": "password_keys",
                          "description": "Allow both password and key authentication"
                        },
                        {
                          "name": "keys_only",
                          "description": "Allow key authentication only"
                        },
                        {
                          "name": "disabled",
                          "description": "Disable Lish"
                        }
                      ]
                    },
                    {
                      "name": "authorized_keys",
                      "description": "Comma-delimited list of authorized SSH public keys",
                      "editable": true,
                      "type": "string",
                      "value": "ssh-rsa AADDDDB3NzaC1yc2EAAAADAQABAAACAQDzP5sZlvUR9nZPy0WrklktNXffq+nQoEYUdVJ0hpIzZs+KqjZ3CDbsJZF0g0pn1/gpY9oSEeXzFpWasdkjlfasdf09asldf+O+y8w6rbPe8IyP1mext4cmBe6g/nHAjw/k0rS6cuUFZu++snG0qubymE9gMZ3X0ac92TP7tk0dEwq1fbjumhqNmNyqSbt5j8pLuLRhYHhVszmwnuKjeGjm9mJLJGnd5V6IdZWEIhCjrNgNr1H+fVNI87ryFE31i/i/bnHcbnkNdAmDc2EQ2gJ33vXg8D8Nf2aI+K+e3t9MiFVTJmzAILQpvZQj2YV4mfOt+GSTUJ4VdgH9dNC/3lA0yoP6YoFYw0cdTKhJ0MotmR9iZepbJfbuXxAFOECJuC1bxFtUam3fIsGqj3vXi1R6CzRzxNERqPGLiFcXH8z0VTwXA1v+iflVd4KqihnwNtU+45TXTtFY0twLQRauB9qo9slvnhYlHqQZb8SBYw5WltX3MBQpyLTSZLQLqIKZVgQRKKF413fT52vMF54zk5SpImm5qY5Q1E4od00UJ1x4kFe0fTUQWVgeYvL8AgFx/idUsVs9r3jRPVTUnQZNB2D+7Cyf9dUFjjpiuH3AMMZyRYfJbh/Chg8J6QXYZyEQCxMRa9/lm2rRCVfGbcfb5zgKsV/HRHI/O1F9cZ9JvykwQ== someguy@someplace.com",
                      "schema": null
                    },
                    {
                      "name": "two_factor_auth",
                      "description": "Toggles whether two factor authentication (TFA) is enabled or disabled.",
                      "editable": true,
                      "type": "boolean",
                      "value": true,
                      "schema": null
                    }
                  ],
                  "enums": {
                    "LishSetting": {
                      "password_keys": "Allow both password and key authentication",
                      "keys_only": "Allow key authentication only",
                      "disabled": "Disable Lish"
                    }
                  },
                  "example": {
                    "username": "example_user",
                    "email": "person@place.com",
                    "timezone": "US/Eastern",
                    "email_notifications": true,
                    "referrals": {
                      "code": "rcg3340777c21fa49a5beb971ca1aec44bc584333",
                      "url": "https://www.linode.com/?r=rcg3340777c21fa49a5beb971ca1aec44bc584333",
                      "total": 10,
                      "completed": 8,
                      "pending": 2,
                      "credit": 160
                    },
                    "ip_whitelist_enabled": true,
                    "lish_auth_method": "password_keys",
                    "authorized_keys": "ssh-rsa AADDDDB3NzaC1yc2EAAAADAQABAAACAQDzP5sZlvUR9nZPy0WrklktNXffq+nQoEYUdVJ0hpIzZs+KqjZ3CDbsJZF0g0pn1/gpY9oSEeXzFpWasdkjlfasdf09asldf+O+y8w6rbPe8IyP1mext4cmBe6g/nHAjw/k0rS6cuUFZu++snG0qubymE9gMZ3X0ac92TP7tk0dEwq1fbjumhqNmNyqSbt5j8pLuLRhYHhVszmwnuKjeGjm9mJLJGnd5V6IdZWEIhCjrNgNr1H+fVNI87ryFE31i/i/bnHcbnkNdAmDc2EQ2gJ33vXg8D8Nf2aI+K+e3t9MiFVTJmzAILQpvZQj2YV4mfOt+GSTUJ4VdgH9dNC/3lA0yoP6YoFYw0cdTKhJ0MotmR9iZepbJfbuXxAFOECJuC1bxFtUam3fIsGqj3vXi1R6CzRzxNERqPGLiFcXH8z0VTwXA1v+iflVd4KqihnwNtU+45TXTtFY0twLQRauB9qo9slvnhYlHqQZb8SBYw5WltX3MBQpyLTSZLQLqIKZVgQRKKF413fT52vMF54zk5SpImm5qY5Q1E4od00UJ1x4kFe0fTUQWVgeYvL8AgFx/idUsVs9r3jRPVTUnQZNB2D+7Cyf9dUFjjpiuH3AMMZyRYfJbh/Chg8J6QXYZyEQCxMRa9/lm2rRCVfGbcfb5zgKsV/HRHI/O1F9cZ9JvykwQ== someguy@someplace.com",
                    "two_factor_auth": true
                  }
                }
              },
              {
                "description": "Edits your account settings.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X PUT -d '{\n      \"address_1\": \"123 Main St.\",\n      \"address_2\": \"Suite 101\",\n      \"city\": \"Philadelphia\",\n      \"company\": \"My Company, LLC\",\n      \"country\": \"US\",\n      \"email\": \"jsmith@mycompany.com\",\n      \"first_name\": \"John\",\n      \"last_name\": \"Smith\",\n      \"network_helper\": true,\n      \"phone\": \"555-555-1212\",\n      \"state\": \"PA\",\n      \"zip\": 19102\n      }\n    }' \\\n    https://$api_root/$version/account/settings\n"
                  },
                  {
                    "name": "python",
                    "value": "my_settings = client.account.get_settings()\nmy_settings.address_1 = '123 Main St.'\nmy_settings.address_2 = 'Suite 101'\nmy_settings.city = 'Philadelphia'\nmy_settings.company = 'My Company, LLC'\nmy_settings.country = 'US'\nmy_settings.email = 'jsmith@company.com'\nmy_settings.save()\n"
                  }
                ],
                "name": "PUT"
              }
            ],
            "path": "account/settings",
            "routePath": "/reference/endpoints/account/settings",
            "endpoints": []
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
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n    https://$api_root/$version/account/clients\n"
                  },
                  {
                    "name": "python",
                    "value": "my_clients = client.account.get_oauth_clients()\n"
                  }
                ],
                "name": "GET",
                "resource": {
                  "name": "Client",
                  "description": "Client objects describe an OAuth client application owned by your account.\n",
                  "schema": [
                    {
                      "name": "id",
                      "description": "This application's OAuth client ID",
                      "type": "string",
                      "value": "0123456789abcdef0123",
                      "schema": null
                    },
                    {
                      "name": "name",
                      "description": "Human-friendly client name.",
                      "editable": true,
                      "filterable": true,
                      "type": "string",
                      "value": "Example OAuth app",
                      "schema": null
                    },
                    {
                      "name": "secret",
                      "description": "The app's client secret, used in the OAuth flow. Visible only on app creation.",
                      "type": "string",
                      "value": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
                      "schema": null
                    },
                    {
                      "name": "redirect_uri",
                      "description": "The URL to redirect to after the OAuth flow.",
                      "editable": true,
                      "type": "string",
                      "value": "https://oauthreturn.example.org/",
                      "schema": null
                    },
                    {
                      "name": "status",
                      "description": "The status of the client application.",
                      "type": "enum",
                      "subType": "Status",
                      "value": "active",
                      "schema": [
                        {
                          "name": "active",
                          "description": "The client application is active and accepting OAuth logins."
                        },
                        {
                          "name": "suspended",
                          "description": "The client application is not accepting OAuth logins."
                        }
                      ]
                    }
                  ],
                  "enums": {
                    "Status": {
                      "active": "The client application is active and accepting OAuth logins.",
                      "suspended": "The client application is not accepting OAuth logins."
                    }
                  },
                  "example": {
                    "id": "0123456789abcdef0123",
                    "name": "Example OAuth app",
                    "secret": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
                    "redirect_uri": "https://oauthreturn.example.org/",
                    "status": "active"
                  }
                }
              },
              {
                "oauth": "clients:create",
                "description": "Registers a new OAuth client application.\n",
                "params": [
                  {
                    "description": "A name for the new client application.",
                    "type": "string",
                    "limit": "1-128 characters",
                    "name": "label"
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
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\n        \"label\": \"Example app\",\n        \"redirect_uri\": \"https://oauthreturn.example.org/\",\n    }' \\\n    https://$api_root/$version/account/clients\n"
                  },
                  {
                    "name": "python",
                    "value": "new_client = client.account.create_oauth_client('Example app', 'https://oauthreturn.example.org/')\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "account/clients",
            "routePath": "/reference/endpoints/account/clients",
            "endpoints": []
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
                  },
                  {
                    "name": "python",
                    "value": "my_client = linode.OAuthClient(client, 123)\n"
                  }
                ],
                "name": "GET",
                "resource": {
                  "name": "Client",
                  "description": "Client objects describe an OAuth client application owned by your account.\n",
                  "schema": [
                    {
                      "name": "id",
                      "description": "This application's OAuth client ID",
                      "type": "string",
                      "value": "0123456789abcdef0123",
                      "schema": null
                    },
                    {
                      "name": "name",
                      "description": "Human-friendly client name.",
                      "editable": true,
                      "filterable": true,
                      "type": "string",
                      "value": "Example OAuth app",
                      "schema": null
                    },
                    {
                      "name": "secret",
                      "description": "The app's client secret, used in the OAuth flow. Visible only on app creation.",
                      "type": "string",
                      "value": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
                      "schema": null
                    },
                    {
                      "name": "redirect_uri",
                      "description": "The URL to redirect to after the OAuth flow.",
                      "editable": true,
                      "type": "string",
                      "value": "https://oauthreturn.example.org/",
                      "schema": null
                    },
                    {
                      "name": "status",
                      "description": "The status of the client application.",
                      "type": "enum",
                      "subType": "Status",
                      "value": "active",
                      "schema": [
                        {
                          "name": "active",
                          "description": "The client application is active and accepting OAuth logins."
                        },
                        {
                          "name": "suspended",
                          "description": "The client application is not accepting OAuth logins."
                        }
                      ]
                    }
                  ],
                  "enums": {
                    "Status": {
                      "active": "The client application is active and accepting OAuth logins.",
                      "suspended": "The client application is not accepting OAuth logins."
                    }
                  },
                  "example": {
                    "id": "0123456789abcdef0123",
                    "name": "Example OAuth app",
                    "secret": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
                    "redirect_uri": "https://oauthreturn.example.org/",
                    "status": "active"
                  }
                }
              },
              {
                "oauth": "clients:modify",
                "description": "Edits this OAuth client.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X PUT -d '{\n        \"name\": \"Updated app name\",\n        \"redirect_uri\": \"https://newredirect.example.org/\",\n    }' \\\n    https://$api_root/$version/account/clients/$client_id\n"
                  },
                  {
                    "name": "python",
                    "value": "my_client.name = 'Updated app name'\nmy_client.save()\n"
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
                  },
                  {
                    "name": "python",
                    "value": "my_client = linode.OAuthClient(client, 123)\nmy_client.delete()\n"
                  }
                ],
                "name": "DELETE"
              }
            ],
            "path": "account/clients/:id",
            "routePath": "/reference/endpoints/account/clients/:id",
            "endpoints": []
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
                  },
                  {
                    "name": "python",
                    "value": "my_client = linode.OAuthClient(client, 123)\nnew_secret = my_client.reset_secret()\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "account/clients/:id/reset_secret",
            "routePath": "/reference/endpoints/account/clients/:id/reset_secret",
            "endpoints": []
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
                  },
                  {
                    "name": "python",
                    "value": "img = my_client.get_thumbnail()\n\n# save image to file\nmy_client.get_thumbnail('client_thumbnail.png')\n"
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
                  },
                  {
                    "name": "python",
                    "value": "my_client = linode.OAuthClient(client, 123)\nmy_client.set_thumbnail('/path/to/image')\n\n# set from memory\nwith open('/path/to/image', 'rb') as f:\n    img = f.read()\nmy_client.set_thumbnail(img)\n"
                  }
                ],
                "name": "PUT"
              }
            ],
            "path": "account/clients/:id/thumbnail",
            "routePath": "/reference/endpoints/account/clients/:id/thumbnail",
            "endpoints": []
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
                  },
                  {
                    "name": "python",
                    "value": "my_users = client.account.get_users()\n"
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
                      "value": "example_user",
                      "schema": null
                    },
                    {
                      "name": "email",
                      "description": "The email address of the user.\n",
                      "editable": true,
                      "type": "string",
                      "value": "person@place.com",
                      "schema": null
                    },
                    {
                      "name": "timezone",
                      "description": "The selected timezone of the user location.",
                      "editable": true,
                      "type": "string",
                      "value": "US/Eastern",
                      "schema": null
                    },
                    {
                      "name": "email_notifications",
                      "description": "Toggles to determine if the user receives email notifications",
                      "editable": true,
                      "type": "boolean",
                      "value": true,
                      "schema": null
                    },
                    {
                      "name": "referrals",
                      "description": "Displays information related to referral signups attributed to the user.\n",
                      "schema": [
                        {
                          "name": "code",
                          "description": "an alphanumeric code unique to each user for use in creating referral URLs.",
                          "type": "string",
                          "value": "rcg3340777c21fa49a5beb971ca1aec44bc584333",
                          "schema": null
                        },
                        {
                          "name": "url",
                          "description": "referral URL based on `code`.",
                          "type": "string",
                          "value": "https://www.linode.com/?r=rcg3340777c21fa49a5beb971ca1aec44bc584333",
                          "schema": null
                        },
                        {
                          "name": "total",
                          "description": "total number of referrals attributed to user.",
                          "type": "integer",
                          "value": 10,
                          "schema": null
                        },
                        {
                          "name": "completed",
                          "description": "total number of referrals attributed to user that have converted to full accounts.",
                          "type": "integer",
                          "value": 8,
                          "schema": null
                        },
                        {
                          "name": "pending",
                          "description": "total number of referrals attributed to user that have not yet converted to full accounts.",
                          "type": "integer",
                          "value": 2,
                          "schema": null
                        },
                        {
                          "name": "credit",
                          "description": "dollar amount of credit based on completed referrals.",
                          "type": "integer",
                          "value": 160,
                          "schema": null
                        }
                      ]
                    },
                    {
                      "name": "ip_whitelist_enabled",
                      "description": "When enabled, you can only log in from an IP address on your whitelist.\n",
                      "editable": true,
                      "type": "boolean",
                      "value": true,
                      "schema": null
                    },
                    {
                      "name": "lish_auth_method",
                      "description": "Controls what authentication methods are allowed to connect to the Lish console servers.\n",
                      "editable": true,
                      "type": "enum",
                      "subType": "LishSetting",
                      "value": "password_keys",
                      "schema": [
                        {
                          "name": "password_keys",
                          "description": "Allow both password and key authentication"
                        },
                        {
                          "name": "keys_only",
                          "description": "Allow key authentication only"
                        },
                        {
                          "name": "disabled",
                          "description": "Disable Lish"
                        }
                      ]
                    },
                    {
                      "name": "authorized_keys",
                      "description": "Comma-delimited list of authorized SSH public keys",
                      "editable": true,
                      "type": "string",
                      "value": "ssh-rsa AADDDDB3NzaC1yc2EAAAADAQABAAACAQDzP5sZlvUR9nZPy0WrklktNXffq+nQoEYUdVJ0hpIzZs+KqjZ3CDbsJZF0g0pn1/gpY9oSEeXzFpWasdkjlfasdf09asldf+O+y8w6rbPe8IyP1mext4cmBe6g/nHAjw/k0rS6cuUFZu++snG0qubymE9gMZ3X0ac92TP7tk0dEwq1fbjumhqNmNyqSbt5j8pLuLRhYHhVszmwnuKjeGjm9mJLJGnd5V6IdZWEIhCjrNgNr1H+fVNI87ryFE31i/i/bnHcbnkNdAmDc2EQ2gJ33vXg8D8Nf2aI+K+e3t9MiFVTJmzAILQpvZQj2YV4mfOt+GSTUJ4VdgH9dNC/3lA0yoP6YoFYw0cdTKhJ0MotmR9iZepbJfbuXxAFOECJuC1bxFtUam3fIsGqj3vXi1R6CzRzxNERqPGLiFcXH8z0VTwXA1v+iflVd4KqihnwNtU+45TXTtFY0twLQRauB9qo9slvnhYlHqQZb8SBYw5WltX3MBQpyLTSZLQLqIKZVgQRKKF413fT52vMF54zk5SpImm5qY5Q1E4od00UJ1x4kFe0fTUQWVgeYvL8AgFx/idUsVs9r3jRPVTUnQZNB2D+7Cyf9dUFjjpiuH3AMMZyRYfJbh/Chg8J6QXYZyEQCxMRa9/lm2rRCVfGbcfb5zgKsV/HRHI/O1F9cZ9JvykwQ== someguy@someplace.com",
                      "schema": null
                    },
                    {
                      "name": "two_factor_auth",
                      "description": "Toggles whether two factor authentication (TFA) is enabled or disabled.",
                      "editable": true,
                      "type": "boolean",
                      "value": true,
                      "schema": null
                    }
                  ],
                  "enums": {
                    "LishSetting": {
                      "password_keys": "Allow both password and key authentication",
                      "keys_only": "Allow key authentication only",
                      "disabled": "Disable Lish"
                    }
                  },
                  "example": {
                    "username": "example_user",
                    "email": "person@place.com",
                    "timezone": "US/Eastern",
                    "email_notifications": true,
                    "referrals": {
                      "code": "rcg3340777c21fa49a5beb971ca1aec44bc584333",
                      "url": "https://www.linode.com/?r=rcg3340777c21fa49a5beb971ca1aec44bc584333",
                      "total": 10,
                      "completed": 8,
                      "pending": 2,
                      "credit": 160
                    },
                    "ip_whitelist_enabled": true,
                    "lish_auth_method": "password_keys",
                    "authorized_keys": "ssh-rsa AADDDDB3NzaC1yc2EAAAADAQABAAACAQDzP5sZlvUR9nZPy0WrklktNXffq+nQoEYUdVJ0hpIzZs+KqjZ3CDbsJZF0g0pn1/gpY9oSEeXzFpWasdkjlfasdf09asldf+O+y8w6rbPe8IyP1mext4cmBe6g/nHAjw/k0rS6cuUFZu++snG0qubymE9gMZ3X0ac92TP7tk0dEwq1fbjumhqNmNyqSbt5j8pLuLRhYHhVszmwnuKjeGjm9mJLJGnd5V6IdZWEIhCjrNgNr1H+fVNI87ryFE31i/i/bnHcbnkNdAmDc2EQ2gJ33vXg8D8Nf2aI+K+e3t9MiFVTJmzAILQpvZQj2YV4mfOt+GSTUJ4VdgH9dNC/3lA0yoP6YoFYw0cdTKhJ0MotmR9iZepbJfbuXxAFOECJuC1bxFtUam3fIsGqj3vXi1R6CzRzxNERqPGLiFcXH8z0VTwXA1v+iflVd4KqihnwNtU+45TXTtFY0twLQRauB9qo9slvnhYlHqQZb8SBYw5WltX3MBQpyLTSZLQLqIKZVgQRKKF413fT52vMF54zk5SpImm5qY5Q1E4od00UJ1x4kFe0fTUQWVgeYvL8AgFx/idUsVs9r3jRPVTUnQZNB2D+7Cyf9dUFjjpiuH3AMMZyRYfJbh/Chg8J6QXYZyEQCxMRa9/lm2rRCVfGbcfb5zgKsV/HRHI/O1F9cZ9JvykwQ== someguy@someplace.com",
                    "two_factor_auth": true
                  }
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
                  },
                  {
                    "name": "python",
                    "value": "# currently unimplemented\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "account/users",
            "routePath": "/reference/endpoints/account/users",
            "endpoints": []
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
                  },
                  {
                    "name": "python",
                    "value": "my_user = linode.User(client, 'username')\n"
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
                      "value": "example_user",
                      "schema": null
                    },
                    {
                      "name": "email",
                      "description": "The email address of the user.\n",
                      "editable": true,
                      "type": "string",
                      "value": "person@place.com",
                      "schema": null
                    },
                    {
                      "name": "timezone",
                      "description": "The selected timezone of the user location.",
                      "editable": true,
                      "type": "string",
                      "value": "US/Eastern",
                      "schema": null
                    },
                    {
                      "name": "email_notifications",
                      "description": "Toggles to determine if the user receives email notifications",
                      "editable": true,
                      "type": "boolean",
                      "value": true,
                      "schema": null
                    },
                    {
                      "name": "referrals",
                      "description": "Displays information related to referral signups attributed to the user.\n",
                      "schema": [
                        {
                          "name": "code",
                          "description": "an alphanumeric code unique to each user for use in creating referral URLs.",
                          "type": "string",
                          "value": "rcg3340777c21fa49a5beb971ca1aec44bc584333",
                          "schema": null
                        },
                        {
                          "name": "url",
                          "description": "referral URL based on `code`.",
                          "type": "string",
                          "value": "https://www.linode.com/?r=rcg3340777c21fa49a5beb971ca1aec44bc584333",
                          "schema": null
                        },
                        {
                          "name": "total",
                          "description": "total number of referrals attributed to user.",
                          "type": "integer",
                          "value": 10,
                          "schema": null
                        },
                        {
                          "name": "completed",
                          "description": "total number of referrals attributed to user that have converted to full accounts.",
                          "type": "integer",
                          "value": 8,
                          "schema": null
                        },
                        {
                          "name": "pending",
                          "description": "total number of referrals attributed to user that have not yet converted to full accounts.",
                          "type": "integer",
                          "value": 2,
                          "schema": null
                        },
                        {
                          "name": "credit",
                          "description": "dollar amount of credit based on completed referrals.",
                          "type": "integer",
                          "value": 160,
                          "schema": null
                        }
                      ]
                    },
                    {
                      "name": "ip_whitelist_enabled",
                      "description": "When enabled, you can only log in from an IP address on your whitelist.\n",
                      "editable": true,
                      "type": "boolean",
                      "value": true,
                      "schema": null
                    },
                    {
                      "name": "lish_auth_method",
                      "description": "Controls what authentication methods are allowed to connect to the Lish console servers.\n",
                      "editable": true,
                      "type": "enum",
                      "subType": "LishSetting",
                      "value": "password_keys",
                      "schema": [
                        {
                          "name": "password_keys",
                          "description": "Allow both password and key authentication"
                        },
                        {
                          "name": "keys_only",
                          "description": "Allow key authentication only"
                        },
                        {
                          "name": "disabled",
                          "description": "Disable Lish"
                        }
                      ]
                    },
                    {
                      "name": "authorized_keys",
                      "description": "Comma-delimited list of authorized SSH public keys",
                      "editable": true,
                      "type": "string",
                      "value": "ssh-rsa AADDDDB3NzaC1yc2EAAAADAQABAAACAQDzP5sZlvUR9nZPy0WrklktNXffq+nQoEYUdVJ0hpIzZs+KqjZ3CDbsJZF0g0pn1/gpY9oSEeXzFpWasdkjlfasdf09asldf+O+y8w6rbPe8IyP1mext4cmBe6g/nHAjw/k0rS6cuUFZu++snG0qubymE9gMZ3X0ac92TP7tk0dEwq1fbjumhqNmNyqSbt5j8pLuLRhYHhVszmwnuKjeGjm9mJLJGnd5V6IdZWEIhCjrNgNr1H+fVNI87ryFE31i/i/bnHcbnkNdAmDc2EQ2gJ33vXg8D8Nf2aI+K+e3t9MiFVTJmzAILQpvZQj2YV4mfOt+GSTUJ4VdgH9dNC/3lA0yoP6YoFYw0cdTKhJ0MotmR9iZepbJfbuXxAFOECJuC1bxFtUam3fIsGqj3vXi1R6CzRzxNERqPGLiFcXH8z0VTwXA1v+iflVd4KqihnwNtU+45TXTtFY0twLQRauB9qo9slvnhYlHqQZb8SBYw5WltX3MBQpyLTSZLQLqIKZVgQRKKF413fT52vMF54zk5SpImm5qY5Q1E4od00UJ1x4kFe0fTUQWVgeYvL8AgFx/idUsVs9r3jRPVTUnQZNB2D+7Cyf9dUFjjpiuH3AMMZyRYfJbh/Chg8J6QXYZyEQCxMRa9/lm2rRCVfGbcfb5zgKsV/HRHI/O1F9cZ9JvykwQ== someguy@someplace.com",
                      "schema": null
                    },
                    {
                      "name": "two_factor_auth",
                      "description": "Toggles whether two factor authentication (TFA) is enabled or disabled.",
                      "editable": true,
                      "type": "boolean",
                      "value": true,
                      "schema": null
                    }
                  ],
                  "enums": {
                    "LishSetting": {
                      "password_keys": "Allow both password and key authentication",
                      "keys_only": "Allow key authentication only",
                      "disabled": "Disable Lish"
                    }
                  },
                  "example": {
                    "username": "example_user",
                    "email": "person@place.com",
                    "timezone": "US/Eastern",
                    "email_notifications": true,
                    "referrals": {
                      "code": "rcg3340777c21fa49a5beb971ca1aec44bc584333",
                      "url": "https://www.linode.com/?r=rcg3340777c21fa49a5beb971ca1aec44bc584333",
                      "total": 10,
                      "completed": 8,
                      "pending": 2,
                      "credit": 160
                    },
                    "ip_whitelist_enabled": true,
                    "lish_auth_method": "password_keys",
                    "authorized_keys": "ssh-rsa AADDDDB3NzaC1yc2EAAAADAQABAAACAQDzP5sZlvUR9nZPy0WrklktNXffq+nQoEYUdVJ0hpIzZs+KqjZ3CDbsJZF0g0pn1/gpY9oSEeXzFpWasdkjlfasdf09asldf+O+y8w6rbPe8IyP1mext4cmBe6g/nHAjw/k0rS6cuUFZu++snG0qubymE9gMZ3X0ac92TP7tk0dEwq1fbjumhqNmNyqSbt5j8pLuLRhYHhVszmwnuKjeGjm9mJLJGnd5V6IdZWEIhCjrNgNr1H+fVNI87ryFE31i/i/bnHcbnkNdAmDc2EQ2gJ33vXg8D8Nf2aI+K+e3t9MiFVTJmzAILQpvZQj2YV4mfOt+GSTUJ4VdgH9dNC/3lA0yoP6YoFYw0cdTKhJ0MotmR9iZepbJfbuXxAFOECJuC1bxFtUam3fIsGqj3vXi1R6CzRzxNERqPGLiFcXH8z0VTwXA1v+iflVd4KqihnwNtU+45TXTtFY0twLQRauB9qo9slvnhYlHqQZb8SBYw5WltX3MBQpyLTSZLQLqIKZVgQRKKF413fT52vMF54zk5SpImm5qY5Q1E4od00UJ1x4kFe0fTUQWVgeYvL8AgFx/idUsVs9r3jRPVTUnQZNB2D+7Cyf9dUFjjpiuH3AMMZyRYfJbh/Chg8J6QXYZyEQCxMRa9/lm2rRCVfGbcfb5zgKsV/HRHI/O1F9cZ9JvykwQ== someguy@someplace.com",
                    "two_factor_auth": true
                  }
                }
              },
              {
                "description": "Update a user.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X PUT -d '{\n        \"email\": \"newemail@linode.com\"\n      }\n    }' \\\n    https://$api_root/$version/account/users/testguy\n"
                  },
                  {
                    "name": "python",
                    "value": "my_user = linode.User(client, 'username')\nmy_user.email = 'newemail@linode.com'\nmy_user.save()\n"
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
                  },
                  {
                    "name": "python",
                    "value": "my_user = linode.User(client, 'username')\nmy_user.delete()\n"
                  }
                ],
                "name": "DELETE"
              }
            ],
            "path": "account/users/:username",
            "routePath": "/reference/endpoints/account/users/:username",
            "endpoints": []
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
                  },
                  {
                    "name": "python",
                    "value": "my_user = linode.User(client, 'username')\nmy_user.change_password('hunter7')\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "account/users/:username/password",
            "routePath": "/reference/endpoints/account/users/:username/password",
            "endpoints": []
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
                  },
                  {
                    "name": "python",
                    "value": "my_user = linode.User(client, 'username')\ngrants = None # unrestricted users have no grants\n\nif my_user.restricted:\n    grants = my_user.grants\n"
                  }
                ],
                "name": "GET",
                "resource": {
                  "name": "UserGrants",
                  "description": "Information about a restricted user's grants.\n",
                  "schema": [
                    {
                      "name": "global",
                      "description": "Grants involving global permissions, such as creating resources.",
                      "schema": [
                        {
                          "name": "add_linodes",
                          "description": "If this user may create Linodes.",
                          "type": "boolean",
                          "value": true,
                          "schema": null
                        },
                        {
                          "name": "add_nodebalancers",
                          "description": "If this user may create NodeBalancers.",
                          "type": "boolean",
                          "value": true,
                          "schema": null
                        },
                        {
                          "name": "add_domains",
                          "description": "If this user may create Domains.",
                          "type": "boolean",
                          "value": true,
                          "schema": null
                        },
                        {
                          "name": "add_longview",
                          "description": "If this user may create longview instances.",
                          "type": "boolean",
                          "value": true,
                          "schema": null
                        },
                        {
                          "name": "add_stackscripts",
                          "description": "If this user may create StackScripts.",
                          "type": "boolean",
                          "value": true,
                          "schema": null
                        },
                        {
                          "name": "longview_subscription",
                          "description": "If this user may manage longview subscription.",
                          "type": "boolean",
                          "value": true,
                          "schema": null
                        }
                      ]
                    },
                    {
                      "name": "customer",
                      "description": "Grants related to modifying the account.",
                      "schema": [
                        {
                          "name": "access",
                          "description": "If this user may modify the account.",
                          "type": "boolean",
                          "value": false,
                          "schema": null
                        },
                        {
                          "name": "cancel",
                          "description": "If this user may cancel the account.",
                          "type": "boolean",
                          "value": false,
                          "schema": null
                        }
                      ]
                    },
                    {
                      "name": "stackscript",
                      "description": "Individual grants to StackScripts you own.  Grants include all, use, edit and delete",
                      "type": "array",
                      "schema": null
                    },
                    {
                      "name": "nodebalancer",
                      "description": "Individual grants to NodeBalancers you own.  Grants inlcude all, access, and delete",
                      "type": "array",
                      "schema": null
                    },
                    {
                      "name": "linode",
                      "description": "Individual grants to a Linode you own.  Grants incldue all, access, resize, and delete",
                      "type": "array",
                      "value": [
                        [
                          {
                            "name": "all",
                            "type": "boolean",
                            "value": false,
                            "schema": null
                          },
                          {
                            "name": "access",
                            "type": "boolean",
                            "value": true,
                            "schema": null
                          },
                          {
                            "name": "delete",
                            "type": "boolean",
                            "value": false,
                            "schema": null
                          },
                          {
                            "name": "id",
                            "type": "integer",
                            "value": 123,
                            "schema": null
                          },
                          {
                            "name": "label",
                            "type": "string",
                            "value": "linode123",
                            "schema": null
                          }
                        ],
                        [
                          {
                            "name": "all",
                            "type": "boolean",
                            "value": true,
                            "schema": null
                          },
                          {
                            "name": "access",
                            "type": "boolean",
                            "value": false,
                            "schema": null
                          },
                          {
                            "name": "delete",
                            "type": "boolean",
                            "value": false,
                            "schema": null
                          },
                          {
                            "name": "id",
                            "type": "integer",
                            "value": 324,
                            "schema": null
                          },
                          {
                            "name": "label",
                            "type": "string",
                            "value": "linode324",
                            "schema": null
                          }
                        ]
                      ],
                      "schema": [
                        {
                          "name": "all",
                          "type": "boolean",
                          "value": false,
                          "schema": null
                        },
                        {
                          "name": "access",
                          "type": "boolean",
                          "value": true,
                          "schema": null
                        },
                        {
                          "name": "delete",
                          "type": "boolean",
                          "value": false,
                          "schema": null
                        },
                        {
                          "name": "id",
                          "type": "integer",
                          "value": 123,
                          "schema": null
                        },
                        {
                          "name": "label",
                          "type": "string",
                          "value": "linode123",
                          "schema": null
                        }
                      ]
                    },
                    {
                      "name": "domain",
                      "description": "Individual grants to a Domain you own.  Grants include all, access and delete",
                      "type": "array",
                      "schema": null
                    }
                  ],
                  "example": {
                    "global": {
                      "add_linodes": true,
                      "add_nodebalancers": true,
                      "add_domains": true,
                      "add_longview": true,
                      "add_stackscripts": true,
                      "longview_subscription": true
                    },
                    "customer": {
                      "access": false,
                      "cancel": false
                    },
                    "linode": [
                      {
                        "all": false,
                        "access": true,
                        "delete": false,
                        "id": 123,
                        "label": "linode123"
                      },
                      {
                        "all": true,
                        "access": false,
                        "delete": false,
                        "id": 324,
                        "label": "linode324"
                      }
                    ]
                  }
                }
              },
              {
                "description": "Update grants for a restricted user.\n",
                "examples": [
                  {
                    "name": "curl",
                    "value": "curl -H \"Authorization: token $TOKEN\" \\\n    -X PUT -d '{\n        \"global\": {\n            \"add_linodes\": true\n        }\n    }' \\\n    https://$api_root/$version/account/users/testguy/grants\n"
                  },
                  {
                    "name": "python",
                    "value": "my_user = linode.User(client, 'username')\nassert my_user.restricted # we can't set grants for unrestricted users\n\nmy_user.grants.global.add_linodes = True\nmy_user.grants.save()\n"
                  }
                ],
                "name": "PUT"
              }
            ],
            "path": "account/users/:username/grants",
            "routePath": "/reference/endpoints/account/users/:username/grants",
            "endpoints": []
          }
        ]
      },
      {
        "name": "Clients",
        "base_path": "/account/clients",
        "description": "Client endpoints provide a means of managing the OAuth client applications on your account.\n",
        "path": "/account",
        "methods": null,
        "endpoints": [
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
                "name": "GET",
                "resource": {
                  "name": "Client",
                  "description": "Client objects describe an OAuth client application owned by your account.\n",
                  "schema": [
                    {
                      "name": "id",
                      "description": "This application's OAuth client ID",
                      "type": "string",
                      "value": "0123456789abcdef0123",
                      "schema": null
                    },
                    {
                      "name": "name",
                      "description": "Human-friendly client name.",
                      "editable": true,
                      "filterable": true,
                      "type": "string",
                      "value": "Example OAuth app",
                      "schema": null
                    },
                    {
                      "name": "secret",
                      "description": "The app's client secret, used in the OAuth flow. Visible only on app creation.",
                      "type": "string",
                      "value": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
                      "schema": null
                    },
                    {
                      "name": "redirect_uri",
                      "description": "The URL to redirect to after the OAuth flow.",
                      "editable": true,
                      "type": "string",
                      "value": "https://oauthreturn.example.org/",
                      "schema": null
                    },
                    {
                      "name": "status",
                      "description": "The status of the client application.",
                      "type": "enum",
                      "subType": "Status",
                      "value": "active",
                      "schema": [
                        {
                          "name": "active",
                          "description": "The client application is active and accepting OAuth logins."
                        },
                        {
                          "name": "suspended",
                          "description": "The client application is not accepting OAuth logins."
                        }
                      ]
                    }
                  ],
                  "enums": {
                    "Status": {
                      "active": "The client application is active and accepting OAuth logins.",
                      "suspended": "The client application is not accepting OAuth logins."
                    }
                  },
                  "example": {
                    "id": "0123456789abcdef0123",
                    "name": "Example OAuth app",
                    "secret": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
                    "redirect_uri": "https://oauthreturn.example.org/",
                    "status": "active"
                  }
                }
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
            "path": "account/clients",
            "routePath": "/reference/endpoints/account/clients",
            "endpoints": []
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
                "name": "GET",
                "resource": {
                  "name": "Client",
                  "description": "Client objects describe an OAuth client application owned by your account.\n",
                  "schema": [
                    {
                      "name": "id",
                      "description": "This application's OAuth client ID",
                      "type": "string",
                      "value": "0123456789abcdef0123",
                      "schema": null
                    },
                    {
                      "name": "name",
                      "description": "Human-friendly client name.",
                      "editable": true,
                      "filterable": true,
                      "type": "string",
                      "value": "Example OAuth app",
                      "schema": null
                    },
                    {
                      "name": "secret",
                      "description": "The app's client secret, used in the OAuth flow. Visible only on app creation.",
                      "type": "string",
                      "value": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
                      "schema": null
                    },
                    {
                      "name": "redirect_uri",
                      "description": "The URL to redirect to after the OAuth flow.",
                      "editable": true,
                      "type": "string",
                      "value": "https://oauthreturn.example.org/",
                      "schema": null
                    },
                    {
                      "name": "status",
                      "description": "The status of the client application.",
                      "type": "enum",
                      "subType": "Status",
                      "value": "active",
                      "schema": [
                        {
                          "name": "active",
                          "description": "The client application is active and accepting OAuth logins."
                        },
                        {
                          "name": "suspended",
                          "description": "The client application is not accepting OAuth logins."
                        }
                      ]
                    }
                  ],
                  "enums": {
                    "Status": {
                      "active": "The client application is active and accepting OAuth logins.",
                      "suspended": "The client application is not accepting OAuth logins."
                    }
                  },
                  "example": {
                    "id": "0123456789abcdef0123",
                    "name": "Example OAuth app",
                    "secret": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
                    "redirect_uri": "https://oauthreturn.example.org/",
                    "status": "active"
                  }
                }
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
            "path": "account/clients/:id",
            "routePath": "/reference/endpoints/account/clients/:id",
            "endpoints": []
          }
        ]
      },
      {
        "name": "Events",
        "base_path": "/account/events",
        "description": "Event endpoints provide a means of viewing event notifications.\n",
        "path": "/account",
        "methods": null,
        "endpoints": [
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
                  },
                  {
                    "name": "python",
                    "value": "my_events = client.account.get_events()\n"
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
                      "value": 1234,
                      "schema": null
                    },
                    {
                      "name": "entity",
                      "description": "Detailed inforrmation about the event's entity, including id, type, label, and URL used to access it.\n",
                      "schema": [
                        {
                          "name": "id",
                          "description": "The entity's ID that this event is for.  This is meaningless without a type.\n",
                          "type": "integer",
                          "value": 9302,
                          "schema": null
                        },
                        {
                          "name": "label",
                          "description": "The current label of this object.  This will reflect changes in label.\n",
                          "type": "string",
                          "value": "linode123",
                          "schema": null
                        },
                        {
                          "name": "type",
                          "description": "The type of entity this is related to.\n",
                          "type": "string",
                          "value": "linode",
                          "schema": null
                        },
                        {
                          "name": "url",
                          "description": "The URL where you can access the object this event is for.  If a relative URL, it is relative to the domain you retrieved the event from.\n",
                          "type": "string",
                          "value": "/v4/linode/instances/123",
                          "schema": null
                        }
                      ]
                    },
                    {
                      "name": "action",
                      "description": "The action that caused this event.\n",
                      "type": "enum",
                      "subType": "EventType",
                      "value": "linode_reboot",
                      "schema": [
                        {
                          "name": "linode_boot",
                          "description": "Linode boot"
                        },
                        {
                          "name": "linode_create",
                          "description": "Linode create"
                        },
                        {
                          "name": "linode_delete",
                          "description": "Linode delete"
                        },
                        {
                          "name": "linode_shutdown",
                          "description": "Linode shutdown"
                        },
                        {
                          "name": "linode_reboot",
                          "description": "Linode reboot"
                        },
                        {
                          "name": "linode_snapshot",
                          "description": "Linode snapshot"
                        },
                        {
                          "name": "linode_addip",
                          "description": "Linode addip"
                        },
                        {
                          "name": "linode_migrate",
                          "description": "Linode migrate"
                        },
                        {
                          "name": "linode_rebuild",
                          "description": "Linode rebuild"
                        },
                        {
                          "name": "linode_clone",
                          "description": "Linode clone"
                        },
                        {
                          "name": "disk_create",
                          "description": "Disk create"
                        },
                        {
                          "name": "disk_delete",
                          "description": "Disk delete"
                        },
                        {
                          "name": "disk_duplicate",
                          "description": "Disk duplicate"
                        },
                        {
                          "name": "disk_resize",
                          "description": "Disk resize"
                        },
                        {
                          "name": "backups_enable",
                          "description": "Backups enable"
                        },
                        {
                          "name": "backups_cancel",
                          "description": "Backups cancel"
                        },
                        {
                          "name": "backups_restore",
                          "description": "Backups restore"
                        },
                        {
                          "name": "password_reset",
                          "description": "Password reset"
                        },
                        {
                          "name": "dns_zone_create",
                          "description": "Domain create"
                        },
                        {
                          "name": "dns_zone_delete",
                          "description": "Domain delete"
                        },
                        {
                          "name": "dns_record_create",
                          "description": "Domain Record create"
                        },
                        {
                          "name": "dns_record_delete",
                          "description": "Domain Record delete"
                        },
                        {
                          "name": "stackscript_create",
                          "description": "Stackscript create"
                        },
                        {
                          "name": "stackscript_publicize",
                          "description": "Stackscript publicize"
                        },
                        {
                          "name": "stackscript_revise",
                          "description": "Stackscript revise"
                        },
                        {
                          "name": "stackscript_delete",
                          "description": "Stackscript delete"
                        }
                      ]
                    },
                    {
                      "name": "username",
                      "description": "The username of the user who initiated this event.\n",
                      "type": "string",
                      "value": "example_user",
                      "schema": null
                    },
                    {
                      "name": "status",
                      "description": "The current status of this event.  \n",
                      "type": "enum",
                      "subType": "EventStatus",
                      "value": "finished",
                      "schema": [
                        {
                          "name": "scheduled",
                          "description": "Event has not yet started."
                        },
                        {
                          "name": "started",
                          "description": "Event is in progress."
                        },
                        {
                          "name": "finished",
                          "description": "Event is completed."
                        },
                        {
                          "name": "failed",
                          "description": "Something went wrong."
                        },
                        {
                          "name": "notification",
                          "description": "Stateless event."
                        }
                      ]
                    },
                    {
                      "name": "percent_complete",
                      "description": "A percentage estimating the amount of time remaining for an event.  Returns null for notification events.\n",
                      "filterable": false,
                      "type": "integer",
                      "value": 20,
                      "schema": null
                    },
                    {
                      "name": "rate",
                      "description": "The rate of completion of the event.  Currently only returned for migration and resize events.\n",
                      "type": "string",
                      "value": null,
                      "schema": null
                    },
                    {
                      "name": "time_remaining",
                      "description": "The estimated time remaining until the completion of this event.  Currently only returned for in progress migrations or resizes.\n",
                      "type": "string",
                      "value": null,
                      "schema": null
                    },
                    {
                      "name": "seen",
                      "description": "If this event has been seen.",
                      "type": "boolean",
                      "value": false,
                      "schema": null
                    },
                    {
                      "name": "read",
                      "description": "If this event has been read.",
                      "type": "boolean",
                      "value": false,
                      "schema": null
                    },
                    {
                      "name": "created",
                      "filterable": true,
                      "type": "datetime",
                      "value": "2014-12-24T18:00:09.000Z",
                      "schema": null
                    },
                    {
                      "name": "updated",
                      "type": "datetime",
                      "value": "2014-12-24T19:00:09.000Z",
                      "schema": null
                    },
                    {
                      "name": "user_id",
                      "description": "The ID of the user who initiated this event.\n",
                      "type": "integer",
                      "value": 234567,
                      "schema": null
                    }
                  ],
                  "enums": {
                    "EventType": {
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
                      "stackscript_delete": "Stackscript delete"
                    },
                    "EventStatus": {
                      "scheduled": "Event has not yet started.",
                      "started": "Event is in progress.",
                      "finished": "Event is completed.",
                      "failed": "Something went wrong.",
                      "notification": "Stateless event."
                    }
                  },
                  "example": {
                    "id": 1234,
                    "entity": {
                      "id": 9302,
                      "label": "linode123",
                      "type": "linode",
                      "url": "/v4/linode/instances/123"
                    },
                    "action": "linode_reboot",
                    "username": "example_user",
                    "status": "finished",
                    "percent_complete": 20,
                    "rate": null,
                    "time_remaining": null,
                    "seen": false,
                    "read": false,
                    "created": "2014-12-24T18:00:09.000Z",
                    "updated": "2014-12-24T19:00:09.000Z",
                    "user_id": 234567
                  }
                }
              }
            ],
            "path": "account/events",
            "routePath": "/reference/endpoints/account/events",
            "endpoints": []
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
                  },
                  {
                    "name": "python",
                    "value": "event = linode.Event(client, 123)\n"
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
                      "value": 1234,
                      "schema": null
                    },
                    {
                      "name": "entity",
                      "description": "Detailed inforrmation about the event's entity, including id, type, label, and URL used to access it.\n",
                      "schema": [
                        {
                          "name": "id",
                          "description": "The entity's ID that this event is for.  This is meaningless without a type.\n",
                          "type": "integer",
                          "value": 9302,
                          "schema": null
                        },
                        {
                          "name": "label",
                          "description": "The current label of this object.  This will reflect changes in label.\n",
                          "type": "string",
                          "value": "linode123",
                          "schema": null
                        },
                        {
                          "name": "type",
                          "description": "The type of entity this is related to.\n",
                          "type": "string",
                          "value": "linode",
                          "schema": null
                        },
                        {
                          "name": "url",
                          "description": "The URL where you can access the object this event is for.  If a relative URL, it is relative to the domain you retrieved the event from.\n",
                          "type": "string",
                          "value": "/v4/linode/instances/123",
                          "schema": null
                        }
                      ]
                    },
                    {
                      "name": "action",
                      "description": "The action that caused this event.\n",
                      "type": "enum",
                      "subType": "EventType",
                      "value": "linode_reboot",
                      "schema": [
                        {
                          "name": "linode_boot",
                          "description": "Linode boot"
                        },
                        {
                          "name": "linode_create",
                          "description": "Linode create"
                        },
                        {
                          "name": "linode_delete",
                          "description": "Linode delete"
                        },
                        {
                          "name": "linode_shutdown",
                          "description": "Linode shutdown"
                        },
                        {
                          "name": "linode_reboot",
                          "description": "Linode reboot"
                        },
                        {
                          "name": "linode_snapshot",
                          "description": "Linode snapshot"
                        },
                        {
                          "name": "linode_addip",
                          "description": "Linode addip"
                        },
                        {
                          "name": "linode_migrate",
                          "description": "Linode migrate"
                        },
                        {
                          "name": "linode_rebuild",
                          "description": "Linode rebuild"
                        },
                        {
                          "name": "linode_clone",
                          "description": "Linode clone"
                        },
                        {
                          "name": "disk_create",
                          "description": "Disk create"
                        },
                        {
                          "name": "disk_delete",
                          "description": "Disk delete"
                        },
                        {
                          "name": "disk_duplicate",
                          "description": "Disk duplicate"
                        },
                        {
                          "name": "disk_resize",
                          "description": "Disk resize"
                        },
                        {
                          "name": "backups_enable",
                          "description": "Backups enable"
                        },
                        {
                          "name": "backups_cancel",
                          "description": "Backups cancel"
                        },
                        {
                          "name": "backups_restore",
                          "description": "Backups restore"
                        },
                        {
                          "name": "password_reset",
                          "description": "Password reset"
                        },
                        {
                          "name": "dns_zone_create",
                          "description": "Domain create"
                        },
                        {
                          "name": "dns_zone_delete",
                          "description": "Domain delete"
                        },
                        {
                          "name": "dns_record_create",
                          "description": "Domain Record create"
                        },
                        {
                          "name": "dns_record_delete",
                          "description": "Domain Record delete"
                        },
                        {
                          "name": "stackscript_create",
                          "description": "Stackscript create"
                        },
                        {
                          "name": "stackscript_publicize",
                          "description": "Stackscript publicize"
                        },
                        {
                          "name": "stackscript_revise",
                          "description": "Stackscript revise"
                        },
                        {
                          "name": "stackscript_delete",
                          "description": "Stackscript delete"
                        }
                      ]
                    },
                    {
                      "name": "username",
                      "description": "The username of the user who initiated this event.\n",
                      "type": "string",
                      "value": "example_user",
                      "schema": null
                    },
                    {
                      "name": "status",
                      "description": "The current status of this event.  \n",
                      "type": "enum",
                      "subType": "EventStatus",
                      "value": "finished",
                      "schema": [
                        {
                          "name": "scheduled",
                          "description": "Event has not yet started."
                        },
                        {
                          "name": "started",
                          "description": "Event is in progress."
                        },
                        {
                          "name": "finished",
                          "description": "Event is completed."
                        },
                        {
                          "name": "failed",
                          "description": "Something went wrong."
                        },
                        {
                          "name": "notification",
                          "description": "Stateless event."
                        }
                      ]
                    },
                    {
                      "name": "percent_complete",
                      "description": "A percentage estimating the amount of time remaining for an event.  Returns null for notification events.\n",
                      "filterable": false,
                      "type": "integer",
                      "value": 20,
                      "schema": null
                    },
                    {
                      "name": "rate",
                      "description": "The rate of completion of the event.  Currently only returned for migration and resize events.\n",
                      "type": "string",
                      "value": null,
                      "schema": null
                    },
                    {
                      "name": "time_remaining",
                      "description": "The estimated time remaining until the completion of this event.  Currently only returned for in progress migrations or resizes.\n",
                      "type": "string",
                      "value": null,
                      "schema": null
                    },
                    {
                      "name": "seen",
                      "description": "If this event has been seen.",
                      "type": "boolean",
                      "value": false,
                      "schema": null
                    },
                    {
                      "name": "read",
                      "description": "If this event has been read.",
                      "type": "boolean",
                      "value": false,
                      "schema": null
                    },
                    {
                      "name": "created",
                      "filterable": true,
                      "type": "datetime",
                      "value": "2014-12-24T18:00:09.000Z",
                      "schema": null
                    },
                    {
                      "name": "updated",
                      "type": "datetime",
                      "value": "2014-12-24T19:00:09.000Z",
                      "schema": null
                    },
                    {
                      "name": "user_id",
                      "description": "The ID of the user who initiated this event.\n",
                      "type": "integer",
                      "value": 234567,
                      "schema": null
                    }
                  ],
                  "enums": {
                    "EventType": {
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
                      "stackscript_delete": "Stackscript delete"
                    },
                    "EventStatus": {
                      "scheduled": "Event has not yet started.",
                      "started": "Event is in progress.",
                      "finished": "Event is completed.",
                      "failed": "Something went wrong.",
                      "notification": "Stateless event."
                    }
                  },
                  "example": {
                    "id": 1234,
                    "entity": {
                      "id": 9302,
                      "label": "linode123",
                      "type": "linode",
                      "url": "/v4/linode/instances/123"
                    },
                    "action": "linode_reboot",
                    "username": "example_user",
                    "status": "finished",
                    "percent_complete": 20,
                    "rate": null,
                    "time_remaining": null,
                    "seen": false,
                    "read": false,
                    "created": "2014-12-24T18:00:09.000Z",
                    "updated": "2014-12-24T19:00:09.000Z",
                    "user_id": 234567
                  }
                }
              }
            ],
            "path": "account/events/:id",
            "routePath": "/reference/endpoints/account/events/:id",
            "endpoints": []
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
                  },
                  {
                    "name": "python",
                    "value": "client.mark_lask_seen_event(event)\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "account/events/:id/seen",
            "routePath": "/reference/endpoints/account/events/:id/seen",
            "endpoints": []
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
                  },
                  {
                    "name": "python",
                    "value": "event.mark_read()\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "account/events/:id/read",
            "routePath": "/reference/endpoints/account/events/:id/read",
            "endpoints": []
          }
        ]
      }
    ]
  }
] };
