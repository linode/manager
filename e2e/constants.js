exports.constants = {
	testAccounts: {

	},
	wait: {
		short: process.env.DOCKER ? 10000 : 5000,
		normal: process.env.DOCKER ? 24000 : 12000,
		long: process.env.DOCKER ?  60000 : 30000,
		minute: process.env.DOCKER ? 90000 : 60000,
		custom: (milliseconds) => process.env.DOCKER ? milliseconds*1.5 : milliseconds,
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
