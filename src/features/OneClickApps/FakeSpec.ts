export interface OCA {
  description: string;
  name: string;
  related_guides?: Doc[];
  href: string;
  logo_url: string;
  summary: string;
}

export interface Doc {
  title: string;
  href: string;
}

export const oneClickApps: OCA[] = [
  {
    name: 'GitLab',
    description: `GitLab is a complete solution for all aspects of your software development.
      At its core, GitLab serves as your centralized Git repository. GitLab also
      features built-in tools that represent every task in your development
      workflow, from planning to testing to releasing.
      Self-hosting your software development with GitLab offers total control of
      your codebase. At the same time, its familiar interface will ease collaboration
      for you and your team. GitLab is the most popular self-hosted Git repository,
      so you'll benefit from a robust set of integrated tools and an active community.`,
    summary:
      'More than a self-hosted Git repository: use GitLab to manage all the stages of your DevOps lifecycle.',
    related_guides: [
      {
        title: 'Deploy GitLab with One-Click Apps',
        href:
          'https://linode.com/docs/platform/one-click/deploy-gitlab-with-one-click-apps/'
      },
      {
        title: 'Getting Started with Git',
        href:
          'https://www.linode.com/docs/development/version-control/how-to-configure-git/'
      },
      {
        title: 'How to Use Git the Version Control System',
        href: 'https://linode.com/docs/quick-answers/linux/how-to-use-git/'
      }
    ],
    href: 'about.gitlab.com',
    logo_url: 'assets/gitlab_color.svg'
  },
  {
    name: 'WordPress',
    description: `With 60 million users around the globe, WordPress is the industry standard
      for content-focused websites such as blogs, news sites, and personal
      websites. With a focus on best in class usability and flexibility,
      you can have a customized website up and running in minutes.`,
    summary:
      'Flexible, open source content management system (CMS) for blogs, news sites, and other content-focused websites.',
    related_guides: [
      {
        title: 'Deploy WordPress with One-Click Apps',
        href:
          'https://linode.com/docs/platform/one-click/deploying-wordpress-with-one-click-apps/'
      },
      {
        title: 'Configure WordPress to Use a Remote Database',
        href:
          'https://linode.com/docs/databases/mariadb/configure-wordpress-remote-database/'
      },
      {
        title: 'Turbocharge Your WordPress Search Using Solr',
        href:
          'https://linode.com/docs/websites/cms/turbocharge-wordpress-search-with-solr/'
      }
    ],
    href: 'https://wordpress.org',
    logo_url: 'assets/wordpress_color.svg'
  }
];
