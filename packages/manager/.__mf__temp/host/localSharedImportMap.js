
// Windows temporarily needs this file, https://github.com/module-federation/vite/issues/68

    const importMap = {
      
        "@linode/api-v4": async () => {
          let pkg = await import("__mf__virtual/host__prebuild___mf_0_linode_mf_1_api_mf_2_v4__prebuild__.js")
          return pkg
        }
      ,
        "@linode/api-v4/lib": async () => {
          let pkg = await import("__mf__virtual/host__prebuild___mf_0_linode_mf_1_api_mf_2_v4_mf_1_lib__prebuild__.js")
          return pkg
        }
      ,
        "@linode/api-v4/lib/account": async () => {
          let pkg = await import("__mf__virtual/host__prebuild___mf_0_linode_mf_1_api_mf_2_v4_mf_1_lib_mf_1_account__prebuild__.js")
          return pkg
        }
      ,
        "@linode/api-v4/lib/account/payments": async () => {
          let pkg = await import("__mf__virtual/host__prebuild___mf_0_linode_mf_1_api_mf_2_v4_mf_1_lib_mf_1_account_mf_1_payments__prebuild__.js")
          return pkg
        }
      ,
        "@linode/api-v4/lib/betas": async () => {
          let pkg = await import("__mf__virtual/host__prebuild___mf_0_linode_mf_1_api_mf_2_v4_mf_1_lib_mf_1_betas__prebuild__.js")
          return pkg
        }
      ,
        "@linode/api-v4/lib/cloudpulse": async () => {
          let pkg = await import("__mf__virtual/host__prebuild___mf_0_linode_mf_1_api_mf_2_v4_mf_1_lib_mf_1_cloudpulse__prebuild__.js")
          return pkg
        }
      ,
        "@linode/api-v4/lib/databases": async () => {
          let pkg = await import("__mf__virtual/host__prebuild___mf_0_linode_mf_1_api_mf_2_v4_mf_1_lib_mf_1_databases__prebuild__.js")
          return pkg
        }
      ,
        "@linode/api-v4/lib/databases/databases": async () => {
          let pkg = await import("__mf__virtual/host__prebuild___mf_0_linode_mf_1_api_mf_2_v4_mf_1_lib_mf_1_databases_mf_1_databases__prebuild__.js")
          return pkg
        }
      ,
        "@linode/api-v4/lib/domains": async () => {
          let pkg = await import("__mf__virtual/host__prebuild___mf_0_linode_mf_1_api_mf_2_v4_mf_1_lib_mf_1_domains__prebuild__.js")
          return pkg
        }
      ,
        "@linode/api-v4/lib/firewalls": async () => {
          let pkg = await import("__mf__virtual/host__prebuild___mf_0_linode_mf_1_api_mf_2_v4_mf_1_lib_mf_1_firewalls__prebuild__.js")
          return pkg
        }
      ,
        "@linode/api-v4/lib/kubernetes": async () => {
          let pkg = await import("__mf__virtual/host__prebuild___mf_0_linode_mf_1_api_mf_2_v4_mf_1_lib_mf_1_kubernetes__prebuild__.js")
          return pkg
        }
      ,
        "@linode/api-v4/lib/linodes": async () => {
          let pkg = await import("__mf__virtual/host__prebuild___mf_0_linode_mf_1_api_mf_2_v4_mf_1_lib_mf_1_linodes__prebuild__.js")
          return pkg
        }
      ,
        "@linode/api-v4/lib/linodes/actions": async () => {
          let pkg = await import("__mf__virtual/host__prebuild___mf_0_linode_mf_1_api_mf_2_v4_mf_1_lib_mf_1_linodes_mf_1_actions__prebuild__.js")
          return pkg
        }
      ,
        "@linode/api-v4/lib/longview": async () => {
          let pkg = await import("__mf__virtual/host__prebuild___mf_0_linode_mf_1_api_mf_2_v4_mf_1_lib_mf_1_longview__prebuild__.js")
          return pkg
        }
      ,
        "@linode/api-v4/lib/managed": async () => {
          let pkg = await import("__mf__virtual/host__prebuild___mf_0_linode_mf_1_api_mf_2_v4_mf_1_lib_mf_1_managed__prebuild__.js")
          return pkg
        }
      ,
        "@linode/api-v4/lib/object-storage": async () => {
          let pkg = await import("__mf__virtual/host__prebuild___mf_0_linode_mf_1_api_mf_2_v4_mf_1_lib_mf_1_object_mf_2_storage__prebuild__.js")
          return pkg
        }
      ,
        "@linode/api-v4/lib/placement-groups": async () => {
          let pkg = await import("__mf__virtual/host__prebuild___mf_0_linode_mf_1_api_mf_2_v4_mf_1_lib_mf_1_placement_mf_2_groups__prebuild__.js")
          return pkg
        }
      ,
        "@linode/api-v4/lib/profile": async () => {
          let pkg = await import("__mf__virtual/host__prebuild___mf_0_linode_mf_1_api_mf_2_v4_mf_1_lib_mf_1_profile__prebuild__.js")
          return pkg
        }
      ,
        "@linode/api-v4/lib/regions": async () => {
          let pkg = await import("__mf__virtual/host__prebuild___mf_0_linode_mf_1_api_mf_2_v4_mf_1_lib_mf_1_regions__prebuild__.js")
          return pkg
        }
      ,
        "@linode/api-v4/lib/request": async () => {
          let pkg = await import("__mf__virtual/host__prebuild___mf_0_linode_mf_1_api_mf_2_v4_mf_1_lib_mf_1_request__prebuild__.js")
          return pkg
        }
      ,
        "@linode/api-v4/lib/support": async () => {
          let pkg = await import("__mf__virtual/host__prebuild___mf_0_linode_mf_1_api_mf_2_v4_mf_1_lib_mf_1_support__prebuild__.js")
          return pkg
        }
      ,
        "@linode/api-v4/lib/vlans": async () => {
          let pkg = await import("__mf__virtual/host__prebuild___mf_0_linode_mf_1_api_mf_2_v4_mf_1_lib_mf_1_vlans__prebuild__.js")
          return pkg
        }
      ,
        "react": async () => {
          let pkg = await import("__mf__virtual/host__prebuild__react__prebuild__.js")
          return pkg
        }
      
    }
      const usedShared = {
      
          "@linode/api-v4": {
            name: "@linode/api-v4",
            version: "0.148.0",
            scope: ["default"],
            loaded: false,
            from: "host",
            async get () {
              usedShared["@linode/api-v4"].loaded = true
              const {"@linode/api-v4": pkgDynamicImport} = importMap 
              const res = await pkgDynamicImport()
              const exportModule = {...res}
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              })
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^0.148.0"
            }
          }
        ,
          "@linode/api-v4/lib": {
            name: "@linode/api-v4/lib",
            version: "0.148.0",
            scope: ["default"],
            loaded: false,
            from: "host",
            async get () {
              usedShared["@linode/api-v4/lib"].loaded = true
              const {"@linode/api-v4/lib": pkgDynamicImport} = importMap 
              const res = await pkgDynamicImport()
              const exportModule = {...res}
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              })
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^0.148.0"
            }
          }
        ,
          "@linode/api-v4/lib/account": {
            name: "@linode/api-v4/lib/account",
            version: "0.148.0",
            scope: ["default"],
            loaded: false,
            from: "host",
            async get () {
              usedShared["@linode/api-v4/lib/account"].loaded = true
              const {"@linode/api-v4/lib/account": pkgDynamicImport} = importMap 
              const res = await pkgDynamicImport()
              const exportModule = {...res}
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              })
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^0.148.0"
            }
          }
        ,
          "@linode/api-v4/lib/account/payments": {
            name: "@linode/api-v4/lib/account/payments",
            version: "0.148.0",
            scope: ["default"],
            loaded: false,
            from: "host",
            async get () {
              usedShared["@linode/api-v4/lib/account/payments"].loaded = true
              const {"@linode/api-v4/lib/account/payments": pkgDynamicImport} = importMap 
              const res = await pkgDynamicImport()
              const exportModule = {...res}
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              })
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^0.148.0"
            }
          }
        ,
          "@linode/api-v4/lib/betas": {
            name: "@linode/api-v4/lib/betas",
            version: "0.148.0",
            scope: ["default"],
            loaded: false,
            from: "host",
            async get () {
              usedShared["@linode/api-v4/lib/betas"].loaded = true
              const {"@linode/api-v4/lib/betas": pkgDynamicImport} = importMap 
              const res = await pkgDynamicImport()
              const exportModule = {...res}
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              })
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^0.148.0"
            }
          }
        ,
          "@linode/api-v4/lib/cloudpulse": {
            name: "@linode/api-v4/lib/cloudpulse",
            version: "0.148.0",
            scope: ["default"],
            loaded: false,
            from: "host",
            async get () {
              usedShared["@linode/api-v4/lib/cloudpulse"].loaded = true
              const {"@linode/api-v4/lib/cloudpulse": pkgDynamicImport} = importMap 
              const res = await pkgDynamicImport()
              const exportModule = {...res}
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              })
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^0.148.0"
            }
          }
        ,
          "@linode/api-v4/lib/databases": {
            name: "@linode/api-v4/lib/databases",
            version: "0.148.0",
            scope: ["default"],
            loaded: false,
            from: "host",
            async get () {
              usedShared["@linode/api-v4/lib/databases"].loaded = true
              const {"@linode/api-v4/lib/databases": pkgDynamicImport} = importMap 
              const res = await pkgDynamicImport()
              const exportModule = {...res}
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              })
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^0.148.0"
            }
          }
        ,
          "@linode/api-v4/lib/databases/databases": {
            name: "@linode/api-v4/lib/databases/databases",
            version: "0.148.0",
            scope: ["default"],
            loaded: false,
            from: "host",
            async get () {
              usedShared["@linode/api-v4/lib/databases/databases"].loaded = true
              const {"@linode/api-v4/lib/databases/databases": pkgDynamicImport} = importMap 
              const res = await pkgDynamicImport()
              const exportModule = {...res}
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              })
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^0.148.0"
            }
          }
        ,
          "@linode/api-v4/lib/domains": {
            name: "@linode/api-v4/lib/domains",
            version: "0.148.0",
            scope: ["default"],
            loaded: false,
            from: "host",
            async get () {
              usedShared["@linode/api-v4/lib/domains"].loaded = true
              const {"@linode/api-v4/lib/domains": pkgDynamicImport} = importMap 
              const res = await pkgDynamicImport()
              const exportModule = {...res}
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              })
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^0.148.0"
            }
          }
        ,
          "@linode/api-v4/lib/firewalls": {
            name: "@linode/api-v4/lib/firewalls",
            version: "0.148.0",
            scope: ["default"],
            loaded: false,
            from: "host",
            async get () {
              usedShared["@linode/api-v4/lib/firewalls"].loaded = true
              const {"@linode/api-v4/lib/firewalls": pkgDynamicImport} = importMap 
              const res = await pkgDynamicImport()
              const exportModule = {...res}
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              })
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^0.148.0"
            }
          }
        ,
          "@linode/api-v4/lib/kubernetes": {
            name: "@linode/api-v4/lib/kubernetes",
            version: "0.148.0",
            scope: ["default"],
            loaded: false,
            from: "host",
            async get () {
              usedShared["@linode/api-v4/lib/kubernetes"].loaded = true
              const {"@linode/api-v4/lib/kubernetes": pkgDynamicImport} = importMap 
              const res = await pkgDynamicImport()
              const exportModule = {...res}
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              })
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^0.148.0"
            }
          }
        ,
          "@linode/api-v4/lib/linodes": {
            name: "@linode/api-v4/lib/linodes",
            version: "0.148.0",
            scope: ["default"],
            loaded: false,
            from: "host",
            async get () {
              usedShared["@linode/api-v4/lib/linodes"].loaded = true
              const {"@linode/api-v4/lib/linodes": pkgDynamicImport} = importMap 
              const res = await pkgDynamicImport()
              const exportModule = {...res}
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              })
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^0.148.0"
            }
          }
        ,
          "@linode/api-v4/lib/linodes/actions": {
            name: "@linode/api-v4/lib/linodes/actions",
            version: "0.148.0",
            scope: ["default"],
            loaded: false,
            from: "host",
            async get () {
              usedShared["@linode/api-v4/lib/linodes/actions"].loaded = true
              const {"@linode/api-v4/lib/linodes/actions": pkgDynamicImport} = importMap 
              const res = await pkgDynamicImport()
              const exportModule = {...res}
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              })
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^0.148.0"
            }
          }
        ,
          "@linode/api-v4/lib/longview": {
            name: "@linode/api-v4/lib/longview",
            version: "0.148.0",
            scope: ["default"],
            loaded: false,
            from: "host",
            async get () {
              usedShared["@linode/api-v4/lib/longview"].loaded = true
              const {"@linode/api-v4/lib/longview": pkgDynamicImport} = importMap 
              const res = await pkgDynamicImport()
              const exportModule = {...res}
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              })
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^0.148.0"
            }
          }
        ,
          "@linode/api-v4/lib/managed": {
            name: "@linode/api-v4/lib/managed",
            version: "0.148.0",
            scope: ["default"],
            loaded: false,
            from: "host",
            async get () {
              usedShared["@linode/api-v4/lib/managed"].loaded = true
              const {"@linode/api-v4/lib/managed": pkgDynamicImport} = importMap 
              const res = await pkgDynamicImport()
              const exportModule = {...res}
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              })
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^0.148.0"
            }
          }
        ,
          "@linode/api-v4/lib/object-storage": {
            name: "@linode/api-v4/lib/object-storage",
            version: "0.148.0",
            scope: ["default"],
            loaded: false,
            from: "host",
            async get () {
              usedShared["@linode/api-v4/lib/object-storage"].loaded = true
              const {"@linode/api-v4/lib/object-storage": pkgDynamicImport} = importMap 
              const res = await pkgDynamicImport()
              const exportModule = {...res}
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              })
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^0.148.0"
            }
          }
        ,
          "@linode/api-v4/lib/placement-groups": {
            name: "@linode/api-v4/lib/placement-groups",
            version: "0.148.0",
            scope: ["default"],
            loaded: false,
            from: "host",
            async get () {
              usedShared["@linode/api-v4/lib/placement-groups"].loaded = true
              const {"@linode/api-v4/lib/placement-groups": pkgDynamicImport} = importMap 
              const res = await pkgDynamicImport()
              const exportModule = {...res}
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              })
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^0.148.0"
            }
          }
        ,
          "@linode/api-v4/lib/profile": {
            name: "@linode/api-v4/lib/profile",
            version: "0.148.0",
            scope: ["default"],
            loaded: false,
            from: "host",
            async get () {
              usedShared["@linode/api-v4/lib/profile"].loaded = true
              const {"@linode/api-v4/lib/profile": pkgDynamicImport} = importMap 
              const res = await pkgDynamicImport()
              const exportModule = {...res}
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              })
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^0.148.0"
            }
          }
        ,
          "@linode/api-v4/lib/regions": {
            name: "@linode/api-v4/lib/regions",
            version: "0.148.0",
            scope: ["default"],
            loaded: false,
            from: "host",
            async get () {
              usedShared["@linode/api-v4/lib/regions"].loaded = true
              const {"@linode/api-v4/lib/regions": pkgDynamicImport} = importMap 
              const res = await pkgDynamicImport()
              const exportModule = {...res}
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              })
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^0.148.0"
            }
          }
        ,
          "@linode/api-v4/lib/request": {
            name: "@linode/api-v4/lib/request",
            version: "0.148.0",
            scope: ["default"],
            loaded: false,
            from: "host",
            async get () {
              usedShared["@linode/api-v4/lib/request"].loaded = true
              const {"@linode/api-v4/lib/request": pkgDynamicImport} = importMap 
              const res = await pkgDynamicImport()
              const exportModule = {...res}
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              })
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^0.148.0"
            }
          }
        ,
          "@linode/api-v4/lib/support": {
            name: "@linode/api-v4/lib/support",
            version: "0.148.0",
            scope: ["default"],
            loaded: false,
            from: "host",
            async get () {
              usedShared["@linode/api-v4/lib/support"].loaded = true
              const {"@linode/api-v4/lib/support": pkgDynamicImport} = importMap 
              const res = await pkgDynamicImport()
              const exportModule = {...res}
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              })
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^0.148.0"
            }
          }
        ,
          "@linode/api-v4/lib/vlans": {
            name: "@linode/api-v4/lib/vlans",
            version: "0.148.0",
            scope: ["default"],
            loaded: false,
            from: "host",
            async get () {
              usedShared["@linode/api-v4/lib/vlans"].loaded = true
              const {"@linode/api-v4/lib/vlans": pkgDynamicImport} = importMap 
              const res = await pkgDynamicImport()
              const exportModule = {...res}
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              })
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^0.148.0"
            }
          }
        ,
          "react": {
            name: "react",
            version: "19.1.0",
            scope: ["default"],
            loaded: false,
            from: "host",
            async get () {
              usedShared["react"].loaded = true
              const {"react": pkgDynamicImport} = importMap 
              const res = await pkgDynamicImport()
              const exportModule = {...res}
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              })
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: true,
              requiredVersion: "^19.1.0"
            }
          }
        
    }
      const usedRemotes = [
                {
                  entryGlobalName: "betas",
                  name: "betas",
                  type: "module",
                  entry: "http://localhost:4000/remoteEntry.js",
                  shareScope: "default",
                }
          
      ]
      export {
        usedShared,
        usedRemotes
      }
      