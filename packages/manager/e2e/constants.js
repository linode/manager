exports.constants = {

  testAccounts: {},
  testPublicKey: `ssh-rsa MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAq5X9wwTT0hnEgyXnHaWZCfBp4z3DGdxaDsp1m+mdaDBUEDqtZ+6/GNAjkq7JipeXmg8YD3oKdlwm2jupv2lji4LbLHPu9umhRWpQsIOPS8pcEAvpzvA99fpdZYrMI03DZyuSiK5NjRRsusbLVaMhkv3/9dkChyly0d0JSCjA2/C71VOXSUAljxtRFIQ3qtMeN+EsMNDRYrLjMBCJmuGr2/my3mGHapa4QbwdOgqhCyerr/W7/nZeqEIyTWpIkX9dMppCGq2gcqW40s4ISGnFXN8YoTlbnXtq18jrZG6O0D1+HNUJvc4RdSxq+xZPILM40xQFUb0YdqLcPXcW/yZjQ7runP3cHndN72t0JYabu0+YL14t6ZS9gX7lc3vDv7Y1exYwgaup+H5kPCpaEYzRmMEtaOn0oVAeBrunAsIFoOiAOLn/SdmU7jtG9eWCskDRwchCm1rz9CeDkOQllUZg6RItbJGUqfV7GvK/8byfhdjzsD2QPW0b+xCWjPjTJXBzhudm9FESQJ+uLA7cQisM9iLF3R9KAmRotM/X9UdlBLqy1Kjp/6JBR89DXgco/XKAGZOA97n/H3agoJ+KA4hw7Mi68XccKcBQiNY0v9I6RKCzaa4wEeTxmk69oRK57iXp1BG8mqYnaiDZF2fXqrIG/IUq+qtU3p7u7QwhTqRYjYcCAwEAAQ== pthiel@linode.com`,
  wait: {
    short:
      process.env.DOCKER || process.env.BROWSERSTACK_USERNAME ? 10000 : 5000,
    normal:
      process.env.DOCKER || process.env.BROWSERSTACK_USERNAME ? 20000 : 12000,
    long:
      process.env.DOCKER || process.env.BROWSERSTACK_USERNAME ? 40000 : 30000,
    minute:
      process.env.DOCKER || process.env.BROWSERSTACK_USERNAME ? 75000 : 60000,
    custom: milliseconds => milliseconds
  },
  routes: {
    storybook: '/',
    dashboard: '/',
    create: {
      linode: '/linodes/create',
      nodebalancer: '/nodebalancers/create'
    },
    linodes: '/linodes',
    volumes: '/volumes',
    nodeBalancers: '/nodebalancers',
    domains: '/domains',
    managed: '/managed',
    longview: '/longview',
    stackscripts: '/stackscripts',
    createStackScript: '/stackscripts/create',
    images: '/images',
    account: {
      billing: '/account/billing',
      users: '/account/users',
      globalSettings: '/account/settings'
    },
    profile: {
      auth: '/profile/auth',
      view: '/profile/',
      tokens: '/profile/tokens',
      oauth: '/profile/clients',
      lish: '/profile/lish',
      sshKeys: '/profile/keys'
    },
    support: {
      landing: '/support',
      docs: '/documentation',
      community: '/community/questions/',
      tickets: '/support/tickets'
    }
  }
};
