export interface OCA {
  description: string;
  name: string;
  related_guides?: Doc[];
  href?: string;
  logo_url: string;
  summary: string;
  tips?: string[];
  related_info?: Doc[];
}

export interface Doc {
  title: string;
  href: string;
}

export const oneClickApps: OCA[] = [
  {
    name: 'Ark',
    description: `In Ark: Survival Evolved, you are placed on a series of fictional islands inhabited by dinosaurs and
      other prehistoric animals. Ark is an ongoing battle where animals and other players have the ability to destroy you.
      You must build structures, farm resources, breed dinosaurs, and even set up
      trading hubs with neighboring tribes. Hosting an Ark server gives you control
      of the entire game. You can define the leveling speed, the amount of players,
      and the types of weapons available.`,
    summary: `Multiplayer action-survival game. You have only one objective: survive.`,
    related_guides: [
      {
        title: 'Deploy an ARK: Survival Evolved Server with One-Click Apps',
        href:
          'https://linode.com/docs/platform/one-click/deploying-ark-survival-evolved-with-one-click-apps/'
      }
    ],
    related_info: [
      {
        title: 'https://survivetheark.com/',
        href: 'https://survivetheark.com/'
      }
    ],
    logo_url: 'assets/ark_color.svg'
  },
  {
    name: 'Azuracast',
    description: `All aspects of running a radio station in one web interface so you can start your own station. Manage media, create playlists, and interact with listeners on one free platform.`,
    summary: 'Open source, self-hosted web radio tool',
    related_guides: [
      {
        title: 'Deploy Azuracast with One-Click Apps',
        href:
          'https://linode.com/docs/platform/one-click/deploy-azuracast-with-one-click-apps/'
      }
    ],
    related_info: [
      {
        title: 'https://www.azuracast.com/',
        href: 'https://www.azuracast.com/'
      }
    ],
    logo_url: 'assets/azuracast.svg'
  },
  {
    name: 'cPanel',
    description: `The cPanel &amp; WHM&reg; One-Click App streamlines publishing and managing a website on your Linode. cPanel 	&amp; WHM is a Linux&reg; based web hosting control panel and platform that helps you create and manage websites, servers, databases and more with a suite of hosting automation and optimization tools.`,
    summary:
      'The leading hosting automation platform that has simplified site and server management for 20 years.',
    tips: [
      `Please note that it will take approximately 15 minutes for cPanel to boot after you launch.`,
      `Once the script finishes, go to <em>https://[your-Linode's-IP-address]:2087</em> in a browser, where you'll be prompted to log in and begin your trial.`,
      `Your credentials are <code>root</code> for the username and the <strong>Root Password</strong> you defined when you ran the cPanel One-Click App installer.`
    ],
    related_info: [
      {
        title: 'https://www.cpanel.net/',
        href: 'https://www.cpanel.net/'
      }
    ],
    logo_url: 'assets/cpanel_color.svg'
  },
  {
    name: 'CS:GO',
    description: `In CS:GO there are two teams: Terrorists and Counter-Terrorists.
    The teams compete against each other to complete objectives or to eliminate the opposing team.
    A competitive match requires two teams of five players, but hosting your own server allows you control over team size and server location,
    so you and your friends can play with low latency. Up to 64 players can be hosted on a single server.`,
    summary: `Fast-paced, competitive FPS. Partner with your team to compete the objective at hand, or take matters into your own hands and go solo.`,
    related_guides: [
      {
        title: 'Deploy Counter-Strike: Global Offensive with One-Click Apps',
        href:
          'https://linode.com/docs/platform/one-click/deploying-cs-go-with-one-click-apps/'
      }
    ],
    related_info: [
      {
        title: 'https://blog.counter-strike.net/index.php/about/',
        href: 'https://blog.counter-strike.net/index.php/about/'
      }
    ],
    logo_url: 'assets/csgo_color.svg'
  },
  {
    name: 'Django',
    description: `Django is a web development framework for the Python programing language. It enables rapid development, while favoring pragmatic and clean design.`,
    summary: `A framework for simplifying the process of building your web applications more quickly and with less code.`,
    related_info: [
      {
        title: 'https://www.djangoproject.com/',
        href: 'https://www.djangoproject.com/'
      }
    ],
    tips: [
      `Once the script finishes, go to <em>https://[your-Linode's-IP-address]:8000</em> in a browser to visit the default web page.`,
      `You can also visit <em>https://[your-Linode's-IP-address]:8000/admin</em> to view the Django admin panel.`
    ],
    logo_url: 'assets/django_color.svg'
  },
  {
    name: 'Flask',
    description: `Flask is a lightweight WSGI web application framework written in Python. It is designed to make getting started quick and easy, with the ability to scale up to complex applications.`,
    summary: `A quick light-weight web framework for Python that includes several utilities and libraries you can use to create a web application.`,
    related_guides: [
      {
        title: 'Deploy a Flask Application on Ubuntu',
        href:
          'https://www.linode.com/docs/development/python/flask-and-gunicorn-on-ubuntu/'
      }
    ],
    related_info: [
      {
        title: 'https://www.palletsprojects.com/p/flask/',
        href: 'https://www.palletsprojects.com/p/flask/'
      }
    ],
    tips: [
      `Once the script finishes, go to <em>https://[your-Linode's-IP-address]</em> in a browser.`
    ],
    logo_url: 'assets/flask_color.svg'
  },
  {
    name: 'Docker',
    description: `Docker is a tool that enables you to create, deploy, and manage lightweight, stand-alone packages that contain everything needed to run an application (code, libraries, runtime, system settings, and dependencies).`,
    summary: `Securely build, share and run modern applications anywhere.`,
    related_guides: [
      {
        title: 'An Introduction to Docker',
        href:
          'https://www.linode.com/docs/applications/containers/introduction-to-docker/'
      },
      {
        title: 'Docker Commands Quick Reference Cheat Sheet',
        href:
          'https://www.linode.com/docs/applications/containers/docker-commands-quick-reference-cheat-sheet/'
      },
      {
        title: 'How to Use Docker Compose',
        href:
          'https://www.linode.com/docs/applications/containers/how-to-use-docker-compose/'
      }
    ],
    related_info: [
      {
        title: 'https://www.docker.com/',
        href: 'https://www.docker.com/'
      },
      {
        title: 'https://docs.docker.com/compose/',
        href: 'https://docs.docker.com/compose/'
      }
    ],
    logo_url: 'assets/docker_color.svg'
  },
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
    related_info: [
      {
        title: 'https://about.gitlab.com/',
        href: 'https://about.gitlab.com/'
      }
    ],
    logo_url: 'assets/gitlab_color.svg'
  },
  {
    name: 'Drupal',
    description: `Drupal is a content management system (CMS) designed for building custom
      websites for personal and business use. Built for high performance and
      scalability, Drupal provides the necessary tools to create rich,
      interactive community websites with forums, user blogs, and private messaging.
      Drupal also has support for personal publishing projects and can power podcasts,
      blogs, and knowledge-based systems, all within a single, unified platform.`,
    summary: `Powerful content management system built on PHP and supported by a database
      engine.`,
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
    related_info: [
      {
        title: 'https://www.drupal.org/',
        href: 'https://www.drupal.org/'
      }
    ],
    logo_url: 'assets/drupal_color.svg'
  },
  {
    name: 'Grafana',
    description: `Grafana gives you the ability to create, monitor, store, and share metrics with your team to keep tabs on your infrastructure.`,
    summary: `An open source analytics and monitoring solution with a focus on accessibility for metric visualization.`,
    related_info: [
      {
        title: 'https://grafana.com/',
        href: 'https://grafana.com/'
      }
    ],
    tips: [
      `Once the script finishes, go to <em>https://[your-Linode's-IP-address]:3000</em> in a browser.`
    ],
    logo_url: 'assets/grafana_color.svg'
  },
  {
    name: 'Jenkins',
    description: `Jenkins is an open source automation tool which can build, test, and deploy your infrastructure.`,
    summary: `A tool that gives you access to a massive library of plugins to support automation in your project's lifecycle.`,
    related_guides: [
      {
        title: 'Using LISH to SSH into your Linode',
        href:
          'https://www.linode.com/docs/platform/manager/using-the-linode-shell-lish/#use-a-web-browser'
      },
      {
        title: 'Scripted vs. Declarative Pipeline Syntax',
        href:
          'https://www.linode.com/docs/development/ci/automate-builds-with-jenkins-on-ubuntu/#scripted-vs-declarative-pipeline-syntax'
      }
    ],
    related_info: [
      {
        title: 'https://jenkins.io/',
        href: 'https://jenkins.io/'
      }
    ],
    tips: [
      `Once the script finishes, go to <em>http://[your-Linode's-IP-address]:8080</em> in a browser to finish the configuration.`,
      `You will need to SSH into your Linode to retrieve the Jenkins one time password:`,
      `<code>sudo cat /var/lib/jenkins/secrets/initialAdminPassword</code>`
    ],
    logo_url: 'assets/jenkins_color.svg'
  },
  {
    name: 'Jitsi',
    description: `Secure, stable, and free alternative to popular video conferencing services. Use built-in features to limit meeting access with passwords or stream on YouTube so anyone can attend.`,
    summary: 'Free, open source video conferencing and communication platform',
    related_guides: [
      {
        title: 'Deploy Jitsi with One-Click Apps',
        href:
          'https://linode.com/docs/platform/one-click/deploy-jitsi-with-one-click-apps/'
      }
    ],
    related_info: [
      {
        title: 'https://jitsi.org/',
        href: 'https://jitsi.org/'
      }
    ],
    logo_url: 'assets/jitsi_color.svg'
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
      MySQL, and PHP.`,
    related_guides: [
      {
        title: 'Deploy a LAMP Stack with One-Click Apps',
        href:
          'https://linode.com/docs/platform/one-click/deploy-lamp-stack-with-one-click-apps/'
      }
    ],
    logo_url: 'assets/lamp_flame_color.svg'
    // href: 'https://www.ibm.com/cloud/learn/lamp-stack-explained' Not sure this is kosher.
  },
  {
    name: 'MongoDB',
    description: `MongoDB provides an alternative to traditional relational database management systems (RDBMS). In addition to its schema-free design and scalable architecture, MongoDB provides JSON output and specialized language-specific bindings that make it particularly attractive for use in custom application development and rapid prototyping.`,
    summary: `MongoDB is a database engine that provides access to non-relational, document-oriented databases.`,
    related_guides: [
      {
        title: 'Create a MongoDB Replica Set',
        href:
          'https://www.linode.com/docs/databases/mongodb/create-a-mongodb-replica-set/'
      },
      {
        title: 'Build Database Clusters with MongoDB',
        href:
          'https://www.linode.com/docs/databases/mongodb/build-database-clusters-with-mongodb/'
      },
      {
        title: 'Install MongoDB on Ubuntu 16.04',
        href:
          'https://www.linode.com/docs/databases/mongodb/install-mongodb-on-ubuntu-16-04/'
      }
    ],
    related_info: [
      {
        title: 'https://www.mongodb.com/',
        href: 'https://www.mongodb.com/'
      }
    ],
    logo_url: 'assets/mongodb_color.svg'
  },
  {
    name: 'MEAN',
    description: `MEAN is a full-stack JavaScript-based framework which accelerates web application development much faster than other frameworks.  All involved technologies are well-established, offer robust feature sets, and are well-supported by their maintaining organizations. These characteristics make them a great choice for your applications.`,
    summary: `A MEAN (MongoDB, Express, Angular, Node.js) stack is a free and open-source web software bundle used to build modern web applications:`,
    related_info: [
      {
        title: 'http://meanjs.org/',
        href: 'http://meanjs.org/'
      }
    ],
    logo_url: 'assets/mean_color.svg'
  },
  {
    name: 'LEMP',
    description: `LEMP provides a platform for applications that is compatible with the LAMP stack for nearly all applications; however, because NGINX is able to serve more pages at once with a more predictable memory usage profile, it may be more suited to high demand situations.`,
    summary: `The LEMP stack replaces the Apache web server component with NGINX (“Engine-X”), providing the E in the acronym: Linux, NGINX, MySQL/MariaDB, PHP.    `,
    related_guides: [
      {
        title: 'LEMP Guides',
        href: 'https://www.linode.com/docs/web-servers/lemp/'
      }
    ],
    logo_url: 'assets/lemp_color.svg'
  },
  {
    name: 'MySQL/MariaDB',
    description: `MySQL, or MariaDB for Linux distributions, is primarily used for web and server applications, including as a component of the industry-standard LAMP and LEMP stacks.`,
    summary: `World's most popular open source database.`,
    related_info: [
      {
        title: 'https://www.mysql.com/',
        href: 'https://www.mysql.com/'
      },
      {
        title: 'https://dev.mysql.com/downloads/workbench/',
        href: 'https://dev.mysql.com/downloads/workbench/'
      },
      {
        title: 'Sequel Pro - macOS database management client',
        href: 'https://www.sequelpro.com/'
      }
    ],
    related_guides: [
      {
        title: 'MySQL Guides',
        href: 'https://www.linode.com/docs/databases/mysql/'
      }
    ],
    tips: [
      `<b>In addition to installing MySQL, this One-Click app also enables the following UFW firewall rules:</b>`,
      ` - SSH <em>port 22</em>, HTTP <em>port 80</em>, HTTPS <em>port 443</em>, MySQL <em>port 3306</em>`
    ],
    logo_url: 'assets/mysql_color.svg'
  },
  {
    name: 'Nextcloud',
    description: `Nextcloud is an open source solution to file hosting and sharing. With NextCloud, you can synchronize files from your local computer to your Linode server and share them with your collaborators. Nextcloud’s customizable security features and intuitive user interface help keep your files safe and easy to manage.`,
    summary: `A file sharing service that allows you to store your important documents and images in one centralized location.`,
    related_guides: [
      {
        title: 'Deploying Nextcloud on Linode with One-Click Apps',
        href:
          'https://www.linode.com/docs/platform/one-click/how-to-deploy-nextcloud-with-one-click-apps/'
      }
    ],
    logo_url: 'assets/nextcloud_color.svg'
  },
  {
    name: 'Plesk',
    description: `Plesk is a leading WordPress and website management platform and control panel. Plesk lets you build and manage multiple websites from a single dashboard to configure web services, email, and other applications. Plesk features hundreds of extensions, plus a complete WordPress toolkit. Use the Plesk One-Click App to manage websites hosted on your Linode.`,
    summary:
      'A secure, scalable, and versatile website and WordPress management platform.',
    tips: [
      `Please allow the script around 15 minutes to finish.`,
      `Once the script finishes, go to <em>https://[your-Linode's-IP-address]</em> in a browser, where you'll be prompted to log in and begin your trial.`,
      `Your credentials are <code>root</code> for the username and the <b>Root Password</b> you defined when you ran the Plesk One-Click App installer.`
    ],
    related_info: [
      {
        title: 'https://www.plesk.com/',
        href: 'https://www.plesk.com/'
      }
    ],
    logo_url: 'assets/plesk_color.svg'
  },
  {
    name: 'Plex',
    description: `Organize, stream, and share your media library with friends, in addition to free live TV in 220+ countries.`,
    summary:
      'Media server and streaming service to stay entertained across devices',
    related_guides: [
      {
        title: 'Deploy Plex with One-Click Apps',
        href:
          'https://linode.com/docs/platform/one-click/deploy-plex-with-one-click-apps/'
      }
    ],
    related_info: [
      {
        title: 'https://www.plex.tv/',
        href: 'https://www.plex.tv/'
      }
    ],
    logo_url: 'assets/plex_color.svg'
  },
  {
    name: 'Percona (PMM)',
    description: `Percona Monitoring and Management (PMM) is an open source GUI for managing and monitoring the performance of your MySQL, MariaDB, PostgreSQL, and MongoDB databases. This tool helps you optimize your database’s performance, manage your database instances, and keep track of and identify security issues.`,
    summary:
      'An open source analytics and performance monitoring solution for databases with a focus on user-friendly metrics visualizations.',
    related_info: [
      {
        title:
          'Deploying Percona Monitoring Management (PMM) with One-Click Apps',
        href:
          'https://www.linode.com/docs/platform/one-click/how-to-deploy-percona-monitoring-management-with-one-click-apps/'
      }
    ],
    logo_url: 'assets/percona_color.svg'
  },
  {
    name: 'Redis',
    description: `Redis is an open-source, in-memory, data-structure store, with the optional ability to write and persist data to a disk, which can be used as a key-value database, cache, and message broker. Redis features
 built-in transactions, replication, and support for a variety of data structures such as strings, hashes, lists, sets, and others.`,
    summary:
      'Flexible, in-memory, NoSQL database service supported in many different coding languages.',
    related_guides: [
      {
        title: 'How to Install a Redis Server on Ubuntu or Debian 8',
        href:
          'https://www.linode.com/docs/databases/redis/how-to-install-a-redis-server-on-ubuntu-or-debian8/'
      }
    ],
    related_info: [
      {
        title: 'https://redis.io/',
        href: 'https://redis.io/'
      }
    ],
    logo_url: 'assets/redis_color.svg'
  },
  {
    name: 'Ruby on Rails',
    description: `Rails is a web application development framework written in the Ruby programming language. It is designed to make programming web applications easier by giving every developer a number of common tools they need to get started. Ruby on Rails empowers you to accomplish more with less code.`,
    summary: `Ruby on Rails is a web framework that allows web designers and developers to implement dynamic, fully featured web applications. `,
    related_guides: [
      {
        title: 'Ruby on Rails with NGINX On Debian 9',
        href:
          'https://www.linode.com/docs/development/ror/ruby-on-rails-nginx-debian/'
      }
    ],
    related_info: [
      {
        title: 'https://rubyonrails.org/',
        href: 'https://rubyonrails.org/'
      }
    ],
    tips: [
      `Once the script finishes, go to <em>https://[your-Linode's-IP-address]:3000</em> in a browser.`
    ],
    logo_url: 'assets/rubyonrails_color.svg'
  },
  {
    name: 'PostgreSQL',
    description: `PostgreSQL is a popular open source relational database system that provides many advanced configuration options that can help optimize your database’s performance in a production environment.`,
    summary: `The PostgreSQL relational database system is a powerful, scalable, and standards-compliant open-source database platform.`,
    related_guides: [
      {
        title: 'Configure PostgreSQL',
        href:
          'https://www.linode.com/docs/databases/postgresql/configure-postgresql/'
      },
      {
        title: 'How to Install PostgreSQL on Ubuntu 16.04',
        href:
          'https://www.linode.com/docs/databases/postgresql/how-to-install-postgresql-on-ubuntu-16-04/'
      }
    ],
    related_info: [
      {
        title: 'https://www.postgresql.org/',
        href: 'https://www.postgresql.org/'
      }
    ],
    logo_url: 'assets/postgresql_color.svg'
  },
  {
    name: 'phpMyAdmin',
    description: `Intuitive web interface for MySQL and MariaDB operations, including importing/exporting data, administering multiple servers, and global database search.`,
    summary: 'Popular free administration tool for MySQL and MariaDB',
    related_guides: [
      {
        title: 'Deploy phpMyAdmin with One-Click Apps',
        href:
          'https://linode.com/docs/platform/one-click/deploy-phpmyadmin-with-one-click-apps/'
      }
    ],
    related_info: [
      {
        title: 'https://www.phpmyadmin.net/',
        href: 'https://www.phpmyadmin.net/'
      }
    ],
    tips: [
      `Once the script finishes, go to <em>https://[your-Linode's-IP-address]/phpmyadmin</em> in a browser.`
    ],
    logo_url: 'assets/phpmyadmin_color.svg'
  },
  {
    name: 'Prometheus',
    description: `Prometheus is a powerful monitoring software tool that collects metrics from configurable data points at given intervals, evaluates rule expressions, and can trigger alerts if some condition is observed.`,
    summary:
      'Gain metrics and receive alerts with this open-source monitoring tool.',
    related_info: [
      {
        title: 'https://prometheus.io/',
        href: 'https://prometheus.io/'
      }
    ],
    logo_url: 'assets/prometheus_color.svg'
  },
  {
    name: 'Rust',
    description: `In Rust, you must work with or against other players
      to ensure your own survival. Players are able to steal, lie, cheat, or
      trick each other. Build a shelter, hunt animals for food, craft weapons and
      armor, and much more. Hosting your own Rust server allows you to customize
      settings and curate the number of players in the world.`,
    summary: `A free-for-all battle for survival in a harsh open-world environment.
    In Rust, you can do anything--but so can everyone else.`,
    related_guides: [
      {
        title: 'Deploy Rust with One-Click Apps',
        href:
          'https://linode.com/docs/platform/one-click/deploying-rust-with-one-click-apps/'
      }
    ],
    related_info: [
      {
        title: 'https://rust.facepunch.com/',
        href: 'https://rust.facepunch.com/'
      }
    ],
    logo_url: 'assets/rust_color.svg'
  },
  {
    name: 'Secure Your Server',
    description: `Save time on securing your Linode a by deploying an instance preconfigured with some basic security best practices: limited user account access, hardened SSH, and Fail2Ban for SSH Login Protection."
    summary: `Harden your Linode before you deploy with the Secure Your Server One-Click App``,
    related_guides: [
      {
        title: 'Securing your Server',
        href:
          'https://www.linode.com/docs/guides/securing-your-server/'
      }
    ],
    logo_url: 'assets/secureyourserver_color.svg'
  },
  {
    name: 'Shadowsocks',
    description:
      'Shadowsocks is a lightweight SOCKS5 web proxy tool. A full setup requires a Linode server to host the Shadowsocks daemon, and a client installed on PC, Mac, Linux, or a mobile device. Unlike other proxy software, Shadowsocks traffic is designed to be both indiscernible from other traffic to third-party monitoring tools, and also able to disguise itself as a normal direct connection. Data passing through Shadowsocks is encrypted for additional security and privacy.',
    summary:
      'A secure socks5 proxy, designed to protect your Internet traffic.',
    related_info: [
      {
        title: 'https://shadowsocks.org/',
        href: 'https://shadowsocks.org/'
      },
      {
        title: 'ShadowsocksX-NG - macOS Client',
        href: 'https://github.com/shadowsocks/ShadowsocksX-NG'
      },
      {
        title: 'shadowsocks-windows - Windows Client',
        href: 'https://github.com/shadowsocks/shadowsocks-windows'
      },
      {
        title: 'shadowsocks-android - Android Client',
        href: 'https://github.com/shadowsocks/shadowsocks-android'
      },
      {
        title: 'Help with installing clients - macOS and Windows',
        href:
          'https://www.linode.com/docs/networking/vpn/create-a-socks5-proxy-server-with-shadowsocks-on-ubuntu-and-centos7/#install-a-shadowsocks-client'
      }
    ],
    tips: [
      `<b>Server Preferences</b> on your Shadowsocks Client:`,
      `- set <b>Address</b> to <em>[your-linodes-IP]:8000</em>`,
      `- set <b>Encryption</b> to <em>aes-256-cfb</em>`,
      `- set <b>Password</b> that was specified on configuration`
    ],
    logo_url: 'assets/shadowsocks_color.svg'
  },
  {
    name: 'Terraria',
    description: `Terraria generates unique environments where a player begins by digging
      for ore, and the further they dig the more adventure they find. Multiplayer
      mode can be either cooperative or PvP.
      Hosting your own Terraria server gives you control over the world, the players,
      and the objectives. Your world, your rules.`,
    summary: `Adventure, collect resources, build structures, and battle enemies in
      this wildly creative two-dimensional sandbox game.`,
    related_guides: [
      {
        title: 'Deploy a Terraria Server with One-Click Apps',
        href:
          'https://linode.com/docs/platform/one-click/deploying-terraria-with-one-click-apps/'
      }
    ],
    related_info: [
      {
        title: 'https://terraria.org/',
        href: 'https://terraria.org/'
      }
    ],
    logo_url: 'assets/terraria_color.svg'
  },
  {
    name: 'TF2',
    description: `Team Fortress 2 is a team-based multiplayer first-person shooter.
      In TF2, you and your team choose from a number of hero classes and different game modes,
      ensuring a unique in-game experience every match.
      Setting up a personal game server puts you in control of
      what game modes and maps you use, as well as a variety of other settings
      to customize your experience.`,
    summary: `Choose from 9 unique classes in this highly original FPS. Compete against
      players around the world in a variety of modes such as capture the flag,
      king of the hill, and more.`,
    related_guides: [
      {
        title: 'Deploy a Team Fortress 2 Server with One-Click Apps',
        href:
          'https://linode.com/docs/platform/one-click/deploying-team-fortress-2-with-one-click-apps/'
      }
    ],
    related_info: [
      {
        title: 'http://www.teamfortress.com/',
        href: 'http://www.teamfortress.com/'
      }
    ],
    logo_url: 'assets/teamfortress_color.svg'
  },
  {
    name: 'WooCommerce',
    description: `With WooCommerce, you can securely sell both digital and
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
    related_info: [
      {
        title: 'https://woocommerce.com/features/',
        href: 'https://woocommerce.com/features/'
      }
    ],
    logo_url: 'assets/woocommerce_color.svg'
  },
  {
    name: 'MERN',
    description: `MERN is a full stack platform that contains everything you need to build a web application:
      MongoDB, a document database used to persist your application's data;
      Express, which serves as the web application framework;
      React, used to build your application's user interfaces;
      and Node.js, which serves as the run-time environment for your application.
      All of these technologies are well-established, offer robust feature sets,
      and are well-supported by their maintaining organizations. These
      characteristics make them a great choice for your applications. Upload your
      existing MERN website code to your new Linode, or use MERN's scaffolding tool
      to start writing new web applications on the Linode.`,
    summary: `Build production-ready apps with the MERN stack: MongoDB, Express, React, and Node.js.`,
    related_guides: [
      {
        title: 'Deploy a MERN Stack with One-Click Apps',
        href:
          'https://linode.com/docs/platform/one-click/deploy-mern-with-one-click-apps/'
      }
    ],
    logo_url: 'assets/mern_color.svg'
  },
  {
    name: 'OpenVPN',
    description: `OpenVPN is a widely trusted, free, and open-source virtual private network
    application. OpenVPN creates network tunnels between groups of
      computers that are not on the same local network, and it uses OpenSSL
      to encrypt your traffic.`,
    summary: `Open-source virtual private network (VPN) application.
      OpenVPN securely connects your computer to your servers,
      or to the public Internet.`,
    related_guides: [
      {
        title: 'Deploy OpenVPN Access Server with One-Click Apps',
        href: 'https://linode.com/docs/platform/one-click/one-click-openvpn/'
      },
      {
        title: 'Manage OpenVPN with OpenVPN Access Server',
        href:
          'https://linode.com/docs/networking/vpn/install-openvpn-access-server-on-linux/'
      },
      {
        title: 'Configure OpenVPN Client Devices',
        href:
          'https://linode.com/docs/networking/vpn/configuring-openvpn-client-devices/'
      }
    ],
    logo_url: 'assets/openvpn_color.svg'
  },
  {
    name: 'Minecraft: Java Edition',
    description: `With over 100 million users around the world, Minecraft is the most popular
      online game of all time. Less of a game and more of a lifestyle choice, you
      and other players are free to build and explore in a 3D generated world made
      up of millions of mineable blocks. Collect resources by leveling mountains,
      taming forests, and venturing out to sea. Choose a home from the varied list
      of biomes like ice worlds, flower plains, and jungles. Build ancient castles
      or modern mega cities, and fill them with redstone circuit contraptions and
      villagers. Fight off nightly invasions of Skeletons, Zombies, and explosive
      Creepers, or adventure to the End and the Nether to summon the fabled End
      Dragon and the chaotic Wither. If that is not enough, Minecraft is also
      highly moddable and customizable. You decide the rules when hosting your own
      Minecraft server for you and your friends to play together in this highly
      addictive game.`,
    summary: `Build, explore, and adventure in your own 3D generated world.`,
    related_guides: [
      {
        title: 'Deploy A Minecraft Server with One-Click Apps',
        href:
          'https://linode.com/docs/platform/one-click/deploying-minecraft-with-one-click-apps/'
      }
    ],
    related_info: [
      {
        title: 'https://www.minecraft.net/',
        href: 'https://www.minecraft.net/'
      }
    ],
    logo_url: 'assets/minecraft_color.svg'
  },
  {
    name: 'Virtualmin',
    description: `Streamline domain management, included as part of Webmin. Choose between the standard free version or upgrade to their premium service to access more features.`,
    summary: 'Domain hosting and website control panel',
    related_guides: [
      {
        title: 'Deploy Virtualmin with One-Click Apps',
        href:
          'https://linode.com/docs/platform/one-click/deploy-virtualmin-with-one-click-apps/'
      }
    ],
    related_info: [
      {
        title: 'https://www.virtualmin.com/',
        href: 'https://www.virtualmin.com/'
      }
    ],
    logo_url: 'assets/virtualmin_color.svg'
  },
  {
    name: 'Webmin',
    description: `Web interface for Unix to optimize system management, both from the console and remotely.`,
    summary: 'Unix management in your browser',
    related_guides: [
      {
        title: 'Deploy Webmin with One-Click Apps',
        href:
          'https://linode.com/docs/platform/one-click/deploy-webmin-with-one-click-apps/'
      }
    ],
    related_info: [
      {
        title: 'http://www.webmin.com/',
        href: 'http://www.webmin.com/'
      }
    ],
    logo_url: 'assets/webmin_color.svg'
  },
  {
    name: 'WireGuard',
    description: `Configuring WireGuard is as simple as configuring SSH. A connection is established by an
      exchange of public keys between server and client, and only a client whose public key is
      present in the server's configuration file is considered authorized. WireGuard sets up
      standard network interfaces which behave similarly to other common network interfaces,
      like eth0. This makes it possible to configure and manage WireGuard interfaces using
      standard networking tools such as ifconfig and ip.`,
    summary: `Modern VPN which utilizes state-of-the-art cryptography. It aims to be faster
      and leaner than other VPN protocols and has a smaller source code footprint.`,
    related_guides: [
      {
        title: 'Deploy WireGuard with One-Click Apps',
        href:
          'https://linode.com/docs/platform/one-click/deploy-wireguard-with-one-click-apps/'
      }
    ],
    related_info: [
      {
        title: 'https://www.wireguard.com/',
        href: 'https://www.wireguard.com/'
      }
    ],
    logo_url: 'assets/wireguard_color.svg'
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
    related_info: [
      {
        title: 'https://woocommerce.com/features/',
        href: 'https://woocommerce.com/features/'
      }
    ],
    logo_url: 'assets/woocommerce_color.svg'
  },
  {
    name: 'WordPress',
    description: `With 60 million users around the globe, WordPress is the industry standard
      for custom websites such as blogs, news sites, personal
      websites, and anything in-between. With a focus on best in class usability and flexibility,
      you can have a customized website up and running in minutes.`,
    summary:
      'Flexible, open source content management system (CMS) for content-focused websites of any kind.',
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
    related_info: [
      {
        title: 'https://wordpress.org/',
        href: 'https://wordpress.org/'
      }
    ],
    logo_url: 'assets/wordpress_color.svg'
  }
];
