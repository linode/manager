exports.constants = {
	testAccounts: {

	},
	wait: {
		short: process.env.DOCKER ? 10000 : 5000,
		normal: process.env.DOCKER ? 18000 : 12000,
		long: process.env.DOCKER ?  40000 : 30000,
		minute: process.env.DOCKER ? 75000 : 60000,
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
