import type { OCA } from './types';

/**
 * This object maps a StackScript ID to additional information.
 *
 * A marketplace app must be listed here with the correct ID
 * for it to be visible to users.
 */
export const oneClickApps: Record<number, OCA> = {
  401697: {
    alt_description: 'Popular website content management system.',
    alt_name: 'CMS: content management system',
    categories: ['Website'],
    colors: {
      end: '135478',
      start: '176086',
    },
    description: `With 60 million users around the globe, WordPress is the industry standard for custom websites such as blogs, news sites, personal websites, and anything in-between. With a focus on best in class usability and flexibility, you can have a customized website up and running in minutes.`,
    logo_url: 'wordpress.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/wordpress/',
        title: 'Deploy WordPress through the Linode Marketplace',
      },
    ],
    summary:
      'Flexible, open source content management system (CMS) for content-focused websites of any kind.',
    website: 'https://wordpress.org/',
  },
  401698: {
    alt_description: 'Secure website CMS.',
    alt_name: 'CMS: content management system',
    categories: ['Website'],
    colors: {
      end: '1b64a5',
      start: '0678be',
    },
    description: `Drupal is a content management system (CMS) designed for building custom websites for personal and business use. Built for high performance and scalability, Drupal provides the necessary tools to create rich, interactive community websites with forums, user blogs, and private messaging. Drupal also has support for personal publishing projects and can power podcasts, blogs, and knowledge-based systems, all within a single, unified platform.`,
    logo_url: 'drupal.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/drupal/',
        title: 'Deploy Drupal through the Linode Marketplace',
      },
    ],
    summary: `Powerful content management system built on PHP and supported by a database engine.`,
    website: 'https://www.drupal.org/',
  },
  401701: {
    alt_description: 'Essential software stack for Linux applications.',
    alt_name: 'Web stack',
    categories: ['Stacks'],
    colors: {
      end: 'bfa477',
      start: '3c4043',
    },
    description: `The LAMP stack consists of the Linux operating system, the Apache HTTP Server, the MySQL relational database management system, and the PHP programming language. This software environment is a foundation for popular PHP application
      frameworks like WordPress, Drupal, and Laravel. Upload your existing PHP application code to your new app or use a PHP framework to write a new application on the Linode.`,
    logo_url: 'lamp.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/lamp-stack/',
        title: 'Deploy a LAMP Stack through the Linode Marketplace',
      },
    ],
    summary: `Build PHP-based applications with the LAMP software stack: Linux, Apache, MySQL, and PHP.`,
  },
  401702: {
    alt_description: 'React and Node.js stack.',
    alt_name: 'Web stack',
    categories: [],
    colors: {
      end: '256291',
      start: '30383a',
    },
    description: `MERN is a full stack platform that contains everything you need to build a web application: MongoDB, a document database used to persist your application's data; Express, which serves as the web application framework; React, used to build your application's user interfaces;
      and Node.js, which serves as the run-time environment for your application. All of these technologies are well-established, offer robust feature sets, and are well-supported by their maintaining organizations. These characteristics make them a great choice for your applications. Upload your
      existing MERN website code to your new Linode, or use MERN's scaffolding tool to start writing new web applications on the Linode.`,
    logo_url: 'mern.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/mern-stack/',
        title: 'Deploy a MERN Stack through the Linode Marketplace',
      },
    ],
    summary: `Build production-ready apps with the MERN stack: MongoDB, Express, React, and Node.js.`,
  },
  401706: {
    alt_description: 'Virtual private network.',
    alt_name: 'Free VPN',
    categories: ['Security'],
    colors: {
      end: '51171a',
      start: '88171a',
    },
    description: `Configuring WireGuard&reg; is as simple as configuring SSH. A connection is established by an exchange of public keys between server and client, and only a client whose public key is present in the server's configuration file is considered authorized. WireGuard sets up
      standard network interfaces which behave similarly to other common network interfaces, like eth0. This makes it possible to configure and manage WireGuard interfaces using standard networking tools such as ifconfig and ip. "WireGuard" is a registered trademark of Jason A. Donenfeld.`,
    logo_url: 'wireguard.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/wireguard/',
        title: 'Deploy WireGuard through the Linode Marketplace',
      },
    ],
    summary: `Modern VPN which utilizes state-of-the-art cryptography. It aims to be faster and leaner than other VPN protocols and has a smaller source code footprint.`,
    website: 'https://www.wireguard.com/',
  },
  401707: {
    alt_description: 'Popular Git management tool.',
    alt_name: 'Git repository hosting',
    categories: ['Development'],
    colors: {
      end: '21153e',
      start: '48357d',
    },
    description: `GitLab is a complete solution for all aspects of your software development. At its core, GitLab serves as your centralized Git repository. GitLab also features built-in tools that represent every task in your development workflow, from planning to testing to releasing.
      Self-hosting your software development with GitLab offers total control of your codebase. At the same time, its familiar interface will ease collaboration for you and your team. GitLab is the most popular self-hosted Git repository, so you'll benefit from a robust set of integrated tools and an active community.`,
    logo_url: 'gitlab.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/gitlab/',
        title: 'Deploy GitLab through the Linode Marketplace',
      },
    ],
    summary:
      'More than a self-hosted Git repository: use GitLab to manage all the stages of your DevOps life cycle.',
    website: 'https://about.gitlab.com/',
  },
  401708: {
    alt_description: 'Popular secure WordPress ecommerce online store plugin.',
    alt_name: 'Ecommerce site',
    categories: ['Website'],
    colors: {
      end: '743b8a',
      start: '96588a',
    },
    description: `With WooCommerce, you can securely sell both digital and physical goods, and take payments via major credit cards, bank transfers, PayPal, and other providers like Stripe. With more than 300 extensions to choose from, WooCommerce is extremely flexible.`,
    logo_url: 'woocommerce.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/woocommerce/',
        title: 'Deploy WooCommerce through the Linode Marketplace',
      },
    ],
    summary: `Highly customizable, secure, open source eCommerce platform built to integrate with Wordpress.`,
    website: 'https://woocommerce.com/features/',
  },
  401709: {
    alt_description: 'Classic open world survival crafting game.',
    alt_name: 'World building game',
    categories: ['Games'],
    colors: {
      end: 'd0c8c4',
      start: '97948f',
    },
    description: `With over 100 million users around the world, Minecraft is the most popular online game of all time. Less of a game and more of a lifestyle choice, you and other players are free to build and explore in a 3D generated world made up of millions of mineable blocks. Collect resources by leveling mountains,
      taming forests, and venturing out to sea. Choose a home from the varied list of biomes like ice worlds, flower plains, and jungles. Build ancient castles or modern mega cities, and fill them with redstone circuit contraptions and villagers. Fight off nightly invasions of Skeletons, Zombies, and explosive
      Creepers, or adventure to the End and the Nether to summon the fabled End Dragon and the chaotic Wither. If that is not enough, Minecraft is also highly moddable and customizable. You decide the rules when hosting your own Minecraft server for you and your friends to play together in this highly addictive game.`,
    logo_url: 'minecraft.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/minecraft/',
        title: 'Deploy a Minecraft Server through the Linode Marketplace',
      },
    ],
    summary: `Build, explore, and adventure in your own 3D generated world.`,
    website: 'https://www.minecraft.net/',
  },
  401719: {
    alt_description: 'Popular virtual private network.',
    alt_name: 'Free VPN',
    categories: ['Security'],
    colors: {
      end: '193766',
      start: 'ea7e20',
    },
    description: `OpenVPN is a widely trusted, free, and open-source virtual private network application. OpenVPN creates network tunnels between groups of computers that are not on the same local network, and it uses OpenSSL to encrypt your traffic.`,
    logo_url: 'openvpn.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/openvpn/',
        title: 'Deploy OpenVPN through the Linode Marketplace',
      },
    ],
    summary: `Open-source virtual private network (VPN) application. OpenVPN securely connects your computer to your servers, or to the public Internet.`,
    website: 'https://openvpn.net/',
  },
  593835: {
    alt_description: 'Popular WordPress server management.',
    alt_name: 'WordPress control panel',
    categories: ['Control Panels'],
    colors: {
      end: '4b5868',
      start: '53bce6',
    },
    description: `Plesk is a leading WordPress and website management platform and control panel. Plesk lets you build and manage multiple websites from a single dashboard to configure web services, email, and other applications. Plesk features hundreds of extensions, plus a complete WordPress toolkit. Use the Plesk One-Click App to manage websites hosted on your Linode.`,
    logo_url: 'plesk.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/plesk/',
        title: 'Deploy Plesk through the Linode Marketplace',
      },
    ],
    summary:
      'A secure, scalable, and versatile website and WordPress management platform.',
    website: 'https://www.plesk.com/',
  },
  595742: {
    alt_description:
      'Linux-based web hosting control panel for managing websites, servers, databases, and more.',
    alt_name: 'Web server automation and control panel',
    categories: ['Control Panels'],
    colors: {
      end: '141d25',
      start: 'ff6c2c',
    },
    description: `The cPanel &amp; WHM&reg; Marketplace App streamlines publishing and managing a website on your Linode. cPanel 	&amp; WHM is a Linux&reg; based web hosting control panel and platform that helps you create and manage websites, servers, databases and more with a suite of hosting automation and optimization tools.`,
    logo_url: 'cpanel.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/cpanel/',
        title: 'Deploy cPanel through the Linode Marketplace',
      },
    ],
    summary:
      'The leading hosting automation platform that has simplified site and server management for 20 years.',
    website: 'https://www.cpanel.net/',
  },
  604068: {
    alt_description: 'Secure SOCKS5 web proxy with data encryption.',
    alt_name: 'VPN proxy',
    categories: ['Security'],
    colors: {
      end: '8d8d8d',
      start: '227dc0',
    },
    description:
      'Shadowsocks is a lightweight SOCKS5 web proxy tool. A full setup requires a Linode server to host the Shadowsocks daemon, and a client installed on PC, Mac, Linux, or a mobile device. Unlike other proxy software, Shadowsocks traffic is designed to be both indiscernible from other traffic to third-party monitoring tools, and also able to disguise itself as a normal direct connection. Data passing through Shadowsocks is encrypted for additional security and privacy.',
    logo_url: 'shadowsocks.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/shadowsocks/',
        title: 'Deploy Shadowsocks through the Linode Marketplace',
      },
    ],
    summary:
      'A secure socks5 proxy, designed to protect your Internet traffic.',
    website: 'https://shadowsocks.org/',
  },
  606691: {
    alt_description: 'Essential software stack for Linux applications.',
    alt_name: 'Web stack',
    categories: ['Stacks'],
    colors: {
      end: '005138',
      start: '2e7d32',
    },
    description: `LEMP provides a platform for applications that is compatible with the LAMP stack for nearly all applications; however, because NGINX is able to serve more pages at once with a more predictable memory usage profile, it may be more suited to high demand situations.`,
    logo_url: 'lemp.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/lemp-stack/',
        title: 'Deploy a LEMP Stack through the Linode Marketplace',
      },
    ],
    summary: `The LEMP stack replaces the Apache web server component with NGINX (“Engine-X”), providing the E in the acronym: Linux, NGINX, MySQL/MariaDB, PHP.`,
  },
  607026: {
    alt_description: 'SQL database.',
    alt_name: 'SQL database',
    categories: ['Databases'],
    colors: {
      end: '8a9177',
      start: '1d758f',
    },
    description: `MySQL, or MariaDB for Linux operating systems, is primarily used for web and server applications, including as a component of the industry-standard LAMP and LEMP stacks.`,
    logo_url: 'mysql.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/mysql/',
        title: 'Deploy MySQL/MariaDB through the Linode Marketplace',
      },
    ],
    summary: `World's most popular open source database.`,
    website: 'https://www.mysql.com/',
  },
  607401: {
    alt_description: 'CI/CD tool to delegate automation tasks and jobs.',
    alt_name: 'Free automation tool',
    categories: ['Development'],
    colors: {
      end: 'd24939',
      start: 'd33833',
    },
    description: `Jenkins is an open source automation tool which can build, test, and deploy your infrastructure.`,
    logo_url: 'jenkins.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/jenkins/',
        title: 'Deploy Jenkins through the Linode Marketplace',
      },
    ],
    summary: `A tool that gives you access to a massive library of plugins to support automation in your project's lifecycle.`,
    website: 'https://jenkins.io/',
  },
  607433: {
    alt_description:
      'Popular container tool to build cloud-native applications.',
    alt_name: 'Container builder',
    categories: ['Development'],
    colors: {
      end: '1e65c9',
      start: '2496ed',
    },
    description: `Docker is a tool that enables you to create, deploy, and manage lightweight, stand-alone packages that contain everything needed to run an application (code, libraries, runtime, system settings, and dependencies).`,
    logo_url: 'docker.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/docker/',
        title: 'Deploy Docker through the Linode Marketplace',
      },
    ],
    summary: `Securely build, share and run modern applications anywhere.`,
    website: 'https://www.docker.com/',
  },
  607488: {
    alt_description: 'In-memory caching database.',
    alt_name: 'High performance database',
    categories: ['Databases'],
    colors: {
      end: '722b20',
      start: '222222',
    },
    description: `Redis&reg; is an open-source, in-memory, data-structure store, with the optional ability to write and persist data to a disk, which can be used as a key-value database, cache, and message broker. Redis&reg; features built-in transactions, replication, and support for a variety of data structures such as strings, hashes, lists, sets, and others.<br/><br/>*Redis is a registered trademark of Redis Ltd. Any rights therein are reserved to Redis Ltd. Any use by Akamai Technologies is for referential purposes only and does not indicate any sponsorship, endorsement or affiliation between Redis and Akamai Technologies.`,
    logo_url: 'redis.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/redis/',
        title: 'Deploy Redis&reg; through the Linode Marketplace',
      },
    ],
    summary:
      'Flexible, in-memory, NoSQL database service supported in many different coding languages.',
    website: 'https://redis.io/',
  },
  609048: {
    alt_description: 'Ruby web application framework with development tools.',
    alt_name: 'Web application framework',
    categories: ['Development'],
    colors: {
      end: 'fa9999',
      start: '722b20',
    },
    description: `Rails is a web application development framework written in the Ruby programming language. It is designed to make programming web applications easier by giving every developer a number of common tools they need to get started. Ruby on Rails empowers you to accomplish more with less code.`,
    logo_url: 'rubyonrails.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/ruby-on-rails/',
        title: 'Deploy Ruby on Rails through the Linode Marketplace',
      },
    ],
    summary: `Ruby on Rails is a web framework that allows web designers and developers to implement dynamic, fully featured web applications.`,
    website: 'https://rubyonrails.org/',
  },
  609175: {
    alt_description: 'Fast Python development with best practices.',
    alt_name: 'Python framework',
    categories: ['Development'],
    colors: {
      end: '136149',
      start: '0a2e1f',
    },
    description: `Django is a web development framework for the Python programming language. It enables rapid development, while favoring pragmatic and clean design.`,
    logo_url: 'django.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/django/',
        title: 'Deploy Django through the Linode Marketplace',
      },
    ],
    summary: `A framework for simplifying the process of building your web applications more quickly and with less code.`,
    website: 'https://www.djangoproject.com/',
  },
  609392: {
    alt_description: 'Fast Python development with best practices.',
    alt_name: 'Python framework',
    categories: ['Development'],
    colors: {
      end: '1e2122',
      start: '363b3d',
    },
    description: `Flask is a lightweight WSGI web application framework written in Python. It is designed to make getting started quick and easy, with the ability to scale up to complex applications.`,
    logo_url: 'flask.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/flask/',
        title: 'Deploy Flask through the Linode Marketplace',
      },
    ],
    summary: `A quick light-weight web framework for Python that includes several utilities and libraries you can use to create a web application.`,
    website: 'https://www.palletsprojects.com/p/flask/',
  },
  611376: {
    alt_description: 'MySQL alternative for SQL database.',
    alt_name: 'SQL database',
    categories: ['Databases'],
    colors: {
      end: '254078',
      start: '326690',
    },
    description: `PostgreSQL is a popular open source relational database system that provides many advanced configuration options that can help optimize your database’s performance in a production environment.`,
    logo_url: 'postgresql.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/postgresql/',
        title: 'Deploy PostgreSQL through the Linode Marketplace',
      },
    ],
    summary: `The PostgreSQL relational database system is a powerful, scalable, and standards-compliant open-source database platform.`,
    website: 'https://www.postgresql.org/',
  },
  611895: {
    alt_description: 'Angular and Node.js stack.',
    alt_name: 'Web framework',
    categories: ['Development'],
    colors: {
      end: '686868',
      start: '323232',
    },
    description: `MEAN is a full-stack JavaScript-based framework which accelerates web application development much faster than other frameworks.  All involved technologies are well-established, offer robust feature sets, and are well-supported by their maintaining organizations. These characteristics make them a great choice for your applications.`,
    logo_url: 'mean.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/mean-stack/',
        title: 'Deploy a MEAN Stack through the Linode Marketplace',
      },
    ],
    summary: `A MEAN (MongoDB, Express, Angular, Node.js) stack is a free and open-source web software bundle used to build modern web applications.`,
    website: 'http://meanjs.org/',
  },
  632758: {
    alt_description:
      'File storage alternative to Dropbox and office suite alternative to Microsoft Office.',
    alt_name: 'File storage management & business tool suite',
    categories: ['Productivity'],
    colors: {
      end: '2a2a36',
      start: '16a5f3',
    },
    description: `Nextcloud AIO stands for Nextcloud All In One, and provides easy deployment and maintenance for popular Nextcloud tools. AIO includes Nextcloud, Nextcloud Office, OnlyOffice, and high-performance backend features.`,
    logo_url: 'nextcloud.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/nextcloud/',
        title: 'Deploy Nextcloud through the Linode Marketplace',
      },
    ],
    summary: `A safe home for all your data.`,
  },
  662118: {
    alt_description: 'Free internet radio station management and hosting.',
    alt_name: 'Online radio station builder',
    categories: ['Media and Entertainment'],
    colors: {
      end: '0b1b64',
      start: '1f8df5',
    },
    description: `All aspects of running a radio station in one web interface so you can start your own station. Manage media, create playlists, and interact with listeners on one free platform.`,
    logo_url: 'azuracast.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/azuracast/',
        title: 'Deploy AzuraCast through the Linode Marketplace',
      },
    ],
    summary: 'Open source, self-hosted web radio tool.',
    website: 'https://www.azuracast.com/',
  },
  662119: {
    alt_description:
      'Video / media library storage and sharing across TVs, phones, computers, and more.',
    alt_name: 'Media server',
    categories: [],
    colors: {
      end: '332c37',
      start: 'e5a00d',
    },
    description: `Organize, stream, and share your media library with friends, in addition to free live TV in 220+ countries.`,
    logo_url: 'plex.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/plex/',
        title: 'Deploy Plex Media Server through the Linode Marketplace',
      },
    ],
    summary:
      'Media server and streaming service to stay entertained across devices.',
    website: 'https://www.plex.tv/',
  },
  662121: {
    alt_description: 'Open source video conferencing alternative to Zoom.',
    alt_name: 'Video chat and video conferencing',
    categories: ['Media and Entertainment'],
    colors: {
      end: '949699',
      start: '1d76ba',
    },
    description: `Secure, stable, and free alternative to popular video conferencing services. Use built-in features to limit meeting access with passwords or stream on YouTube so anyone can attend.`,
    logo_url: 'jitsi.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/jitsi/',
        title: 'Deploy Jitsi through the Linode Marketplace',
      },
    ],
    summary: 'Free, open source video conferencing and communication platform.',
    website: 'https://jitsi.org/',
  },
  688890: {
    alt_description: 'Server work queue management.',
    alt_name: 'Message broker',
    categories: ['Development'],
    colors: {
      end: 'ff6600',
      start: 'a9b5af',
    },
    description: `Connect and scale applications with asynchronous messaging and highly available work queues, all controlled through an intuitive management UI.`,
    logo_url: 'rabbitmq.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/rabbitmq/',
        title: 'Deploy RabbitMQ through the Linode Marketplace',
      },
    ],
    summary: 'Most popular open source message broker.',
    website: 'https://www.rabbitmq.com/',
  },
  688891: {
    alt_description: 'Open source community forum alternative to Reddit.',
    alt_name: 'Chat forum',
    categories: ['Media and Entertainment'],
    colors: {
      end: 'eae692',
      start: '13b3ed',
    },
    description: `Launch a sleek forum with robust integrations to popular tools like Slack and WordPress to start more conversations.`,
    logo_url: 'discourse.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/discourse/',
        title: 'Deploy Discourse through the Linode Marketplace',
      },
    ],
    summary:
      'Open source community and discussion forum for customers, teams, fans, and more.',
    website: 'https://www.discourse.org/',
  },
  688903: {
    alt_description: 'Fancy development text editor.',
    alt_name: 'Text editor',
    categories: ['Development'],
    colors: {
      end: '0066b8',
      start: '23a9f2',
    },
    description: `Launch a portable development environment to speed up tests, downloads, and more.`,
    logo_url: 'vscodeserver.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/vscode/',
        title: 'Deploy VS Code through the Linode Marketplace',
      },
    ],
    summary: 'Run VS code in the cloud, right from your browser.',
    website: 'https://github.com/cdr/code-server',
  },
  688911: {
    alt_description: 'Open source, self-hosted Git management tool.',
    alt_name: 'Git repository hosting',
    categories: ['Development'],
    colors: {
      end: '34495e',
      start: '609926',
    },
    description: `Self-hosted Git service built and maintained by a large developer community.`,
    logo_url: 'gitea.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/gitea/',
        title: 'Deploy Gitea through the Linode Marketplace',
      },
    ],
    summary: 'Git with a cup of tea - A painless self-hosted Git service.',
    website: 'https://gitea.io/',
  },
  688914: {
    alt_description: 'Desktop cloud hosting.',
    alt_name: 'Virtual desktop',
    categories: ['Development'],
    colors: {
      end: '213121',
      start: '304730',
    },
    description: `Access your desktop from any device with a browser to keep your desktop hosted in the cloud.`,
    logo_url: 'guacamole.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/guacamole/',
        title: 'Deploy Apache Guacamole through the Linode Marketplace',
      },
    ],
    summary: 'Free open source clientless remote desktop gateway.',
    website: 'https://guacamole.apache.org/',
  },
  691620: {
    alt_description: 'File storage alternative to Dropbox and Google Drive.',
    alt_name: 'File sharing',
    categories: ['Productivity'],
    colors: {
      end: '0168ad',
      start: '3e8cc1',
    },
    description: `File synchronization across multiple users’ computers and other devices to keep everyone working without interruption.`,
    logo_url: 'filecloud.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/filecloud/',
        title: 'Deploy FileCloud through the Linode Marketplace',
      },
    ],
    summary: 'Enterprise file sharing to manage and sync from any device.',
    website: 'https://www.getfilecloud.com',
  },
  691621: {
    alt_description:
      'Host multiple apps on one server and control panel, including WordPress, GitLab, and Nextcloud.',
    alt_name: 'Cloud app and website control panel',
    categories: ['Website'],
    colors: {
      end: '212121',
      start: '03a9f4',
    },
    description: `Turnkey solution for running apps like WordPress, Rocket.Chat, NextCloud, GitLab, and OpenVPN.`,
    logo_url: 'cloudron.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/cloudron/',
        title: 'Deploy Cloudron through the Linode Marketplace',
      },
    ],
    summary:
      'End-to-end deployment and automatic updates for a range of essential applications.',
    website: 'https://docs.cloudron.io',
  },
  691622: {
    alt_description: 'Popular website content management system.',
    alt_name: 'CMS: content management system',
    categories: ['Website'],
    colors: {
      end: '3d596d',
      start: '33cccc',
    },
    description: `Accelerated and scalable hosting for WordPress. Includes OpenLiteSpeed, PHP, MySQL Server, WordPress, and LiteSpeed Cache.`,
    logo_url: 'openlitespeedwordpress.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/openlitespeed-wordpress/',
        title: 'Deploy OpenLiteSpeed Wordpress through the Linode Marketplace',
      },
    ],
    summary: 'Blazing fast, open source alternative to LiteSpeed Web Server.',
    website: 'https://openlitespeed.org/',
  },
  692092: {
    alt_description: 'Limited user, hardened SSH, Fail2Ban Linode server.',
    alt_name: 'Secure server tool',
    categories: ['Security'],
    colors: {
      end: '32363b',
      start: '01b058',
    },
    description: `Save time on securing your Linode by deploying an instance pre-configured with some basic security best practices: limited user account access, hardened SSH, and Fail2Ban for SSH Login Protection.`,
    logo_url: 'secureyourserver.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/secure-your-server/',
        title: 'Secure Your Server through the Linode Marketplace',
      },
    ],
    summary: `Harden your Linode before you deploy with the Secure Your Server One-Click App.`,
  },
  741206: {
    alt_description:
      'Web hosting control panel for managing websites, including WordPress.',
    alt_name: 'Web hosting control panel',
    categories: ['Control Panels'],
    colors: {
      end: '33cccc',
      start: '3d596d',
    },
    description: `Reduce setup time required to host websites and applications, including popular tools like OpenLiteSpeed WordPress.`,
    logo_url: 'cyberpanel.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/cyberpanel/',
        title: 'Deploy CyberPanel through the Linode Marketplace',
      },
    ],
    summary: 'Next-generation hosting control panel by OpenLiteSpeed.',
    website: 'https://docs.litespeedtech.com/cloud/images/cyberpanel/',
  },
  741207: {
    alt_description: 'Web interface for managing Docker containers.',
    alt_name: 'Docker GUI',
    categories: ['Development'],
    colors: {
      end: 'c4c4c4',
      start: '41b883',
    },
    description: `Simplify Docker deployments and make containerization easy for anyone to use. Please note: Yacht is still in alpha and is not recommended for production use.`,
    logo_url: 'yacht.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/yacht/',
        title: 'Deploy Yacht through the Linode Marketplace',
      },
    ],
    summary: 'Intuitive web interface for managing Docker containers.',
    website: 'https://github.com/SelfhostedPro/Yacht/',
  },
  741208: {
    alt_description: 'Enterprise infrastructure and IT resource montioring.',
    alt_name: 'Infrastructure monitoring',
    categories: ['Monitoring'],
    colors: {
      end: '252730',
      start: 'd40000',
    },
    description: `Monitor, track performance and maintain availability for network servers, devices, services and other IT resources– all in one tool.`,
    logo_url: 'zabbix.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/zabbix/',
        title: 'Deploy Zabbix through the Linode Marketplace',
      },
    ],
    summary: 'Enterprise-class open source distributed monitoring solution.',
    website: 'https://www.zabbix.com',
  },
  804143: {
    alt_description: 'Open source project management tool.',
    alt_name: 'Ticket management project management tool',
    categories: ['Productivity'],
    colors: {
      end: '0a0a0a',
      start: '4cff4c',
    },
    description: `Open source alternative to paid ticket management solutions with essential features including a streamlined task list, project and client management, and ticket prioritization.`,
    logo_url: 'peppermint.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/peppermint/',
        title: 'Deploy Peppermint through the Linode Marketplace',
      },
    ],
    summary: 'Simple yet scalable open source ticket management.',
    website: 'https://peppermint.sh/',
  },
  804144: {
    alt_description:
      'Free high-performance media streaming, including livestreaming.',
    alt_name: 'Free media streaming app',
    categories: ['Media and Entertainment'],
    colors: {
      end: '0a0a0a',
      start: 'df0718',
    },
    description: `Self-hosted free version to optimize and record video streaming for webinars, gaming, and more.`,
    logo_url: 'antmediaserver.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/antmediaserver/',
        title: 'Deploy Ant Media Server through the Linode Marketplace',
      },
    ],
    summary: 'A reliable, flexible and scalable video streaming solution.',
    website: 'https://antmedia.io/',
  },
  804172: {
    alt_description: 'Video and audio live streaming alternative to Twitch.',
    alt_name: 'Live streaming app',
    categories: ['Media and Entertainment'],
    colors: {
      end: '2086e1',
      start: '7871ff',
    },
    description: `A live streaming and chat server for use with existing popular broadcasting software.`,
    logo_url: 'owncast.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/owncast/',
        title: 'Deploy Owncast through the Linode Marketplace',
      },
    ],
    summary:
      'The standalone “Twitch in a Box” open source streaming and chat solution.',
    website: 'https://owncast.online/',
  },
  869127: {
    alt_description: 'Open source course builder and education tool.',
    alt_name: 'Online course CMS',
    categories: ['Website'],
    colors: {
      end: '494949',
      start: 'ff7800',
    },
    description: `Robust open-source learning platform enabling online education for more than 200 million users around the world. Create personalized learning environments within a secure and integrated system built for all education levels with an intuitive interface, drag-and-drop features, and accessible documentation.`,
    logo_url: 'moodle.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/moodle/',
        title: 'Deploy Moodle through the Linode Marketplace',
      },
    ],
    summary:
      'World’s most popular learning management system built and maintained by an active developer community.',
    website: 'https://docs.moodle.org/',
  },
  869129: {
    alt_description: 'Free open source control panel with a mobile app.',
    alt_name: 'Free infrastructure control panel',
    categories: ['Control Panels'],
    colors: {
      end: 'a3a3a3',
      start: '20a53a',
    },
    description: `Feature-rich alternative control panel for users who need critical control panel functionality but don’t need to pay for more niche premium features. aaPanel is open source and consistently maintained with weekly updates.`,
    logo_url: 'aapanel.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/aapanel/',
        title: 'Deploy aaPanel through the Linode Marketplace',
      },
    ],
    summary:
      'Popular open source free control panel with robust features and a mobile app.',
    website: 'https://www.aapanel.com/reference.html',
  },
  869153: {
    alt_description: 'Data security, data observability, data automation.',
    alt_name: 'Data management',
    categories: ['Development'],
    colors: {
      end: 'ed0181',
      start: 'f89f24',
    },
    description: `Popular data-to-everything platform with advanced security, observability, and automation features for machine learning and AI.`,
    logo_url: 'splunk.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/splunk/',
        title: 'Deploy Splunk through the Linode Marketplace',
      },
    ],
    summary:
      'All-in-one database deployment, management, and monitoring system.',
    website: 'https://docs.splunk.com/Documentation/Splunk',
  },
  912262: {
    alt_description: 'Container registry for Kubernetes.',
    alt_name: 'Container registry for Kubernetes.',
    categories: ['Development'],
    colors: {
      end: '4495d7',
      start: '60b932',
    },
    description: `Open source registry for images and containers. Linode recommends using Harbor with Linode Kubernetes Engine (LKE).`,
    logo_url: 'harbor.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/harbor/',
        title: 'Deploy Harbor through the Linode Marketplace',
      },
    ],
    summary: 'Cloud native container registry for Kubernetes and more.',
    website: 'https://goharbor.io/docs',
  },
  912264: {
    alt_description: 'Free alternative to Slack, Microsoft Teams, and Skype.',
    alt_name: 'Chat software',
    categories: ['Productivity'],
    colors: {
      end: '030d1a',
      start: 'f5445c',
    },
    description: `Put data privacy first with an alternative to programs like Slack and Microsoft Teams.`,
    logo_url: 'rocketchat.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/rocketchat/',
        title: 'Deploy Rocket.Chat through the Linode Marketplace',
      },
    ],
    summary: 'Feature-rich self-hosted chat and collaboration platform.',
    website: 'https://docs.rocket.chat/',
  },
  913276: {
    alt_description:
      'Security analytics for intrusion attempts and user action monitoring.',
    alt_name: 'Security monitoring',
    categories: ['Security'],
    colors: {
      end: 'ffb600',
      start: '00a9e5',
    },
    description: `Infrastructure monitoring solution to detect threats, intrusion attempts, unauthorized user actions, and provide security analytics.`,
    logo_url: 'wazuh.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/wazuh/',
        title: 'Deploy Wazuh through the Linode Marketplace',
      },
    ],
    summary: 'Free open source security monitoring solution.',
    website: 'https://documentation.wazuh.com/current/index.html',
  },
  913277: {
    alt_description: 'Free penetration testing tool using client-side vectors.',
    alt_name: 'Penetration testing tool for security research',
    categories: ['Security'],
    colors: {
      end: '000f21',
      start: '4a80a9',
    },
    description: `Test the security posture of a client or application using client-side vectors, all powered by a simple API. This project is developed solely for lawful research and penetration testing.`,
    logo_url: 'beef.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/beef/',
        title: 'Deploy BeEF through the Linode Marketplace',
      },
    ],
    summary:
      'Browser Exploitation Framework (BeEF) is an open source web browser penetration tool.',
    website: 'https://github.com/beefproject/beef',
  },
  923029: {
    alt_description: 'Fast Python development with best practices.',
    alt_name: 'Python framework',
    categories: ['Development'],
    colors: {
      end: '5cbf8a',
      start: '318640',
    },
    description: `Simple deployment for OLS web server, Python LSAPI, and CertBot.`,
    logo_url: 'openlitespeeddjango.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/openlitespeed-django/',
        title: 'Deploy OpenLiteSpeed Django through the Linode Marketplace',
      },
    ],
    summary: 'OLS web server with Django development framework.',
    website: 'https://docs.litespeedtech.com/cloud/images/django/',
  },
  923031: {
    alt_description:
      'Versatile cross-platform JavaScript run-time (runtime) environment.',
    alt_name: 'JavaScript environment',
    categories: ['Development'],
    colors: {
      end: '33cccc',
      start: '3d596d',
    },
    description: `High-performance open source web server with Node and CertBot, in addition to features like HTTP/3 support and easy SSL setup.`,
    logo_url: 'openlitespeednodejs.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/openlitespeed-nodejs/',
        title: 'Deploy OpenLiteSpeed Node.js through the Linode Marketplace',
      },
    ],
    summary: 'OLS web server with Node.js JavaScript runtime environment.',
    website: 'https://docs.litespeedtech.com/cloud/images/nodejs/',
  },
  923032: {
    alt_description: 'Optimized control panel server.',
    alt_name: 'Web server control panel',
    categories: ['Website'],
    colors: {
      end: '6e92c7',
      start: '353785',
    },
    description: `High-performance LiteSpeed web server equipped with WHM/cPanel and WHM LiteSpeed Plugin.`,
    logo_url: 'litespeedcpanel.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/litespeed-cpanel/',
        title: 'Deploy LiteSpeed cPanel through the Linode Marketplace',
      },
    ],
    summary: 'Next-generation web server with cPanel and WHM.',
    website: 'https://docs.litespeedtech.com/cp/cpanel/',
  },
  923033: {
    alt_description:
      'Free accounting software. QuickBooks alternative for freelancers and small businesses.',
    alt_name: 'Open source accounting software',
    categories: ['Productivity'],
    colors: {
      end: '55588b',
      start: '6ea152',
    },
    description: `Akaunting is a universal accounting software that helps small businesses run more efficiently. Track expenses, generate reports, manage your books, and get the other essential features to run your business from a single dashboard.`,
    logo_url: 'akaunting.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/akaunting/',
        title: 'Deploy Akaunting through the Linode Marketplace',
      },
    ],
    summary:
      'Free and open source accounting software you can use in your browser.',
    website: 'https://akaunting.com',
  },
  925722: {
    alt_description: 'Virtual private network for businesses and teams.',
    alt_name: 'Enterprise VPN',
    categories: ['Security'],
    colors: {
      end: '2e72d2',
      start: '2e4153',
    },
    description: `User-friendly VPN for both individual and commercial use. Choose from three pricing plans.`,
    logo_url: 'pritunl.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/pritunl/',
        title: 'Deploy Pritunl through the Linode Marketplace',
      },
    ],
    summary: 'Enterprise open source VPN.',
    website: 'https://docs.pritunl.com/docs',
  },
  970522: {
    alt_description: 'Popular DNS privacy sinkhole.',
    alt_name: 'Network ad blocking',
    categories: ['Security'],
    colors: {
      end: 'f60d1a',
      start: '96060c',
    },
    description: `Protect your network and devices from unwanted content. Avoid ads in non-browser locations with a free, lightweight, and comprehensive privacy solution you can self-host.`,
    logo_url: 'pihole.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/pihole/',
        title: 'Deploy Pi-hole through the Linode Marketplace',
      },
    ],
    summary: 'Free, open source, and highly scalable DNS sinkhole.',
    website: 'https://pi-hole.net/',
  },
  970523: {
    alt_description:
      'Infrastructure monitoring and aler alternative to Uptime Robot.',
    alt_name: 'Infrastructure monitoring',
    categories: ['Monitoring'],
    colors: {
      end: 'baecca',
      start: '67de92',
    },
    description: `Uptime Kuma is self-hosted alternative to Uptime Robot. Get real-time performance insights for HTTP(s), TCP/ HTTP(s) Keyword, Ping, DNS Record, and more. Monitor everything you need in one UI dashboard, or customize how you receive alerts with a wide range of supported integrations.`,
    logo_url: 'uptimekuma.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/uptime-kuma/',
        title: 'Deploy Uptime Kuma through the Linode Marketplace',
      },
    ],
    summary: 'Free, comprehensive, and “fancy” monitoring solution.',
    website: 'https://github.com/louislam/uptime-kuma',
  },
  970559: {
    alt_description: 'Markdown-based website CMS.',
    alt_name: 'CMS: content management system',
    categories: ['Website'],
    colors: {
      end: 'b987cf',
      start: '1a0629',
    },
    description: `Build websites on a CMS that prioritizes speed and simplicity over customization and integration support. Create your content in Markdown and take advantage of powerful taxonomy to customize relationships between pages and other content.`,
    logo_url: 'grav.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/grav/',
        title: 'Deploy Grav through the Linode Marketplace',
      },
    ],
    summary: 'Modern and open source flat-file content management system.',
    website: 'https://getgrav.org/',
  },
  970561: {
    alt_description:
      'Versatile cross-platform JavaScript run-time (runtime) environment.',
    alt_name: 'JavaScript environment',
    categories: ['Development'],
    colors: {
      end: '333333',
      start: '3d853c',
    },
    description: `Node.js is a free, open-source, and cross-platform JavaScript run-time environment that lets developers write command line tools and server-side scripts outside of a browser.`,
    logo_url: 'nodejs.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/nodejs/',
        title: 'Deploy Node.js through the Linode Marketplace',
      },
    ],
    summary:
      'Popular and versatile open source JavaScript run-time environment.',
    website: 'https://nodejs.org/',
  },
  971042: {
    alt_description: 'Database low-code/no-code application builder.',
    alt_name: 'Low-code application builder',
    categories: ['Development'],
    colors: {
      end: 'ff8e42',
      start: '995ad9',
    },
    description: `Build applications without writing a single line of code. Saltcorn is a free platform that allows you to build an app with an intuitive point-and-click, drag-and-drop UI.`,
    logo_url: 'saltcorn.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/saltcorn/',
        title: 'Deploy Saltcorn through the Linode Marketplace',
      },
    ],
    summary: 'Open source, no-code database application builder.',
    website: 'https://saltcorn.com/',
  },
  971043: {
    alt_description:
      'Open source marketing and business platform with a CRM and email marketing.',
    alt_name: 'Marketing tool suite',
    categories: ['Productivity'],
    colors: {
      end: '027e84',
      start: '55354c',
    },
    description: `Odoo is a free and comprehensive business app suite of tools that seamlessly integrate. Choose what you need to manage your business on a single platform, including a CRM, email marketing tools, essential project management functions, and more.`,
    logo_url: 'odoo.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/odoo/',
        title: 'Deploy Odoo through the Linode Marketplace',
      },
    ],
    summary:
      'Open source, all-in-one business app suite with more than 7 million users.',
    website: 'https://www.odoo.com/',
  },
  971045: {
    alt_description: 'Free alternative to Trello and Asana.',
    alt_name: 'Kanban board project management tool',
    categories: ['Productivity'],
    colors: {
      end: '1d52ad',
      start: '2997f8',
    },
    description: `Create boards, assign tasks, and keep projects moving with a free and robust alternative to tools like Trello and Asana.`,
    logo_url: 'focalboard.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/focalboard/',
        title: 'Deploy Focalboard through the Linode Marketplace',
      },
    ],
    summary: 'Free open source project management tool.',
    website: 'https://www.focalboard.com/',
  },
  985364: {
    alt_description: 'Monitoring server.',
    alt_name: 'Server monitoring and visualization',
    categories: ['Monitoring'],
    colors: {
      end: 'e6522c',
      start: 'f9b716',
    },
    description: `Free industry-standard monitoring tools that work better together. Prometheus is a powerful monitoring software tool that collects metrics from configurable data points at given intervals, evaluates rule expressions, and can trigger alerts if some condition is observed. Use Grafana to create visuals, monitor, store, and share metrics with your team to keep tabs on your infrastructure.`,
    logo_url: 'prometheusgrafana.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/prometheus-grafana/',
        title: 'Deploy Prometheus & Grafana through the Linode Marketplace',
      },
    ],
    summary: 'Open source metrics and monitoring for real-time insights.',
    website: 'https://prometheus.io/docs/visualization/grafana/',
  },
  985372: {
    alt_description: 'Secure website CMS.',
    alt_name: 'CMS: content management system',
    categories: ['Website'],
    colors: {
      end: '5090cd',
      start: 'f2a13e',
    },
    description: `Free open source CMS optimized for building custom functionality and design.`,
    logo_url: 'joomla.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/joomla/',
        title: 'Deploy Joomla through the Linode Marketplace',
      },
    ],
    summary: 'Flexible and security-focused content management system.',
    website: 'https://www.joomla.org/',
  },
  985374: {
    alt_description:
      'Low latency live streaming including WebRTC streaming, CMAF, and HLS.',
    alt_name: 'Media streaming app',
    categories: ['Media and Entertainment'],
    colors: {
      end: '0a0a0a',
      start: 'df0718',
    },
    description: `Ant Media Server makes it easy to set up a video streaming platform with ultra low latency. The Enterprise edition supports WebRTC Live Streaming in addition to CMAF and HLS streaming. Set up live restreaming to social media platforms to reach more viewers.`,
    logo_url: 'antmediaserver.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/antmediaenterpriseserver/',
        title:
          'Deploy Ant Media Enterprise Edition through the Linode Marketplace',
      },
    ],
    summary: 'Highly scalable and feature-rich live video streaming platform.',
    website: 'https://antmedia.io/',
  },
  985380: {
    alt_description:
      'Digital note-taking application alternative to Evernote and OneNote.',
    alt_name: 'Multimedia note-taking and digital notebook',
    categories: ['Website'],
    colors: {
      end: '509df9',
      start: '043872',
    },
    description: `Capture your thoughts and securely access them from any device with a highly customizable note-taking software.`,
    logo_url: 'joplin.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/joplin/',
        title: 'Deploy Joplin through the Linode Marketplace',
      },
    ],
    summary: 'Open source multimedia note-taking app.',
    website: 'https://joplinapp.org/',
  },
  1008123: {
    alt_description: 'Audio and video streaming with E2E data encryption.',
    alt_name: 'Live streaming',
    categories: ['Media and Entertainment'],
    colors: {
      end: '4d8eff',
      start: '346ee0',
    },
    description: `Stream live audio or video while maximizing customer engagement with advanced built-in features. Liveswitch provides real-time monitoring, audience polling, and end-to-end (E2E) data encryption.`,
    logo_url: 'liveswitch.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/liveswitch/',
        title: 'Deploy LiveSwitch through the Linode Marketplace',
      },
    ],
    summary: 'High quality and reliable interactive live streaming.',
    website: 'https://www.liveswitch.io/',
  },
  1008125: {
    alt_description:
      'Flexible control panel to simplify SSL certificates and push code from GitHub.',
    alt_name: 'Server control panel',
    categories: ['Control Panels'],
    colors: {
      end: '000000',
      start: '059669',
    },
    description: `Deploy Node.js, Ruby, Python, PHP, Go, and Java applications via an intuitive control panel. Easily set up free SSL certificates, run commands with an in-browser terminal, and push your code from Github to accelerate development.`,
    logo_url: 'easypanel.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/easypanel/',
        title: 'Deploy Easypanel through the Linode Marketplace',
      },
    ],
    summary: 'Modern server control panel based on Docker.',
    website: 'https://easypanel.io/',
  },
  1017300: {
    alt_description:
      'Security research and testing platform with hundreds of tools for reverse engineering, penetration testing, and more.',
    alt_name: 'Security research',
    categories: ['Security'],
    colors: {
      end: '2fa1bc',
      start: '267ff7',
    },
    description: `Kali Linux is an open source, Debian-based Linux OS that has become an industry-standard tool for penetration testing and security audits. Kali includes hundreds of free tools for reverse engineering, penetration testing and more. Kali prioritizes simplicity, making security best practices more accessible to everyone from cybersecurity professionals to hobbyists.`,
    logo_url: 'kalilinux.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/kali-linux/',
        title: 'Deploy Kali Linux through the Linode Marketplace',
      },
    ],
    summary:
      'Popular Linux OS and tool suite for penetration testing and security research.',
    website: 'https://www.kali.org/',
  },
  1037037: {
    alt_description:
      'HashiCorp containerization tool to use instead of or with Kubernetes',
    alt_name: 'Container scheduler and orchestrator',
    categories: ['Development'],
    colors: {
      end: '545556',
      start: '60dea9',
    },
    description:
      'A simple and flexible scheduler and orchestrator to deploy and manage containers and non-containerized applications across on-prem and clouds at scale.',
    logo_url: 'nomad.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/hashicorp-nomad',
        title: 'Deploy HashiCorp Nomad through the Linode Marketplace',
      },
    ],
    summary: 'Flexible scheduling and orchestration for diverse workloads.',
    website: 'https://www.nomadproject.io/docs',
  },
  1037038: {
    alt_description: 'HashiCorp password and secrets management storage.',
    alt_name: 'Security secrets management',
    categories: ['Security'],
    colors: {
      end: '545556',
      start: 'ffd712',
    },
    description:
      'HashiCorp Vault is an open source, centralized secrets management system. It provides a secure and reliable way of storing and distributing secrets like API keys, access tokens, and passwords.',
    logo_url: 'vault.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/hashicorp-vault',
        title: 'Deploy HashiCorp Vault through the Linode Marketplace',
      },
    ],
    summary: 'An open source, centralized secrets management system.',
    website: 'https://www.vaultproject.io/docs',
  },
  1051714: {
    alt_description: 'Drag and drop website CMS.',
    alt_name: 'Website builder',
    categories: ['Development'],
    colors: {
      end: '4592ff',
      start: '4592ff',
    },
    description: `Microweber is an easy Drag and Drop website builder and a powerful CMS of a new generation, based on the PHP Laravel Framework.`,
    logo_url: 'microweber.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/microweber/',
        title: 'Deploy Microweber through the Linode Marketplace',
      },
    ],
    summary: `Drag and drop CMS and website builder.`,
    website: 'https://microweber.com/',
  },
  1068726: {
    alt_description: 'MySQL alternative for SQL database.',
    alt_name: 'SQL database',
    categories: ['Databases'],
    colors: {
      end: '254078',
      start: '326690',
    },
    description: `PostgreSQL is a popular open source relational database system that provides many advanced configuration options that can help optimize your database’s performance in a production environment.`,
    logo_url: 'postgresql.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/postgresql-cluster/',
        title: 'Deploy PostgreSQL Cluster through the Linode Marketplace',
      },
    ],
    summary: `The PostgreSQL relational database system is a powerful, scalable, and standards-compliant open-source database platform.`,
    website: 'https://www.postgresql.org/',
  },
  1088136: {
    alt_description: 'SQL database.',
    alt_name: 'SQL database',
    categories: ['Databases'],
    colors: {
      end: '000000',
      start: 'EC7704',
    },
    description: `Galera provides a performant multi-master/active-active database solution with synchronous replication, to achieve high availability.`,
    logo_url: 'galeramarketplaceocc.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/galera-cluster/',
        title: 'Deploy Galera Cluster through the Linode Marketplace',
      },
    ],
    summary: `Multi-master MariaDB database cluster.`,
    website: 'https://galeracluster.com/',
  },
  1096122: {
    alt_description: 'Open source Twitter alternative.',
    alt_name: 'Open source social media',
    categories: ['Media and Entertainment'],
    colors: {
      end: '563ACC',
      start: '6364FF',
    },
    description: `Mastodon is an open-source and decentralized micro-blogging platform, supporting federation and public access to the server.`,
    logo_url: 'mastodon.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/mastodon/',
        title: 'Deploy Mastodon through the Linode Marketplace',
      },
    ],
    summary:
      'Mastodon is an open-source and decentralized micro-blogging platform.',
    website: 'https://docs.joinmastodon.org/',
  },
  1102900: {
    alt_description:
      'Open-source workflow management platform for data engineering pipelines.',
    alt_name: 'Workflow management platform',
    categories: ['Development'],
    colors: {
      end: 'E43921',
      start: '00C7D4',
    },
    description: `Programmatically author, schedule, and monitor workflows with a Python-based tool. Airflow provides full insight into the status and logs of your tasks, all in a modern web application.`,
    logo_url: 'apacheairflow.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/apache-airflow/',
        title: 'Deploy Apache Airflow through the Linode Marketplace',
      },
    ],
    summary:
      'Open source workflow management platform for data engineering pipelines.',
    website: 'https://airflow.apache.org/',
  },
  1102902: {
    alt_description: 'Web Application Firewall.',
    alt_name: 'Community WAF',
    categories: ['Security'],
    colors: {
      end: '00C1A9',
      start: '22324F',
    },
    description: `Harden your web applications and APIs against OWASP Top 10 attacks. Haltdos makes it easy to manage WAF settings and review logs in an intuitive web-based GUI.`,
    logo_url: 'haltdos.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/haltdos-community-waf/',
        title: 'Deploy Haltdos Community WAF through the Linode Marketplace',
      },
    ],
    summary: 'User-friendly web application firewall.',
    website: 'https://www.haltdos.com/',
  },
  1102906: {
    alt_description: 'Password Manager',
    alt_name: 'Pass Key',
    categories: ['Security'],
    colors: {
      end: '3A5EFF',
      start: '709cff',
    },
    description: `Self-host a password manager designed to simplify and secure your digital life. Passky is a streamlined version of paid password managers designed for everyone to use.`,
    logo_url: 'passky.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/passky/',
        title: 'Deploy Passky through the Linode Marketplace',
      },
    ],
    summary: 'Simple open source password manager.',
    website: 'https://passky.org/',
  },
  1102907: {
    alt_description: 'Office Suite',
    alt_name: 'Office Docs',
    categories: ['Productivity'],
    colors: {
      end: 'ff6f3d',
      start: 'ffa85b',
    },
    description: `Create and collaborate on text documents, spreadsheets, and presentations compatible with popular file types including .docx, .xlsx, and more. Additional features include real-time editing, paragraph locking while co-editing, and version history.`,
    logo_url: 'onlyoffice.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/onlyoffice/',
        title: 'Deploy ONLYOFFICE Docs through the Linode Marketplace',
      },
    ],
    summary: 'Open source comprehensive office suite.',
    website: 'https://www.onlyoffice.com/',
  },
  1132204: {
    alt_description: 'In-memory caching database.',
    alt_name: 'High performance database',
    categories: ['Databases'],
    colors: {
      end: '722b20',
      start: '222222',
    },
    description: `Redis&reg; is an open-source, in-memory, data-structure store, with the optional ability to write and persist data to a disk, which can be used as a key-value database, cache, and message broker. Redis&reg; features built-in transactions, replication, and support for a variety of data structures such as strings, hashes, lists, sets, and others.<br/><br/>*Redis is a registered trademark of Redis Ltd. Any rights therein are reserved to Redis Ltd. Any use by Akamai Technologies is for referential purposes only and does not indicate any sponsorship, endorsement or affiliation between Redis and Akamai Technologies.`,
    logo_url: 'redis.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/redis-cluster/',
        title: 'Deploy Redis® Sentinel Cluster through the Linode Marketplace',
      },
    ],
    summary:
      'Flexible, in-memory, NoSQL database service supported in many different coding languages.',
    website: 'https://redis.io/',
  },
  1160820: {
    alt_description:
      'A self-hosted backend-as-a-service platform that provides developers with all the core APIs required to build any application.',
    alt_name: 'Self-hosted backend-as-a-service',
    categories: ['Development'],
    colors: {
      end: 'f02e65',
      start: 'f02e65',
    },
    description: `A self-hosted Firebase alternative for web, mobile & Flutter developers.`,
    logo_url: 'appwrite.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/appwrite/',
        title: 'Deploy Appwrite through the Linode Marketplace',
      },
    ],
    summary:
      'Appwrite is an open-source, cross-platform and technology-agnostic alternative to Firebase, providing all the core APIs necessary for web, mobile and Flutter development.',
    website: 'https://appwrite.io/',
  },
  1226544: {
    alt_description:
      'HashiCorp containerization tool to use instead of or with Kubernetes',
    alt_name: 'Container scheduler and orchestrator',
    categories: ['Development'],
    colors: {
      end: '545556',
      start: '60dea9',
    },
    description:
      'A simple and flexible scheduler and orchestrator to deploy and manage containers and non-containerized applications across on-prem and clouds at scale.',
    logo_url: 'nomad.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/hashicorp-nomad-cluster',
        title: 'Deploy HashiCorp Nomad Cluster through the Linode Marketplace',
      },
    ],
    summary: 'Flexible scheduling and orchestration for diverse workloads.',
    website: 'https://www.nomadproject.io/docs',
  },
  1226545: {
    alt_description:
      'HashiCorp Nomad clients for horizontally scaling a Nomad One-Click Cluster',
    alt_name: 'Container scheduler and orchestrator',
    categories: ['Development'],
    colors: {
      end: '545556',
      start: '60dea9',
    },
    description:
      'A simple deployment of multiple clients to horizontally scale an existing Nomad One-Click Cluster.',
    logo_url: 'nomad.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/hashicorp-nomad-clients-cluster',
        title:
          'Deploy HashiCorp Nomad Clients Cluster through the Linode Marketplace',
      },
    ],
    summary: 'Flexible scheduling and orchestration for diverse workloads.',
    website: 'https://www.nomadproject.io/docs',
  },
  1243759: {
    alt_description: 'FFmpeg encoder plugins.',
    alt_name: 'Premium video encoding',
    categories: ['Media and Entertainment'],
    colors: {
      end: '041125',
      start: '6DBA98',
    },
    description: `MainConcept FFmpeg Plugins Demo is suited for both VOD and live production workflows, with advanced features such as Hybrid GPU acceleration and xHE-AAC audio format.`,
    logo_url: 'mainconcept.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/mainconcept-ffmpeg-plugins-demo/',
        title:
          'Deploy MainConcept FFmpeg Plugins Demo through the Linode Marketplace',
      },
    ],
    summary:
      'MainConcept FFmpeg Plugins Demo contains advanced video encoding tools.',
    website: 'https://www.mainconcept.com/ffmpeg',
  },
  1243760: {
    alt_description: 'Live video encoding engine.',
    alt_name: 'Real time video encoding',
    categories: ['Media and Entertainment'],
    colors: {
      end: '041125',
      start: '6DBA98',
    },
    description: `MainConcept Live Encoder Demo is a powerful all-in-one encoding engine designed to simplify common broadcast and OTT video workflows.`,
    logo_url: 'mainconcept.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/mainconcept-live-encoder-demo/',
        title:
          'Deploy MainConcept Live Encoder Demo through the Linode Marketplace',
      },
    ],
    summary: 'MainConcept Live Encoder is a real time video encoding engine.',
    website: 'https://www.mainconcept.com/live-encoder',
  },
  1243762: {
    alt_description: 'Panasonic camera format encoder.',
    alt_name: 'Media encoding into professional file formats.',
    categories: ['Media and Entertainment'],
    colors: {
      end: '041125',
      start: '6DBA98',
    },
    description: `MainConcept P2 AVC ULTRA Transcoder Demo is an optimized Docker container for file-based transcoding of media files into professional Panasonic camera formats like P2 AVC-Intra, P2 AVC LongG and AVC-intra RP2027.v1 and AAC High Efficiency v2 formats into an MP4 container.`,
    logo_url: 'mainconcept.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/mainconcept-p2-avc-ultra-demo/',
        title:
          'Deploy MainConcept P2 AVC ULTRA Transcoder Demo through the Linode Marketplace',
      },
    ],
    summary:
      'MainConcept P2 AVC ULTRA Transcoder is a Docker container for file-based transcoding of media files into professional Panasonic camera formats.',
    website: 'https://www.mainconcept.com/transcoders',
  },
  1243763: {
    alt_description: 'Sony camera format encoder.',
    alt_name: 'Media encoding into professional file formats.',
    categories: ['Media and Entertainment'],
    colors: {
      end: '041125',
      start: '6DBA98',
    },
    description: `MainConcept XAVC Transcoder Demo is an optimized Docker container for file-based transcoding of media files into professional Sony camera formats like XAVC-Intra, XAVC Long GOP and XAVC-S.`,
    logo_url: 'mainconcept.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/mainconcept-xavc-transcoder-demo/',
        title:
          'Deploy MainConcept XAVC Transcoder Demo through the Linode Marketplace',
      },
    ],
    summary:
      'MainConcept XAVC Transcoder is a Docker container for file-based transcoding of media files into professional Sony camera formats.',
    website: 'https://www.mainconcept.com/transcoders',
  },
  1243764: {
    alt_description: 'Sony XDCAM format encoder.',
    alt_name: 'Media encoding into professional file formats.',
    categories: ['Media and Entertainment'],
    colors: {
      end: '041125',
      start: '6DBA98',
    },
    description: `MainConcept XDCAM Transcoder Demo is an optimized Docker container for file-based transcoding of media files into professional Sony camera formats like XDCAM HD, XDCAM EX, XDCAM IMX and DVCAM (XDCAM DV).`,
    logo_url: 'mainconcept.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/mainconcept-xdcam-transcoder-demo/',
        title:
          'Deploy MainConcept XDCAM Transcoder Demo through the Linode Marketplace',
      },
    ],
    summary:
      'MainConcept XDCAM Transcoder is a Docker container for file-based transcoding of media files into professional Sony camera formats.',
    website: 'https://www.mainconcept.com/transcoders',
  },
  1243780: {
    alt_description: 'A private by design messaging platform.',
    alt_name: 'Anonymous messaging platform.',
    categories: ['Productivity'],
    colors: {
      end: '70f0f9',
      start: '11182f',
    },
    description: `SimpleX Chat - The first messaging platform that has no user identifiers of any kind - 100% private by design. SMP server is the relay server used to pass messages in SimpleX network. XFTP is a new file transfer protocol focussed on meta-data protection. This One-Click APP will deploy both SMP and XFTP servers.`,
    logo_url: 'simplexchat.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/simplex/',
        title: 'Deploy SimpleX chat through the Linode Marketplace',
      },
    ],
    summary: 'Private by design messaging server.',
    website: 'https://simplex.chat',
  },
  1298017: {
    alt_description: 'Data science notebook.',
    alt_name: 'Data science and machine learning development environment.',
    categories: ['Productivity'],
    colors: {
      end: '9e9e9e',
      start: 'f37626',
    },
    description:
      'JupyterLab is a cutting-edge web-based, interactive development environment, geared towards data science, machine learning and other scientific computing workflows.',
    logo_url: 'jupyter.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/jupyterlab/',
        title: 'Deploy JupyterLab through the Linode Marketplace',
      },
    ],
    summary: 'Data science development environment.',
    website: 'https://jupyter.org',
  },
  1308539: {
    alt_description: `Microservice centeric stream processing.`,
    alt_name: 'Microservice messaging bus',
    categories: ['Development'],
    colors: {
      end: '000000',
      start: '0086FF',
    },
    description:
      'NATS is a distributed PubSub technology that enables applications to securely communicate across any combination of cloud vendors, on-premise, edge, web and mobile, and devices.',
    logo_url: 'nats.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/nats-single-node/',
        title: 'Deploy NATS single node through the Linode Marketplace',
      },
    ],
    summary: 'Cloud native application messaging service.',
    website: 'https://nats.io',
  },
  1329462: {
    alt_description:
      'LinuxGSM is a command line utility that simplifies self-hosting multiplayer game servers.',
    alt_name: 'Multiplayer Game Servers',
    categories: ['Games'],
    colors: {
      end: 'F6BD0C',
      start: '000000',
    },
    description: `Self hosted multiplayer game servers.`,
    logo_url: 'linuxgsm.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/linuxgsm/',
        title: 'Deploy LinuxGSM through the Linode Marketplace',
      },
    ],
    summary: 'Simple command line multiplayer game servers.',
    website: 'https://docs.linuxgsm.com',
  },
  1350733: {
    alt_description:
      'Open source video conferencing cluster, alternative to Zoom.',
    alt_name: 'Video chat and video conferencing cluster',
    categories: ['Media and Entertainment'],
    colors: {
      end: '949699',
      start: '1d76ba',
    },
    description: `Secure, stable, and free alternative to popular video conferencing services. This app deploys four networked Jitsi nodes.`,
    logo_url: 'jitsi.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/jitsi-cluster/',
        title: 'Deploy Jitsi Cluster through the Linode Marketplace',
      },
    ],
    summary: 'Free, open source video conferencing and communication platform.',
    website: 'https://jitsi.org/',
  },
  1350783: {
    alt_description: 'Open source, highly available, shared filesystem.',
    alt_name: 'GlusterFS',
    categories: ['Development'],
    colors: {
      end: '784900',
      start: 'D4AC5C',
    },
    description:
      'GlusterFS is an open source, software scalable network filesystem. This app deploys three GlusterFS servers and three GlusterFS clients.',
    logo_url: 'glusterfs.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/glusterfs-cluster/',
        title: 'Deploy GlusterFS Cluster through the Linode Marketplace',
      },
    ],
    summary: 'Open source network filesystem.',
    website: 'https://www.gluster.org/',
  },
  1350845: {
    alt_description:
      'Linearly scalable, fault tolerant, open source NoSQL distributed database.',
    alt_name: 'NoSQL database cluster',
    categories: ['Databases'],
    colors: {
      end: '1486B1',
      start: '85A355',
    },
    description: `Distributed, masterless, replicating NoSQL database cluster.`,
    isNew: true,
    logo_url: 'apachecassandra.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/apache-cassandra-cluster/',
        title: 'Deploy Apache Cassandra Cluster through the Linode Marketplace',
      },
    ],
    summary: 'Open source NoSQL database cluster.',
    website: 'https://cassandra.apache.org/doc/latest/',
  },
  1366191: {
    alt_description:
      'Highly available, five-node enterprise NoSQL database cluster.',
    alt_name: 'Couchbase Enterprise Server Cluster',
    categories: ['Databases'],
    colors: {
      end: 'EC1018',
      start: '333333',
    },
    description: `Couchbase Enterprise Server is a high-performance NoSQL database, built for scale. Couchbase Server is designed with memory-first architecture, built-in cache and workload isolation.`,
    logo_url: 'couchbase.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/couchbase-cluster/',
        title:
          'Deploy a Couchbase Enterprise Server cluster through the Linode Marketplace',
      },
    ],
    summary: 'NoSQL production database cluster.',
    website: 'https://www.couchbase.com/',
  },
  1377657: {
    alt_description: 'Open source real-time data stream management cluster.',
    alt_name: 'Data stream publisher-subscriber cluster',
    categories: ['Development'],
    colors: {
      end: '5CA2A2',
      start: '00C7D4',
    },
    description: `Apache Kafka supports a wide range of applications from log aggregation to real-time analytics. Kafka provides a foundation for building data pipelines, event-driven architectures, or stream processing applications.`,
    logo_url: 'apachekafka.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/apache-kafka-cluster/',
        title: 'Deploy an Apache Kafka cluster through the Linode Marketplace',
      },
    ],
    summary: 'Open source data streaming.',
    website: 'https://kafka.apache.org/',
  },
  1403815: {
    alt_description: 'Open Source key/value datastore.',
    alt_name: 'Caching and message queue database',
    categories: ['Databases'],
    colors: {
      end: '1486B1',
      start: 'AAAAAA',
    },
    description: `High performance, BSD license key/value database.`,
    isNew: true,
    logo_url: 'valkey.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/valkey/',
        title: 'Deploy Valkey through the Linode Marketplace',
      },
    ],
    summary: 'Open Source key/value database',
    website: 'https://valkey.io/',
  },
  1403816: {
    alt_description: 'Open Source secrets management platform.',
    alt_name: 'Linux Foundation supported password mangement.',
    categories: ['Security'],
    colors: {
      end: '336D5C',
      start: 'FFBA01',
    },
    description: `OSI approved open source secrets platform.`,
    isNew: true,
    logo_url: 'openbao.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/openbao/',
        title: 'Deploy OpenBao through the Linode Marketplace',
      },
    ],
    summary: 'Open source password and credentials security.',
    website: 'https://openbao.org/',
  },
  1403817: {
    alt_description: 'High-performance time series database.',
    alt_name: 'Monitoring and analytics datastore.',
    categories: ['Databases'],
    colors: {
      end: 'CD0C81',
      start: '9D29FB',
    },
    description: `Time series database supporting native query and visualization.`,
    isNew: true,
    logo_url: 'influxdb.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/influxdb/',
        title: 'Deploy InfluxDB through the Linode Marketplace',
      },
    ],
    summary: 'High-performance database for analytics, monitoring and IoT.',
    website: 'https://influxdata.com/',
  },
  1403818: {
    alt_description:
      'Distributed data processing engine for large-scale analytics.',
    alt_name: 'Big Data processing framework.',
    categories: ['Stacks'],
    colors: {
      end: 'E25A1B',
      start: '1D678F',
    },
    description: `Fast, open-source unified analytics engine for large-scale data processing.`,
    isNew: true,
    logo_url: 'apachespark.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/marketplace-docs/guides/apache-spark-cluster/',
        title: 'Deploy Apache Spark through the Linode Marketplace',
      },
    ],
    summary: 'Unified analytics engine for big data processing.',
    website: 'https://spark.apache.org/',
  },
  1439640: {
    alt_description: 'Open Source Secrets Manager',
    alt_name: 'Passbolt CE',
    categories: ['Security'],
    colors: {
      end: 'D40101',
      start: '171717',
    },
    description: `Passbolt Community Edition is an open-source password manager designed for teams and businesses. It allows users to securely store, share and manage passwords.`,
    logo_url: 'passbolt.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/products/tools/marketplace/guides/passbolt/',
        title:
          'Deploy Passbolt Community Edition through the Linode Marketplace',
      },
    ],
    summary: 'Open-source password manager for teams and businesses.',
    website: 'https://www.passbolt.com/',
  },
  1646305: {
    alt_description:
      'Fast, open source framework for building developer portals.',
    alt_name: 'Developer Tool.',
    categories: ['Development'],
    colors: {
      end: '121212',
      start: '9BF0E1',
    },
    description: `Platform for building developer portals designed to simplify and unify software development processes.`,
    isNew: true,
    logo_url: 'backstage.svg',
    related_guides: [
      {
        href: 'https://www.linode.com/docs/marketplace-docs/guides/backstage/',
        title: 'Deploy Backstage through the Linode Marketplace',
      },
    ],
    summary: 'Developer portal for managing services and infrastructure.',
    website: 'https://backstage.io/',
  },
};
