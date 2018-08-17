exports.constants = {
	testAccounts: {

	},
	wait: {
		short: process.env.DOCKER || process.env.BROWSERSTACK_USERNAME ? 10000 : 5000,
		normal: process.env.DOCKER || process.env.BROWSERSTACK_USERNAME ? 20000 : 12000,
		long: process.env.DOCKER || process.env.BROWSERSTACK_USERNAME ?  40000 : 30000,
		minute: process.env.DOCKER || process.env.BROWSERSTACK_USERNAME ? 75000 : 60000,
		custom: (milliseconds) => milliseconds,
	},
	routes: {
		storybook: '/',
		dashboard: '/',
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
			billing: '/billing',
			users: '/users',
		},
		profile: {
			view: '/profile/',
			tokens: '/profile/tokens',
			oauth: '/profile/clients'
		},
		support: {
			docs: '/documentation',
			community: '/community/questions/',
			tickets: '/support',
		}
	},
}
