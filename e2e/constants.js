exports.constants = {
	testAccounts: {

	},
	wait: {
		short: 5000,
		normal: 12000,
		long: 30000,
		minute: 60000,
		custom: (milliseconds) => milliseconds,
	},
	routes: {
		storybook: '/',
		dashboard: '/',
		linodes: '/linodes',
		volumes: '/volumes',
		nodebalancers: '/nodebalancers',
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
