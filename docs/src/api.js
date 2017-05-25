
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
                                  "description": "The Linode is being migrated to a new host/datacenter."
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
                              "name": "datacenter",
                              "description": "This backup  datacenter.",
                              "filterable": false,
                              "type": "datacenter",
                              "schema": [
                                {
                                  "name": "id",
                                  "type": "string",
                                  "value": "newark",
                                  "schema": null
                                },
                                {
                                  "name": "label",
                                  "description": "Human-friendly datacenter name.",
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
                                  "description": "The Linode is being migrated to a new host/datacenter."
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
                              "name": "datacenter",
                              "description": "This backup  datacenter.",
                              "filterable": false,
                              "type": "datacenter",
                              "schema": [
                                {
                                  "name": "id",
                                  "type": "string",
                                  "value": "newark",
                                  "schema": null
                                },
                                {
                                  "name": "label",
                                  "description": "Human-friendly datacenter name.",
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
                      "name": "datacenter",
                      "description": "This Linode's datacenter.",
                      "filterable": true,
                      "type": "datacenter",
                      "schema": [
                        {
                          "name": "id",
                          "type": "string",
                          "value": "newark",
                          "schema": null
                        },
                        {
                          "name": "label",
                          "description": "Human-friendly datacenter name.",
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
                      "description": "This Linode's primary IPv4 address.",
                      "editable": false,
                      "type": "string",
                      "value": "97.107.143.8",
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
                            "value": "standard-1",
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
                          "value": "standard-1",
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
                          "description": "The Linode is being migrated to a new host/datacenter."
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
                      "migrating": "The Linode is being migrated to a new host/datacenter."
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
                        "datacenter": {
                          "id": "newark",
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
                        "datacenter": {
                          "id": "newark",
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
                    "datacenter": {
                      "id": "newark",
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
                    "ipv4": "97.107.143.8",
                    "ipv6": "2a01:7e00::f03c:91ff:fe96:46f5/64",
                    "label": "Example Linode",
                    "type": [
                      {
                        "id": "standard-1",
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
                    "description": "A datacenter ID to provision this Linode in.\n",
                    "type": "integer",
                    "name": "datacenter"
                  },
                  {
                    "description": "A service plan ID to use for this Linode.\n",
                    "type": "integer",
                    "name": "service"
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
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\n        \"datacenter\": \"newark\",\n        \"service\": \"linode2048.5\"\n    }' \\\n    https://$api_root/$version/linode/instances\n"
                  },
                  {
                    "name": "python",
                    "value": "import linode\nTODO\n"
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
                                  "description": "The Linode is being migrated to a new host/datacenter."
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
                              "name": "datacenter",
                              "description": "This backup  datacenter.",
                              "filterable": false,
                              "type": "datacenter",
                              "schema": [
                                {
                                  "name": "id",
                                  "type": "string",
                                  "value": "newark",
                                  "schema": null
                                },
                                {
                                  "name": "label",
                                  "description": "Human-friendly datacenter name.",
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
                                  "description": "The Linode is being migrated to a new host/datacenter."
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
                              "name": "datacenter",
                              "description": "This backup  datacenter.",
                              "filterable": false,
                              "type": "datacenter",
                              "schema": [
                                {
                                  "name": "id",
                                  "type": "string",
                                  "value": "newark",
                                  "schema": null
                                },
                                {
                                  "name": "label",
                                  "description": "Human-friendly datacenter name.",
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
                      "name": "datacenter",
                      "description": "This Linode's datacenter.",
                      "filterable": true,
                      "type": "datacenter",
                      "schema": [
                        {
                          "name": "id",
                          "type": "string",
                          "value": "newark",
                          "schema": null
                        },
                        {
                          "name": "label",
                          "description": "Human-friendly datacenter name.",
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
                      "description": "This Linode's primary IPv4 address.",
                      "editable": false,
                      "type": "string",
                      "value": "97.107.143.8",
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
                            "value": "standard-1",
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
                          "value": "standard-1",
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
                          "description": "The Linode is being migrated to a new host/datacenter."
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
                      "migrating": "The Linode is being migrated to a new host/datacenter."
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
                        "datacenter": {
                          "id": "newark",
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
                        "datacenter": {
                          "id": "newark",
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
                    "datacenter": {
                      "id": "newark",
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
                    "ipv4": "97.107.143.8",
                    "ipv6": "2a01:7e00::f03c:91ff:fe96:46f5/64",
                    "label": "Example Linode",
                    "type": [
                      {
                        "id": "standard-1",
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
                                  "description": "The Linode is being migrated to a new host/datacenter."
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
                              "name": "datacenter",
                              "description": "This backup  datacenter.",
                              "filterable": false,
                              "type": "datacenter",
                              "schema": [
                                {
                                  "name": "id",
                                  "type": "string",
                                  "value": "newark",
                                  "schema": null
                                },
                                {
                                  "name": "label",
                                  "description": "Human-friendly datacenter name.",
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
                                  "description": "The Linode is being migrated to a new host/datacenter."
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
                              "name": "datacenter",
                              "description": "This backup  datacenter.",
                              "filterable": false,
                              "type": "datacenter",
                              "schema": [
                                {
                                  "name": "id",
                                  "type": "string",
                                  "value": "newark",
                                  "schema": null
                                },
                                {
                                  "name": "label",
                                  "description": "Human-friendly datacenter name.",
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
                      "name": "datacenter",
                      "description": "This Linode's datacenter.",
                      "filterable": true,
                      "type": "datacenter",
                      "schema": [
                        {
                          "name": "id",
                          "type": "string",
                          "value": "newark",
                          "schema": null
                        },
                        {
                          "name": "label",
                          "description": "Human-friendly datacenter name.",
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
                      "description": "This Linode's primary IPv4 address.",
                      "editable": false,
                      "type": "string",
                      "value": "97.107.143.8",
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
                            "value": "standard-1",
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
                          "value": "standard-1",
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
                          "description": "The Linode is being migrated to a new host/datacenter."
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
                      "migrating": "The Linode is being migrated to a new host/datacenter."
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
                        "datacenter": {
                          "id": "newark",
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
                        "datacenter": {
                          "id": "newark",
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
                    "datacenter": {
                      "id": "newark",
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
                    "ipv4": "97.107.143.8",
                    "ipv6": "2a01:7e00::f03c:91ff:fe96:46f5/64",
                    "label": "Example Linode",
                    "type": [
                      {
                        "id": "standard-1",
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
                    "value": "import linode\nTODO\n"
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
                      "ext4": "The ext4 journaling filesystem for Linux."
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
                    "value": "import linode\nTODO\n"
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
                    "value": "import linode\nTODO\n"
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
                    "value": "import linode\nTODO\n"
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
                    "value": "import linode\nTODO\n"
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
                    "value": "import linode\nTODO\n"
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
                    "value": "import linode\nTODO\n"
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
                    "value": "import linode\nTODO\n"
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
                    "value": "import linode\nTODO\n"
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
                    "value": "import linode\nTODO\n"
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
                    "value": "import linode\nTODO\n"
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
                    "value": "import linode\nTODO\n"
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
            "description": "Deletes all Disks and Configs on this Linode, then deploys a new Distribution to this Linode with the given attributes.\n",
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
        "name": "Types",
        "sort": 1,
        "base_path": "/linode/types",
        "description": "Type endpoints provide a means of viewing service objects.\n",
        "path": "/linode",
        "methods": null,
        "endpoints": [
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
            "path": "linode/types/:id",
            "routePath": "/reference/endpoints/linode/types/:id",
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
                    "value": "curl -H \"Content-Type: application/json\" \\\n  -H \"Authorization: token $TOKEN\" \\\n  -X PUT -d '{\n    \"label\": \"New Label\"\n  }' \\\n  https://$api_root/$version/stackscripts/$stackscript_id\n"
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
      }
    ]
  },
  {
    "name": "Domains",
    "path": "/domains",
    "routePath": "/reference/domains",
    "endpoints": []
  },
  {
    "name": "NodeBalancers",
    "path": "/nodebalancers",
    "routePath": "/reference/nodebalancers",
    "endpoints": []
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
                    "description": "The datacenter where the IPv4 address and Linode are located.\n",
                    "type": "integer",
                    "name": "datacenter"
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
                    "value": "curl -H \"Content-Type: application/json\" \\\n    -H \"Authorization: token $TOKEN\" \\\n    -X POST -d '{\n        \"datacenter\": \"newark\",\n        \"assignments\": [\n          {\"address\": \"210.111.22.95\", \"linode_id\": 134504},\n          {\"address\": \"190.12.207.11\", \"linode_id\": 119034},\n        ]\n    }' \\\nhttps://$api_root/$version/networking/ip-assign\n"
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
    "endpoints": []
  },
  {
    "name": "Support",
    "path": "/support",
    "routePath": "/reference/support",
    "endpoints": []
  },
  {
    "name": "Account",
    "path": "/account",
    "routePath": "/reference/account",
    "endpoints": [
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
                      "description": "The current label of the entity this event was created for.\n",
                      "type": "string",
                      "value": "linode123456",
                      "schema": null
                    },
                    {
                      "name": "type",
                      "description": "This event's type.\n",
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
                          "description": "DNS Zone create"
                        },
                        {
                          "name": "dns_zone_delete",
                          "description": "DNS Zone delete"
                        },
                        {
                          "name": "dns_record_create",
                          "description": "DNS Zone Record create"
                        },
                        {
                          "name": "dns_record_delete",
                          "description": "DNS Zone Record delete"
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
                    },
                    {
                      "name": "linode_id",
                      "description": "The Linode's ID if the event affects a Linode.",
                      "filterable": true,
                      "type": "integer",
                      "value": 123456,
                      "schema": null
                    },
                    {
                      "name": "stackscript_id",
                      "description": "The StackScript's ID if the event affects a StackScript.",
                      "filterable": true,
                      "type": "integer",
                      "value": null,
                      "schema": null
                    },
                    {
                      "name": "nodebalancer_id",
                      "description": "The NodeBalancer's ID if the event affects a NodeBalancer.",
                      "filterable": true,
                      "type": "integer",
                      "value": null,
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
                      "dns_zone_create": "DNS Zone create",
                      "dns_zone_delete": "DNS Zone delete",
                      "dns_record_create": "DNS Zone Record create",
                      "dns_record_delete": "DNS Zone Record delete",
                      "stackscript_create": "Stackscript create",
                      "stackscript_publicize": "Stackscript publicize",
                      "stackscript_revise": "Stackscript revise",
                      "stackscript_delete": "Stackscript delete"
                    }
                  },
                  "example": {
                    "id": 1234,
                    "entity": "linode123456",
                    "type": "linode_reboot",
                    "username": "example_user",
                    "percent_complete": 20,
                    "rate": null,
                    "time_remaining": null,
                    "seen": false,
                    "read": false,
                    "created": "2014-12-24T18:00:09.000Z",
                    "updated": "2014-12-24T19:00:09.000Z",
                    "user_id": 234567,
                    "linode_id": 123456,
                    "stackscript_id": null,
                    "nodebalancer_id": null
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
                      "description": "The current label of the entity this event was created for.\n",
                      "type": "string",
                      "value": "linode123456",
                      "schema": null
                    },
                    {
                      "name": "type",
                      "description": "This event's type.\n",
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
                          "description": "DNS Zone create"
                        },
                        {
                          "name": "dns_zone_delete",
                          "description": "DNS Zone delete"
                        },
                        {
                          "name": "dns_record_create",
                          "description": "DNS Zone Record create"
                        },
                        {
                          "name": "dns_record_delete",
                          "description": "DNS Zone Record delete"
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
                    },
                    {
                      "name": "linode_id",
                      "description": "The Linode's ID if the event affects a Linode.",
                      "filterable": true,
                      "type": "integer",
                      "value": 123456,
                      "schema": null
                    },
                    {
                      "name": "stackscript_id",
                      "description": "The StackScript's ID if the event affects a StackScript.",
                      "filterable": true,
                      "type": "integer",
                      "value": null,
                      "schema": null
                    },
                    {
                      "name": "nodebalancer_id",
                      "description": "The NodeBalancer's ID if the event affects a NodeBalancer.",
                      "filterable": true,
                      "type": "integer",
                      "value": null,
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
                      "dns_zone_create": "DNS Zone create",
                      "dns_zone_delete": "DNS Zone delete",
                      "dns_record_create": "DNS Zone Record create",
                      "dns_record_delete": "DNS Zone Record delete",
                      "stackscript_create": "Stackscript create",
                      "stackscript_publicize": "Stackscript publicize",
                      "stackscript_revise": "Stackscript revise",
                      "stackscript_delete": "Stackscript delete"
                    }
                  },
                  "example": {
                    "id": 1234,
                    "entity": "linode123456",
                    "type": "linode_reboot",
                    "username": "example_user",
                    "percent_complete": 20,
                    "rate": null,
                    "time_remaining": null,
                    "seen": false,
                    "read": false,
                    "created": "2014-12-24T18:00:09.000Z",
                    "updated": "2014-12-24T19:00:09.000Z",
                    "user_id": 234567,
                    "linode_id": 123456,
                    "stackscript_id": null,
                    "nodebalancer_id": null
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
