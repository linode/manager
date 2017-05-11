module.exports = { endpoints: [
  {
    "name": "Linodes",
    "path": "/linode",
    "routePath": "/reference/linode",
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
                      "value": "linode/Arch2014.10",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "created",
                      "type": "datetime",
                      "value": "2014-12-24T18:00:09.000Z",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "label",
                      "description": "The user-friendly name of this distribution.",
                      "filterable": true,
                      "type": "string",
                      "value": "Arch Linux 2014.10",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "minimum_storage_size",
                      "description": "The minimum size required for the distrbution image.",
                      "filterable": true,
                      "type": "integer",
                      "value": 800,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "recommended",
                      "description": "True if this distribution is recommended by Linode.",
                      "filterable": true,
                      "type": "boolean",
                      "value": true,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "vendor",
                      "description": "The upstream distribution vendor. Consistent between releases of a distro.",
                      "filterable": true,
                      "type": "string",
                      "value": "Arch",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "x64",
                      "description": "True if this is a 64-bit distribution.",
                      "type": "boolean",
                      "value": true,
                      "example": null,
                      "schema": null
                    }
                  ]
                }
              }
            ],
            "path": "linode/distributions",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/linode/distributions"
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
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "created",
                      "type": "datetime",
                      "value": "2014-12-24T18:00:09.000Z",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "label",
                      "description": "The user-friendly name of this distribution.",
                      "filterable": true,
                      "type": "string",
                      "value": "Arch Linux 2014.10",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "minimum_storage_size",
                      "description": "The minimum size required for the distrbution image.",
                      "filterable": true,
                      "type": "integer",
                      "value": 800,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "recommended",
                      "description": "True if this distribution is recommended by Linode.",
                      "filterable": true,
                      "type": "boolean",
                      "value": true,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "vendor",
                      "description": "The upstream distribution vendor. Consistent between releases of a distro.",
                      "filterable": true,
                      "type": "string",
                      "value": "Arch",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "x64",
                      "description": "True if this is a 64-bit distribution.",
                      "type": "boolean",
                      "value": true,
                      "example": null,
                      "schema": null
                    }
                  ]
                }
              }
            ],
            "path": "linode/distributions/:id",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/linode/distributions/:id"
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
                      "value": "linode/3.5.2-x86_64-linode26",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "description",
                      "description": "Additional, descriptive text about the kernel.",
                      "type": "string",
                      "value": "null",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "xen",
                      "description": "If this kernel is suitable for Xen Linodes.",
                      "filterable": true,
                      "type": "boolean",
                      "value": false,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "kvm",
                      "description": "If this kernel is suitable for KVM Linodes.",
                      "filterable": true,
                      "type": "boolean",
                      "value": true,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "label",
                      "description": "The friendly name of this kernel.",
                      "filterable": true,
                      "type": "string",
                      "value": "3.5.2-x86_64-linode26",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "version",
                      "description": "Linux Kernel version.",
                      "filterable": true,
                      "type": "string",
                      "value": "3.5.2",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "x64",
                      "description": "True if this is a 64-bit kernel, false for 32-bit.",
                      "filterable": true,
                      "type": "boolean",
                      "value": true,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "current",
                      "filterable": true,
                      "type": "boolean",
                      "value": true,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "deprecated",
                      "filterable": true,
                      "type": "boolean",
                      "value": false,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "latest",
                      "type": "boolean",
                      "value": true,
                      "example": null,
                      "schema": null
                    }
                  ]
                }
              }
            ],
            "path": "linode/kernels",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/linode/kernels"
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
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "description",
                      "description": "Additional, descriptive text about the kernel.",
                      "type": "string",
                      "value": "null",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "xen",
                      "description": "If this kernel is suitable for Xen Linodes.",
                      "filterable": true,
                      "type": "boolean",
                      "value": false,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "kvm",
                      "description": "If this kernel is suitable for KVM Linodes.",
                      "filterable": true,
                      "type": "boolean",
                      "value": true,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "label",
                      "description": "The friendly name of this kernel.",
                      "filterable": true,
                      "type": "string",
                      "value": "3.5.2-x86_64-linode26",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "version",
                      "description": "Linux Kernel version.",
                      "filterable": true,
                      "type": "string",
                      "value": "3.5.2",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "x64",
                      "description": "True if this is a 64-bit kernel, false for 32-bit.",
                      "filterable": true,
                      "type": "boolean",
                      "value": true,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "current",
                      "filterable": true,
                      "type": "boolean",
                      "value": true,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "deprecated",
                      "filterable": true,
                      "type": "boolean",
                      "value": false,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "latest",
                      "type": "boolean",
                      "value": true,
                      "example": null,
                      "schema": null
                    }
                  ]
                }
              }
            ],
            "path": "linode/kernels/:id",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/linode/kernels/:id"
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
                      "value": 123456,
                      "example": null,
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
                      "example": {},
                      "schema": [
                        {
                          "name": "cpu",
                          "description": "Average CPU usage over 2 hours exceeding this value triggers this alert.",
                          "example": {
                            "enabled": true,
                            "threshold": 90
                          },
                          "schema": [
                            {
                              "name": "enabled",
                              "type": "boolean",
                              "value": true,
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "threshold",
                              "description": "CPU Usage % (Range 0-2000, default 90).",
                              "type": "integer",
                              "value": 90,
                              "example": null,
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "io",
                          "description": "Average Disk IO ops/sec over 2 hours exceeding this value triggers this alert.",
                          "example": {
                            "enabled": true,
                            "threshold": 10000
                          },
                          "schema": [
                            {
                              "name": "enabled",
                              "type": "boolean",
                              "value": true,
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "threshold",
                              "description": "Disk IO Rate ops/sec (Range 0-100000, default 10000).",
                              "type": "integer",
                              "value": 10000,
                              "example": null,
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "transfer_in",
                          "description": "Average incoming traffic over a 2 hour period exceeding this value triggers this alert.",
                          "example": {
                            "enabled": true,
                            "threshold": 10
                          },
                          "schema": [
                            {
                              "name": "enabled",
                              "type": "boolean",
                              "value": true,
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "threshold",
                              "description": "Incoming Traffic Mbit/s (Range 0-40000, default 10).",
                              "type": "integer",
                              "value": 10,
                              "example": null,
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "transfer_out",
                          "description": "Average outbound traffic over a 2 hour period exceeding this value triggers this alert.",
                          "example": {
                            "enabled": true,
                            "threshold": 10
                          },
                          "schema": [
                            {
                              "name": "enabled",
                              "type": "boolean",
                              "value": true,
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "threshold",
                              "description": "Outbound Traffic Mbit/s (Range 0-10000, default 10).",
                              "type": "integer",
                              "value": 10,
                              "example": null,
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "transfer_quota",
                          "description": "Percentage of network transfer quota used being greater than this value will trigger this alert.",
                          "example": {
                            "enabled": true,
                            "threshold": 80
                          },
                          "schema": [
                            {
                              "name": "enabled",
                              "type": "boolean",
                              "value": true,
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "threshold",
                              "description": "Transfer Quota % (Range 0-400, default 80).",
                              "type": "integer",
                              "value": 80,
                              "example": null,
                              "schema": null
                            }
                          ]
                        }
                      ]
                    },
                    {
                      "name": "backups",
                      "description": "Displays if backups are enabled, last backup datetime if applicable, and the day/window your backups will occur. Window is prefixed by a \"W\" and an integer representing the two-hour window in 24-hour UTC time format. For example, 2AM is represented as \"W2\", 8PM as \"W20\", etc. (W0, W2, W4...W22)\n",
                      "example": {
                        "enabled": true
                      },
                      "schema": [
                        {
                          "name": "enabled",
                          "type": "boolean",
                          "value": true,
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "schedule",
                          "description": "The day and window of a Linode's automatic backups.",
                          "example": {
                            "day": "Tuesday",
                            "window": "W20"
                          },
                          "schema": [
                            {
                              "name": "day",
                              "type": "string",
                              "value": "Tuesday",
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "window",
                              "type": "string",
                              "value": "W20",
                              "example": null,
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "last_backup",
                          "description": "If enabled, the last backup that was successfully taken.",
                          "type": "backup",
                          "example": {
                            "id": 123456,
                            "label": "A label for your snapshot",
                            "status": "successful",
                            "type": "snapshot",
                            "created": "2015-09-29T11:21:01",
                            "updated": "2015-09-29T11:21:01",
                            "finished": "2015-09-29T11:21:01",
                            "configs": [
                              "My Debian8 Profile"
                            ],
                            "disks": [
                              {
                                "label": {
                                  "_type": "string",
                                  "_value": "My Debian8 Disk"
                                },
                                "size": {
                                  "_type": "integer",
                                  "_value": 24064
                                },
                                "filesystem": {
                                  "_type": "string",
                                  "_value": "ext4"
                                }
                              },
                              {
                                "label": {
                                  "_type": "string",
                                  "_value": "swap"
                                },
                                "size": {
                                  "_type": "integer",
                                  "_value": 512
                                },
                                "filesystem": {
                                  "_type": "string",
                                  "_value": "swap"
                                }
                              }
                            ],
                            "availability": "daily"
                          },
                          "schema": [
                            {
                              "name": "id",
                              "type": "integer",
                              "value": 123456,
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "label",
                              "description": "Human-friendly backup name.",
                              "filterable": false,
                              "type": "string",
                              "value": "A label for your snapshot",
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "status",
                              "description": "Status of the backup.",
                              "filterable": false,
                              "type": "enum",
                              "value": "successful",
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "type",
                              "description": "Whether this is a snapshot or an auto backup.",
                              "type": "enum",
                              "value": "snapshot",
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "region",
                              "description": "This backup  region.",
                              "filterable": false,
                              "type": "region",
                              "example": {
                                "id": "us-east-1a",
                                "label": "Newark, NJ",
                                "country": "US"
                              },
                              "schema": [
                                {
                                  "name": "id",
                                  "type": "string",
                                  "value": "us-east-1a",
                                  "example": null,
                                  "schema": null
                                },
                                {
                                  "name": "label",
                                  "description": "Human-friendly region name.",
                                  "filterable": true,
                                  "type": "string",
                                  "value": "Newark, NJ",
                                  "example": null,
                                  "schema": null
                                },
                                {
                                  "name": "country",
                                  "description": "Country",
                                  "filterable": true,
                                  "type": "string",
                                  "value": "US",
                                  "example": null,
                                  "schema": null
                                }
                              ]
                            },
                            {
                              "name": "created",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "updated",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "finished",
                              "description": "An ISO 8601 datetime of when the backup completed.",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "configs",
                              "description": "A JSON Array of config labels that were included in this backup.",
                              "type": "array",
                              "value": [
                                "My Debian8 Profile"
                              ],
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "disks",
                              "description": "A JSON Array of JSON Objects describing the disks included in this backup.",
                              "type": "array",
                              "value": [
                                {
                                  "label": {
                                    "_type": "string",
                                    "_value": "My Debian8 Disk"
                                  },
                                  "size": {
                                    "_type": "integer",
                                    "_value": 24064
                                  },
                                  "filesystem": {
                                    "_type": "string",
                                    "_value": "ext4"
                                  }
                                },
                                {
                                  "label": {
                                    "_type": "string",
                                    "_value": "swap"
                                  },
                                  "size": {
                                    "_type": "integer",
                                    "_value": 512
                                  },
                                  "filesystem": {
                                    "_type": "string",
                                    "_value": "swap"
                                  }
                                }
                              ],
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "availability",
                              "description": "If this backup is available, which backup slot it is in.  Otherwise, unavailable.",
                              "type": "enum",
                              "value": "daily",
                              "example": null,
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "snapshot",
                          "description": "If enabled, the last snapshot that was successfully taken.",
                          "type": "backup",
                          "example": {
                            "id": 123456,
                            "label": "A label for your snapshot",
                            "status": "successful",
                            "type": "snapshot",
                            "created": "2015-09-29T11:21:01",
                            "updated": "2015-09-29T11:21:01",
                            "finished": "2015-09-29T11:21:01",
                            "configs": [
                              "My Debian8 Profile"
                            ],
                            "disks": [
                              {
                                "label": {
                                  "_type": "string",
                                  "_value": "My Debian8 Disk"
                                },
                                "size": {
                                  "_type": "integer",
                                  "_value": 24064
                                },
                                "filesystem": {
                                  "_type": "string",
                                  "_value": "ext4"
                                }
                              },
                              {
                                "label": {
                                  "_type": "string",
                                  "_value": "swap"
                                },
                                "size": {
                                  "_type": "integer",
                                  "_value": 512
                                },
                                "filesystem": {
                                  "_type": "string",
                                  "_value": "swap"
                                }
                              }
                            ],
                            "availability": "daily"
                          },
                          "schema": [
                            {
                              "name": "id",
                              "type": "integer",
                              "value": 123456,
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "label",
                              "description": "Human-friendly backup name.",
                              "filterable": false,
                              "type": "string",
                              "value": "A label for your snapshot",
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "status",
                              "description": "Status of the backup.",
                              "filterable": false,
                              "type": "enum",
                              "value": "successful",
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "type",
                              "description": "Whether this is a snapshot or an auto backup.",
                              "type": "enum",
                              "value": "snapshot",
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "region",
                              "description": "This backup  region.",
                              "filterable": false,
                              "type": "region",
                              "example": {
                                "id": "us-east-1a",
                                "label": "Newark, NJ",
                                "country": "US"
                              },
                              "schema": [
                                {
                                  "name": "id",
                                  "type": "string",
                                  "value": "us-east-1a",
                                  "example": null,
                                  "schema": null
                                },
                                {
                                  "name": "label",
                                  "description": "Human-friendly region name.",
                                  "filterable": true,
                                  "type": "string",
                                  "value": "Newark, NJ",
                                  "example": null,
                                  "schema": null
                                },
                                {
                                  "name": "country",
                                  "description": "Country",
                                  "filterable": true,
                                  "type": "string",
                                  "value": "US",
                                  "example": null,
                                  "schema": null
                                }
                              ]
                            },
                            {
                              "name": "created",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "updated",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "finished",
                              "description": "An ISO 8601 datetime of when the backup completed.",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "configs",
                              "description": "A JSON Array of config labels that were included in this backup.",
                              "type": "array",
                              "value": [
                                "My Debian8 Profile"
                              ],
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "disks",
                              "description": "A JSON Array of JSON Objects describing the disks included in this backup.",
                              "type": "array",
                              "value": [
                                {
                                  "label": {
                                    "_type": "string",
                                    "_value": "My Debian8 Disk"
                                  },
                                  "size": {
                                    "_type": "integer",
                                    "_value": 24064
                                  },
                                  "filesystem": {
                                    "_type": "string",
                                    "_value": "ext4"
                                  }
                                },
                                {
                                  "label": {
                                    "_type": "string",
                                    "_value": "swap"
                                  },
                                  "size": {
                                    "_type": "integer",
                                    "_value": 512
                                  },
                                  "filesystem": {
                                    "_type": "string",
                                    "_value": "swap"
                                  }
                                }
                              ],
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "availability",
                              "description": "If this backup is available, which backup slot it is in.  Otherwise, unavailable.",
                              "type": "enum",
                              "value": "daily",
                              "example": null,
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
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "region",
                      "description": "This Linode's region.",
                      "filterable": true,
                      "type": "region",
                      "example": {
                        "id": "us-east-1a",
                        "label": "Newark, NJ",
                        "country": "US"
                      },
                      "schema": [
                        {
                          "name": "id",
                          "type": "string",
                          "value": "us-east-1a",
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "label",
                          "description": "Human-friendly region name.",
                          "filterable": true,
                          "type": "string",
                          "value": "Newark, NJ",
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "country",
                          "description": "Country",
                          "filterable": true,
                          "type": "string",
                          "value": "US",
                          "example": null,
                          "schema": null
                        }
                      ]
                    },
                    {
                      "name": "distribution",
                      "description": "The distribution that this Linode booted to last.",
                      "filterable": true,
                      "type": "distribution",
                      "example": {
                        "id": "linode/Arch2014.10",
                        "created": "2014-12-24T18:00:09.000Z",
                        "label": "Arch Linux 2014.10",
                        "minimum_storage_size": 800,
                        "recommended": true,
                        "vendor": "Arch",
                        "x64": true
                      },
                      "schema": [
                        {
                          "name": "id",
                          "type": "string",
                          "value": "linode/Arch2014.10",
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "created",
                          "type": "datetime",
                          "value": "2014-12-24T18:00:09.000Z",
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "label",
                          "description": "The user-friendly name of this distribution.",
                          "filterable": true,
                          "type": "string",
                          "value": "Arch Linux 2014.10",
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "minimum_storage_size",
                          "description": "The minimum size required for the distrbution image.",
                          "filterable": true,
                          "type": "integer",
                          "value": 800,
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "recommended",
                          "description": "True if this distribution is recommended by Linode.",
                          "filterable": true,
                          "type": "boolean",
                          "value": true,
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "vendor",
                          "description": "The upstream distribution vendor. Consistent between releases of a distro.",
                          "filterable": true,
                          "type": "string",
                          "value": "Arch",
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "x64",
                          "description": "True if this is a 64-bit distribution.",
                          "type": "boolean",
                          "value": true,
                          "example": null,
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
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "ipv4",
                      "description": "This Linode's IPv4 addresses.",
                      "editable": false,
                      "type": "array",
                      "value": [
                        "97.107.143.8",
                        "192.168.149.108"
                      ],
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "ipv6",
                      "description": "This Linode's IPv6 slaac address.",
                      "editable": false,
                      "type": "string",
                      "value": "2a01:7e00::f03c:91ff:fe96:46f5/64",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "label",
                      "description": "This Linode's display label.",
                      "editable": true,
                      "filterable": true,
                      "type": "string",
                      "value": "Example Linode",
                      "example": null,
                      "schema": null
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
                      ],
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "status",
                      "description": "The current state of this Linode.",
                      "filterable": true,
                      "type": "enum",
                      "value": "running",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "total_transfer",
                      "description": "The amount of outbound traffic used this month.",
                      "type": "integer",
                      "value": 20000,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "updated",
                      "description": "The last updated datetime for this Linode record.",
                      "type": "datetime",
                      "value": "2015-10-27T09:59:26.000Z",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "hypervisor",
                      "description": "The hypervisor this Linode is running on.",
                      "type": "enum",
                      "value": "kvm",
                      "example": null,
                      "schema": null
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
                    "type": "integer",
                    "name": "region"
                  },
                  {
                    "description": "A Linode type ID to use for this Linode.\n",
                    "type": "integer",
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
                    "value": "import linode\nTODO\n"
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "linode/instances",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/linode/instances"
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
                      "example": null,
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
                      "example": {},
                      "schema": [
                        {
                          "name": "cpu",
                          "description": "Average CPU usage over 2 hours exceeding this value triggers this alert.",
                          "example": {
                            "enabled": true,
                            "threshold": 90
                          },
                          "schema": [
                            {
                              "name": "enabled",
                              "type": "boolean",
                              "value": true,
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "threshold",
                              "description": "CPU Usage % (Range 0-2000, default 90).",
                              "type": "integer",
                              "value": 90,
                              "example": null,
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "io",
                          "description": "Average Disk IO ops/sec over 2 hours exceeding this value triggers this alert.",
                          "example": {
                            "enabled": true,
                            "threshold": 10000
                          },
                          "schema": [
                            {
                              "name": "enabled",
                              "type": "boolean",
                              "value": true,
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "threshold",
                              "description": "Disk IO Rate ops/sec (Range 0-100000, default 10000).",
                              "type": "integer",
                              "value": 10000,
                              "example": null,
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "transfer_in",
                          "description": "Average incoming traffic over a 2 hour period exceeding this value triggers this alert.",
                          "example": {
                            "enabled": true,
                            "threshold": 10
                          },
                          "schema": [
                            {
                              "name": "enabled",
                              "type": "boolean",
                              "value": true,
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "threshold",
                              "description": "Incoming Traffic Mbit/s (Range 0-40000, default 10).",
                              "type": "integer",
                              "value": 10,
                              "example": null,
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "transfer_out",
                          "description": "Average outbound traffic over a 2 hour period exceeding this value triggers this alert.",
                          "example": {
                            "enabled": true,
                            "threshold": 10
                          },
                          "schema": [
                            {
                              "name": "enabled",
                              "type": "boolean",
                              "value": true,
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "threshold",
                              "description": "Outbound Traffic Mbit/s (Range 0-10000, default 10).",
                              "type": "integer",
                              "value": 10,
                              "example": null,
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "transfer_quota",
                          "description": "Percentage of network transfer quota used being greater than this value will trigger this alert.",
                          "example": {
                            "enabled": true,
                            "threshold": 80
                          },
                          "schema": [
                            {
                              "name": "enabled",
                              "type": "boolean",
                              "value": true,
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "threshold",
                              "description": "Transfer Quota % (Range 0-400, default 80).",
                              "type": "integer",
                              "value": 80,
                              "example": null,
                              "schema": null
                            }
                          ]
                        }
                      ]
                    },
                    {
                      "name": "backups",
                      "description": "Displays if backups are enabled, last backup datetime if applicable, and the day/window your backups will occur. Window is prefixed by a \"W\" and an integer representing the two-hour window in 24-hour UTC time format. For example, 2AM is represented as \"W2\", 8PM as \"W20\", etc. (W0, W2, W4...W22)\n",
                      "example": {
                        "enabled": true
                      },
                      "schema": [
                        {
                          "name": "enabled",
                          "type": "boolean",
                          "value": true,
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "schedule",
                          "description": "The day and window of a Linode's automatic backups.",
                          "example": {
                            "day": "Tuesday",
                            "window": "W20"
                          },
                          "schema": [
                            {
                              "name": "day",
                              "type": "string",
                              "value": "Tuesday",
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "window",
                              "type": "string",
                              "value": "W20",
                              "example": null,
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "last_backup",
                          "description": "If enabled, the last backup that was successfully taken.",
                          "type": "backup",
                          "example": {
                            "id": 123456,
                            "label": "A label for your snapshot",
                            "status": "successful",
                            "type": "snapshot",
                            "created": "2015-09-29T11:21:01",
                            "updated": "2015-09-29T11:21:01",
                            "finished": "2015-09-29T11:21:01",
                            "configs": [
                              "My Debian8 Profile"
                            ],
                            "disks": [
                              {
                                "label": {
                                  "_type": "string",
                                  "_value": "My Debian8 Disk"
                                },
                                "size": {
                                  "_type": "integer",
                                  "_value": 24064
                                },
                                "filesystem": {
                                  "_type": "string",
                                  "_value": "ext4"
                                }
                              },
                              {
                                "label": {
                                  "_type": "string",
                                  "_value": "swap"
                                },
                                "size": {
                                  "_type": "integer",
                                  "_value": 512
                                },
                                "filesystem": {
                                  "_type": "string",
                                  "_value": "swap"
                                }
                              }
                            ],
                            "availability": "daily"
                          },
                          "schema": [
                            {
                              "name": "id",
                              "type": "integer",
                              "value": 123456,
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "label",
                              "description": "Human-friendly backup name.",
                              "filterable": false,
                              "type": "string",
                              "value": "A label for your snapshot",
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "status",
                              "description": "Status of the backup.",
                              "filterable": false,
                              "type": "enum",
                              "value": "successful",
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "type",
                              "description": "Whether this is a snapshot or an auto backup.",
                              "type": "enum",
                              "value": "snapshot",
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "region",
                              "description": "This backup  region.",
                              "filterable": false,
                              "type": "region",
                              "example": {
                                "id": "us-east-1a",
                                "label": "Newark, NJ",
                                "country": "US"
                              },
                              "schema": [
                                {
                                  "name": "id",
                                  "type": "string",
                                  "value": "us-east-1a",
                                  "example": null,
                                  "schema": null
                                },
                                {
                                  "name": "label",
                                  "description": "Human-friendly region name.",
                                  "filterable": true,
                                  "type": "string",
                                  "value": "Newark, NJ",
                                  "example": null,
                                  "schema": null
                                },
                                {
                                  "name": "country",
                                  "description": "Country",
                                  "filterable": true,
                                  "type": "string",
                                  "value": "US",
                                  "example": null,
                                  "schema": null
                                }
                              ]
                            },
                            {
                              "name": "created",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "updated",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "finished",
                              "description": "An ISO 8601 datetime of when the backup completed.",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "configs",
                              "description": "A JSON Array of config labels that were included in this backup.",
                              "type": "array",
                              "value": [
                                "My Debian8 Profile"
                              ],
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "disks",
                              "description": "A JSON Array of JSON Objects describing the disks included in this backup.",
                              "type": "array",
                              "value": [
                                {
                                  "label": {
                                    "_type": "string",
                                    "_value": "My Debian8 Disk"
                                  },
                                  "size": {
                                    "_type": "integer",
                                    "_value": 24064
                                  },
                                  "filesystem": {
                                    "_type": "string",
                                    "_value": "ext4"
                                  }
                                },
                                {
                                  "label": {
                                    "_type": "string",
                                    "_value": "swap"
                                  },
                                  "size": {
                                    "_type": "integer",
                                    "_value": 512
                                  },
                                  "filesystem": {
                                    "_type": "string",
                                    "_value": "swap"
                                  }
                                }
                              ],
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "availability",
                              "description": "If this backup is available, which backup slot it is in.  Otherwise, unavailable.",
                              "type": "enum",
                              "value": "daily",
                              "example": null,
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "snapshot",
                          "description": "If enabled, the last snapshot that was successfully taken.",
                          "type": "backup",
                          "example": {
                            "id": 123456,
                            "label": "A label for your snapshot",
                            "status": "successful",
                            "type": "snapshot",
                            "created": "2015-09-29T11:21:01",
                            "updated": "2015-09-29T11:21:01",
                            "finished": "2015-09-29T11:21:01",
                            "configs": [
                              "My Debian8 Profile"
                            ],
                            "disks": [
                              {
                                "label": {
                                  "_type": "string",
                                  "_value": "My Debian8 Disk"
                                },
                                "size": {
                                  "_type": "integer",
                                  "_value": 24064
                                },
                                "filesystem": {
                                  "_type": "string",
                                  "_value": "ext4"
                                }
                              },
                              {
                                "label": {
                                  "_type": "string",
                                  "_value": "swap"
                                },
                                "size": {
                                  "_type": "integer",
                                  "_value": 512
                                },
                                "filesystem": {
                                  "_type": "string",
                                  "_value": "swap"
                                }
                              }
                            ],
                            "availability": "daily"
                          },
                          "schema": [
                            {
                              "name": "id",
                              "type": "integer",
                              "value": 123456,
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "label",
                              "description": "Human-friendly backup name.",
                              "filterable": false,
                              "type": "string",
                              "value": "A label for your snapshot",
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "status",
                              "description": "Status of the backup.",
                              "filterable": false,
                              "type": "enum",
                              "value": "successful",
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "type",
                              "description": "Whether this is a snapshot or an auto backup.",
                              "type": "enum",
                              "value": "snapshot",
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "region",
                              "description": "This backup  region.",
                              "filterable": false,
                              "type": "region",
                              "example": {
                                "id": "us-east-1a",
                                "label": "Newark, NJ",
                                "country": "US"
                              },
                              "schema": [
                                {
                                  "name": "id",
                                  "type": "string",
                                  "value": "us-east-1a",
                                  "example": null,
                                  "schema": null
                                },
                                {
                                  "name": "label",
                                  "description": "Human-friendly region name.",
                                  "filterable": true,
                                  "type": "string",
                                  "value": "Newark, NJ",
                                  "example": null,
                                  "schema": null
                                },
                                {
                                  "name": "country",
                                  "description": "Country",
                                  "filterable": true,
                                  "type": "string",
                                  "value": "US",
                                  "example": null,
                                  "schema": null
                                }
                              ]
                            },
                            {
                              "name": "created",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "updated",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "finished",
                              "description": "An ISO 8601 datetime of when the backup completed.",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "configs",
                              "description": "A JSON Array of config labels that were included in this backup.",
                              "type": "array",
                              "value": [
                                "My Debian8 Profile"
                              ],
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "disks",
                              "description": "A JSON Array of JSON Objects describing the disks included in this backup.",
                              "type": "array",
                              "value": [
                                {
                                  "label": {
                                    "_type": "string",
                                    "_value": "My Debian8 Disk"
                                  },
                                  "size": {
                                    "_type": "integer",
                                    "_value": 24064
                                  },
                                  "filesystem": {
                                    "_type": "string",
                                    "_value": "ext4"
                                  }
                                },
                                {
                                  "label": {
                                    "_type": "string",
                                    "_value": "swap"
                                  },
                                  "size": {
                                    "_type": "integer",
                                    "_value": 512
                                  },
                                  "filesystem": {
                                    "_type": "string",
                                    "_value": "swap"
                                  }
                                }
                              ],
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "availability",
                              "description": "If this backup is available, which backup slot it is in.  Otherwise, unavailable.",
                              "type": "enum",
                              "value": "daily",
                              "example": null,
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
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "region",
                      "description": "This Linode's region.",
                      "filterable": true,
                      "type": "region",
                      "example": {
                        "id": "us-east-1a",
                        "label": "Newark, NJ",
                        "country": "US"
                      },
                      "schema": [
                        {
                          "name": "id",
                          "type": "string",
                          "value": "us-east-1a",
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "label",
                          "description": "Human-friendly region name.",
                          "filterable": true,
                          "type": "string",
                          "value": "Newark, NJ",
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "country",
                          "description": "Country",
                          "filterable": true,
                          "type": "string",
                          "value": "US",
                          "example": null,
                          "schema": null
                        }
                      ]
                    },
                    {
                      "name": "distribution",
                      "description": "The distribution that this Linode booted to last.",
                      "filterable": true,
                      "type": "distribution",
                      "example": {
                        "id": "linode/Arch2014.10",
                        "created": "2014-12-24T18:00:09.000Z",
                        "label": "Arch Linux 2014.10",
                        "minimum_storage_size": 800,
                        "recommended": true,
                        "vendor": "Arch",
                        "x64": true
                      },
                      "schema": [
                        {
                          "name": "id",
                          "type": "string",
                          "value": "linode/Arch2014.10",
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "created",
                          "type": "datetime",
                          "value": "2014-12-24T18:00:09.000Z",
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "label",
                          "description": "The user-friendly name of this distribution.",
                          "filterable": true,
                          "type": "string",
                          "value": "Arch Linux 2014.10",
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "minimum_storage_size",
                          "description": "The minimum size required for the distrbution image.",
                          "filterable": true,
                          "type": "integer",
                          "value": 800,
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "recommended",
                          "description": "True if this distribution is recommended by Linode.",
                          "filterable": true,
                          "type": "boolean",
                          "value": true,
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "vendor",
                          "description": "The upstream distribution vendor. Consistent between releases of a distro.",
                          "filterable": true,
                          "type": "string",
                          "value": "Arch",
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "x64",
                          "description": "True if this is a 64-bit distribution.",
                          "type": "boolean",
                          "value": true,
                          "example": null,
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
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "ipv4",
                      "description": "This Linode's IPv4 addresses.",
                      "editable": false,
                      "type": "array",
                      "value": [
                        "97.107.143.8",
                        "192.168.149.108"
                      ],
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "ipv6",
                      "description": "This Linode's IPv6 slaac address.",
                      "editable": false,
                      "type": "string",
                      "value": "2a01:7e00::f03c:91ff:fe96:46f5/64",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "label",
                      "description": "This Linode's display label.",
                      "editable": true,
                      "filterable": true,
                      "type": "string",
                      "value": "Example Linode",
                      "example": null,
                      "schema": null
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
                      ],
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "status",
                      "description": "The current state of this Linode.",
                      "filterable": true,
                      "type": "enum",
                      "value": "running",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "total_transfer",
                      "description": "The amount of outbound traffic used this month.",
                      "type": "integer",
                      "value": 20000,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "updated",
                      "description": "The last updated datetime for this Linode record.",
                      "type": "datetime",
                      "value": "2015-10-27T09:59:26.000Z",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "hypervisor",
                      "description": "The hypervisor this Linode is running on.",
                      "type": "enum",
                      "value": "kvm",
                      "example": null,
                      "schema": null
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
            "path": "linode/instances/:id",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/linode/instances/:id"
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
                      "example": null,
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
                      "example": {},
                      "schema": [
                        {
                          "name": "cpu",
                          "description": "Average CPU usage over 2 hours exceeding this value triggers this alert.",
                          "example": {
                            "enabled": true,
                            "threshold": 90
                          },
                          "schema": [
                            {
                              "name": "enabled",
                              "type": "boolean",
                              "value": true,
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "threshold",
                              "description": "CPU Usage % (Range 0-2000, default 90).",
                              "type": "integer",
                              "value": 90,
                              "example": null,
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "io",
                          "description": "Average Disk IO ops/sec over 2 hours exceeding this value triggers this alert.",
                          "example": {
                            "enabled": true,
                            "threshold": 10000
                          },
                          "schema": [
                            {
                              "name": "enabled",
                              "type": "boolean",
                              "value": true,
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "threshold",
                              "description": "Disk IO Rate ops/sec (Range 0-100000, default 10000).",
                              "type": "integer",
                              "value": 10000,
                              "example": null,
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "transfer_in",
                          "description": "Average incoming traffic over a 2 hour period exceeding this value triggers this alert.",
                          "example": {
                            "enabled": true,
                            "threshold": 10
                          },
                          "schema": [
                            {
                              "name": "enabled",
                              "type": "boolean",
                              "value": true,
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "threshold",
                              "description": "Incoming Traffic Mbit/s (Range 0-40000, default 10).",
                              "type": "integer",
                              "value": 10,
                              "example": null,
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "transfer_out",
                          "description": "Average outbound traffic over a 2 hour period exceeding this value triggers this alert.",
                          "example": {
                            "enabled": true,
                            "threshold": 10
                          },
                          "schema": [
                            {
                              "name": "enabled",
                              "type": "boolean",
                              "value": true,
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "threshold",
                              "description": "Outbound Traffic Mbit/s (Range 0-10000, default 10).",
                              "type": "integer",
                              "value": 10,
                              "example": null,
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "transfer_quota",
                          "description": "Percentage of network transfer quota used being greater than this value will trigger this alert.",
                          "example": {
                            "enabled": true,
                            "threshold": 80
                          },
                          "schema": [
                            {
                              "name": "enabled",
                              "type": "boolean",
                              "value": true,
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "threshold",
                              "description": "Transfer Quota % (Range 0-400, default 80).",
                              "type": "integer",
                              "value": 80,
                              "example": null,
                              "schema": null
                            }
                          ]
                        }
                      ]
                    },
                    {
                      "name": "backups",
                      "description": "Displays if backups are enabled, last backup datetime if applicable, and the day/window your backups will occur. Window is prefixed by a \"W\" and an integer representing the two-hour window in 24-hour UTC time format. For example, 2AM is represented as \"W2\", 8PM as \"W20\", etc. (W0, W2, W4...W22)\n",
                      "example": {
                        "enabled": true
                      },
                      "schema": [
                        {
                          "name": "enabled",
                          "type": "boolean",
                          "value": true,
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "schedule",
                          "description": "The day and window of a Linode's automatic backups.",
                          "example": {
                            "day": "Tuesday",
                            "window": "W20"
                          },
                          "schema": [
                            {
                              "name": "day",
                              "type": "string",
                              "value": "Tuesday",
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "window",
                              "type": "string",
                              "value": "W20",
                              "example": null,
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "last_backup",
                          "description": "If enabled, the last backup that was successfully taken.",
                          "type": "backup",
                          "example": {
                            "id": 123456,
                            "label": "A label for your snapshot",
                            "status": "successful",
                            "type": "snapshot",
                            "created": "2015-09-29T11:21:01",
                            "updated": "2015-09-29T11:21:01",
                            "finished": "2015-09-29T11:21:01",
                            "configs": [
                              "My Debian8 Profile"
                            ],
                            "disks": [
                              {
                                "label": {
                                  "_type": "string",
                                  "_value": "My Debian8 Disk"
                                },
                                "size": {
                                  "_type": "integer",
                                  "_value": 24064
                                },
                                "filesystem": {
                                  "_type": "string",
                                  "_value": "ext4"
                                }
                              },
                              {
                                "label": {
                                  "_type": "string",
                                  "_value": "swap"
                                },
                                "size": {
                                  "_type": "integer",
                                  "_value": 512
                                },
                                "filesystem": {
                                  "_type": "string",
                                  "_value": "swap"
                                }
                              }
                            ],
                            "availability": "daily"
                          },
                          "schema": [
                            {
                              "name": "id",
                              "type": "integer",
                              "value": 123456,
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "label",
                              "description": "Human-friendly backup name.",
                              "filterable": false,
                              "type": "string",
                              "value": "A label for your snapshot",
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "status",
                              "description": "Status of the backup.",
                              "filterable": false,
                              "type": "enum",
                              "value": "successful",
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "type",
                              "description": "Whether this is a snapshot or an auto backup.",
                              "type": "enum",
                              "value": "snapshot",
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "region",
                              "description": "This backup  region.",
                              "filterable": false,
                              "type": "region",
                              "example": {
                                "id": "us-east-1a",
                                "label": "Newark, NJ",
                                "country": "US"
                              },
                              "schema": [
                                {
                                  "name": "id",
                                  "type": "string",
                                  "value": "us-east-1a",
                                  "example": null,
                                  "schema": null
                                },
                                {
                                  "name": "label",
                                  "description": "Human-friendly region name.",
                                  "filterable": true,
                                  "type": "string",
                                  "value": "Newark, NJ",
                                  "example": null,
                                  "schema": null
                                },
                                {
                                  "name": "country",
                                  "description": "Country",
                                  "filterable": true,
                                  "type": "string",
                                  "value": "US",
                                  "example": null,
                                  "schema": null
                                }
                              ]
                            },
                            {
                              "name": "created",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "updated",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "finished",
                              "description": "An ISO 8601 datetime of when the backup completed.",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "configs",
                              "description": "A JSON Array of config labels that were included in this backup.",
                              "type": "array",
                              "value": [
                                "My Debian8 Profile"
                              ],
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "disks",
                              "description": "A JSON Array of JSON Objects describing the disks included in this backup.",
                              "type": "array",
                              "value": [
                                {
                                  "label": {
                                    "_type": "string",
                                    "_value": "My Debian8 Disk"
                                  },
                                  "size": {
                                    "_type": "integer",
                                    "_value": 24064
                                  },
                                  "filesystem": {
                                    "_type": "string",
                                    "_value": "ext4"
                                  }
                                },
                                {
                                  "label": {
                                    "_type": "string",
                                    "_value": "swap"
                                  },
                                  "size": {
                                    "_type": "integer",
                                    "_value": 512
                                  },
                                  "filesystem": {
                                    "_type": "string",
                                    "_value": "swap"
                                  }
                                }
                              ],
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "availability",
                              "description": "If this backup is available, which backup slot it is in.  Otherwise, unavailable.",
                              "type": "enum",
                              "value": "daily",
                              "example": null,
                              "schema": null
                            }
                          ]
                        },
                        {
                          "name": "snapshot",
                          "description": "If enabled, the last snapshot that was successfully taken.",
                          "type": "backup",
                          "example": {
                            "id": 123456,
                            "label": "A label for your snapshot",
                            "status": "successful",
                            "type": "snapshot",
                            "created": "2015-09-29T11:21:01",
                            "updated": "2015-09-29T11:21:01",
                            "finished": "2015-09-29T11:21:01",
                            "configs": [
                              "My Debian8 Profile"
                            ],
                            "disks": [
                              {
                                "label": {
                                  "_type": "string",
                                  "_value": "My Debian8 Disk"
                                },
                                "size": {
                                  "_type": "integer",
                                  "_value": 24064
                                },
                                "filesystem": {
                                  "_type": "string",
                                  "_value": "ext4"
                                }
                              },
                              {
                                "label": {
                                  "_type": "string",
                                  "_value": "swap"
                                },
                                "size": {
                                  "_type": "integer",
                                  "_value": 512
                                },
                                "filesystem": {
                                  "_type": "string",
                                  "_value": "swap"
                                }
                              }
                            ],
                            "availability": "daily"
                          },
                          "schema": [
                            {
                              "name": "id",
                              "type": "integer",
                              "value": 123456,
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "label",
                              "description": "Human-friendly backup name.",
                              "filterable": false,
                              "type": "string",
                              "value": "A label for your snapshot",
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "status",
                              "description": "Status of the backup.",
                              "filterable": false,
                              "type": "enum",
                              "value": "successful",
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "type",
                              "description": "Whether this is a snapshot or an auto backup.",
                              "type": "enum",
                              "value": "snapshot",
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "region",
                              "description": "This backup  region.",
                              "filterable": false,
                              "type": "region",
                              "example": {
                                "id": "us-east-1a",
                                "label": "Newark, NJ",
                                "country": "US"
                              },
                              "schema": [
                                {
                                  "name": "id",
                                  "type": "string",
                                  "value": "us-east-1a",
                                  "example": null,
                                  "schema": null
                                },
                                {
                                  "name": "label",
                                  "description": "Human-friendly region name.",
                                  "filterable": true,
                                  "type": "string",
                                  "value": "Newark, NJ",
                                  "example": null,
                                  "schema": null
                                },
                                {
                                  "name": "country",
                                  "description": "Country",
                                  "filterable": true,
                                  "type": "string",
                                  "value": "US",
                                  "example": null,
                                  "schema": null
                                }
                              ]
                            },
                            {
                              "name": "created",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "updated",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "finished",
                              "description": "An ISO 8601 datetime of when the backup completed.",
                              "type": "datetime",
                              "value": "2015-09-29T11:21:01",
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "configs",
                              "description": "A JSON Array of config labels that were included in this backup.",
                              "type": "array",
                              "value": [
                                "My Debian8 Profile"
                              ],
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "disks",
                              "description": "A JSON Array of JSON Objects describing the disks included in this backup.",
                              "type": "array",
                              "value": [
                                {
                                  "label": {
                                    "_type": "string",
                                    "_value": "My Debian8 Disk"
                                  },
                                  "size": {
                                    "_type": "integer",
                                    "_value": 24064
                                  },
                                  "filesystem": {
                                    "_type": "string",
                                    "_value": "ext4"
                                  }
                                },
                                {
                                  "label": {
                                    "_type": "string",
                                    "_value": "swap"
                                  },
                                  "size": {
                                    "_type": "integer",
                                    "_value": 512
                                  },
                                  "filesystem": {
                                    "_type": "string",
                                    "_value": "swap"
                                  }
                                }
                              ],
                              "example": null,
                              "schema": null
                            },
                            {
                              "name": "availability",
                              "description": "If this backup is available, which backup slot it is in.  Otherwise, unavailable.",
                              "type": "enum",
                              "value": "daily",
                              "example": null,
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
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "region",
                      "description": "This Linode's region.",
                      "filterable": true,
                      "type": "region",
                      "example": {
                        "id": "us-east-1a",
                        "label": "Newark, NJ",
                        "country": "US"
                      },
                      "schema": [
                        {
                          "name": "id",
                          "type": "string",
                          "value": "us-east-1a",
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "label",
                          "description": "Human-friendly region name.",
                          "filterable": true,
                          "type": "string",
                          "value": "Newark, NJ",
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "country",
                          "description": "Country",
                          "filterable": true,
                          "type": "string",
                          "value": "US",
                          "example": null,
                          "schema": null
                        }
                      ]
                    },
                    {
                      "name": "distribution",
                      "description": "The distribution that this Linode booted to last.",
                      "filterable": true,
                      "type": "distribution",
                      "example": {
                        "id": "linode/Arch2014.10",
                        "created": "2014-12-24T18:00:09.000Z",
                        "label": "Arch Linux 2014.10",
                        "minimum_storage_size": 800,
                        "recommended": true,
                        "vendor": "Arch",
                        "x64": true
                      },
                      "schema": [
                        {
                          "name": "id",
                          "type": "string",
                          "value": "linode/Arch2014.10",
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "created",
                          "type": "datetime",
                          "value": "2014-12-24T18:00:09.000Z",
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "label",
                          "description": "The user-friendly name of this distribution.",
                          "filterable": true,
                          "type": "string",
                          "value": "Arch Linux 2014.10",
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "minimum_storage_size",
                          "description": "The minimum size required for the distrbution image.",
                          "filterable": true,
                          "type": "integer",
                          "value": 800,
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "recommended",
                          "description": "True if this distribution is recommended by Linode.",
                          "filterable": true,
                          "type": "boolean",
                          "value": true,
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "vendor",
                          "description": "The upstream distribution vendor. Consistent between releases of a distro.",
                          "filterable": true,
                          "type": "string",
                          "value": "Arch",
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "x64",
                          "description": "True if this is a 64-bit distribution.",
                          "type": "boolean",
                          "value": true,
                          "example": null,
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
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "ipv4",
                      "description": "This Linode's IPv4 addresses.",
                      "editable": false,
                      "type": "array",
                      "value": [
                        "97.107.143.8",
                        "192.168.149.108"
                      ],
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "ipv6",
                      "description": "This Linode's IPv6 slaac address.",
                      "editable": false,
                      "type": "string",
                      "value": "2a01:7e00::f03c:91ff:fe96:46f5/64",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "label",
                      "description": "This Linode's display label.",
                      "editable": true,
                      "filterable": true,
                      "type": "string",
                      "value": "Example Linode",
                      "example": null,
                      "schema": null
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
                      ],
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "status",
                      "description": "The current state of this Linode.",
                      "filterable": true,
                      "type": "enum",
                      "value": "running",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "total_transfer",
                      "description": "The amount of outbound traffic used this month.",
                      "type": "integer",
                      "value": 20000,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "updated",
                      "description": "The last updated datetime for this Linode record.",
                      "type": "datetime",
                      "value": "2015-10-27T09:59:26.000Z",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "hypervisor",
                      "description": "The hypervisor this Linode is running on.",
                      "type": "enum",
                      "value": "kvm",
                      "example": null,
                      "schema": null
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
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/linode/instances/:id/disks"
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
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "label",
                      "description": "Human-friendly disk name.",
                      "filterable": true,
                      "type": "string",
                      "value": "Ubuntu 14.04 Disk",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "status",
                      "description": "Status of the disk.",
                      "filterable": false,
                      "type": "enum",
                      "value": "ok",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "size",
                      "description": "Size of this disk in MB.",
                      "editable": true,
                      "filterable": true,
                      "type": "integer",
                      "value": 1000,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "filesystem",
                      "description": "The filesystem on the disk.",
                      "type": "enum",
                      "value": "ext4",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "created",
                      "type": "datetime",
                      "value": "2015-09-29T11:21:01",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "updated",
                      "type": "datetime",
                      "value": "2015-09-29T11:21:01",
                      "example": null,
                      "schema": null
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
            "path": "linode/instances/:id/disks/:id",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/linode/instances/:id/disks/:id"
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
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/linode/instances/:id/disks/:id/resize"
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
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/linode/instances/:id/disks/:id/password"
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
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/linode/instances/:id/configs"
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
            "path": "linode/instances/:id/configs/:id",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/linode/instances/:id/configs/:id"
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
            "path": "linode/instances/:id/boot",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/linode/instances/:id/boot"
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
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/linode/instances/:id/shutdown"
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
            "path": "linode/instances/:id/reboot",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/linode/instances/:id/reboot"
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
            "path": "linode/instances/:id/kvmify",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/linode/instances/:id/kvmify"
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
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/linode/instances/:id/rescue"
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
                    "type": "integer",
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
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/linode/instances/:id/resize"
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
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/linode/instances/:id/backups"
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
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/linode/instances/:id/backups/enable"
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
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/linode/instances/:id/backups/cancel"
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
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/linode/instances/:id/backups/:id/restore"
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
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/linode/instances/:id/ips"
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
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/linode/instances/:id/ips/sharing"
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
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "gateway",
                      "description": "The default gateway. Gateways for private IP's are always null.",
                      "type": "string",
                      "value": "97.107.143.1",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "subnet_mask",
                      "description": "The subnet mask.",
                      "type": "string",
                      "value": "255.255.255.0",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "prefix",
                      "description": "The network prefix.",
                      "type": "string",
                      "value": 24,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "type",
                      "description": "The type of IP Address, either public or private",
                      "type": "enum",
                      "value": "public",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "rdns",
                      "description": "Reverse DNS address for this IP Address. Null to reset.",
                      "editable": true,
                      "type": "string",
                      "value": null,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "linode_id",
                      "type": "integer",
                      "value": 42,
                      "example": null,
                      "schema": null
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
            "path": "linode/instances/:id/ips/:ip_address",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/linode/instances/:id/ips/:ip_address"
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
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "linode/instances/:id/rebuild",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/linode/instances/:id/rebuild"
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
            "path": "linode/types",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/linode/types"
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
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/linode/types/:id"
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
                      "value": 37,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "customer_id",
                      "description": "The customer that created this StackScript.",
                      "type": "integer",
                      "value": 123,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "user_id",
                      "description": "The user account that created this StackScript.",
                      "type": "integer",
                      "value": 456,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "label",
                      "description": "This StackScript's display label.",
                      "editable": true,
                      "filterable": true,
                      "type": "string",
                      "value": "Example StackScript",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "description",
                      "description": "In-depth information on what this StackScript does.",
                      "editable": true,
                      "filterable": true,
                      "type": "string",
                      "value": "Installs the Linode API bindings",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "distributions",
                      "description": "A list of distributions this StackScript is compatible with.",
                      "editable": true,
                      "filterable": true,
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
                      ],
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "deployments_total",
                      "description": "The total number of times this StackScript has been deployed.",
                      "type": "integer",
                      "value": 150,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "deployments_active",
                      "description": "The total number of active deployments.",
                      "type": "integer",
                      "value": 42,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "is_public",
                      "description": "Publicize StackScript in the Linode StackScript library. Note that StackScripts cannot be changed to private after they have been public.\n",
                      "editable": true,
                      "filterable": true,
                      "type": "boolean",
                      "value": true,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "created",
                      "description": "When the StackScript was initially created.",
                      "type": "datetime",
                      "value": "2015-09-29T11:21:01",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "updated",
                      "description": "When the StackScript was last updated.",
                      "type": "datetime",
                      "value": "2015-10-15T10:02:01",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "rev_note",
                      "description": "The most recent note about what was changed for this revision.",
                      "editable": true,
                      "type": "string",
                      "value": "Initial import",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "script",
                      "description": "The actual script body to be executed.",
                      "editable": true,
                      "type": "string",
                      "value": "#!/bin/bash",
                      "example": null,
                      "schema": null
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
                      ],
                      "example": null,
                      "schema": null
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
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/linode/stackscripts"
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
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "customer_id",
                      "description": "The customer that created this StackScript.",
                      "type": "integer",
                      "value": 123,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "user_id",
                      "description": "The user account that created this StackScript.",
                      "type": "integer",
                      "value": 456,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "label",
                      "description": "This StackScript's display label.",
                      "editable": true,
                      "filterable": true,
                      "type": "string",
                      "value": "Example StackScript",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "description",
                      "description": "In-depth information on what this StackScript does.",
                      "editable": true,
                      "filterable": true,
                      "type": "string",
                      "value": "Installs the Linode API bindings",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "distributions",
                      "description": "A list of distributions this StackScript is compatible with.",
                      "editable": true,
                      "filterable": true,
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
                      ],
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "deployments_total",
                      "description": "The total number of times this StackScript has been deployed.",
                      "type": "integer",
                      "value": 150,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "deployments_active",
                      "description": "The total number of active deployments.",
                      "type": "integer",
                      "value": 42,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "is_public",
                      "description": "Publicize StackScript in the Linode StackScript library. Note that StackScripts cannot be changed to private after they have been public.\n",
                      "editable": true,
                      "filterable": true,
                      "type": "boolean",
                      "value": true,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "created",
                      "description": "When the StackScript was initially created.",
                      "type": "datetime",
                      "value": "2015-09-29T11:21:01",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "updated",
                      "description": "When the StackScript was last updated.",
                      "type": "datetime",
                      "value": "2015-10-15T10:02:01",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "rev_note",
                      "description": "The most recent note about what was changed for this revision.",
                      "editable": true,
                      "type": "string",
                      "value": "Initial import",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "script",
                      "description": "The actual script body to be executed.",
                      "editable": true,
                      "type": "string",
                      "value": "#!/bin/bash",
                      "example": null,
                      "schema": null
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
                      ],
                      "example": null,
                      "schema": null
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
            "path": "linode/stackscripts/:id",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/linode/stackscripts/:id"
          }
        ],
        "methods": null
      }
    ]
  },
  {
    "name": "Domains",
    "path": "/domains",
    "routePath": "/reference/domains",
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
                      "value": 357,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "domain",
                      "description": "The Domain name.\n",
                      "editable": true,
                      "filterable": true,
                      "type": "string",
                      "value": "example.com",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "soa_email",
                      "description": "Start of Authority (SOA) contact email.\n",
                      "editable": true,
                      "type": "string",
                      "value": "admin@example.com",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "description",
                      "description": "A description to keep track of this Domain.\n",
                      "editable": true,
                      "type": "string",
                      "value": "Example Description",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "refresh_sec",
                      "description": "Time interval before the Domain should be refreshed, in seconds.\n",
                      "editable": true,
                      "type": "integer",
                      "value": 14400,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "retry_sec",
                      "description": "Time interval that should elapse before a failed refresh should be retried, in seconds.\n",
                      "editable": true,
                      "type": "integer",
                      "value": 3600,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "expire_sec",
                      "description": "Time value that specifies the upper limit on the time interval that can elapse before the Domain is no longer authoritative, in seconds.\n",
                      "editable": true,
                      "type": "integer",
                      "value": 604800,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "ttl_sec",
                      "description": "Time interval that the resource record may be cached before\n  it should be discarded, in seconds.\n",
                      "editable": true,
                      "type": "integer",
                      "value": 3600,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "status",
                      "description": "The status of the Domain it can be disabled, active, or edit_mode.\n",
                      "editable": true,
                      "type": "enum",
                      "value": "active",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "master_ips",
                      "description": "An array of IP addresses for this Domain.\n",
                      "editable": true,
                      "filterable": true,
                      "type": "array",
                      "value": [
                        "127.0.0.1",
                        "255.255.255.1",
                        "123.123.123.7"
                      ],
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "axfr_ips",
                      "description": "An array of IP addresses allowed to AXFR the entire Domain.\n",
                      "editable": true,
                      "type": "array",
                      "value": [
                        "44.55.66.77"
                      ],
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "display_group",
                      "description": "A display group to keep track of this Domain.\n",
                      "editable": true,
                      "filterable": true,
                      "type": "string",
                      "value": "Example Display Group",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "type",
                      "description": "Controls the Domain type.",
                      "editable": false,
                      "filterable": true,
                      "type": "enum",
                      "value": "master",
                      "example": null,
                      "schema": null
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
            "path": "domains",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/domains"
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
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "domain",
                      "description": "The Domain name.\n",
                      "editable": true,
                      "filterable": true,
                      "type": "string",
                      "value": "example.com",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "soa_email",
                      "description": "Start of Authority (SOA) contact email.\n",
                      "editable": true,
                      "type": "string",
                      "value": "admin@example.com",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "description",
                      "description": "A description to keep track of this Domain.\n",
                      "editable": true,
                      "type": "string",
                      "value": "Example Description",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "refresh_sec",
                      "description": "Time interval before the Domain should be refreshed, in seconds.\n",
                      "editable": true,
                      "type": "integer",
                      "value": 14400,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "retry_sec",
                      "description": "Time interval that should elapse before a failed refresh should be retried, in seconds.\n",
                      "editable": true,
                      "type": "integer",
                      "value": 3600,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "expire_sec",
                      "description": "Time value that specifies the upper limit on the time interval that can elapse before the Domain is no longer authoritative, in seconds.\n",
                      "editable": true,
                      "type": "integer",
                      "value": 604800,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "ttl_sec",
                      "description": "Time interval that the resource record may be cached before\n  it should be discarded, in seconds.\n",
                      "editable": true,
                      "type": "integer",
                      "value": 3600,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "status",
                      "description": "The status of the Domain it can be disabled, active, or edit_mode.\n",
                      "editable": true,
                      "type": "enum",
                      "value": "active",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "master_ips",
                      "description": "An array of IP addresses for this Domain.\n",
                      "editable": true,
                      "filterable": true,
                      "type": "array",
                      "value": [
                        "127.0.0.1",
                        "255.255.255.1",
                        "123.123.123.7"
                      ],
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "axfr_ips",
                      "description": "An array of IP addresses allowed to AXFR the entire Domain.\n",
                      "editable": true,
                      "type": "array",
                      "value": [
                        "44.55.66.77"
                      ],
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "display_group",
                      "description": "A display group to keep track of this Domain.\n",
                      "editable": true,
                      "filterable": true,
                      "type": "string",
                      "value": "Example Display Group",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "type",
                      "description": "Controls the Domain type.",
                      "editable": false,
                      "filterable": true,
                      "type": "enum",
                      "value": "master",
                      "example": null,
                      "schema": null
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
            "path": "domains/:id",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/domains/:id"
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
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "type",
                      "description": "Type of record (A/AAAA, NS, MX, CNAME, TXT, SRV).\n",
                      "type": "string",
                      "value": "A",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "name",
                      "description": "The hostname or FQDN. When type=MX the subdomain to delegate to the Target MX server.\n",
                      "editable": true,
                      "filterable": true,
                      "type": "string",
                      "value": "sub.example.com",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "target",
                      "description": "When type=MX the hostname. When type=CNAME the target of the alias. When type=TXT the value of the record. When type=A or AAAA the token of '[remote_addr]' will be substituted with the IP address of the request.\n",
                      "editable": true,
                      "filterable": true,
                      "type": "string",
                      "value": "sub",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "priority",
                      "description": "Priority for MX and SRV records.\n",
                      "editable": true,
                      "type": "integer",
                      "value": 10,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "weight",
                      "description": "A relative weight for records with the same priority, higher value means more preferred.\n",
                      "editable": true,
                      "type": "integer",
                      "value": 20,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "port",
                      "description": "The TCP or UDP port on which the service is to be found.\n",
                      "editable": true,
                      "type": "integer",
                      "value": 80,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "service",
                      "description": "The service to append to an SRV record. Must conform to RFC2782 standards.\n",
                      "editable": true,
                      "type": "string",
                      "value": "_sip",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "protocol",
                      "description": "The protocol to append to an SRV record. Must conform to RFC2782 standards.\n",
                      "editable": true,
                      "type": "string",
                      "value": "_tcp",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "ttl_sec",
                      "description": "Time interval that the resource record may be cached before it should be discarded, in seconds. Leave as 0 to accept our default.\n",
                      "editable": true,
                      "type": "integer",
                      "value": 86400,
                      "example": null,
                      "schema": null
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
            "path": "domains/:id/records",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/domains/:id/records"
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
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "type",
                      "description": "Type of record (A/AAAA, NS, MX, CNAME, TXT, SRV).\n",
                      "type": "string",
                      "value": "A",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "name",
                      "description": "The hostname or FQDN. When type=MX the subdomain to delegate to the Target MX server.\n",
                      "editable": true,
                      "filterable": true,
                      "type": "string",
                      "value": "sub.example.com",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "target",
                      "description": "When type=MX the hostname. When type=CNAME the target of the alias. When type=TXT the value of the record. When type=A or AAAA the token of '[remote_addr]' will be substituted with the IP address of the request.\n",
                      "editable": true,
                      "filterable": true,
                      "type": "string",
                      "value": "sub",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "priority",
                      "description": "Priority for MX and SRV records.\n",
                      "editable": true,
                      "type": "integer",
                      "value": 10,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "weight",
                      "description": "A relative weight for records with the same priority, higher value means more preferred.\n",
                      "editable": true,
                      "type": "integer",
                      "value": 20,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "port",
                      "description": "The TCP or UDP port on which the service is to be found.\n",
                      "editable": true,
                      "type": "integer",
                      "value": 80,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "service",
                      "description": "The service to append to an SRV record. Must conform to RFC2782 standards.\n",
                      "editable": true,
                      "type": "string",
                      "value": "_sip",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "protocol",
                      "description": "The protocol to append to an SRV record. Must conform to RFC2782 standards.\n",
                      "editable": true,
                      "type": "string",
                      "value": "_tcp",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "ttl_sec",
                      "description": "Time interval that the resource record may be cached before it should be discarded, in seconds. Leave as 0 to accept our default.\n",
                      "editable": true,
                      "type": "integer",
                      "value": 86400,
                      "example": null,
                      "schema": null
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
            "path": "domains/:id/records/:id",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/domains/:id/records/:id"
          }
        ],
        "methods": null
      }
    ]
  },
  {
    "name": "NodeBalancers",
    "path": "/nodebalancers",
    "routePath": "/reference/nodebalancers",
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
                      "value": 123456,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "label",
                      "description": "The NodeBalancer's display label. Must be 3-32 ASCII characters limited to letters, numbers, underscores, and dashes, starting and ending with a letter, and without two dashes or underscores in a row.",
                      "editable": true,
                      "type": "string",
                      "value": "nodebalancer12345",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "hostname",
                      "description": "The NodeBalancer's hostname.",
                      "editable": false,
                      "type": "string",
                      "value": "nb-69-164-223-4.us-east-1a.nodebalancer.linode.com",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "client_conn_throttle",
                      "description": "Throttle connections per second. 0 to disable, max of 20.",
                      "editable": true,
                      "type": "integer",
                      "value": 10,
                      "example": null,
                      "schema": null
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
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "nodebalancers",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/nodebalancers"
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
                      "name": "id",
                      "description": "An integer.",
                      "type": "integer",
                      "value": 123456,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "label",
                      "description": "The NodeBalancer's display label. Must be 3-32 ASCII characters limited to letters, numbers, underscores, and dashes, starting and ending with a letter, and without two dashes or underscores in a row.",
                      "editable": true,
                      "type": "string",
                      "value": "nodebalancer12345",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "hostname",
                      "description": "The NodeBalancer's hostname.",
                      "editable": false,
                      "type": "string",
                      "value": "nb-69-164-223-4.us-east-1a.nodebalancer.linode.com",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "client_conn_throttle",
                      "description": "Throttle connections per second. 0 to disable, max of 20.",
                      "editable": true,
                      "type": "integer",
                      "value": 10,
                      "example": null,
                      "schema": null
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
            "path": "nodebalancers/:id",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/nodebalancers/:id"
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
            "path": "nodebalancers/:id/configs",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/nodebalancers/:id/configs"
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
            "path": "nodebalancers/:id/configs/:id",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/nodebalancers/:id/configs/:id"
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
            "path": "nodebalancers/:id/configs/:id/ssl",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/nodebalancers/:id/configs/:id/ssl"
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
            "path": "nodebalancers/:id/configs/:id/nodes",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/nodebalancers/:id/configs/:id/nodes"
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
            "path": "nodebalancers/:id/configs/:id/nodes/:id",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/nodebalancers/:id/configs/:id/nodes/:id"
          }
        ],
        "methods": null
      }
    ]
  },
  {
    "name": "Networking",
    "path": "/networking",
    "routePath": "/reference/networking",
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
            "path": "networking/ipv4",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/networking/ipv4"
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
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/networking/ipv4/:address"
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
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/networking/ipv6"
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
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/networking/ipv6/:address"
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
                  }
                ],
                "name": "POST"
              }
            ],
            "path": "networking/ip-assign",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/networking/ip-assign"
          }
        ],
        "methods": null
      }
    ]
  },
  {
    "name": "Regions",
    "path": "/regions",
    "routePath": "/reference/regions",
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
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "label",
                      "description": "Human-friendly region name.",
                      "filterable": true,
                      "type": "string",
                      "value": "Newark, NJ",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "country",
                      "description": "Country",
                      "filterable": true,
                      "type": "string",
                      "value": "US",
                      "example": null,
                      "schema": null
                    }
                  ]
                }
              }
            ],
            "path": "regions",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/regions"
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
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "label",
                      "description": "Human-friendly region name.",
                      "filterable": true,
                      "type": "string",
                      "value": "Newark, NJ",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "country",
                      "description": "Country",
                      "filterable": true,
                      "type": "string",
                      "value": "US",
                      "example": null,
                      "schema": null
                    }
                  ]
                }
              }
            ],
            "path": "regions/:id",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/regions/:id"
          }
        ],
        "methods": null
      }
    ]
  },
  {
    "name": "Support",
    "path": "/support",
    "routePath": "/reference/support",
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
                      "value": 1234,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "summary",
                      "description": "This is summary or title for the ticket.",
                      "type": "string",
                      "value": "A summary of the ticket.",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "description",
                      "description": "The full details of the issue or question.",
                      "type": "string",
                      "value": "More details about the ticket.",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "status",
                      "description": "The status of the ticket.",
                      "filterable": true,
                      "type": "enum",
                      "value": "open",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "opened",
                      "filterable": true,
                      "type": "datetime",
                      "value": "2017-02-23T11:21:01",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "closed",
                      "filterable": true,
                      "type": "datetime",
                      "value": "2017-02-25T03:20:00",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "closed_by",
                      "description": "The user who closed this ticket.",
                      "type": "string",
                      "value": "some_user",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "updated",
                      "filterable": true,
                      "type": "datetime",
                      "value": "2017-02-23T11:21:01",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "updated_by",
                      "description": "The user who last updated this ticket.",
                      "type": "string",
                      "value": "some_other_user",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "entity",
                      "description": "The entity this ticket was opened regarding",
                      "example": {
                        "id": 9302,
                        "label": "linode123",
                        "type": "linode",
                        "url": "/v4/linode/instances/123"
                      },
                      "schema": [
                        {
                          "name": "id",
                          "description": "The entity's ID that this event is for.  This is meaningless without a type.\n",
                          "type": "integer",
                          "value": 9302,
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "label",
                          "description": "The current label of this object.  This will reflect changes in label.\n",
                          "type": "string",
                          "value": "linode123",
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "type",
                          "description": "The type of entity this is related to.\n",
                          "type": "string",
                          "value": "linode",
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "url",
                          "description": "The URL where you can access the object this event is for.  If a relative URL, it is relative to the domain you retrieved the event from.\n",
                          "type": "string",
                          "value": "/v4/linode/instances/123",
                          "example": null,
                          "schema": null
                        }
                      ]
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
            "path": "support/tickets",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/support/tickets"
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
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "summary",
                      "description": "This is summary or title for the ticket.",
                      "type": "string",
                      "value": "A summary of the ticket.",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "description",
                      "description": "The full details of the issue or question.",
                      "type": "string",
                      "value": "More details about the ticket.",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "status",
                      "description": "The status of the ticket.",
                      "filterable": true,
                      "type": "enum",
                      "value": "open",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "opened",
                      "filterable": true,
                      "type": "datetime",
                      "value": "2017-02-23T11:21:01",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "closed",
                      "filterable": true,
                      "type": "datetime",
                      "value": "2017-02-25T03:20:00",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "closed_by",
                      "description": "The user who closed this ticket.",
                      "type": "string",
                      "value": "some_user",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "updated",
                      "filterable": true,
                      "type": "datetime",
                      "value": "2017-02-23T11:21:01",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "updated_by",
                      "description": "The user who last updated this ticket.",
                      "type": "string",
                      "value": "some_other_user",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "entity",
                      "description": "The entity this ticket was opened regarding",
                      "example": {
                        "id": 9302,
                        "label": "linode123",
                        "type": "linode",
                        "url": "/v4/linode/instances/123"
                      },
                      "schema": [
                        {
                          "name": "id",
                          "description": "The entity's ID that this event is for.  This is meaningless without a type.\n",
                          "type": "integer",
                          "value": 9302,
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "label",
                          "description": "The current label of this object.  This will reflect changes in label.\n",
                          "type": "string",
                          "value": "linode123",
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "type",
                          "description": "The type of entity this is related to.\n",
                          "type": "string",
                          "value": "linode",
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "url",
                          "description": "The URL where you can access the object this event is for.  If a relative URL, it is relative to the domain you retrieved the event from.\n",
                          "type": "string",
                          "value": "/v4/linode/instances/123",
                          "example": null,
                          "schema": null
                        }
                      ]
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
            "path": "support/tickets/:id",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/support/tickets/:id"
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
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "description",
                      "description": "The body of this ticket reply.",
                      "type": "string",
                      "value": "More details about the ticket.",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "created",
                      "description": "A timestamp for when the reply was submitted.",
                      "type": "datetime",
                      "value": "2017-02-23T11:21:01",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "created_by",
                      "description": "The user who submitted this reply.",
                      "type": "string",
                      "value": "some_other_user",
                      "example": null,
                      "schema": null
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
            "path": "support/tickets/:id/replies",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/support/tickets/:id/replies"
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
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/support/tickets/:id/attachments"
          }
        ],
        "methods": null
      }
    ]
  },
  {
    "name": "Account",
    "path": "/account",
    "routePath": "/reference/account",
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
                      "value": "example_user",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "email",
                      "description": "The email address of the user.\n",
                      "editable": true,
                      "type": "string",
                      "value": "person@place.com",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "timezone",
                      "description": "The selected timezone of the user location.",
                      "editable": true,
                      "type": "string",
                      "value": "US/Eastern",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "email_notifications",
                      "description": "Toggles to determine if the user receives email notifications",
                      "editable": true,
                      "type": "boolean",
                      "value": true,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "referrals",
                      "description": "Displays information related to referral signups attributed to the user.\n",
                      "example": {
                        "code": "rcg3340777c21fa49a5beb971ca1aec44bc584333",
                        "url": "https://www.linode.com/?r=rcg3340777c21fa49a5beb971ca1aec44bc584333",
                        "total": 10,
                        "completed": 8,
                        "pending": 2,
                        "credit": 160
                      },
                      "schema": [
                        {
                          "name": "code",
                          "description": "an alphanumeric code unique to each user for use in creating referral URLs.",
                          "type": "string",
                          "value": "rcg3340777c21fa49a5beb971ca1aec44bc584333",
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "url",
                          "description": "referral URL based on `code`.",
                          "type": "string",
                          "value": "https://www.linode.com/?r=rcg3340777c21fa49a5beb971ca1aec44bc584333",
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "total",
                          "description": "total number of referrals attributed to user.",
                          "type": "integer",
                          "value": 10,
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "completed",
                          "description": "total number of referrals attributed to user that have converted to full accounts.",
                          "type": "integer",
                          "value": 8,
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "pending",
                          "description": "total number of referrals attributed to user that have not yet converted to full accounts.",
                          "type": "integer",
                          "value": 2,
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "credit",
                          "description": "dollar amount of credit based on completed referrals.",
                          "type": "integer",
                          "value": 160,
                          "example": null,
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
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "lish_auth_method",
                      "description": "Controls what authentication methods are allowed to connect to the Lish console servers.\n",
                      "editable": true,
                      "type": "enum",
                      "value": "password_keys",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "authorized_keys",
                      "description": "Comma-delimited list of authorized SSH public keys",
                      "editable": true,
                      "type": "string",
                      "value": "ssh-rsa AADDDDB3NzaC1yc2EAAAADAQABAAACAQDzP5sZlvUR9nZPy0WrklktNXffq+nQoEYUdVJ0hpIzZs+KqjZ3CDbsJZF0g0pn1/gpY9oSEeXzFpWasdkjlfasdf09asldf+O+y8w6rbPe8IyP1mext4cmBe6g/nHAjw/k0rS6cuUFZu++snG0qubymE9gMZ3X0ac92TP7tk0dEwq1fbjumhqNmNyqSbt5j8pLuLRhYHhVszmwnuKjeGjm9mJLJGnd5V6IdZWEIhCjrNgNr1H+fVNI87ryFE31i/i/bnHcbnkNdAmDc2EQ2gJ33vXg8D8Nf2aI+K+e3t9MiFVTJmzAILQpvZQj2YV4mfOt+GSTUJ4VdgH9dNC/3lA0yoP6YoFYw0cdTKhJ0MotmR9iZepbJfbuXxAFOECJuC1bxFtUam3fIsGqj3vXi1R6CzRzxNERqPGLiFcXH8z0VTwXA1v+iflVd4KqihnwNtU+45TXTtFY0twLQRauB9qo9slvnhYlHqQZb8SBYw5WltX3MBQpyLTSZLQLqIKZVgQRKKF413fT52vMF54zk5SpImm5qY5Q1E4od00UJ1x4kFe0fTUQWVgeYvL8AgFx/idUsVs9r3jRPVTUnQZNB2D+7Cyf9dUFjjpiuH3AMMZyRYfJbh/Chg8J6QXYZyEQCxMRa9/lm2rRCVfGbcfb5zgKsV/HRHI/O1F9cZ9JvykwQ== someguy@someplace.com",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "two_factor_auth",
                      "description": "Toggles whether two factor authentication (TFA) is enabled or disabled.",
                      "editable": true,
                      "type": "boolean",
                      "value": true,
                      "example": null,
                      "schema": null
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
            "path": "account/profile",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/account/profile"
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
            "path": "account/profile/password",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/account/profile/password"
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
            "path": "account/profile/tfa-enable",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/account/profile/tfa-enable"
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
            "path": "account/profile/tfa-enable-confirm",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/account/profile/tfa-enable-confirm"
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
            "path": "account/profile/tfa-disable",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/account/profile/tfa-disable"
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
            "path": "account/profile/grants",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/account/profile/grants"
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
                      "value": 123,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "client",
                      "description": "The OAuthClient this token is associated with, or null if this is a Personal Access Token.\n",
                      "type": "oauthclient",
                      "value": null,
                      "example": {
                        "id": "0123456789abcdef0123",
                        "name": "Example OAuth app",
                        "secret": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
                        "redirect_uri": "https://oauthreturn.example.org/",
                        "status": "active"
                      },
                      "schema": [
                        {
                          "name": "id",
                          "description": "This application's OAuth client ID",
                          "type": "string",
                          "value": "0123456789abcdef0123",
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "name",
                          "description": "Human-friendly client name.",
                          "editable": true,
                          "filterable": true,
                          "type": "string",
                          "value": "Example OAuth app",
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "secret",
                          "description": "The app's client secret, used in the OAuth flow. Visible only on app creation.",
                          "type": "string",
                          "value": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "redirect_uri",
                          "description": "The URL to redirect to after the OAuth flow.",
                          "editable": true,
                          "type": "string",
                          "value": "https://oauthreturn.example.org/",
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "status",
                          "description": "The status of the client application.",
                          "type": "enum",
                          "value": "active",
                          "example": null,
                          "schema": null
                        }
                      ]
                    },
                    {
                      "name": "type",
                      "description": "If this is a Client Token or a Personal Access Token.\n",
                      "type": "enum",
                      "value": "personal_access_token",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "scopes",
                      "description": "The OAuth Scopes this token has.\n",
                      "type": "string",
                      "value": "*",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "label",
                      "description": "The label given to this token.\n",
                      "type": "string",
                      "value": "cli-token",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "created",
                      "type": "datetime",
                      "value": "2017-01-01T13:46:32.000Z",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "token",
                      "description": "The OAuth Token that you can use in API requests.  Except for the inital creation of the token, this field is truncated to 16 characters.\n",
                      "type": "string",
                      "value": "cd224292c853fe27...",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "expiry",
                      "description": "When this token expires.\n",
                      "type": "datetime",
                      "value": "2018-01-01T13:46:32.000Z",
                      "example": null,
                      "schema": null
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
            "path": "account/tokens",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/account/tokens"
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
                      "name": "id",
                      "description": "This token's ID.\n",
                      "type": "integer",
                      "value": 123,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "client",
                      "description": "The OAuthClient this token is associated with, or null if this is a Personal Access Token.\n",
                      "type": "oauthclient",
                      "value": null,
                      "example": {
                        "id": "0123456789abcdef0123",
                        "name": "Example OAuth app",
                        "secret": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
                        "redirect_uri": "https://oauthreturn.example.org/",
                        "status": "active"
                      },
                      "schema": [
                        {
                          "name": "id",
                          "description": "This application's OAuth client ID",
                          "type": "string",
                          "value": "0123456789abcdef0123",
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "name",
                          "description": "Human-friendly client name.",
                          "editable": true,
                          "filterable": true,
                          "type": "string",
                          "value": "Example OAuth app",
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "secret",
                          "description": "The app's client secret, used in the OAuth flow. Visible only on app creation.",
                          "type": "string",
                          "value": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "redirect_uri",
                          "description": "The URL to redirect to after the OAuth flow.",
                          "editable": true,
                          "type": "string",
                          "value": "https://oauthreturn.example.org/",
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "status",
                          "description": "The status of the client application.",
                          "type": "enum",
                          "value": "active",
                          "example": null,
                          "schema": null
                        }
                      ]
                    },
                    {
                      "name": "type",
                      "description": "If this is a Client Token or a Personal Access Token.\n",
                      "type": "enum",
                      "value": "personal_access_token",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "scopes",
                      "description": "The OAuth Scopes this token has.\n",
                      "type": "string",
                      "value": "*",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "label",
                      "description": "The label given to this token.\n",
                      "type": "string",
                      "value": "cli-token",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "created",
                      "type": "datetime",
                      "value": "2017-01-01T13:46:32.000Z",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "token",
                      "description": "The OAuth Token that you can use in API requests.  Except for the inital creation of the token, this field is truncated to 16 characters.\n",
                      "type": "string",
                      "value": "cd224292c853fe27...",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "expiry",
                      "description": "When this token expires.\n",
                      "type": "datetime",
                      "value": "2018-01-01T13:46:32.000Z",
                      "example": null,
                      "schema": null
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
            "path": "account/tokens/:id",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/account/tokens/:id"
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
                      "name": "username",
                      "description": "The username of the user.\n",
                      "type": "string",
                      "value": "example_user",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "email",
                      "description": "The email address of the user.\n",
                      "editable": true,
                      "type": "string",
                      "value": "person@place.com",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "timezone",
                      "description": "The selected timezone of the user location.",
                      "editable": true,
                      "type": "string",
                      "value": "US/Eastern",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "email_notifications",
                      "description": "Toggles to determine if the user receives email notifications",
                      "editable": true,
                      "type": "boolean",
                      "value": true,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "referrals",
                      "description": "Displays information related to referral signups attributed to the user.\n",
                      "example": {
                        "code": "rcg3340777c21fa49a5beb971ca1aec44bc584333",
                        "url": "https://www.linode.com/?r=rcg3340777c21fa49a5beb971ca1aec44bc584333",
                        "total": 10,
                        "completed": 8,
                        "pending": 2,
                        "credit": 160
                      },
                      "schema": [
                        {
                          "name": "code",
                          "description": "an alphanumeric code unique to each user for use in creating referral URLs.",
                          "type": "string",
                          "value": "rcg3340777c21fa49a5beb971ca1aec44bc584333",
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "url",
                          "description": "referral URL based on `code`.",
                          "type": "string",
                          "value": "https://www.linode.com/?r=rcg3340777c21fa49a5beb971ca1aec44bc584333",
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "total",
                          "description": "total number of referrals attributed to user.",
                          "type": "integer",
                          "value": 10,
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "completed",
                          "description": "total number of referrals attributed to user that have converted to full accounts.",
                          "type": "integer",
                          "value": 8,
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "pending",
                          "description": "total number of referrals attributed to user that have not yet converted to full accounts.",
                          "type": "integer",
                          "value": 2,
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "credit",
                          "description": "dollar amount of credit based on completed referrals.",
                          "type": "integer",
                          "value": 160,
                          "example": null,
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
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "lish_auth_method",
                      "description": "Controls what authentication methods are allowed to connect to the Lish console servers.\n",
                      "editable": true,
                      "type": "enum",
                      "value": "password_keys",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "authorized_keys",
                      "description": "Comma-delimited list of authorized SSH public keys",
                      "editable": true,
                      "type": "string",
                      "value": "ssh-rsa AADDDDB3NzaC1yc2EAAAADAQABAAACAQDzP5sZlvUR9nZPy0WrklktNXffq+nQoEYUdVJ0hpIzZs+KqjZ3CDbsJZF0g0pn1/gpY9oSEeXzFpWasdkjlfasdf09asldf+O+y8w6rbPe8IyP1mext4cmBe6g/nHAjw/k0rS6cuUFZu++snG0qubymE9gMZ3X0ac92TP7tk0dEwq1fbjumhqNmNyqSbt5j8pLuLRhYHhVszmwnuKjeGjm9mJLJGnd5V6IdZWEIhCjrNgNr1H+fVNI87ryFE31i/i/bnHcbnkNdAmDc2EQ2gJ33vXg8D8Nf2aI+K+e3t9MiFVTJmzAILQpvZQj2YV4mfOt+GSTUJ4VdgH9dNC/3lA0yoP6YoFYw0cdTKhJ0MotmR9iZepbJfbuXxAFOECJuC1bxFtUam3fIsGqj3vXi1R6CzRzxNERqPGLiFcXH8z0VTwXA1v+iflVd4KqihnwNtU+45TXTtFY0twLQRauB9qo9slvnhYlHqQZb8SBYw5WltX3MBQpyLTSZLQLqIKZVgQRKKF413fT52vMF54zk5SpImm5qY5Q1E4od00UJ1x4kFe0fTUQWVgeYvL8AgFx/idUsVs9r3jRPVTUnQZNB2D+7Cyf9dUFjjpiuH3AMMZyRYfJbh/Chg8J6QXYZyEQCxMRa9/lm2rRCVfGbcfb5zgKsV/HRHI/O1F9cZ9JvykwQ== someguy@someplace.com",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "two_factor_auth",
                      "description": "Toggles whether two factor authentication (TFA) is enabled or disabled.",
                      "editable": true,
                      "type": "boolean",
                      "value": true,
                      "example": null,
                      "schema": null
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
            "path": "account/settings",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/account/settings"
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
            "path": "account/clients",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/account/clients"
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
            "path": "account/clients/:id",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/account/clients/:id"
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
            "path": "account/clients/:id/reset_secret",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/account/clients/:id/reset_secret"
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
            "path": "account/clients/:id/thumbnail",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/account/clients/:id/thumbnail"
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
                      "name": "username",
                      "description": "The username of the user.\n",
                      "type": "string",
                      "value": "example_user",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "email",
                      "description": "The email address of the user.\n",
                      "editable": true,
                      "type": "string",
                      "value": "person@place.com",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "timezone",
                      "description": "The selected timezone of the user location.",
                      "editable": true,
                      "type": "string",
                      "value": "US/Eastern",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "email_notifications",
                      "description": "Toggles to determine if the user receives email notifications",
                      "editable": true,
                      "type": "boolean",
                      "value": true,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "referrals",
                      "description": "Displays information related to referral signups attributed to the user.\n",
                      "example": {
                        "code": "rcg3340777c21fa49a5beb971ca1aec44bc584333",
                        "url": "https://www.linode.com/?r=rcg3340777c21fa49a5beb971ca1aec44bc584333",
                        "total": 10,
                        "completed": 8,
                        "pending": 2,
                        "credit": 160
                      },
                      "schema": [
                        {
                          "name": "code",
                          "description": "an alphanumeric code unique to each user for use in creating referral URLs.",
                          "type": "string",
                          "value": "rcg3340777c21fa49a5beb971ca1aec44bc584333",
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "url",
                          "description": "referral URL based on `code`.",
                          "type": "string",
                          "value": "https://www.linode.com/?r=rcg3340777c21fa49a5beb971ca1aec44bc584333",
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "total",
                          "description": "total number of referrals attributed to user.",
                          "type": "integer",
                          "value": 10,
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "completed",
                          "description": "total number of referrals attributed to user that have converted to full accounts.",
                          "type": "integer",
                          "value": 8,
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "pending",
                          "description": "total number of referrals attributed to user that have not yet converted to full accounts.",
                          "type": "integer",
                          "value": 2,
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "credit",
                          "description": "dollar amount of credit based on completed referrals.",
                          "type": "integer",
                          "value": 160,
                          "example": null,
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
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "lish_auth_method",
                      "description": "Controls what authentication methods are allowed to connect to the Lish console servers.\n",
                      "editable": true,
                      "type": "enum",
                      "value": "password_keys",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "authorized_keys",
                      "description": "Comma-delimited list of authorized SSH public keys",
                      "editable": true,
                      "type": "string",
                      "value": "ssh-rsa AADDDDB3NzaC1yc2EAAAADAQABAAACAQDzP5sZlvUR9nZPy0WrklktNXffq+nQoEYUdVJ0hpIzZs+KqjZ3CDbsJZF0g0pn1/gpY9oSEeXzFpWasdkjlfasdf09asldf+O+y8w6rbPe8IyP1mext4cmBe6g/nHAjw/k0rS6cuUFZu++snG0qubymE9gMZ3X0ac92TP7tk0dEwq1fbjumhqNmNyqSbt5j8pLuLRhYHhVszmwnuKjeGjm9mJLJGnd5V6IdZWEIhCjrNgNr1H+fVNI87ryFE31i/i/bnHcbnkNdAmDc2EQ2gJ33vXg8D8Nf2aI+K+e3t9MiFVTJmzAILQpvZQj2YV4mfOt+GSTUJ4VdgH9dNC/3lA0yoP6YoFYw0cdTKhJ0MotmR9iZepbJfbuXxAFOECJuC1bxFtUam3fIsGqj3vXi1R6CzRzxNERqPGLiFcXH8z0VTwXA1v+iflVd4KqihnwNtU+45TXTtFY0twLQRauB9qo9slvnhYlHqQZb8SBYw5WltX3MBQpyLTSZLQLqIKZVgQRKKF413fT52vMF54zk5SpImm5qY5Q1E4od00UJ1x4kFe0fTUQWVgeYvL8AgFx/idUsVs9r3jRPVTUnQZNB2D+7Cyf9dUFjjpiuH3AMMZyRYfJbh/Chg8J6QXYZyEQCxMRa9/lm2rRCVfGbcfb5zgKsV/HRHI/O1F9cZ9JvykwQ== someguy@someplace.com",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "two_factor_auth",
                      "description": "Toggles whether two factor authentication (TFA) is enabled or disabled.",
                      "editable": true,
                      "type": "boolean",
                      "value": true,
                      "example": null,
                      "schema": null
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
            "path": "account/users",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/account/users"
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
                      "name": "username",
                      "description": "The username of the user.\n",
                      "type": "string",
                      "value": "example_user",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "email",
                      "description": "The email address of the user.\n",
                      "editable": true,
                      "type": "string",
                      "value": "person@place.com",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "timezone",
                      "description": "The selected timezone of the user location.",
                      "editable": true,
                      "type": "string",
                      "value": "US/Eastern",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "email_notifications",
                      "description": "Toggles to determine if the user receives email notifications",
                      "editable": true,
                      "type": "boolean",
                      "value": true,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "referrals",
                      "description": "Displays information related to referral signups attributed to the user.\n",
                      "example": {
                        "code": "rcg3340777c21fa49a5beb971ca1aec44bc584333",
                        "url": "https://www.linode.com/?r=rcg3340777c21fa49a5beb971ca1aec44bc584333",
                        "total": 10,
                        "completed": 8,
                        "pending": 2,
                        "credit": 160
                      },
                      "schema": [
                        {
                          "name": "code",
                          "description": "an alphanumeric code unique to each user for use in creating referral URLs.",
                          "type": "string",
                          "value": "rcg3340777c21fa49a5beb971ca1aec44bc584333",
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "url",
                          "description": "referral URL based on `code`.",
                          "type": "string",
                          "value": "https://www.linode.com/?r=rcg3340777c21fa49a5beb971ca1aec44bc584333",
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "total",
                          "description": "total number of referrals attributed to user.",
                          "type": "integer",
                          "value": 10,
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "completed",
                          "description": "total number of referrals attributed to user that have converted to full accounts.",
                          "type": "integer",
                          "value": 8,
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "pending",
                          "description": "total number of referrals attributed to user that have not yet converted to full accounts.",
                          "type": "integer",
                          "value": 2,
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "credit",
                          "description": "dollar amount of credit based on completed referrals.",
                          "type": "integer",
                          "value": 160,
                          "example": null,
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
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "lish_auth_method",
                      "description": "Controls what authentication methods are allowed to connect to the Lish console servers.\n",
                      "editable": true,
                      "type": "enum",
                      "value": "password_keys",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "authorized_keys",
                      "description": "Comma-delimited list of authorized SSH public keys",
                      "editable": true,
                      "type": "string",
                      "value": "ssh-rsa AADDDDB3NzaC1yc2EAAAADAQABAAACAQDzP5sZlvUR9nZPy0WrklktNXffq+nQoEYUdVJ0hpIzZs+KqjZ3CDbsJZF0g0pn1/gpY9oSEeXzFpWasdkjlfasdf09asldf+O+y8w6rbPe8IyP1mext4cmBe6g/nHAjw/k0rS6cuUFZu++snG0qubymE9gMZ3X0ac92TP7tk0dEwq1fbjumhqNmNyqSbt5j8pLuLRhYHhVszmwnuKjeGjm9mJLJGnd5V6IdZWEIhCjrNgNr1H+fVNI87ryFE31i/i/bnHcbnkNdAmDc2EQ2gJ33vXg8D8Nf2aI+K+e3t9MiFVTJmzAILQpvZQj2YV4mfOt+GSTUJ4VdgH9dNC/3lA0yoP6YoFYw0cdTKhJ0MotmR9iZepbJfbuXxAFOECJuC1bxFtUam3fIsGqj3vXi1R6CzRzxNERqPGLiFcXH8z0VTwXA1v+iflVd4KqihnwNtU+45TXTtFY0twLQRauB9qo9slvnhYlHqQZb8SBYw5WltX3MBQpyLTSZLQLqIKZVgQRKKF413fT52vMF54zk5SpImm5qY5Q1E4od00UJ1x4kFe0fTUQWVgeYvL8AgFx/idUsVs9r3jRPVTUnQZNB2D+7Cyf9dUFjjpiuH3AMMZyRYfJbh/Chg8J6QXYZyEQCxMRa9/lm2rRCVfGbcfb5zgKsV/HRHI/O1F9cZ9JvykwQ== someguy@someplace.com",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "two_factor_auth",
                      "description": "Toggles whether two factor authentication (TFA) is enabled or disabled.",
                      "editable": true,
                      "type": "boolean",
                      "value": true,
                      "example": null,
                      "schema": null
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
            "path": "account/users/:username",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/account/users/:username"
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
            "path": "account/users/:username/password",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/account/users/:username/password"
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
                      "description": "Grants involving global permissions, such as creating resources.",
                      "example": {
                        "add_linodes": true,
                        "add_nodebalancers": true,
                        "add_domains": true,
                        "add_longview": true,
                        "add_stackscripts": true,
                        "longview_subscription": true
                      },
                      "schema": [
                        {
                          "name": "add_linodes",
                          "description": "If this user may create Linodes.",
                          "type": "boolean",
                          "value": true,
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "add_nodebalancers",
                          "description": "If this user may create NodeBalancers.",
                          "type": "boolean",
                          "value": true,
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "add_domains",
                          "description": "If this user may create Domains.",
                          "type": "boolean",
                          "value": true,
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "add_longview",
                          "description": "If this user may create longview instances.",
                          "type": "boolean",
                          "value": true,
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "add_stackscripts",
                          "description": "If this user may create StackScripts.",
                          "type": "boolean",
                          "value": true,
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "longview_subscription",
                          "description": "If this user may manage longview subscription.",
                          "type": "boolean",
                          "value": true,
                          "example": null,
                          "schema": null
                        }
                      ]
                    },
                    {
                      "name": "customer",
                      "description": "Grants related to modifying the account.",
                      "example": {
                        "access": false,
                        "cancel": false
                      },
                      "schema": [
                        {
                          "name": "access",
                          "description": "If this user may modify the account.",
                          "type": "boolean",
                          "value": false,
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "cancel",
                          "description": "If this user may cancel the account.",
                          "type": "boolean",
                          "value": false,
                          "example": null,
                          "schema": null
                        }
                      ]
                    },
                    {
                      "name": "stackscript",
                      "description": "Individual grants to StackScripts you own.  Grants include all, use, edit and delete",
                      "type": "array",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "nodebalancer",
                      "description": "Individual grants to NodeBalancers you own.  Grants inlcude all, access, and delete",
                      "type": "array",
                      "example": null,
                      "schema": null
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
                      ],
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "domain",
                      "description": "Individual grants to a Domain you own.  Grants include all, access and delete",
                      "type": "array",
                      "example": null,
                      "schema": null
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
            "path": "account/users/:username/grants",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/account/users/:username/grants"
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
                      "value": 1234,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "entity",
                      "description": "Detailed inforrmation about the event's entity, including id, type, label, and URL used to access it.\n",
                      "example": {
                        "id": 9302,
                        "label": "linode123",
                        "type": "linode",
                        "url": "/v4/linode/instances/123"
                      },
                      "schema": [
                        {
                          "name": "id",
                          "description": "The entity's ID that this event is for.  This is meaningless without a type.\n",
                          "type": "integer",
                          "value": 9302,
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "label",
                          "description": "The current label of this object.  This will reflect changes in label.\n",
                          "type": "string",
                          "value": "linode123",
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "type",
                          "description": "The type of entity this is related to.\n",
                          "type": "string",
                          "value": "linode",
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "url",
                          "description": "The URL where you can access the object this event is for.  If a relative URL, it is relative to the domain you retrieved the event from.\n",
                          "type": "string",
                          "value": "/v4/linode/instances/123",
                          "example": null,
                          "schema": null
                        }
                      ]
                    },
                    {
                      "name": "action",
                      "description": "The action that caused this event.\n",
                      "type": "enum",
                      "value": "linode_reboot",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "username",
                      "description": "The username of the user who initiated this event.\n",
                      "type": "string",
                      "value": "example_user",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "status",
                      "description": "The current status of this event.  \n",
                      "type": "enum",
                      "value": "finished",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "percent_complete",
                      "description": "A percentage estimating the amount of time remaining for an event.  Returns null for notification events.\n",
                      "filterable": false,
                      "type": "integer",
                      "value": 20,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "rate",
                      "description": "The rate of completion of the event.  Currently only returned for migration and resize events.\n",
                      "type": "string",
                      "value": null,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "time_remaining",
                      "description": "The estimated time remaining until the completion of this event.  Currently only returned for in progress migrations or resizes.\n",
                      "type": "string",
                      "value": null,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "seen",
                      "description": "If this event has been seen.",
                      "type": "boolean",
                      "value": false,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "read",
                      "description": "If this event has been read.",
                      "type": "boolean",
                      "value": false,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "created",
                      "filterable": true,
                      "type": "datetime",
                      "value": "2014-12-24T18:00:09.000Z",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "updated",
                      "type": "datetime",
                      "value": "2014-12-24T19:00:09.000Z",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "user_id",
                      "description": "The ID of the user who initiated this event.\n",
                      "type": "integer",
                      "value": 234567,
                      "example": null,
                      "schema": null
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
            "path": "account/events",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/account/events"
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
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "entity",
                      "description": "Detailed inforrmation about the event's entity, including id, type, label, and URL used to access it.\n",
                      "example": {
                        "id": 9302,
                        "label": "linode123",
                        "type": "linode",
                        "url": "/v4/linode/instances/123"
                      },
                      "schema": [
                        {
                          "name": "id",
                          "description": "The entity's ID that this event is for.  This is meaningless without a type.\n",
                          "type": "integer",
                          "value": 9302,
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "label",
                          "description": "The current label of this object.  This will reflect changes in label.\n",
                          "type": "string",
                          "value": "linode123",
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "type",
                          "description": "The type of entity this is related to.\n",
                          "type": "string",
                          "value": "linode",
                          "example": null,
                          "schema": null
                        },
                        {
                          "name": "url",
                          "description": "The URL where you can access the object this event is for.  If a relative URL, it is relative to the domain you retrieved the event from.\n",
                          "type": "string",
                          "value": "/v4/linode/instances/123",
                          "example": null,
                          "schema": null
                        }
                      ]
                    },
                    {
                      "name": "action",
                      "description": "The action that caused this event.\n",
                      "type": "enum",
                      "value": "linode_reboot",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "username",
                      "description": "The username of the user who initiated this event.\n",
                      "type": "string",
                      "value": "example_user",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "status",
                      "description": "The current status of this event.  \n",
                      "type": "enum",
                      "value": "finished",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "percent_complete",
                      "description": "A percentage estimating the amount of time remaining for an event.  Returns null for notification events.\n",
                      "filterable": false,
                      "type": "integer",
                      "value": 20,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "rate",
                      "description": "The rate of completion of the event.  Currently only returned for migration and resize events.\n",
                      "type": "string",
                      "value": null,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "time_remaining",
                      "description": "The estimated time remaining until the completion of this event.  Currently only returned for in progress migrations or resizes.\n",
                      "type": "string",
                      "value": null,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "seen",
                      "description": "If this event has been seen.",
                      "type": "boolean",
                      "value": false,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "read",
                      "description": "If this event has been read.",
                      "type": "boolean",
                      "value": false,
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "created",
                      "filterable": true,
                      "type": "datetime",
                      "value": "2014-12-24T18:00:09.000Z",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "updated",
                      "type": "datetime",
                      "value": "2014-12-24T19:00:09.000Z",
                      "example": null,
                      "schema": null
                    },
                    {
                      "name": "user_id",
                      "description": "The ID of the user who initiated this event.\n",
                      "type": "integer",
                      "value": 234567,
                      "example": null,
                      "schema": null
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
            "path": "account/events/:id",
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/account/events/:id"
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
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/account/events/:id/seen"
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
            "formattedEndpoints": [],
            "routePath": "/reference/endpoints/account/events/:id/read"
          }
        ],
        "methods": null
      }
    ]
  }
] };