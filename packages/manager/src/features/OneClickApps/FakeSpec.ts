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
    name: 'aaPanel',
    description: `Feature-rich alternative control panel for users who need critical control panel functionality but don’t need to pay for more niche premium features. aaPanel is open source and consistently maintained with weekly updates.`,
    summary:
      'Popular open source free control panel with robust features and a mobile app.',
    related_guides: [
      {
        title: 'Deploying aaPanel through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/aapanel-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://www.aapanel.com/reference.html',
        href: 'https://www.aapanel.com/reference.html',
      },
    ],
    logo_url: 'assets/aapanel_color.svg',
  },
  {
    name: 'Akaunting',
    description: `Akaunting is a universal accounting software that helps small businesses run more efficiently. Track expenses, generate reports, manage your books, and get the other essential features to run your business from a single dashboard.`,
    summary:
      'Free and open source accounting software you can use in your browser.',
    related_guides: [
      {
        title: 'Deploying Akaunting through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/akaunting-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://akaunting.com',
        href: 'https://akaunting.com',
      },
    ],
    logo_url: 'assets/akaunting_color.svg',
  },
  {
    name: 'Ant Media Server',
    description: `Self-hosted free version to optimize and record video streaming for webinars, gaming, and more.`,
    summary: 'A reliable, flexible and scalable video streaming solution.',
    related_guides: [
      {
        title: 'Deploying Ant Media Server through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/guides/antmediaserver-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://antmedia.io/',
        href: 'https://antmedia.io/',
      },
    ],
    logo_url: 'assets/antmediaserver_color.svg',
  },
  {
    name: 'Ant Media Enterprise Edition',
    description: `Ant Media Server makes it easy to set up a video streaming platform with ultra low latency. The Enterprise edition supports WebRTC Live Streaming in addition to CMAF and HLS streaming. Set up live restreaming to social media platforms to reach more viewers.`,
    summary: 'Highly scalable and feature-rich live video streaming platform.',
    related_guides: [
      {
        title:
          'Deploying Ant Media Enterprise Edition through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/antmediaenterpriseserver/',
      },
    ],
    related_info: [
      {
        title: 'https://antmedia.io/',
        href: 'https://antmedia.io/',
      },
    ],
    logo_url: 'assets/antmediaserver_color.svg',
  },
  {
    name: 'Ark',
    description: `In Ark: Survival Evolved, you are placed on a series of fictional islands inhabited by dinosaurs and other prehistoric animals. Ark is an ongoing battle where animals and other players have the ability to destroy you. You must build structures, farm resources, breed dinosaurs, and even set up
      trading hubs with neighboring tribes. Hosting an Ark server gives you control of the entire game. You can define the leveling speed, the amount of players, and the types of weapons available.`,
    summary: `Multiplayer action-survival game. You have only one objective: survive.`,
    related_guides: [
      {
        title:
          'Deploying an ARK Survival Evolved Server through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/guides/ark-survival-evolved-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://survivetheark.com/',
        href: 'https://survivetheark.com/',
      },
    ],
    logo_url: 'assets/ark_color.svg',
  },
  {
    name: 'Azuracast',
    description: `All aspects of running a radio station in one web interface so you can start your own station. Manage media, create playlists, and interact with listeners on one free platform.`,
    summary: 'Open source, self-hosted web radio tool',
    related_guides: [
      {
        title: 'Deploying AzuraCast through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/azuracast-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://www.azuracast.com/',
        href: 'https://www.azuracast.com/',
      },
    ],
    logo_url: 'assets/azuracast.svg',
  },
  {
    name: 'BeEF',
    description: `Test the security posture of a client or application using client-side vectors, all powered by a simple API. This project is developed solely for lawful research and penetration testing.`,
    summary:
      'Browser Exploitation Framework (BeEF) is an open source web browser penetration tool.',
    related_guides: [
      {
        title: 'Deploying BeEF through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/beef-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://github.com/beefproject/beef',
        href: 'https://github.com/beefproject/beef',
      },
    ],
    logo_url: 'assets/beef_color.svg',
  },
  {
    name: 'BitNinja',
    description: `Add a critical layer of security to your server with a built-in web application firewall, inbound and outbound DoS detection, and real time IP reputation protection.`,
    summary: 'Full-stack server protection suite.',
    related_guides: [
      {
        title: 'Deploying BitNinja through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/bitninja-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://doc.bitninja.io/',
        href: 'https://doc.bitninja.io/',
      },
    ],
    logo_url: 'assets/bitninja_color.svg',
  },
  {
    name: 'Chevereto',
    description: `Chevereto is a full-featured image sharing solution that acts as an alternative to services like Google Photos or Flickr. Optimize image hosting by using external cloud storage (like Linode’s S3-compatible Object Storage) and connect to Chevereto using API keys.`,
    summary:
      'Self-host your own open source image library to easily upload, collaborate, and share images on your terms.',
    related_guides: [
      {
        title: 'Deploying Chevereto through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/chevereto-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://v3-docs.chevereto.com/',
        href: 'https://v3-docs.chevereto.com/',
      },
    ],
    logo_url: 'assets/chevereto_color.svg',
  },
  {
    name: 'Cloudron',
    description: `Turnkey solution for running apps like WordPress, Rocket.Chat, NextCloud, GitLab, and OpenVPN.`,
    summary:
      'End-to-end deployment and automatic updates for a range of essential applications.',
    related_guides: [
      {
        title: 'Deploying Cloudron through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/cloudron-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://docs.cloudron.io',
        href: 'https://docs.cloudron.io',
      },
    ],
    logo_url: 'assets/cloudron_color.svg',
  },
  {
    name: 'ClusterControl',
    description: `All-in-one interface for scripting and monitoring databases, including MySQL, MariaDB, Percona, MongoDB, PostgreSQL, Galera Cluster and more. Easily deploy database instances, manage with an included CLI, and automate performance monitoring.`,
    summary:
      'All-in-one database deployment, management, and monitoring system.',
    related_guides: [
      {
        title: 'Deploying ClusterControl through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/guides/clustercontrol-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://docs.severalnines.com/docs/clustercontrol/',
        href: 'https://docs.severalnines.com/docs/clustercontrol/',
      },
    ],
    logo_url: 'assets/clustercontrol_color.svg',
  },
  {
    name: 'cPanel',
    description: `The cPanel &amp; WHM&reg; Marketplace App streamlines publishing and managing a website on your Linode. cPanel 	&amp; WHM is a Linux&reg; based web hosting control panel and platform that helps you create and manage websites, servers, databases and more with a suite of hosting automation and optimization tools.`,
    summary:
      'The leading hosting automation platform that has simplified site and server management for 20 years.',
    related_guides: [
      {
        title: 'Deploying cPanel through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/cpanel-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://www.cpanel.net/',
        href: 'https://www.cpanel.net/',
      },
    ],
    logo_url: 'assets/cpanel_color.svg',
  },
  {
    name: 'CS:GO',
    description: `In CS:GO there are two teams: Terrorists and Counter-Terrorists. The teams compete against each other to complete objectives or to eliminate the opposing team. A competitive match requires two teams of five players, but hosting your own server allows you control over team size and server location, so you and your friends can play with low latency. Up to 64 players can be hosted on a single server.`,
    summary: `Fast-paced, competitive FPS. Partner with your team to compete the objective at hand, or take matters into your own hands and go solo.`,
    related_guides: [
      {
        title:
          'Deploying Counter-Strike Global Offensive through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/guides/counter-strike-go-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://blog.counter-strike.net/index.php/about/',
        href: 'https://blog.counter-strike.net/index.php/about/',
      },
    ],
    logo_url: 'assets/csgo_color.svg',
  },
  {
    name: 'CyberPanel',
    description: `Reduce setup time required to host websites and applications, including popular tools like OpenLiteSpeed WordPress.`,
    summary: 'Next-generation hosting control panel by OpenLiteSpeed.',
    related_guides: [
      {
        title: 'Deploying CyberPanel through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/cyberpanel-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://docs.litespeedtech.com/cloud/images/cyberpanel/',
        href: 'https://docs.litespeedtech.com/cloud/images/cyberpanel/',
      },
    ],
    logo_url: 'assets/cyberpanel_color.svg',
  },
  {
    name: 'Discourse',
    description: `Launch a sleek forum with robust integrations to popular tools like Slack and WordPress to start more conversations.`,
    summary:
      'Open source community and discussion forum for customers, teams, fans, and more',
    related_guides: [
      {
        title: 'Deploying Discourse through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/discourse-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://www.discourse.org/',
        href: 'https://www.discourse.org/',
      },
    ],
    logo_url: 'assets/discourse_color.svg',
  },
  {
    name: 'Django',
    description: `Django is a web development framework for the Python programing language. It enables rapid development, while favoring pragmatic and clean design.`,
    summary: `A framework for simplifying the process of building your web applications more quickly and with less code.`,
    related_guides: [
      {
        title: 'Deploying Django through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/django-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://www.djangoproject.com/',
        href: 'https://www.djangoproject.com/',
      },
    ],
    logo_url: 'assets/django_color.svg',
  },
  {
    name: 'Docker',
    description: `Docker is a tool that enables you to create, deploy, and manage lightweight, stand-alone packages that contain everything needed to run an application (code, libraries, runtime, system settings, and dependencies).`,
    summary: `Securely build, share and run modern applications anywhere.`,
    related_guides: [
      {
        title: 'Deploying Docker through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/docker-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://www.docker.com/',
        href: 'https://www.docker.com/',
      },
    ],
    logo_url: 'assets/docker_color.svg',
  },
  {
    name: 'Drupal',
    description: `Drupal is a content management system (CMS) designed for building custom websites for personal and business use. Built for high performance and scalability, Drupal provides the necessary tools to create rich, interactive community websites with forums, user blogs, and private messaging. Drupal also has support for personal publishing projects and can power podcasts, blogs, and knowledge-based systems, all within a single, unified platform.`,
    summary: `Powerful content management system built on PHP and supported by a database engine.`,
    related_guides: [
      {
        title: 'Deploying Drupal through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/drupal-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://www.drupal.org/',
        href: 'https://www.drupal.org/',
      },
    ],
    logo_url: 'assets/drupal_color.svg',
  },
  {
    name: 'Easypanel',
    description: `Deploy Node.js, Ruby, Python, PHP, Go, and Java applications via an intuitive control panel. Easily set up free SSL certificates, run commands with an in-browser terminal, and push your code from Github to accelerate development.`,
    summary: 'Modern server control panel based on Docker.',
    related_guides: [
      {
        title: 'Deploying Easypanel through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/easypanel',
      },
    ],
    related_info: [
      {
        title: 'https://easypanel.io/',
        href: 'https://easypanel.io/',
      },
    ],
    logo_url: 'assets/easypanel_color.svg',
  },
  {
    name: 'FileCloud',
    description: `File synchronization across multiple users’ computers and other devices to keep everyone working without interruption.`,
    summary: 'Enterprise file sharing to manage and sync from any device',
    related_guides: [
      {
        title: 'Deploying FileCloud through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/filecloud-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://www.getfilecloud.com',
        href: 'https://www.getfilecloud.com',
      },
    ],
    logo_url: 'assets/filecloud_color.svg',
  },
  {
    name: 'Flask',
    description: `Flask is a lightweight WSGI web application framework written in Python. It is designed to make getting started quick and easy, with the ability to scale up to complex applications.`,
    summary: `A quick light-weight web framework for Python that includes several utilities and libraries you can use to create a web application.`,
    related_guides: [
      {
        title: 'Deploying Flask through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/flask-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://www.palletsprojects.com/p/flask/',
        href: 'https://www.palletsprojects.com/p/flask/',
      },
    ],
    logo_url: 'assets/flask_color.svg',
  },
  {
    name: 'Focalboard',
    description: `Create boards, assign tasks, and keep projects moving with a free and robust alternative to tools like Trello and Asana.`,
    summary: 'Free open source project management tool.',
    related_guides: [
      {
        title: 'Deploying Focalboard through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/focalboard-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://www.focalboard.com/',
        href: 'https://www.focalboard.com/',
      },
    ],
    logo_url: 'assets/focalboard_color.svg',
  },
  {
    name: 'Gitea',
    description: `Self-hosted Git service built and maintained by a large developer community.`,
    summary: 'Git with a cup of tea - A painless self-hosted Git service',
    related_guides: [
      {
        title: 'Deploying Gitea through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/gitea-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://gitea.io/',
        href: 'https://gitea.io/',
      },
    ],
    logo_url: 'assets/gitea_color.svg',
  },
  {
    name: 'GitLab',
    description: `GitLab is a complete solution for all aspects of your software development. At its core, GitLab serves as your centralized Git repository. GitLab also features built-in tools that represent every task in your development workflow, from planning to testing to releasing.
      Self-hosting your software development with GitLab offers total control of your codebase. At the same time, its familiar interface will ease collaboration for you and your team. GitLab is the most popular self-hosted Git repository, so you'll benefit from a robust set of integrated tools and an active community.`,
    summary:
      'More than a self-hosted Git repository: use GitLab to manage all the stages of your DevOps life cycle.',
    related_guides: [
      {
        title: 'Deploying GitLab through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/gitlab-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://about.gitlab.com/',
        href: 'https://about.gitlab.com/',
      },
    ],
    logo_url: 'assets/gitlab_color.svg',
  },
  {
    name: 'Grafana',
    description: `Grafana gives you the ability to create, monitor, store, and share metrics with your team to keep tabs on your infrastructure.`,
    summary: `An open source analytics and monitoring solution with a focus on accessibility for metric visualization.`,
    related_guides: [
      {
        title: 'Deploying Grafana through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/grafana-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://grafana.com/',
        href: 'https://grafana.com/',
      },
    ],
    logo_url: 'assets/grafana_color.svg',
  },
  {
    name: 'Grav',
    description: `Build websites on a CMS that prioritizes speed and simplicity over customization and integration support. Create your content in Markdown and take advantage of powerful taxonomy to customize relationships between pages and other content.`,
    summary: 'Modern and open source flat-file content management system.',
    related_guides: [
      {
        title: 'Deploying Grav through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/grav-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://getgrav.org/',
        href: 'https://getgrav.org/',
      },
    ],
    logo_url: 'assets/grav_color.svg',
  },
  {
    name: 'Guacamole',
    description: `Access your desktop from any device with a browser to keep your desktop hosted in the cloud.`,
    summary: 'Free open source clientless remote desktop gateway',
    related_guides: [
      {
        title: 'Deploying Apache Guacamole through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/guacamole-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://guacamole.apache.org/',
        href: 'https://guacamole.apache.org/',
      },
    ],
    logo_url: 'assets/guacamole_color.svg',
  },
  {
    name: 'Harbor',
    description: `Open source registry for images and containers. Linode recommends using Harbor with Linode Kubernetes Engine (LKE).`,
    summary: 'Cloud native container registry for Kubernetes and more.',
    related_guides: [
      {
        title: 'Deploying Harbor through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/harbor-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://goharbor.io/docs',
        href: 'https://goharbor.io/docs',
      },
    ],
    logo_url: 'assets/harbor_color.svg',
  },
  {
    name: 'Jenkins',
    description: `Jenkins is an open source automation tool which can build, test, and deploy your infrastructure.`,
    summary: `A tool that gives you access to a massive library of plugins to support automation in your project's lifecycle.`,
    related_guides: [
      {
        title: 'Deploying Jenkins through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/jenkins-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://jenkins.io/',
        href: 'https://jenkins.io/',
      },
    ],
    logo_url: 'assets/jenkins_color.svg',
  },
  {
    name: 'JetBackup',
    description: `Powerful and customizable backups for several websites and data all in the same interface. JetBackup integrates with any control panel via API, and has native support for cPanel and DirectAdmin. Easily backup your data to storage you already use, including Linode’s S3-compatible Object Storage.`,
    summary:
      'Advanced customizable backups to integrate with your preferred control panel.',
    related_guides: [
      {
        title: 'Deploying JetBackup through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/jetbackup-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://docs.jetapps.com/',
        href: 'https://docs.jetapps.com/',
      },
    ],
    logo_url: 'assets/jetbackup_color.svg',
  },
  {
    name: 'Jitsi',
    description: `Secure, stable, and free alternative to popular video conferencing services. Use built-in features to limit meeting access with passwords or stream on YouTube so anyone can attend.`,
    summary: 'Free, open source video conferencing and communication platform',
    related_guides: [
      {
        title: 'Deploying Jitsi through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/jitsi-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://jitsi.org/',
        href: 'https://jitsi.org/',
      },
    ],
    logo_url: 'assets/jitsi_color.svg',
  },
  {
    name: 'Joomla',
    description: `Free open source CMS optimized for building custom functionality and design.`,
    summary: 'Flexible and security-focused content management system.',
    related_guides: [
      {
        title: 'Deploying Joomla through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/joomla',
      },
    ],
    related_info: [
      {
        title: 'https://www.joomla.org/',
        href: 'https://www.joomla.org/',
      },
    ],
    logo_url: 'assets/joomla_color.svg',
  },
  {
    name: 'Joplin',
    description: `Capture your thoughts and securely access them from any device with a highly customizable note-taking software.`,
    summary: 'Open source multimedia note-taking app.',
    related_guides: [
      {
        title: 'Deploying Joplin through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/joplin',
      },
    ],
    related_info: [
      {
        title: 'https://joplinapp.org/',
        href: 'https://joplinapp.org/',
      },
    ],
    logo_url: 'assets/joplin_color.svg',
  },
  {
    name: 'Kali Linux',
    description: `Kali Linux is an open source, Debian-based Linux distribution that has become an industry-standard tool for penetration testing and security audits. Kali includes hundreds of free tools for reverse engineering, penetration testing and more. Kali prioritizes simplicity, making security best practices more accessible to everyone from cybersecurity professionals to hobbyists.`,
    summary:
      'Popular Linux distribution and tool suite for penetration testing and security research',
    related_guides: [
      {
        title: 'Deploying Kali Linux through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/kalilinux',
      },
    ],
    related_info: [
      {
        title: 'https://www.kali.org/',
        href: 'https://www.kali.org/',
      },
    ],
    logo_url: 'assets/kalilinux_color.svg',
  },
  {
    name: 'Kepler Builder',
    description: `Use Kepler Builder to easily design and build sites in WordPress - no coding or design knowledge necessary.`,
    summary: 'Powerful drag & drop WordPress website builder',
    related_guides: [
      {
        title: 'Deploying Kepler through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/kepler-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://kepler.app/',
        href: 'https://kepler.app/',
      },
    ],
    logo_url: 'assets/keplerbuilder_color.svg',
  },
  {
    name: 'LAMP',
    description: `The LAMP stack consists of the Linux operating system, the Apache HTTP Server, the MySQL relational database management system, and the PHP programming language. This software environment is a foundation for popular PHP application
      frameworks like WordPress, Drupal, and Laravel. Upload your existing PHP application code to your new app or use a PHP framework to write a new application on the Linode.`,
    summary: `Build PHP-based applications with the LAMP software stack: Linux, Apache, MySQL, and PHP.`,
    related_guides: [
      {
        title: 'Deploying a LAMP Stack through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/lamp-stack-marketplace-app/',
      },
    ],
    logo_url: 'assets/lamp_flame_color.svg',
  },
  {
    name: 'LEMP',
    description: `LEMP provides a platform for applications that is compatible with the LAMP stack for nearly all applications; however, because NGINX is able to serve more pages at once with a more predictable memory usage profile, it may be more suited to high demand situations.`,
    summary: `The LEMP stack replaces the Apache web server component with NGINX (“Engine-X”), providing the E in the acronym: Linux, NGINX, MySQL/MariaDB, PHP.    `,
    related_guides: [
      {
        title: 'Deploying a LEMP Stack through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/lemp-stack-marketplace-app/',
      },
    ],
    logo_url: 'assets/lemp_color.svg',
  },
  {
    name: 'LiteSpeed cPanel',
    description: `High-performance LiteSpeed web server equipped with WHM/cPanel and WHM LiteSpeed Plugin.`,
    summary: 'Next-generation web server with cPanel and WHM.',
    related_guides: [
      {
        title: 'Deploying LiteSpeed cPanel through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/guides/litespeed-cpanel-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://docs.litespeedtech.com/cp/cpanel/',
        href: 'https://docs.litespeedtech.com/cp/cpanel/',
      },
    ],
    logo_url: 'assets/litespeedcpanel_color.svg',
  },
  {
    name: 'LiveSwitch',
    description: `Stream live audio or video while maximizing customer engagement with advanced built-in features. Liveswitch provides real-time monitoring, audience polling, and end-to-end (E2E) data encryption.`,
    summary: 'High quality and reliable interactive live streaming.',
    related_guides: [
      {
        title: 'Deploying LiveSwitch through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/liveswitch',
      },
    ],
    related_info: [
      {
        title: 'https://www.liveswitch.io/',
        href: 'https://www.liveswitch.io/',
      },
    ],
    logo_url: 'assets/liveswitch_color.svg',
  },
  {
    name: 'MagicSpam',
    description: `MagicSpam stops inbound spam from entering your server right at the SMTP layer to lower bandwidth and overhead, as well as secure mailboxes on your server from being compromised and used to send outbound spam. MagicSpam installs directly onto the email server without any need to change A/MX records to protect unlimited users and domains, and integrates natively with your control panel interface.`,
    summary:
      'Powerful anti-spam and email security solution for control panels (including cPanel and Plesk).',
    related_guides: [
      {
        title: 'Deploying Magicspam through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/magicspam-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://www.magicspam.com/anti-spam-features.php',
        href: 'https://www.magicspam.com/anti-spam-features.php',
      },
    ],
    logo_url: 'assets/magicspam_color.svg',
  },
  {
    name: 'MEAN',
    description: `MEAN is a full-stack JavaScript-based framework which accelerates web application development much faster than other frameworks.  All involved technologies are well-established, offer robust feature sets, and are well-supported by their maintaining organizations. These characteristics make them a great choice for your applications.`,
    summary: `A MEAN (MongoDB, Express, Angular, Node.js) stack is a free and open-source web software bundle used to build modern web applications:`,
    related_guides: [
      {
        title: 'Deploying a MEAN Stack through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/mean-stack-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'http://meanjs.org/',
        href: 'http://meanjs.org/',
      },
    ],
    logo_url: 'assets/mean_color.svg',
  },
  {
    name: 'MERN',
    description: `MERN is a full stack platform that contains everything you need to build a web application: MongoDB, a document database used to persist your application's data; Express, which serves as the web application framework; React, used to build your application's user interfaces;
      and Node.js, which serves as the run-time environment for your application. All of these technologies are well-established, offer robust feature sets, and are well-supported by their maintaining organizations. These characteristics make them a great choice for your applications. Upload your
      existing MERN website code to your new Linode, or use MERN's scaffolding tool to start writing new web applications on the Linode.`,
    summary: `Build production-ready apps with the MERN stack: MongoDB, Express, React, and Node.js.`,
    related_guides: [
      {
        title: 'Deploying a MERN Stack through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/mern-stack-marketplace-app/',
      },
    ],
    logo_url: 'assets/mern_color.svg',
  },
  {
    name: 'Minecraft: Java Edition',
    description: `With over 100 million users around the world, Minecraft is the most popular online game of all time. Less of a game and more of a lifestyle choice, you and other players are free to build and explore in a 3D generated world made up of millions of mineable blocks. Collect resources by leveling mountains,
      taming forests, and venturing out to sea. Choose a home from the varied list of biomes like ice worlds, flower plains, and jungles. Build ancient castles or modern mega cities, and fill them with redstone circuit contraptions and villagers. Fight off nightly invasions of Skeletons, Zombies, and explosive
      Creepers, or adventure to the End and the Nether to summon the fabled End Dragon and the chaotic Wither. If that is not enough, Minecraft is also highly moddable and customizable. You decide the rules when hosting your own Minecraft server for you and your friends to play together in this highly addictive game.`,
    summary: `Build, explore, and adventure in your own 3D generated world.`,
    related_guides: [
      {
        title: 'Deploying a Minecraft Server through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/minecraft-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://www.minecraft.net/',
        href: 'https://www.minecraft.net/',
      },
    ],
    logo_url: 'assets/minecraft_color.svg',
  },
  {
    name: 'Mist.io',
    description: `Streamline infrastructure management in one UI or by using the Mist.io RESTful API.`,
    summary:
      'Open source, unified interface and management platform for multi-cloud deployments',
    related_guides: [
      {
        title: 'Deploying Mist.io through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/mistio-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://mist.io/',
        href: 'https://mist.io/',
      },
    ],
    logo_url: 'assets/mistio_color.svg',
  },
  {
    name: 'MongoDB',
    description: `MongoDB provides an alternative to traditional relational database management systems (RDBMS). In addition to its schema-free design and scalable architecture, MongoDB provides JSON output and specialized language-specific bindings that make it particularly attractive for use in custom application development and rapid prototyping.`,
    summary: `MongoDB is a database engine that provides access to non-relational, document-oriented databases.`,
    related_guides: [
      {
        title: 'Deploying MongoDB with Marketplace Apps',
        href: 'https://www.linode.com/docs/guides/mongodb-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://www.mongodb.com/',
        href: 'https://www.mongodb.com/',
      },
    ],
    logo_url: 'assets/mongodb_color.svg',
  },
  {
    name: 'Moodle',
    description: `Robust open-source learning platform enabling online education for more than 200 million users around the world. Create personalized learning environments within a secure and integrated system built for all education levels with an intuitive interface, drag-and-drop features, and accessible documentation.`,
    summary:
      'World’s most popular learning management system built and maintained by an active developer community.',
    related_guides: [
      {
        title: 'Deploying Moodle through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/moodle-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://docs.moodle.org/',
        href: 'https://docs.moodle.org/',
      },
    ],
    logo_url: 'assets/moodle_color.svg',
  },
  {
    name: 'MySQL/MariaDB',
    description: `MySQL, or MariaDB for Linux distributions, is primarily used for web and server applications, including as a component of the industry-standard LAMP and LEMP stacks.`,
    summary: `World's most popular open source database.`,
    related_guides: [
      {
        title: 'Deploying MySQL/MariaDB through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/mysql-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://www.mysql.com/',
        href: 'https://www.mysql.com/',
      },
      {
        title: 'https://mariadb.com/',
        href: 'https://mariadb.com/',
      },
    ],
    logo_url: 'assets/mysql_color.svg',
  },
  {
    name: 'Nextcloud',
    description: `Nextcloud AIO stands for Nextcloud All In One, and provides easy deployment and maintenance for popular Nextcloud tools. AIO includes Nextcloud, Nextcloud Office, OnlyOffice, and high-performance backend features.`,
    summary: `A safe home for all your data.`,
    related_guides: [
      {
        title: 'Deploying Nextcloud through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/nextcloud-marketplace-app/',
      },
    ],
    logo_url: 'assets/nextcloud_color.svg',
  },
  {
    name: 'NirvaShare',
    description: `Securely share and collaborate Linode S3 object storage files/folders with your internal or external users such as customers, partners, vendors, etc with fine access control and a simple interface. Nirvashare easily integrates with many external identity providers such as Active Directory, GSuite, AWS SSO, KeyClock, etc.`,
    summary:
      'Secure file sharing for better collaboration with employees, partners, vendors, and more.',
    related_guides: [
      {
        title: 'Deploying NirvaShare through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/nirvashare-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://nirvashare.com/setup-guide/',
        href: 'https://nirvashare.com/setup-guide/',
      },
    ],
    logo_url: 'assets/nirvashare_color.svg',
  },
  {
    name: 'NodeJS',
    description: `NodeJS is a free, open-source, and cross-platform JavaScript run-time environment that lets developers write command line tools and server-side scripts outside of a browser.`,
    summary:
      'Popular and versatile open source JavaScript run-time environment.',
    related_guides: [
      {
        title: 'Deploying NodeJS through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/nodejs-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://nodejs.org/',
        href: 'https://nodejs.org/',
      },
    ],
    logo_url: 'assets/nodejs_color.svg',
  },
  {
    name: 'Odoo',
    description: `Odoo is a free and comprehensive business app suite of tools that seamlessly integrate. Choose what you need to manage your business on a single platform, including a CRM, email marketing tools, essential project management functions, and more.`,
    summary:
      'Open source, all-in-one business app suite with more than 7 million users.',
    related_guides: [
      {
        title: 'Deploying Odoo through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/odoo-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://www.odoo.com/',
        href: 'https://www.odoo.com/',
      },
    ],
    logo_url: 'assets/odoo_color.svg',
  },
  {
    name: 'OpenLiteSpeed Django',
    description: `Simple deployment for OLS web server, Python LSAPI, and CertBot.`,
    summary: 'OLS web server with Django development framework.',
    related_guides: [
      {
        title: 'Deploying OpenLiteSpeed Django through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/guides/openlitespeed-django-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://docs.litespeedtech.com/cloud/images/django/',
        href: 'https://docs.litespeedtech.com/cloud/images/django/',
      },
    ],
    logo_url: 'assets/openlitespeeddjango_color.svg',
  },
  {
    name: 'OpenLiteSpeed NodeJS',
    description: `High-performance open source web server with Node and CertBot, in addition to features like HTTP/3 support and easy SSL setup.`,
    summary: 'OLS web server with NodeJS JavaScript runtime environment.',
    related_guides: [
      {
        title: 'Deploying OpenLiteSpeed Node.js through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/guides/openlitespeed-nodejs-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://docs.litespeedtech.com/cloud/images/nodejs/',
        href: 'https://docs.litespeedtech.com/cloud/images/nodejs/',
      },
    ],
    logo_url: 'assets/openlitespeednodejs_color.svg',
  },
  {
    name: 'OpenLiteSpeed Rails',
    description: `Easy setup to run Ruby apps in the cloud and take advantage of OpenLiteSpeed server features like SSL, HTTP/3 support, and RewriteRules.`,
    summary: 'OLS web server with Ruby and CertBot.',
    related_guides: [
      {
        title: 'Deploying OpenLiteSpeed Rails through the Linode Marketplace ',
        href:
          'https://www.linode.com/docs/guides/openlitespeed-rails-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://docs.litespeedtech.com/cloud/images/rails/',
        href: 'https://docs.litespeedtech.com/cloud/images/rails/',
      },
    ],
    logo_url: 'assets/openlitespeedrails_color.svg',
  },
  {
    name: 'OpenLiteSpeed WordPress',
    description: `Accelerated and scalable hosting for WordPress. Includes OpenLiteSpeed, PHP, MySQL Server, WordPress, and LiteSpeed Cache.`,
    summary: 'Blazing fast, open source alternative to LiteSpeed Web Server',
    related_guides: [
      {
        title:
          'Deploying OpenLiteSpeed Wordpress through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/guides/openlitespeed-wordpress-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://openlitespeed.org/',
        href: 'https://openlitespeed.org/',
      },
    ],
    logo_url: 'assets/openlitespeedwordpress_color.svg',
  },
  {
    name: 'OpenVPN',
    description: `OpenVPN is a widely trusted, free, and open-source virtual private network application. OpenVPN creates network tunnels between groups of computers that are not on the same local network, and it uses OpenSSL to encrypt your traffic.`,
    summary: `Open-source virtual private network (VPN) application. OpenVPN securely connects your computer to your servers, or to the public Internet.`,
    related_guides: [
      {
        title: 'Deploying OpenVPN through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/openvpn-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://openvpn.net/',
        href: 'https://openvpn.net/',
      },
    ],
    logo_url: 'assets/openvpn_color.svg',
  },
  {
    name: 'Owncast',
    description: `A live streaming and chat server for use with existing popular broadcasting software.`,
    summary:
      'The standalone “Twitch in a Box” open source streaming and chat solution.',
    related_guides: [
      {
        title: 'Deploying Owncast through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/owncast-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://owncast.online/',
        href: 'https://owncast.online/',
      },
    ],
    logo_url: 'assets/owncast_color.svg',
  },
  {
    name: 'Peppermint',
    description: `Open source alternative to paid ticket management solutions with essential features including a streamlined task list, project and client management, and ticket prioritization.`,
    summary: 'Simple yet scalable open source ticket management.',
    related_guides: [
      {
        title: 'Deploying Peppermint through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/peppermint-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://pmint.dev/',
        href: 'https://pmint.dev/',
      },
    ],
    logo_url: 'assets/peppermint_color.svg',
  },
  {
    name: 'Percona (PMM)',
    description: `Percona Monitoring and Management (PMM) is an open source GUI for managing and monitoring the performance of your MySQL, MariaDB, PostgreSQL, and MongoDB databases. This tool helps you optimize your database’s performance, manage your database instances, and keep track of and identify security issues.`,
    summary:
      'An open source analytics and performance monitoring solution for databases with a focus on user-friendly metrics visualizations.',
    related_guides: [
      {
        title:
          'Deploying Percona Monitoring and Management (PMM) through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/percona-marketplace-app/',
      },
    ],
    related_info: [
      {
        title:
          'https://www.percona.com/software/database-tools/percona-monitoring-and-management',
        href:
          'https://www.percona.com/software/database-tools/percona-monitoring-and-management',
      },
    ],
    logo_url: 'assets/percona_color.svg',
  },
  {
    name: 'phpMyAdmin',
    description: `Intuitive web interface for MySQL and MariaDB operations, including importing/exporting data, administering multiple servers, and global database search.`,
    summary: 'Popular free administration tool for MySQL and MariaDB',
    related_guides: [
      {
        title: 'Deploying phpMyAdmin through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/phpmyadmin-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://www.phpmyadmin.net/',
        href: 'https://www.phpmyadmin.net/',
      },
    ],
    logo_url: 'assets/phpmyadmin_color.svg',
  },
  {
    name: 'Pi-hole',
    description: `Protect your network and devices from unwanted content. Avoid ads in non-browser locations with a free, lightweight, and comprehensive privacy solution you can self-host.`,
    summary: 'Free, open source, and highly scalable DNS sinkhole.',
    related_guides: [
      {
        title: 'Deploying Pi-hole through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/pihole-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://pi-hole.net/',
        href: 'https://pi-hole.net/',
      },
    ],
    logo_url: 'assets/pihole_color.svg',
  },
  {
    name: 'Plesk',
    description: `Plesk is a leading WordPress and website management platform and control panel. Plesk lets you build and manage multiple websites from a single dashboard to configure web services, email, and other applications. Plesk features hundreds of extensions, plus a complete WordPress toolkit. Use the Plesk One-Click App to manage websites hosted on your Linode.`,
    summary:
      'A secure, scalable, and versatile website and WordPress management platform.',
    related_guides: [
      {
        title: 'Deploying Plesk through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/plesk-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://www.plesk.com/',
        href: 'https://www.plesk.com/',
      },
    ],
    logo_url: 'assets/plesk_color.svg',
  },
  {
    name: 'Plex',
    description: `Organize, stream, and share your media library with friends, in addition to free live TV in 220+ countries.`,
    summary:
      'Media server and streaming service to stay entertained across devices',
    related_guides: [
      {
        title: 'Deploying Plex Media Server through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/plex-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://www.plex.tv/',
        href: 'https://www.plex.tv/',
      },
    ],
    logo_url: 'assets/plex_color.svg',
  },
  {
    name: 'PostgreSQL',
    description: `PostgreSQL is a popular open source relational database system that provides many advanced configuration options that can help optimize your database’s performance in a production environment.`,
    summary: `The PostgreSQL relational database system is a powerful, scalable, and standards-compliant open-source database platform.`,
    related_guides: [
      {
        title: 'Deploying PostgreSQL through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/postgresql-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://www.postgresql.org/',
        href: 'https://www.postgresql.org/',
      },
    ],
    logo_url: 'assets/postgresql_color.svg',
  },
  {
    name: 'Pritunl',
    description: `User-friendly VPN for both individual and commercial use. Choose from three pricing plans.`,
    summary: 'Enterprise open source VPN.',
    related_guides: [
      {
        title: 'Deploying Pritunl through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/pritunl-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://docs.pritunl.com/docs',
        href: 'https://docs.pritunl.com/docs',
      },
    ],
    logo_url: 'assets/pritunl_color.svg',
  },
  {
    name: 'Prometheus',
    description: `Prometheus is a powerful monitoring software tool that collects metrics from configurable data points at given intervals, evaluates rule expressions, and can trigger alerts if some condition is observed.`,
    summary:
      'Gain metrics and receive alerts with this open-source monitoring tool.',
    related_guides: [
      {
        title: 'Deploying Prometheus through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/prometheus-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://prometheus.io/',
        href: 'https://prometheus.io/',
      },
    ],
    logo_url: 'assets/prometheus_color.svg',
  },
  {
    name: 'Prometheus & Grafana',
    description: `Free industry-standard monitoring tools that work better together. Prometheus is a powerful monitoring software tool that collects metrics from configurable data points at given intervals, evaluates rule expressions, and can trigger alerts if some condition is observed. Use Grafana to create visuals, monitor, store, and share metrics with your team to keep tabs on your infrastructure.`,
    summary: 'Open source metrics and monitoring for real-time insights.',
    related_guides: [
      {
        title: 'Deploying Prometheus & Grafana through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/prometheus-grafana',
      },
    ],
    related_info: [
      {
        title: 'https://prometheus.io/docs/visualization/grafana/',
        href: 'https://prometheus.io/docs/visualization/grafana/',
      },
    ],
    logo_url: 'assets/prometheus_grafana_color.svg',
  },
  {
    name: 'RabbitMQ',
    description: `Connect and scale applications with asynchronous messaging and highly available work queues, all controlled through an intuitive management UI.`,
    summary: 'Most popular open source message broker',
    related_guides: [
      {
        title: 'Deploying RabbitMQ through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/rabbitmq-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://www.rabbitmq.com/',
        href: 'https://www.rabbitmq.com/',
      },
    ],
    logo_url: 'assets/rabbitmq_color.svg',
  },
  {
    name: 'Redis',
    description: `Redis is an open-source, in-memory, data-structure store, with the optional ability to write and persist data to a disk, which can be used as a key-value database, cache, and message broker. Redis features built-in transactions, replication, and support for a variety of data structures such as strings, hashes, lists, sets, and others.`,
    summary:
      'Flexible, in-memory, NoSQL database service supported in many different coding languages.',
    related_guides: [
      {
        title: 'Deploying Redis through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/redis-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://redis.io/',
        href: 'https://redis.io/',
      },
    ],
    logo_url: 'assets/redis_color.svg',
  },
  {
    name: 'Restyaboard',
    description: `Restyaboard is an open-source alternative to Trello, but with additional smart features like offline sync, diff /revisions, nested comments, multiple view layouts, chat, and more.`,
    summary: 'Free and open source project management tool.',
    related_guides: [
      {
        title: 'Deploying Restyaboard through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/restyaboard-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://restya.com',
        href: 'https://restya.com',
      },
    ],
    logo_url: 'assets/restyaboard_color.svg',
  },
  {
    name: 'Rocket.Chat',
    description: `Put data privacy first with an alternative to programs like Slack and Microsoft Teams.`,
    summary: 'Feature-rich self-hosted chat and collaboration platform.',
    related_guides: [
      {
        title: 'Deploying Rocket.Chat through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/rocketchat-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://docs.rocket.chat/',
        href: 'https://docs.rocket.chat/',
      },
    ],
    logo_url: 'assets/rocketchat_color.svg',
  },
  {
    name: 'Ruby on Rails',
    description: `Rails is a web application development framework written in the Ruby programming language. It is designed to make programming web applications easier by giving every developer a number of common tools they need to get started. Ruby on Rails empowers you to accomplish more with less code.`,
    summary: `Ruby on Rails is a web framework that allows web designers and developers to implement dynamic, fully featured web applications. `,
    related_guides: [
      {
        title: 'Deploying Ruby on Rails through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/guides/ruby-on-rails-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://rubyonrails.org/',
        href: 'https://rubyonrails.org/',
      },
    ],
    logo_url: 'assets/rubyonrails_color.svg',
  },
  {
    name: 'Rust',
    description: `In Rust, you must work with or against other players to ensure your own survival. Players are able to steal, lie, cheat, or trick each other. Build a shelter, hunt animals for food, craft weapons and armor, and much more. Hosting your own Rust server allows you to customize settings and curate the number of players in the world.`,
    summary: `A free-for-all battle for survival in a harsh open-world environment. In Rust, you can do anything--but so can everyone else.`,
    related_guides: [
      {
        title: 'Deploying Rust through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/rust-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://rust.facepunch.com/',
        href: 'https://rust.facepunch.com/',
      },
    ],
    logo_url: 'assets/rust_color.svg',
  },
  {
    name: 'Saltcorn',
    description: `Build applications without writing a single line of code. Saltcorn is a free platform that allows you to build an app with an intuitive point-and-click, drag-and-drop UI.`,
    summary: 'Open source, no-code database application builder.',
    related_guides: [
      {
        title: 'Deploying Saltcorn through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/saltcorn-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://saltcorn.com/',
        href: 'https://saltcorn.com/',
      },
    ],
    logo_url: 'assets/saltcorn_color.svg',
  },
  {
    name: 'Secure Your Server',
    description: `Save time on securing your Linode by deploying an instance pre-configured with some basic security best practices: limited user account access, hardened SSH, and Fail2Ban for SSH Login Protection.`,
    summary: `Harden your Linode before you deploy with the Secure Your Server One-Click App.`,
    related_guides: [
      {
        title: 'Securing your Server',
        href: 'https://www.linode.com/docs/guides/securing-your-server/',
      },
    ],
    logo_url: 'assets/secureyourserver_color.svg',
  },
  {
    name: 'ServerWand',
    description: `Host multiple sites on a single server while managing apps, firewall, databases, backups, system users, cron jobs, SSL and email–  all in an intuitive interface.`,
    summary:
      'Magical control panel for hosting websites and managing your servers.',
    related_guides: [
      {
        title: 'Deploying ServerWand through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/serverwand-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://serverwand.com/',
        href: 'https://serverwand.com/',
      },
    ],
    logo_url: 'assets/serverwand_color.svg',
  },
  {
    name: 'Shadowsocks',
    description:
      'Shadowsocks is a lightweight SOCKS5 web proxy tool. A full setup requires a Linode server to host the Shadowsocks daemon, and a client installed on PC, Mac, Linux, or a mobile device. Unlike other proxy software, Shadowsocks traffic is designed to be both indiscernible from other traffic to third-party monitoring tools, and also able to disguise itself as a normal direct connection. Data passing through Shadowsocks is encrypted for additional security and privacy.',
    summary:
      'A secure socks5 proxy, designed to protect your Internet traffic.',
    related_guides: [
      {
        title: 'Deploying Splunk through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/shadowsocks-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://shadowsocks.org/',
        href: 'https://shadowsocks.org/',
      },
    ],
    logo_url: 'assets/shadowsocks_color.svg',
  },
  {
    name: 'Splunk',
    description: `Popular data-to-everything platform with advanced security, observability, and automation features for machine learning and AI.`,
    summary:
      'All-in-one database deployment, management, and monitoring system.',
    related_guides: [
      {
        title: 'Deploying Splunk through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/splunk-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://docs.splunk.com/Documentation/Splunk',
        href: 'https://docs.splunk.com/Documentation/Splunk',
      },
    ],
    logo_url: 'assets/splunk_color.svg',
  },
  {
    name: 'Terraria',
    description: `Terraria generates unique environments where a player begins by digging for ore, and the further they dig the more adventure they find. Multiplayer mode can be either cooperative or PvP. Hosting your own Terraria server gives you control over the world, the players, and the objectives. Your world, your rules.`,
    summary: `Adventure, collect resources, build structures, and battle enemies in this wildly creative two-dimensional sandbox game.`,
    related_guides: [
      {
        title: 'Deploying Terraria through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/terraria-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://terraria.org/',
        href: 'https://terraria.org/',
      },
    ],
    logo_url: 'assets/terraria_color.svg',
  },
  {
    name: 'TF2',
    description: `Team Fortress 2 is a team-based multiplayer first-person shooter. In TF2, you and your team choose from a number of hero classes and different game modes, ensuring a unique in-game experience every match.
      Setting up a personal game server puts you in control of what game modes and maps you use, as well as a variety of other settings to customize your experience.`,
    summary: `Choose from 9 unique classes in this highly original FPS. Compete against players around the world in a variety of modes such as capture the flag, king of the hill, and more.`,
    related_guides: [
      {
        title:
          'Deploying a Team Fortress 2 Server through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/guides/team-fortress-2-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'http://www.teamfortress.com/',
        href: 'http://www.teamfortress.com/',
      },
    ],
    logo_url: 'assets/teamfortress_color.svg',
  },
  {
    name: 'Uptime Kuma',
    description: `Uptime Kuma is self-hosted alternative to Uptime Robot. Get real-time performance insights for HTTP(s), TCP/ HTTP(s) Keyword, Ping, DNS Record, and more. Monitor everything you need in one UI dashboard, or customize how you receive alerts with a wide range of supported integrations.`,
    summary: 'Free, comprehensive, and “fancy” monitoring solution.',
    related_guides: [
      {
        title: 'Deploying Uptime Kuma through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/uptimekuma-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://github.com/louislam/uptime-kuma',
        href: 'https://github.com/louislam/uptime-kuma',
      },
    ],
    logo_url: 'assets/uptimekuma_color.svg',
  },
  {
    name: 'UTunnel VPN',
    description: `UTunnel VPN is a robust cloud-based VPN server software solution. With UTunnel VPN, businesses could easily set up secure remote access to their business network. UTunnel comes with a host of business-centric features including site-to-site connectivity, single sign-on integration, 2-factor authentication, etc.`,
    summary:
      'A powerful, user-friendly Virtual Private Network (VPN) server application that supports multiple VPN protocols.',
    related_guides: [
      {
        title: 'Deploying UTunnel VPN through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/utunnel-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://www.utunnel.io/linode-vpn-server.html',
        href: 'https://www.utunnel.io/linode-vpn-server.html',
      },
      {
        title: 'https://help.utunnel.io/',
        href: 'https://help.utunnel.io/',
      },
    ],
    logo_url: 'assets/utunnel_color.svg',
  },
  {
    name: 'Valheim',
    description: `In the relatively peaceful place called Valheim, traveling farther comes with a price: more enemies and greater challenges to stay alive. Experience a punishing combat system, intense boss battles, and a complex building system to construct Viking warships and more.`,
    summary:
      'Explore, build, and conquer in the popular open-world Viking survival game.',
    related_guides: [
      {
        title: 'Deploying Valheim through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/valheim-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://www.valheimgame.com/',
        href: 'https://www.valheimgame.com/',
      },
    ],
    logo_url: 'assets/valheim_color.svg',
  },
  {
    name: 'VictoriaMetrics Single',
    description: `VictoriaMetrics is designed to collect, store, and process real-time metrics.`,
    summary:
      'Free and open source time series database (TSDB) and monitoring solution.',
    related_guides: [
      {
        title:
          'Deploying VictoriaMetrics Single through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/guides/victoriametrics-single-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://victoriametrics.com/',
        href: 'https://victoriametrics.com/',
      },
    ],
    logo_url: 'assets/victoriametricssingle_color.svg',
  },
  {
    name: 'Virtualmin',
    description: `Streamline domain management, included as part of Webmin. Choose between the standard free version or upgrade to their premium service to access more features.`,
    summary: 'Domain hosting and website control panel',
    related_guides: [
      {
        title: 'Deploying Virtualmin through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/virtualmin-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://www.virtualmin.com/',
        href: 'https://www.virtualmin.com/',
      },
    ],
    logo_url: 'assets/virtualmin_color.svg',
  },
  {
    name: 'VS Code Server',
    description: `Launch a portable development environment to speed up tests, downloads, and more.`,
    summary: 'Run VS code in the cloud, right from your browser',
    related_guides: [
      {
        title: 'Deploying VS Code through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/vscode-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://github.com/cdr/code-server',
        href: 'https://github.com/cdr/code-server',
      },
    ],
    logo_url: 'assets/vscodeserver_color.svg',
  },
  {
    name: 'WarpSpeed',
    description: `Feature-rich, self-hosted VPN based on WireGuard® protocol, plus convenient features like single sign-on, real-time bandwidth monitoring, and unlimited users/devices.`,
    summary: 'Secure low-latency VPN powered by WireGuard® protocol.',
    related_guides: [
      {
        title: 'Deploying WarpSpeed VPN through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/warpspeed-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://bunker.services/products/warpspeed',
        href: 'https://bunker.services/products/warpspeed',
      },
    ],
    logo_url: 'assets/warpspeed_color.svg',
  },
  {
    name: 'Wazuh',
    description: `Infrastructure monitoring solution to detect threats, intrusion attempts, unauthorized user actions, and provide security analytics.`,
    summary: 'Free open source security monitoring solution.',
    related_guides: [
      {
        title: 'Deploying Wazuh through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/wazuh/',
      },
    ],
    related_info: [
      {
        title: 'https://documentation.wazuh.com/current/index.html',
        href: 'https://documentation.wazuh.com/current/index.html',
      },
    ],
    logo_url: 'assets/wazuh_color.svg',
  },
  {
    name: 'Webmin',
    description: `Web interface for Unix to optimize system management, both from the console and remotely.`,
    summary: 'Unix management in your browser',
    related_guides: [
      {
        title: 'Deploying Webmin through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/webmin-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'http://www.webmin.com/',
        href: 'http://www.webmin.com/',
      },
    ],
    logo_url: 'assets/webmin_color.svg',
  },
  {
    name: 'Webuzo',
    description: `Lightweight control panel with a suite of features to streamline app management.`,
    summary:
      'LAMP stack and single user control panel to simplify app deployment in the cloud.',
    related_guides: [
      {
        title: 'Deploying Webuzo through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/webuzo-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'http://www.webuzo.com/',
        href: 'http://www.webuzo.com/',
      },
    ],
    logo_url: 'assets/webuzo_color.svg',
  },
  {
    name: 'WireGuard&reg;',
    description: `Configuring WireGuard&reg; is as simple as configuring SSH. A connection is established by an exchange of public keys between server and client, and only a client whose public key is present in the server's configuration file is considered authorized. WireGuard sets up
      standard network interfaces which behave similarly to other common network interfaces, like eth0. This makes it possible to configure and manage WireGuard interfaces using standard networking tools such as ifconfig and ip. "WireGuard" is a registered trademark of Jason A. Donenfeld.`,
    summary: `Modern VPN which utilizes state-of-the-art cryptography. It aims to be faster and leaner than other VPN protocols and has a smaller source code footprint.`,
    related_guides: [
      {
        title: 'Deploying WireGuard through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/wireguard-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://www.wireguard.com/',
        href: 'https://www.wireguard.com/',
      },
    ],
    logo_url: 'assets/wireguard_color.svg',
  },
  {
    name: 'WooCommerce',
    description: `With WooCommerce, you can securely sell both digital and physical goods, and take payments via major credit cards, bank transfers, PayPal, and other providers like Stripe. With more than 300 extensions to choose from, WooCommerce is extremely flexible.`,
    summary: `Highly customizable, secure, open source eCommerce platform built to integrate with Wordpress.`,
    related_guides: [
      {
        title: 'Deploying WooCommerce through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/woocommerce-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://woocommerce.com/features/',
        href: 'https://woocommerce.com/features/',
      },
    ],
    logo_url: 'assets/woocommerce_color.svg',
  },
  {
    name: 'WordPress',
    description: `With 60 million users around the globe, WordPress is the industry standard for custom websites such as blogs, news sites, personal websites, and anything in-between. With a focus on best in class usability and flexibility, you can have a customized website up and running in minutes.`,
    summary:
      'Flexible, open source content management system (CMS) for content-focused websites of any kind.',
    related_guides: [
      {
        title: 'Deploying WordPress through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/wordpress-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://wordpress.org/',
        href: 'https://wordpress.org/',
      },
    ],
    logo_url: 'assets/wordpress_color.svg',
  },
  {
    name: 'Yacht',
    description: `Simplify Docker deployments and make containerization easy for anyone to use. Please note: Yacht is still in alpha and is not recommended for production use.`,
    summary: 'Intuitive web interface for managing Docker containers.',
    related_guides: [
      {
        title: 'Deploying Yacht through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/yacht-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://github.com/SelfhostedPro/Yacht/',
        href: 'https://github.com/SelfhostedPro/Yacht/',
      },
    ],
    logo_url: 'assets/yacht_color.svg',
  },
  {
    name: 'Zabbix',
    description: `Monitor, track performance and maintain availability for network servers, devices, services and other IT resources– all in one tool.`,
    summary: 'Enterprise-class open source distributed monitoring solution.',
    related_guides: [
      {
        title: 'Deploying Zabbix through the Linode Marketplace',
        href: 'https://www.linode.com/docs/guides/zabbix-marketplace-app/',
      },
    ],
    related_info: [
      {
        title: 'https://www.zabbix.com',
        href: 'https://www.zabbix.com',
      },
    ],
    logo_url: 'assets/zabbix_color.svg',
  },
];
