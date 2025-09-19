
// Windows temporarily needs this file, https://github.com/module-federation/vite/issues/68

    const importMap = {
      
        "@linode/api-v4": async () => {
          let pkg = await import("__mf__virtual/betas__prebuild___mf_0_linode_mf_1_api_mf_2_v4__prebuild__.js")
          return pkg
        }
      ,
        "@linode/api-v4/lib/account": async () => {
          let pkg = await import("__mf__virtual/betas__prebuild___mf_0_linode_mf_1_api_mf_2_v4_mf_1_lib_mf_1_account__prebuild__.js")
          return pkg
        }
      ,
        "@linode/api-v4/lib/betas": async () => {
          let pkg = await import("__mf__virtual/betas__prebuild___mf_0_linode_mf_1_api_mf_2_v4_mf_1_lib_mf_1_betas__prebuild__.js")
          return pkg
        }
      ,
        "@linode/api-v4/lib/databases": async () => {
          let pkg = await import("__mf__virtual/betas__prebuild___mf_0_linode_mf_1_api_mf_2_v4_mf_1_lib_mf_1_databases__prebuild__.js")
          return pkg
        }
      ,
        "@linode/api-v4/lib/firewalls": async () => {
          let pkg = await import("__mf__virtual/betas__prebuild___mf_0_linode_mf_1_api_mf_2_v4_mf_1_lib_mf_1_firewalls__prebuild__.js")
          return pkg
        }
      ,
        "@linode/api-v4/lib/regions": async () => {
          let pkg = await import("__mf__virtual/betas__prebuild___mf_0_linode_mf_1_api_mf_2_v4_mf_1_lib_mf_1_regions__prebuild__.js")
          return pkg
        }
      ,
        "@linode/api-v4/lib/request": async () => {
          let pkg = await import("__mf__virtual/betas__prebuild___mf_0_linode_mf_1_api_mf_2_v4_mf_1_lib_mf_1_request__prebuild__.js")
          return pkg
        }
      ,
        "@linode/api-v4/lib/vlans": async () => {
          let pkg = await import("__mf__virtual/betas__prebuild___mf_0_linode_mf_1_api_mf_2_v4_mf_1_lib_mf_1_vlans__prebuild__.js")
          return pkg
        }
      ,
        "react": async () => {
          let pkg = await import("__mf__virtual/betas__prebuild__react__prebuild__.js")
          return pkg
        }
      
    }
      const usedShared = {
      
          "@linode/api-v4": {
            name: "@linode/api-v4",
            version: "0.148.0",
            scope: ["default"],
            loaded: false,
            from: "betas",
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
          "@linode/api-v4/lib/account": {
            name: "@linode/api-v4/lib/account",
            version: "0.148.0",
            scope: ["default"],
            loaded: false,
            from: "betas",
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
          "@linode/api-v4/lib/betas": {
            name: "@linode/api-v4/lib/betas",
            version: "0.148.0",
            scope: ["default"],
            loaded: false,
            from: "betas",
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
          "@linode/api-v4/lib/databases": {
            name: "@linode/api-v4/lib/databases",
            version: "0.148.0",
            scope: ["default"],
            loaded: false,
            from: "betas",
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
          "@linode/api-v4/lib/firewalls": {
            name: "@linode/api-v4/lib/firewalls",
            version: "0.148.0",
            scope: ["default"],
            loaded: false,
            from: "betas",
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
          "@linode/api-v4/lib/regions": {
            name: "@linode/api-v4/lib/regions",
            version: "0.148.0",
            scope: ["default"],
            loaded: false,
            from: "betas",
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
            from: "betas",
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
          "@linode/api-v4/lib/vlans": {
            name: "@linode/api-v4/lib/vlans",
            version: "0.148.0",
            scope: ["default"],
            loaded: false,
            from: "betas",
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
            from: "betas",
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
      ]
      export {
        usedShared,
        usedRemotes
      }
      