module.exports = { pythonObjects: {
  "LinodeLoginClient": {
    "name": "LinodeLoginClient",
    "path": "/linode-login-client",
    "routePath": "/guides/python/linode-login-client",
    "formattedPythonObject": {
      "name": "LinodeLoginClient",
      "import": "from linode import LinodeLoginClient",
      "desc": "The LinodeLoginClient class is responsible for communicating with login.linode.com and managing the OAuth workflow.\n",
      "constructor": {
        "name": "LinodeLoginClient",
        "parameters": {
          "client_id": {
            "_keyword": false,
            "desc": "The Client ID generated from the login service.\n"
          },
          "client_secret": {
            "_keyword": false,
            "desc": "The Client Secret generated from the login service.\n"
          },
          "base_url": {
            "_keyword": true,
            "desc": "Who this LinodeLoginClient should talk to.  Set to https://login.alpha.linode.com for alpha environment.",
            "_default": "'https://login.linode.com'"
          }
        },
        "example": "login_client = linode.LinodeLoginClient('my-client-id', 'my-client-secret', base_url='https://login.alpha.linode.com')\n"
      },
      "methods": {
        "generate_login_url": {
          "desc": "Generates a URL a user can be redirected to to authenticate.\n",
          "parameters": {
            "scopes": {
              "_keyword": true,
              "desc": "A list of OAuthScopes to request from the user",
              "_default": "None"
            },
            "redirect_url": {
              "_keyword": true,
              "desc": "The URI to redirect successful auths to.  If not provided, uses OAuth Client's default.",
              "_default": "None"
            }
          },
          "example": "login_client.generate_login_url(scopes=linode.OAuthScopes.all)\n",
          "returns": "A URL to send users to for authentication with login.linode.com"
        },
        "finish_oauth": {
          "desc": "Trades a temporary access code for an OAuth token\n",
          "parameters": {
            "code": {
              "_keyword": false,
              "desc": "The code you received from the OAuth callback."
            }
          },
          "example": "login_client.finish_oauth('my-callback-code')",
          "returns": "A tuple containing the OAuth Token received and the scopes authorized"
        }
      }
    }
  },
  "LinodeClient": {
    "name": "LinodeClient",
    "path": "/linode-client",
    "routePath": "/guides/python/linode-client",
    "formattedPythonObject": {
      "name": "LinodeClient",
      "import": "from linode import LinodeClient",
      "desc": "The <code>LinodeClient</code> class is responsible for communicating with https://api.linode.com\n",
      "constructor": {
        "name": "LinodeClient",
        "parameters": {
          "token": {
            "_keyword": false,
            "desc": "The OAuth Token to use when talking to the the API\n"
          },
          "base_url": {
            "_keyword": true,
            "desc": "Who this LinodeClient should talk to.  Set to https://api.alpha.linode.com/v4 for alpha environment.",
            "_default": "'https://api.linode.com/v4'"
          }
        },
        "example": "client = linode.LinodeClient('my-token', base_url='https://api.alpha.linode.com/v4')\n"
      },
      "methods": {
        "get_datacenters": {
          "desc": "Retrieves a list of Datacenter objects.  This function is filterable - include filters in the parameters list to retrieve only specific objects.\n",
          "parameters": {
            "*filters": {
              "desc": "Any number of filters to this function",
              "_keyword": false
            }
          },
          "example": "dc = client.get_datacenters(linode.Datacenter.label.contains(\"Newark\"))[0]\n",
          "returns": "A list of Datacenter objects"
        }
      },
      "groups": {
        "linode": {
          "name": "Linode",
          "desc": "Includes all methods for accessing and creating resources related to Linodes.\n",
          "methods": {
            "get_distributions": {
              "desc": "Retrieves a list of Distribution objects.  This function is filterable - include fitlers in the parameters list to retrieve only specific objects.\n",
              "parameters": {
                "*filters": {
                  "desc": "Any number of filters to this function",
                  "_keyword": false
                }
              },
              "example": "distros = client.linode.get_distributions(linode.Distribution.vendor == \"Debian\")\n",
              "returns": "A list of Distribution objects"
            },
            "get_services": {
              "desc": "Retrieves a list of Service objects.  This function is filterable - include filters in the parameters list to retrieve only specific objects.\n",
              "parameters": {
                "*filters": {
                  "desc": "Any number of filters to this function",
                  "_keyword": false
                }
              },
              "example": "service = client.linode.get_services(linode.Services.label == \"Linode 1024\")[0]\n",
              "returns": "A list of Service objects"
            },
            "get_instances": {
              "desc": "Retrives a list of Linode objects.  This function is filterable - include filters in the parameters list to retrieve only specific objects.\n",
              "parameters": {
                "*filters": {
                  "desc": "Any number of filters to this function",
                  "_keyword": false
                }
              },
              "example": "linodes = client.linode.get_linodes(linode.Linode.group == \"production\")\n",
              "returns": "A list of Linode objects"
            },
            "get_stackscripts": {
              "desc": "Retrieves a list of StackScript objects.  This function is filterable - include filters in the parameters list to retrieve only specific objects.\n",
              "parameters": {
                "*filters": {
                  "desc": "Any number of filters to this function",
                  "_keyword": false
                }
              },
              "example": "stackscripts = client.linode.get_stackscripts()\n",
              "returns": "A list of StackScript objects"
            },
            "get_kernels": {
              "desc": "Retrieves a list of Kernel objects.  This function is filterable - include filters in the parameters list to retrieve only specific objects.\n",
              "parameters": {
                "*filters": {
                  "desc": "Any number of filters to this function",
                  "_keyword": false
                }
              },
              "example": "kernels = client.linode.get_kernels(linode.Kernel.kvm == True)\n",
              "returns": "A list of Kernel objects"
            }
          },
          "create_instance": {
            "desc": "Creates a new Linode object.  Requires the <code>OAuthScopes.Linodes.create</code> scope.\n",
            "parameters": {
              "service": {
                "desc": "A Service object which represents the Linode plan to create.  Must be a Linode service.",
                "_keyword": false
              },
              "datacenter": {
                "desc": "A Datacenter object which is the datacenter in which this Linode will be created",
                "_keyword": false
              }
            },
            "example": "serv = client.linode.get_services(linode.Service.label == 'Linode 1024')[0]\ndc = client.get_datacenters(linode.Datacenter.label.contains('Newark'))[0]\nl = client.create_linode(serv, dc)\n",
            "returns": "A Linode object"
          },
          "create_instance*": {
            "desc": "Creates a new Linode object and deploys a Distribution to it.  Requires <code>OAuthScopes.Linodes.create</code> scope.\n",
            "parameters": {
              "service": {
                "desc": "A Service object which represents the Linode plan to create.  Must be a Linode service.",
                "_keyword": false
              },
              "datacenter": {
                "desc": "A Datacenter object which is the datacenter in which this Linode will be created",
                "_keyword": false
              },
              "source": {
                "desc": "A Distribution object to deiploy to this Linode.\n",
                "_keyword": true,
                "_default": "None"
              },
              "**kwargs": {
                "desc": "Any number of additional keyword arguments to pass to the POST /linodes endpoint.  These depend on the source parameter's value.  See the <a href=\"/reference/#ep-linodes-POST\">endpoint docs</a> for more information.\n",
                "_keyword": false
              }
            },
            "example": "serv = client.linode.get_services(linode.Service.label == 'Linode 1024')[0]\ndc = client.get_datacenters(linode.Datacenter.label.contains('Newark'))[0]\ndistro = client.linode.get_distributions(linode.Distribution.vendor == 'Debian')[-1]\nl = client.create_linode(serv, dc, source=distro)\n",
            "returns": "A tuple containing the new Linode object and generated root password for the Linode"
          },
          "create_instance**": {
            "desc": "Creates a new Linode object from a StackScript.  Requires the <code>OAuthScopes.Linodes.create</code> scope.\n",
            "parameters": {
              "service": {
                "desc": "A Service object which represents the Linode plan to create.  Must be a Linode service.",
                "_keyword": false
              },
              "datacenter": {
                "desc": "A Datacenter object which is the datacenter in which this Linode will be created",
                "_keyword": false
              },
              "stackscript_id": {
                "desc": "The StackScript to deploy this Linode with.\n",
                "_keyword": true,
                "_default": "None"
              },
              "stackscript_udf_responses": {
                "desc": "A dict containing values for all StackScript user-defined fields.\n",
                "_keyword": true,
                "_default": "None"
              },
              "source": {
                "desc": "The Distribution to deploy to this Linode.  Must be a Distribution the given StackScript supports.\n",
                "_keyword": true,
                "_default": "None"
              },
              "**kwargs": {
                "desc": "Any number of additional keyword arguments to pass to the POST /linodes endpoint.  These depend on the source parameter's value.  See the <a href=\"/reference/#ep-linodes-POST\">endpoint docs</a> more information.\n",
                "_keyword": false
              }
            },
            "example": "serv = client.linode.get_services(linode.Service.label == 'Linode 1024')[0]\ndc = client.get_datacenters(linode.Datacenter.label.contains('Newark'))[0]\ndistro = client.linode.get_distributions(linode.Distribution.vendor == 'Debian')[-1]\nstackscirpt = linode.StackScript(client, 'stackscript_123')\nl = client.create_linode(serv, dc, source=distro, stackscript_id=stackscript.id)\n",
            "returns": "A Linode object"
          },
          "create_stackscript": {
            "desc": "Creates a StackScript object.  Requirs the <code>OAuthScopes.StackScripts.create</code> scope.\n",
            "parameters": {
              "label": {
                "desc": "The label for this StackScript",
                "_keyword": false
              },
              "script": {
                "desc": "Either the script in its entirety, or a path to a file containing the script",
                "_keyword": false
              },
              "distros": {
                "desc": "Either one or a list of Distribution objects this StackScript runs on",
                "_keyword": false
              },
              "desc": {
                "desc": "The description of this StackScrip",
                "_keyword": true,
                "_default": "None"
              },
              "public": {
                "desc": "Whether or not this StackScript should be public",
                "_keyword": true,
                "_default": "False"
              },
              "**kwargs": {
                "desc": "Any number of additional keyword arguments to pass to the POST /stackscripts endpoint.  For more information, see the <a href=\"/reference/#ep-stackscripts-POST\">endpoint docs</a> for complete breakdown.\n",
                "_keyword": false
              }
            },
            "example": "distros = client.linode.get_distributions(linode.or_(linode.Distribution.vendor == 'Ubuntu', linode.Distribution.vendor == 'Debian'))\ns = client.create_stackscript('my-stackscript', '~/stackscripts/my-stackscript.sh', distros)\n"
          }
        },
        "dns": {
          "name": "Dns",
          "desc": "All methods for accessing and creating Dns-related resources\n",
          "methods": {
            "get_zones": {
              "desc": "Retrieves a list of DNS Zone objects.  This function is filterable - include filters in the parameters list to retrieve only specific objects.\n",
              "parameters": {
                "*filters": {
                  "desc": "Any number of filters to this function",
                  "_keyword": false
                }
              },
              "example": "dnszones = client.dns.get_zones()\n",
              "returns": "A list of DNS Zone objects"
            },
            "create_zone": {
              "desc": "Creates a new DNS Zone record.",
              "parameters": {
                "dnszone": {
                  "desc": "The DNS zone we are managing",
                  "_keyword": false
                },
                "master": {
                  "desc": "Is this the master DNS zone record?",
                  "_keyword": true,
                  "_default": "True"
                },
                "**kwargs": {
                  "desc": "Any number of additional keyword arguments to pass to the POST /dnszones endpoint.  For more information, see the <a href=\"/reference/#ep-dnszones-POST\">endpoint docs</a> for complete breakdown.\n",
                  "_keyword": false
                }
              },
              "example": "z = client.create_dnszone('example.org')\n"
            }
          }
        }
      }
    }
  },
  "Linode": {
    "name": "Linode",
    "path": "/linode",
    "routePath": "/guides/python/linode",
    "formattedPythonObject": {
      "name": "Linode",
      "import": "from linode import Linode",
      "_object": "linode",
      "desc": "A Linode.  Create linodes with <code>LinodeClient.create_linode</code>.  This class holds all attributes of a Linode and methods for managing it.\n",
      "_pylib_attributes": {
        "disks": {
          "_type": "list",
          "_description": "A list of Disks belonging to this Linode"
        },
        "configs": {
          "_type": "list",
          "_description": "A list of Configs belonging to this Linode"
        },
        "recent_backups": {
          "_type": "list",
          "_description": "A list of recent Backups for this Linode.  This is for record keeping only, you may not be able to restore all of them."
        },
        "ips": {
          "_type": "object",
          "_description": "A response object containing \"ipv4\" and \"ipv6\" attributes, both of which contain a list of the relevant type of IP Address for this Linode.\n"
        }
      },
      "constructor": {
        "name": "Linode",
        "parameters": {
          "client": {
            "_keyword": false,
            "desc": "The <code>LinodeClient</code> this object will use to communicate with the API."
          },
          "id": {
            "_keyword": false,
            "desc": "This Linode's ID."
          }
        },
        "example": "l = linode.Linode(client, \"123456\")\n"
      },
      "methods": {
        "boot": {
          "desc": "Requests a boot for this Linode.  This function returns immediatley following the API request, you should check the <code>state</code> attribute to see when the Linode has actually booted.\n",
          "parameters": {
            "config": {
              "_keyword": true,
              "desc": "The <code>Config</code> object to use when booting this Linode. By default, uses the only or last booted config.\n",
              "_default": "None"
            }
          },
          "example": "l.boot()\n",
          "returns": "True if boot request succeeded"
        },
        "shutdown": {
          "desc": "Requests a shutdown for this Linode.  This function returns immediatley following the API request, you should check the <code>state</code> attribute to see when the Linode has actually come offline.\n",
          "example": "l.shutdown()\n",
          "returns": "True if shutdown request succeeded"
        },
        "reboot": {
          "desc": "Requests a reboot for ths Linode.  This function returns immediately following the API request, you should check the <code>state</code> attribute to see when the Linode has actaully rebooted.\n",
          "example": "l.reboot()\n",
          "returns": "True if the reboot request succeeded"
        },
        "generate_root_password": {
          "desc": "Generates a random password to assign to the root account on the Linode.  This is used during deployment of a new Linode from a <code>Distribution</code> to create a root password if one was not provided.\n",
          "example": "linode.Linode.generate_root_password()\n",
          "returns": "A 32-character password."
        },
        "save": {
          "desc": "Sends any local changes to Editable fields of this Linode to the API, saving them.\n",
          "example": "l.save()\n",
          "returns": "True if the save succeeded"
        },
        "delete": {
          "desc": "Deletes this Linode from your account.  This is not reversable.\n",
          "example": "l.delete()",
          "returns": "True if the delete succueeded."
        },
        "create_config": {
          "desc": "Creates a new <code>Config</code> object for this Linode.  These do not need to be created manually - deploy a linode with <code>client.create_linode(serv, dc, source=distribution)</code> to have the API generate working config for you.\n",
          "parameters": {
            "kernel": {
              "_keyword": false,
              "desc": "The <code>Kernel</code> to use with this Config"
            },
            "label": {
              "_keyword": true,
              "desc": "The label for this Config",
              "_default": "None"
            },
            "disks": {
              "_keyword": true,
              "desc": "A list of <code>Disks</code> for this Config.  The first disk is sda, the second sdb, etc.",
              "_default": "None"
            },
            "**kwargs": {
              "_keyword": false,
              "desc": "Any number of other keyword arguments to pass to the POST /linodes/12345/configs endpoint.  See the <a href=\"/reference/index.html#ep-linodes-configs-POST\">API Reference</a> for a complete breakdown of all accepted values.\n"
            }
          },
          "example": "kernel = client.linode.get_kernels(linode.Kernel.kvm == True, linode.Kernel.label.contains(\"4\")).last()\nconfig = l.create_config(kernel, disks=[d for d in linode.disks])\n",
          "returns": "The new Config object"
        },
        "create_disk": {
          "desc": "Creates a new Disk of a given size.  This disk can be created raw or given a filesystem.\n",
          "parameters": {
            "size": {
              "_keyword": false,
              "desc": "The size of the new Disk"
            },
            "label": {
              "_keyword": true,
              "desc": "The label for the new Disk",
              "_default": "None"
            },
            "filesystem": {
              "_keyword": true,
              "desc": "The type of filesystem to deploy to the new disk (e.g. 'ext4', 'swap').  If None, creates a raw disk.",
              "_default": "None"
            },
            "read_only": {
              "_keyword": true,
              "desc": "If this disk should be created read-only",
              "_default": "False"
            }
          },
          "example": "disk = l.create_disk(2048, label='other_disk' filesystem='ext4')\n",
          "returns": "A new Disk object"
        },
        "create_disk*": {
          "desc": "Creates a Disk and deploys a <code>Distribution</code> to it.\n",
          "parameters": {
            "size": {
              "_keyword": false,
              "desc": "The size of the new Disk"
            },
            "label": {
              "_keyword": true,
              "desc": "The label for the new Disk",
              "_default": "None"
            },
            "distribution": {
              "_keyword": true,
              "desc": "A Distribution object to deploy to this disk upon creation.",
              "_default": "None"
            },
            "root_key": {
              "_keyword": true,
              "desc": "The ssh public key to include in the disk's filesystem's authorized_keys file for the root user.  Only include if a distribution was given as well.\n",
              "_default": "None"
            },
            "stackscript": {
              "_keyword": true,
              "desc": "The StackScript to deploy to this disk.",
              "_default": "None"
            },
            "**stackscrit_args": {
              "keyword": false,
              "desc": "Any number of additional keyword arguments, which will be sent as responses to the StackScript's user-defined fields."
            }
          },
          "example": "s = client.linode.get_stackscripts(linode.StackScript.label == 'my-aweomse-stackscript')[0]\ndisk, pw = l.create_disk(2048, distribution=s.distributions[0], stackscript=s, udf_value=\"foobar\")\n",
          "returns": "A tuple containing a new Disk object and the generated password for the root user on the new filesystem"
        },
        "create_disk**": {
          "desc": "Creates a Disk and deploys a <code>Distribution</code> to it, using the provided password for the root user.\n",
          "parameters": {
            "size": {
              "_keyword": false,
              "desc": "The size of the new Disk"
            },
            "label": {
              "_keyword": true,
              "desc": "The label for the new Disk",
              "_default": "None"
            },
            "distribution": {
              "_keyword": true,
              "desc": "A Distribution object to deploy to this disk upon creation.",
              "_default": "None"
            },
            "root_pass": {
              "_keyword": true,
              "desc": "The password for the root user in this disk's filesystem.  Only include if you are including a distribution as well. If a distribution is given and no root_pass is provided, one will be generated and returned along with the Disk.\n",
              "_default": "None"
            },
            "root_key": {
              "_keyword": true,
              "desc": "The ssh public key to include in the disk's filesystem's authorized_keys file for the root user.  Only include if a distribution was giben as well.\n",
              "_default": "None"
            },
            "stackscript": {
              "_keyword": true,
              "desc": "The StackScript to deploy to this disk.",
              "_default": "None"
            },
            "**stackscrit_args": {
              "keyword": false,
              "desc": "Any number of additional keyword arguments, which will be sent as responses to the StackScript's user-defined fields."
            }
          },
          "example": "s = client.linode.get_stackscripts(linode.StackScript.label == 'my-aweomse-stackscript')[0]\ndisk = l.create_disk(2048, distribution=s.distributions[0], root_pass='hunter2')\n",
          "returns": "A new Disk object"
        },
        "allocate_ip": {
          "desc": "Allocates a new IPv4 Address for this Linode.\n",
          "parameters": {
            "public": {
              "_keyword": true,
              "desc": "If True, allocate a Public IP address, else allocate a Private IP address.",
              "_default": false
            }
          },
          "example": "l.allocate_ip()",
          "returns": "True if the delete succueeded."
        },
        "rebuild": {
          "desc": "Deletes all Disks and Configs for this Linode, then deploys a Distribution to it.\n",
          "parameters": {
            "distribution": {
              "_keyword": true,
              "desc": "A Distribution object to deploy to this disk upon creation.",
              "_default": "None"
            },
            "root_pass": {
              "_keyword": true,
              "desc": "The password for the root user in this disk's filesystem.  Only include if you are including a distribution as well. If a distribution is given and no root_pass is provided, one will be generated and returned along with the Disk.\n",
              "_default": "None"
            },
            "root_key": {
              "_keyword": true,
              "desc": "The ssh public key to include in the disk's filesystem's authorized_keys file for the root user.  Only include if a distribution was giben as well.\n",
              "_default": "None"
            },
            "stackscript": {
              "_keyword": true,
              "desc": "The StackScript to deploy to this disk.",
              "_default": "None"
            },
            "**stackscrit_args": {
              "keyword": false,
              "desc": "Any number of additional keyword arguments, which will be sent as responses to the StackScript's user-defined fields."
            }
          },
          "example": "pw = l.rebuild(\"linode/debian8\")",
          "returns": "The root password generated for this deplpyment."
        }
      }
    }
  },
  "Config": {
    "name": "Config",
    "path": "/config",
    "routePath": "/guides/python/config",
    "formattedPythonObject": {
      "name": "Config",
      "import": "from linode import Config",
      "_object": "linode_config",
      "desc": "A Linode configuration profile.  This class maps Disks and a Kernel to a Linode, allowing it to boot. These do not need to be created manually - deploy a linode with <code>client.create_linode(serv, dc,  source=distribution)</code> to have the API generate a configuration for you.\n",
      "constructor": {
        "name": "Config",
        "parameters": {
          "client": {
            "_keyword": false,
            "desc": "The <code>LinodeClient</code> this object will use to communicate with the API."
          },
          "id": {
            "_keyword": false,
            "desc": "This Config's ID."
          },
          "parent_id": {
            "_keyword": false,
            "desc": "The <code>Linode</code> object's ID who owns this Config."
          }
        },
        "example": "config = linode.Config(client, \"My Debian 8.1 Disk Profile\", \"123456\")\n"
      },
      "methods": {
        "save": {
          "desc": "Sends any local changes to Editable fields of this Config to the API, saving them.\n",
          "example": "config.save()\n",
          "returns": "True if the save succeeded"
        },
        "delete": {
          "desc": "Deletes this Config.  This is not reversable.\n",
          "example": "config.delete()",
          "returns": "True if the delete succueeded."
        }
      }
    }
  },
  "Disk": {
    "name": "Disk",
    "path": "/disk",
    "routePath": "/guides/python/disk",
    "formattedPythonObject": {
      "name": "Disk",
      "import": "from linode import Disk",
      "_object": "disk",
      "desc": "A Linode disk.  These do not need to be created manually - deploy a linode with <code>client.create_linode(serv, dc, source=distribution)</code> to have the API generate working disks for you.\n",
      "constructor": {
        "name": "Disk",
        "parameters": {
          "client": {
            "_keyword": false,
            "desc": "The <code>LinodeClient</code> this object will use to communicate with the API."
          },
          "id": {
            "_keyword": false,
            "desc": "This Disk's ID."
          },
          "parent_id": {
            "_keyword": false,
            "desc": "The <code>Linode</code> object's ID who owns this Disk."
          }
        },
        "example": "disk = linode.Disk(client, \"Debian 8.1 Disk\", \"123456\")\n"
      },
      "methods": {
        "save": {
          "desc": "Sends any local changes to Editable fields of this Disk to the API, saving them.\n",
          "example": "disk.save()\n",
          "returns": "True if the save succeeded"
        },
        "delete": {
          "desc": "Deletes this Disk.  This is not reversable.\n",
          "example": "disk.delete()",
          "returns": "True if the delete succueeded."
        }
      }
    }
  },
  "Region": {
    "name": "Region",
    "path": "/region",
    "routePath": "/guides/python/region",
    "formattedPythonObject": {
      "name": "Region",
      "import": "from linode import Region",
      "_object": "region",
      "desc": "Represents a Region in the API.\n",
      "constructor": {
        "name": "Region",
        "parameters": {
          "client": {
            "_keyword": false,
            "desc": "The <code>LinodeClient</code> this object will use to communicate with the API."
          },
          "id": {
            "_keyword": false,
            "desc": "This Region's ID."
          }
        },
        "example": "region = linode.Region(client, \"us-east-1a\")\n"
      }
    }
  },
  "Distribution": {
    "name": "Distribution",
    "path": "/distribution",
    "routePath": "/guides/python/distribution",
    "formattedPythonObject": {
      "name": "Distribution",
      "import": "from linode import Distribution",
      "_object": "distribution",
      "desc": "Represents a Distribution in the API.\n",
      "constructor": {
        "name": "Distribution",
        "parameters": {
          "client": {
            "_keyword": false,
            "desc": "The <code>LinodeClient</code> this object will use to communicate with the API."
          },
          "id": {
            "_keyword": false,
            "desc": "This Distribution's ID."
          }
        },
        "example": "distro = linode.Distribution(client, \"linode/debian8\")\n"
      }
    }
  },
  "Backup": {
    "name": "Backup",
    "path": "/backup",
    "routePath": "/guides/python/backup",
    "formattedPythonObject": {
      "name": "Backup",
      "import": "from linode import Backup",
      "_object": "backup",
      "desc": "A Backup taken for a Linode.\n",
      "constructor": {
        "name": "Backup",
        "parameters": {
          "client": {
            "_keyword": false,
            "desc": "The <code>LinodeClient</code> this object will use to communicate with the API."
          },
          "id": {
            "_keyword": false,
            "desc": "This Backup's ID."
          },
          "parent_id": {
            "_keyword": false,
            "desc": "The <code>Linode</code> object's ID who owns this Backup."
          }
        },
        "example": "backup = linode.Backup(client, 543, 123)\n"
      },
      "methods": {
        "restore_to": {
          "desc": "Restores this Backup to a Linode\n",
          "example": "backup.restore_to(l)\n",
          "returns": "True if the restore succeeded",
          "parameters": {
            "linode": {
              "_keyword": false,
              "desc": "A linode object or ID to restore this Backup to."
            }
          }
        }
      }
    }
  },
  "IPAddress": {
    "name": "IPAddress",
    "path": "/ipaddress",
    "routePath": "/guides/python/ipaddress",
    "formattedPythonObject": {
      "name": "IPAddress",
      "import": "from linode import IPAddress",
      "_object": "ipaddress",
      "desc": "An IPv4 Address\n",
      "constructor": {
        "name": "IPAddress",
        "parameters": {
          "client": {
            "_keyword": false,
            "desc": "The <code>LinodeClient</code> this object will use to communicate with the API."
          },
          "id": {
            "_keyword": false,
            "desc": "This IPAddress' ID."
          },
          "parent_id": {
            "_keyword": false,
            "desc": "The <code>Linode</code> object's ID who owns this IPAddress."
          }
        },
        "example": "ipaddress = linode.IPAddress(client, 764, 123)\n"
      }
    }
  },
  "IPv6Address": {
    "name": "IPv6Address",
    "path": "/ipv6address",
    "routePath": "/guides/python/ipv6address",
    "formattedPythonObject": {
      "name": "IPv6Address",
      "import": "from linode import IPv6Address",
      "_object": "ipv6-address",
      "desc": "An IPv6 Address\n",
      "constructor": {
        "name": "IPv6Address",
        "parameters": {
          "client": {
            "_keyword": false,
            "desc": "The <code>LinodeClient</code> this object will use to communicate with the API."
          },
          "id": {
            "_keyword": false,
            "desc": "This IPv6Address' ID."
          },
          "parent_id": {
            "_keyword": false,
            "desc": "The <code>Linode</code> object's ID who owns this IPv6Address."
          }
        },
        "example": "ipaddress = linode.IPAddress(client, 764, 123)\n"
      }
    }
  },
  "Kernel": {
    "name": "Kernel",
    "path": "/kernel",
    "routePath": "/guides/python/kernel",
    "formattedPythonObject": {
      "name": "Kernel",
      "import": "from linode import Kernel",
      "_object": "kernel",
      "desc": "Represents a Kernel in the API.\n",
      "constructor": {
        "name": "Kernel",
        "parameters": {
          "client": {
            "_keyword": false,
            "desc": "The <code>LinodeClient</code> this object will use to communicate with the API."
          },
          "id": {
            "_keyword": false,
            "desc": "This Kernel's ID."
          }
        },
        "example": "kernel = linode.Kernel(client, \"linode/latest_64\")\n"
      }
    }
  },
  "Service": {
    "name": "Service",
    "path": "/service",
    "routePath": "/guides/python/service",
    "formattedPythonObject": {
      "name": "Service",
      "import": "from linode import Service",
      "_object": "service",
      "desc": "Represents a Service in the API.\n",
      "constructor": {
        "name": "Service",
        "parameters": {
          "client": {
            "_keyword": false,
            "desc": "The <code>LinodeClient</code> this object will use to communicate with the API."
          },
          "id": {
            "_keyword": false,
            "desc": "This Service's ID."
          }
        },
        "example": "service = linode.Service(client, \"linode2048.5\")\n"
      }
    }
  },
  "StackScript": {
    "name": "StackScript",
    "path": "/stackscript",
    "routePath": "/guides/python/stackscript",
    "formattedPythonObject": {
      "name": "StackScript",
      "import": "from linode import StackScript",
      "_object": "stackscript",
      "desc": "Represents a StackScript in the API.\n",
      "constructor": {
        "name": "StackScript",
        "parameters": {
          "client": {
            "_keyword": false,
            "desc": "The <code>LinodeClient</code> this object will use to communicate with the API."
          },
          "id": {
            "_keyword": false,
            "desc": "This StackScript's ID."
          }
        },
        "example": "stackscript = linode.StackScript(client, 6)\n"
      },
      "methods": {
        "save": {
          "desc": "Sends any local changes to Editable fields of this StackScript to the API, saving them.\n",
          "example": "stackscript.save()\n",
          "returns": "True if the save succeeded"
        }
      }
    }
  },
  "DNS Zone": {
    "name": "DNS Zone",
    "path": "/dnszone",
    "routePath": "/guides/python/dnszone",
    "formattedPythonObject": {
      "name": "DNS Zone",
      "import": "from linode import DNSZone",
      "_object": "dnszone",
      "desc": "Represents a DNS Zone in the API.\n",
      "_pylib_attributes": {
        "records": {
          "_type": "list",
          "_description": "A list of DNSZoneRecords belonging to this DNS Zone"
        }
      },
      "constructor": {
        "name": "DNSZone",
        "parameters": {
          "client": {
            "_keyword": false,
            "desc": "The <code>LinodeClient</code> this object will use to communicate with the API."
          },
          "id": {
            "_keyword": false,
            "desc": "This DNS Zone's ID."
          }
        },
        "example": "dnszone = linode.DNSZone(client, \"example.org\")\n"
      },
      "methods": {
        "save": {
          "desc": "Sends any local changes to Editable fields of this DNS Zone to the API, saving them.\n",
          "example": "dnszone.save()\n",
          "returns": "True if the save succeeded"
        },
        "delete": {
          "desc": "Deletes this DNS Zone from your account.  This is not reversable.\n",
          "example": "dnszone.delete()",
          "returns": "True if the delete succueeded."
        },
        "create_record": {
          "desc": "Creates a new DNSZoneRecord for this DNS Zone",
          "parameters": {
            "record_type": {
              "_keyword": false,
              "desc": "The type of record to create (A, AAA, etc.)"
            },
            "**kwargs": {
              "_keyword": false,
              "desc": "Any number of keyword arguments to send to the POST /dnszones/example.org endpoint.  See the <a href=\"/reference#ep-dnszones-records-POST\">endpoint docs</a> for more information.\n"
            }
          },
          "example": "dnszone_record = dnszone.create_record('AAA')\n",
          "returns": "A new DNSZoneRecord object"
        }
      }
    }
  },
  "DNS Zone Record": {
    "name": "DNS Zone Record",
    "path": "/dnszone-record",
    "routePath": "/guides/python/dnszone-record",
    "formattedPythonObject": {
      "name": "DNS Zone Record",
      "import": "from linode import DNSZoneRecord",
      "_object": "dnszonerecord",
      "desc": "A DNS Zone record.\n",
      "constructor": {
        "name": "DNSZoneRecord",
        "parameters": {
          "client": {
            "_keyword": false,
            "desc": "The <code>LinodeClient</code> this object will use to communicate with the API."
          },
          "id": {
            "_keyword": false,
            "desc": "This DNSZoneRecord's ID."
          },
          "parent_id": {
            "_keyword": false,
            "desc": "The <code>Linode</code> object's ID who owns this DNSZoneRecord."
          }
        },
        "example": "dnszonerecord = linode.DNSZoneRecord(client, \"example.org\", \"www\")\n"
      },
      "methods": {
        "save": {
          "desc": "Sends any local changes to Editable fields of this DNSZoneRecord to the API, saving them.\n",
          "example": "record.save()\n",
          "returns": "True if the save succeeded"
        },
        "delete": {
          "desc": "Deletes this DNSZoneRecord.  This is not reversable.\n",
          "example": "record.delete()",
          "returns": "True if the delete succueeded."
        }
      }
    }
  }
} };