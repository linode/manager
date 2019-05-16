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
      'More than a self-hosted Git repository: use GitLab to manage all the stages of your DevOps life cycle.',
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
    name: 'Drupal',
    description: ` Drupal is a content management system (CMS) designed for building custom
      websites for personal and business use. Built for high performance and
      scalability, Drupal provides the necessary tools to create rich,
      interactive community websites with forums, user blogs, and private messaging.
      Drupal also has support for personal publishing projects and can power podcasts,
      blogs, and knowledge-based systems, all within a single, unified platform.`,
    summary: `Powerful content management system built on PHP and supported by a database.
      engine. Drupal sites can be rich and interactive, and the Drupal API eases development.`,
    related_guides: [
      {
        title: 'Deploy Drupal with One-Click Apps',
        href:
          'https://linode.com/docs/platform/one-click/deploying-drupal-with-one-click-apps/'
      },
      {
        title: 'Update and Secure Drupal 8 on Ubuntu or Debian',
        href:
          'https://linode.com/docs/websites/cms/update-and-secure-drupal-8-on-ubuntu/'
      }
    ],
    href: 'https://www.drupal.org/',
    logo_url: 'assets/drupal_color.svg'
  },
  {
    name: 'LAMP',
    description: `The LAMP stack consists of the Linux operating system,
      the Apache HTTP Server, the MySQL relational database management system,
      and the PHP programming language.
      This software environment is a foundation for popular PHP application
      frameworks like WordPress, Drupal, and Laravel. Upload your existing
      PHP application code to your new app or use a PHP framework to write
      a new application on the Linode.`,
    summary: `Build PHP-based applications with the LAMP software stack: Linux, Apache,
      MySQL, and PHP. The LAMP stack is the foundation for popular frameworks
      like WordPress and Drupal.`,
    related_guides: [
      {
        title: 'Deploy a LAMP Stack with One-Click Apps',
        href:
          'https://linode.com/docs/platform/one-click/deploy-lamp-stack-with-one-click-apps/'
      }
    ],
    logo_url: 'assets/lamp_color.svg',
    href: 'https://www.ibm.com/cloud/learn/lamp-stack-explained'
  },
  {
    name: 'WooCommerce',
    description: `WooCommerce is an open source eCommerce platform built to integrate with
      WordPress. You can use WooCommerce to securely sell both digital and
      physical goods, and take payments via major credit cards, bank transfers,
      PayPal, and other providers like Stripe. With more than 300 extensions to
      choose from, WooCommerce is extremely flexible.`,
    summary: `Highly customizable, secure, open source eCommerce platform built to integrate with Wordpress.`,
    related_guides: [
      {
        title: 'Deploy WooCommerce with One-Click Apps',
        href:
          'https://linode.com/docs/platform/one-click/one-click-woocommerce/'
      }
    ],
    href: 'https://woocommerce.com/features/',
    logo_url: 'assets/woocommerce_color.svg'
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
