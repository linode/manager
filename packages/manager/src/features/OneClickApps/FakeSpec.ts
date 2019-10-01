export interface OCA {
  description: string;
  name: string;
  related_guides?: Doc[];
  href?: string;
  logo_url: string;
  summary: string;
  tips?: string[];
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
    logo_url: 'assets/ark_color.svg',
    href: 'https://survivetheark.com/'
  },
  {
    name: 'cPanel',
    description: `cPanel & WHM is a Linux-based web hosting control panel and platform that helps you create and manage websites, servers, databases, and more with a suite of hosting automation and optimization tools. The cPanel One-Click App streamlines publishing and managing a website with cPanel & WHM on a Linode instance.`,
    summary: 'The leading hosting automation platform that has simplified site and server management for 20 years.',
    tips: [
      `Please note that it will take approximately 15 minutes for cPanel to boot after you launch.`
    ],
    href: 'https://www.cpanel.net/',
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
    logo_url: 'assets/csgo_color.svg',
    href: 'https://blog.counter-strike.net/index.php/about/'
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
    href: 'https://about.gitlab.com',
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
    name: 'Plesk',
    description: `Plesk is a leading WordPress and website management platform and control panel.
      Plesk lets you build and manage multiple websites from a single dashboard to configure web services,
      email, and other applications. Plesk features hundreds of extensions, plus a complete WordPress toolkit,
      and can orchestrate multi-server deployments. Use the Plesk One-Click App to manage websites hosted on your Linode.`,
    summary: 'A secure, scalable, and versatile website management platform.',
    tips: [
      'Please allow the script around 15 minutes to finish.',
      'After deployment, SSH into your Linode and run: <code> plesk login</code> to generate a login link.'
    ],
    href: 'https://www.plesk.com/',
    logo_url: 'assets/plesk_color.svg'
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
    logo_url: 'assets/rust_color.svg',
    href: 'https://rust.facepunch.com/'
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
    logo_url: 'assets/terraria_color.svg',
    href: 'https://terraria.org/'
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
    logo_url: 'assets/teamfortress_color.svg',
    href: 'http://www.teamfortress.com/'
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
    href: 'https://woocommerce.com/features/',
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
    name: 'Minecraft',
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
    href: 'https://www.minecraft.net/',
    logo_url: 'assets/minecraft_color.svg'
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
    href: 'https://www.wireguard.com/',
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
    href: 'https://woocommerce.com/features/',
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
    href: 'https://wordpress.org',
    logo_url: 'assets/wordpress_color.svg'
  }
];
