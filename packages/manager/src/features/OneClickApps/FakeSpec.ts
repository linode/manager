export interface OCA {
  description: string;
  alt_name: string;
  alt_description: string;
  name: string;
  related_guides?: Doc[];
  href?: string;
  logo_url: string;
  summary: string;
  tips?: string[];
  website?: string;
  colors: Colors;
  categories: AppCategory[];
  cluster_name?: string;
  cluster_guides?: Doc[];
}

export interface Doc {
  title: string;
  href: string;
}

export interface Colors {
  start: string;
  end: string;
}

export type AppCategory =
  | 'Control Panels'
  | 'Databases'
  | 'Development'
  | 'Games'
  | 'Media and Entertainment'
  | 'Monitoring'
  | 'Productivity'
  | 'Security'
  | 'Stacks'
  | 'Website'
  | 'App Creators';

export const oneClickApps: OCA[] = [
  {
    name: 'aaPanel',
    alt_name: 'Free infrastructure control panel',
    alt_description: 'Free open source control panel with a mobile app.',
    categories: ['Control Panels'],
    description: `Feature-rich alternative control panel for users who need critical control panel functionality but don’t need to pay for more niche premium features. aaPanel is open source and consistently maintained with weekly updates.`,
    summary:
      'Popular open source free control panel with robust features and a mobile app.',
    related_guides: [
      {
        title: 'Deploy aaPanel through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/aapanel/',
      },
    ],
    website: 'https://www.aapanel.com/reference.html',
    logo_url: 'aapanel.svg',
    colors: {
      start: '20a53a',
      end: 'a3a3a3',
    },
  },
  {
    name: 'Akaunting',
    alt_name: 'Open source accounting software',
    alt_description:
      'Free accounting software. QuickBooks alternative for freelancers and small businesses.',
    categories: ['Productivity'],
    description: `Akaunting is a universal accounting software that helps small businesses run more efficiently. Track expenses, generate reports, manage your books, and get the other essential features to run your business from a single dashboard.`,
    summary:
      'Free and open source accounting software you can use in your browser.',
    related_guides: [
      {
        title: 'Deploy Akaunting through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/akaunting/',
      },
    ],
    website: 'https://akaunting.com',
    logo_url: 'akaunting.svg',
    colors: {
      start: '6ea152',
      end: '55588b',
    },
  },
  {
    name: 'Ant Media Server: Community Edition',
    alt_name: 'Free media streaming app',
    alt_description:
      'Free high-performance media streaming, including livestreaming.',
    categories: ['Media and Entertainment'],
    description: `Self-hosted free version to optimize and record video streaming for webinars, gaming, and more.`,
    summary: 'A reliable, flexible and scalable video streaming solution.',
    related_guides: [
      {
        title: 'Deploy Ant Media Server through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/antmediaserver/',
      },
    ],
    website: 'https://antmedia.io/',
    logo_url: 'antmediaserver.svg',
    colors: {
      start: 'df0718',
      end: '0a0a0a',
    },
  },
  {
    name: 'Ant Media Server: Enterprise Edition',
    alt_name: 'Media streaming app',
    alt_description:
      'Low latency live streaming including WebRTC streaming, CMAF, and HLS.',
    categories: ['Media and Entertainment'],
    description: `Ant Media Server makes it easy to set up a video streaming platform with ultra low latency. The Enterprise edition supports WebRTC Live Streaming in addition to CMAF and HLS streaming. Set up live restreaming to social media platforms to reach more viewers.`,
    summary: 'Highly scalable and feature-rich live video streaming platform.',
    related_guides: [
      {
        title:
          'Deploy Ant Media Enterprise Edition through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/antmediaenterpriseserver/',
      },
    ],
    website: 'https://antmedia.io/',
    logo_url: 'antmediaserver.svg',
    colors: {
      start: 'df0718',
      end: '0a0a0a',
    },
  },
  {
    name: 'Apache Airflow',
    alt_name: 'Workflow management platform',
    alt_description:
      'Open-source workflow management platform for data engineering pipelines.',
    categories: ['Development'],
    description: `Programmatically author, schedule, and monitor workflows with a Python-based tool. Airflow provides full insight into the status and logs of your tasks, all in a modern web application.`,
    summary:
      'Open source workflow management platform for data engineering pipelines.',
    related_guides: [
      {
        title: 'Deploy Apache Airflow through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/apache-airflow/',
      },
    ],
    website: 'https://airflow.apache.org/',
    logo_url: 'apacheairflow.svg',
    colors: {
      start: '00C7D4',
      end: 'E43921',
    },
  },
  {
    name: 'Ark',
    alt_name: 'Survival game',
    alt_description: 'Prehistoric, open world survival crafting game.',
    categories: ['Games'],
    description: `In Ark: Survival Evolved, you are placed on a series of fictional islands inhabited by dinosaurs and other prehistoric animals. Ark is an ongoing battle where animals and other players have the ability to destroy you. You must build structures, farm resources, breed dinosaurs, and even set up
      trading hubs with neighboring tribes. Hosting an Ark server gives you control of the entire game. You can define the leveling speed, the amount of players, and the types of weapons available.`,
    summary: `Multiplayer action-survival game. You have only one objective: survive.`,
    related_guides: [
      {
        title:
          'Deploy an ARK Survival Evolved Server through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/ark-survival-evolved/',
      },
    ],
    website: 'https://survivetheark.com/',
    logo_url: 'ark@1x.svg',
    colors: {
      start: '0e0b08',
      end: '030303',
    },
  },
  {
    name: 'Azuracast',
    alt_name: 'Online radio station builder',
    alt_description: 'Free internet radio station management and hosting.',
    categories: ['Media and Entertainment'],
    description: `All aspects of running a radio station in one web interface so you can start your own station. Manage media, create playlists, and interact with listeners on one free platform.`,
    summary: 'Open source, self-hosted web radio tool',
    related_guides: [
      {
        title: 'Deploy AzuraCast through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/azuracast/',
      },
    ],
    website: 'https://www.azuracast.com/',
    logo_url: 'azuracast.svg',
    colors: {
      start: '1f8df5',
      end: '0b1b64',
    },
  },
  {
    name: 'BeEF',
    alt_name: 'Penetration testing tool for security research',
    alt_description: 'Free penetration testing tool using client-side vectors.',
    categories: ['Security'],
    description: `Test the security posture of a client or application using client-side vectors, all powered by a simple API. This project is developed solely for lawful research and penetration testing.`,
    summary:
      'Browser Exploitation Framework (BeEF) is an open source web browser penetration tool.',
    related_guides: [
      {
        title: 'Deploy BeEF through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/beef/',
      },
    ],
    website: 'https://github.com/beefproject/beef',
    logo_url: 'beef.svg',
    colors: {
      start: '4a80a9',
      end: '000f21',
    },
  },
  {
    name: 'BitNinja',
    alt_name: 'Server security tools',
    alt_description:
      'Server and application security including web application firewall and IP reputation protection.',
    categories: ['Security'],
    description: `Add a critical layer of security to your server with a built-in web application firewall, inbound and outbound DoS detection, and real time IP reputation protection.`,
    summary: 'Full-stack server protection suite.',
    related_guides: [
      {
        title: 'Deploy BitNinja through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/bitninja/',
      },
    ],
    website: 'https://doc.bitninja.io/',
    logo_url: 'bitninja.svg',
    colors: {
      start: 'c32127',
      end: '2a2a29',
    },
  },
  {
    name: 'Budibase',
    alt_name: 'Low-code application builder',
    alt_description:
      'Application builder for forms, portals, admin panels, and more.',
    categories: ['Development'],
    description:
      'Budibase is a modern, open source low-code platform for building modern business applications in minutes. Build, design and automate business apps, such as; admin panels, forms, internal tools, client portals and more. Before Budibase, it could take developers weeks to build simple CRUD apps; with Budibase, building CRUD apps takes minutes. When self-hosting please follow best practices for securing, updating and backing up your server.',
    summary: 'Low-code platform for building modern business applications.',
    related_guides: [
      {
        title: 'Deploy Budibase through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/budibase/',
      },
    ],
    website: 'https://docs.budibase.com/docs',
    logo_url: 'budibase.svg',
    colors: {
      start: '9981f5',
      end: '000000',
    },
  },
  {
    name: 'Chevereto',
    alt_name: 'Photo library and image library',
    alt_description:
      'Image hosting and sharing alternative to Google Photos and Flickr.',
    categories: ['Media and Entertainment'],
    description: `Chevereto is a full-featured image sharing solution that acts as an alternative to services like Google Photos or Flickr. Optimize image hosting by using external cloud storage (like Linode’s S3-compatible Object Storage) and connect to Chevereto using API keys.`,
    summary:
      'Self-host your own open source image library to easily upload, collaborate, and share images on your terms.',
    related_guides: [
      {
        title: 'Deploy Chevereto through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/chevereto/',
      },
    ],
    website: 'https://v3-docs.chevereto.com/',
    logo_url: 'chevereto.svg',
    colors: {
      start: '23a8e0',
      end: '8e44ad',
    },
  },
  {
    name: 'Cloudron',
    alt_name: 'Cloud app and website control panel',
    alt_description:
      'Host multiple apps on one server and control panel, including WordPress, GitLab, and Nextcloud.',
    categories: ['Website'],
    description: `Turnkey solution for running apps like WordPress, Rocket.Chat, NextCloud, GitLab, and OpenVPN.`,
    summary:
      'End-to-end deployment and automatic updates for a range of essential applications.',
    related_guides: [
      {
        title: 'Deploy Cloudron through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/cloudron/',
      },
    ],
    website: 'https://docs.cloudron.io',
    logo_url: 'cloudron.svg',
    colors: {
      start: '03a9f4',
      end: '212121',
    },
  },
  {
    name: 'ClusterControl',
    alt_name: 'Database monitoring',
    alt_description:
      'SQL and NoSQL database interface and monitoring for MySQL, MongoDB, PostgreSQL, and more.',
    categories: ['Databases'],
    description: `All-in-one interface for scripting and monitoring databases, including MySQL, MariaDB, Percona, MongoDB, PostgreSQL, Galera Cluster and more. Easily deploy database instances, manage with an included CLI, and automate performance monitoring.`,
    summary:
      'All-in-one database deployment, management, and monitoring system.',
    related_guides: [
      {
        title: 'Deploy ClusterControl through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/clustercontrol/',
      },
    ],
    website: 'https://docs.severalnines.com/docs/clustercontrol/',
    logo_url: 'clustercontrol.svg',
    colors: {
      start: '0589de',
      end: '3f434c',
    },
  },
  {
    name: 'cPanel',
    alt_name: 'Web server automation and control panel',
    alt_description:
      'Linux-based web hosting control panel for managing websites, servers, databases, and more.',
    categories: ['Control Panels'],
    description: `The cPanel &amp; WHM&reg; Marketplace App streamlines publishing and managing a website on your Linode. cPanel 	&amp; WHM is a Linux&reg; based web hosting control panel and platform that helps you create and manage websites, servers, databases and more with a suite of hosting automation and optimization tools.`,
    summary:
      'The leading hosting automation platform that has simplified site and server management for 20 years.',
    related_guides: [
      {
        title: 'Deploy cPanel through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/cpanel/',
      },
    ],
    website: 'https://www.cpanel.net/',
    logo_url: 'cpanel.svg',
    colors: {
      start: 'ff6c2c',
      end: '141d25',
    },
  },
  {
    name: 'CS:GO',
    alt_name: 'FPS game',
    alt_description:
      'Counter Strike: Global Offensive, classic first person shooter game.',
    categories: ['Games'],
    description: `In CS:GO there are two teams: Terrorists and Counter-Terrorists. The teams compete against each other to complete objectives or to eliminate the opposing team. A competitive match requires two teams of five players, but hosting your own server allows you control over team size and server location, so you and your friends can play with low latency. Up to 64 players can be hosted on a single server.`,
    summary: `Fast-paced, competitive FPS. Partner with your team to compete the objective at hand, or take matters into your own hands and go solo.`,
    related_guides: [
      {
        title:
          'Deploy Counter-Strike Global Offensive through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/counter-strike-go/',
      },
    ],
    website: 'https://blog.counter-strike.net/index.php/about/',
    logo_url: 'csgo2.svg',
    colors: {
      start: 'f29e1b',
      end: '50545f',
    },
  },
  {
    name: 'CyberPanel',
    alt_name: 'Web hosting control panel',
    alt_description:
      'Web hosting control panel for managing websites, including WordPress.',
    categories: ['Control Panels'],
    description: `Reduce setup time required to host websites and applications, including popular tools like OpenLiteSpeed WordPress.`,
    summary: 'Next-generation hosting control panel by OpenLiteSpeed.',
    related_guides: [
      {
        title: 'Deploy CyberPanel through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/cyberpanel/',
      },
    ],
    website: 'https://docs.litespeedtech.com/cloud/images/cyberpanel/',
    logo_url: 'cyberpanel.svg',
    colors: {
      start: '3d596d',
      end: '33cccc',
    },
  },
  {
    name: 'Discourse',
    alt_name: 'Chat forum',
    alt_description: 'Open source community forum alternative to Reddit.',
    categories: ['Media and Entertainment'],
    description: `Launch a sleek forum with robust integrations to popular tools like Slack and WordPress to start more conversations.`,
    summary:
      'Open source community and discussion forum for customers, teams, fans, and more',
    related_guides: [
      {
        title: 'Deploy Discourse through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/discourse/',
      },
    ],
    website: 'https://www.discourse.org/',
    logo_url: 'discourse.svg',
    colors: {
      start: '13b3ed',
      end: 'eae692',
    },
  },
  {
    name: 'Django',
    alt_name: 'Python framework',
    alt_description: 'Fast Python development with best practices.',
    categories: ['Development'],
    description: `Django is a web development framework for the Python programing language. It enables rapid development, while favoring pragmatic and clean design.`,
    summary: `A framework for simplifying the process of building your web applications more quickly and with less code.`,
    related_guides: [
      {
        title: 'Deploy Django through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/django/',
      },
    ],
    website: 'https://www.djangoproject.com/',
    logo_url: 'django.svg',
    colors: {
      start: '0a2e1f',
      end: '136149',
    },
  },
  {
    name: 'Docker',
    alt_name: 'Container builder',
    alt_description:
      'Popular container tool to build cloud-native applications.',
    categories: ['Development'],
    description: `Docker is a tool that enables you to create, deploy, and manage lightweight, stand-alone packages that contain everything needed to run an application (code, libraries, runtime, system settings, and dependencies).`,
    summary: `Securely build, share and run modern applications anywhere.`,
    related_guides: [
      {
        title: 'Deploy Docker through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/docker/',
      },
    ],
    website: 'https://www.docker.com/',
    logo_url: 'docker.svg',
    colors: {
      start: '2496ed',
      end: '1e65c9',
    },
  },
  {
    name: 'Drupal',
    alt_name: 'CMS: content management system',
    alt_description: 'Secure website CMS.',
    categories: ['Website'],
    description: `Drupal is a content management system (CMS) designed for building custom websites for personal and business use. Built for high performance and scalability, Drupal provides the necessary tools to create rich, interactive community websites with forums, user blogs, and private messaging. Drupal also has support for personal publishing projects and can power podcasts, blogs, and knowledge-based systems, all within a single, unified platform.`,
    summary: `Powerful content management system built on PHP and supported by a database engine.`,
    related_guides: [
      {
        title: 'Deploy Drupal through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/drupal/',
      },
    ],
    website: 'https://www.drupal.org/',
    logo_url: 'drupal.svg',
    colors: {
      start: '0678be',
      end: '1b64a5',
    },
  },
  {
    name: 'Easypanel',
    alt_name: 'Server control panel',
    alt_description:
      'Flexible control panel to simplify SSL certificates and push code from GitHub.',
    categories: ['Control Panels'],
    description: `Deploy Node.js, Ruby, Python, PHP, Go, and Java applications via an intuitive control panel. Easily set up free SSL certificates, run commands with an in-browser terminal, and push your code from Github to accelerate development.`,
    summary: 'Modern server control panel based on Docker.',
    related_guides: [
      {
        title: 'Deploy Easypanel through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/easypanel/',
      },
    ],
    website: 'https://easypanel.io/',
    logo_url: 'easypanel.svg',
    colors: {
      start: '059669',
      end: '000000',
    },
  },
  {
    name: 'FileCloud',
    alt_name: 'File sharing',
    alt_description: 'File storage alternative to Dropbox and Google Drive.',
    categories: ['Productivity'],
    description: `File synchronization across multiple users’ computers and other devices to keep everyone working without interruption.`,
    summary: 'Enterprise file sharing to manage and sync from any device',
    related_guides: [
      {
        title: 'Deploy FileCloud through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/filecloud/',
      },
    ],
    website: 'https://www.getfilecloud.com',
    logo_url: 'filecloud.svg',
    colors: {
      start: '3e8cc1',
      end: '0168ad',
    },
  },
  {
    name: 'Flask',
    alt_name: 'Python framework',
    alt_description: 'Fast Python development with best practices.',
    categories: ['Development'],
    description: `Flask is a lightweight WSGI web application framework written in Python. It is designed to make getting started quick and easy, with the ability to scale up to complex applications.`,
    summary: `A quick light-weight web framework for Python that includes several utilities and libraries you can use to create a web application.`,
    related_guides: [
      {
        title: 'Deploy Flask through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/flask/',
      },
    ],
    website: 'https://www.palletsprojects.com/p/flask/',
    logo_url: 'flask.svg',
    colors: {
      start: '363b3d',
      end: '1e2122',
    },
  },
  {
    name: 'Focalboard',
    alt_name: 'Kanban board project management tool',
    alt_description: 'Free alternative to Trello and Asana.',
    categories: ['Productivity'],
    description: `Create boards, assign tasks, and keep projects moving with a free and robust alternative to tools like Trello and Asana.`,
    summary: 'Free open source project management tool.',
    related_guides: [
      {
        title: 'Deploy Focalboard through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/focalboard/',
      },
    ],
    website: 'https://www.focalboard.com/',
    logo_url: 'focalboard.svg',
    colors: {
      start: '2997f8',
      end: '1d52ad',
    },
  },
  {
    name: 'Galera',
    alt_name: 'SQL database',
    alt_description: 'SQL database.',
    categories: ['Databases'],
    cluster_name: 'Galera Cluster',
    description: `Galera provides a performant multi-master/active-active database solution with synchronous replication, to achieve high availability.`,
    summary: `Multi-master MariaDB database cluster.`,
    related_guides: [
      {
        title: 'Deploy Galera Cluster through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/galera-cluster/',
      },
    ],
    cluster_guides: [
      {
        title: 'Deploy Galera Cluster through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/galera-cluster/',
      },
    ],
    website: 'https://galeracluster.com/',
    logo_url: 'galera.svg',
    colors: {
      start: 'EC7704',
      end: '000000',
    },
  },
  {
    name: 'Gitea',
    alt_name: 'Git repository hosting',
    alt_description: 'Open source, self-hosted Git management tool.',
    categories: ['Development'],
    description: `Self-hosted Git service built and maintained by a large developer community.`,
    summary: 'Git with a cup of tea - A painless self-hosted Git service',
    related_guides: [
      {
        title: 'Deploy Gitea through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/gitea/',
      },
    ],
    website: 'https://gitea.io/',
    logo_url: 'gitea.svg',
    colors: {
      start: '609926',
      end: '34495e',
    },
  },
  {
    name: 'GitLab',
    alt_name: 'Git repository hosting',
    alt_description: 'Popular Git management tool.',
    categories: ['Development'],
    description: `GitLab is a complete solution for all aspects of your software development. At its core, GitLab serves as your centralized Git repository. GitLab also features built-in tools that represent every task in your development workflow, from planning to testing to releasing.
      Self-hosting your software development with GitLab offers total control of your codebase. At the same time, its familiar interface will ease collaboration for you and your team. GitLab is the most popular self-hosted Git repository, so you'll benefit from a robust set of integrated tools and an active community.`,
    summary:
      'More than a self-hosted Git repository: use GitLab to manage all the stages of your DevOps life cycle.',
    related_guides: [
      {
        title: 'Deploy GitLab through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/gitlab/',
      },
    ],
    website: 'https://about.gitlab.com/',
    logo_url: 'gitlab.svg',
    colors: {
      start: '48357d',
      end: '21153e',
    },
  },
  {
    name: 'Gopaddle',
    alt_name: 'Go Paddle',
    alt_description:
      'No-code platform for Kubernetes developers and operators.',
    categories: ['Development'],
    description: `Provision multicloud clusters, containerize applications, and build DevOps pipelines. Gopaddle’s suite of templates and integrations helps eliminate manual errors and automate Kubernetes application releases.`,
    summary:
      'Simple low-code platform for Kubernetes developers and operators.',
    related_guides: [
      {
        title: 'Deploy Gopaddle through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/gopaddle/',
      },
    ],
    website: 'https://gopaddle.io/',
    logo_url: 'gopaddle.svg',
    colors: {
      start: '3a5bfd',
      end: '252930',
    },
  },
  {
    name: 'Grafana',
    alt_name: 'Monitoring vizualization dashboards',
    alt_description: 'Monitoring server.',
    categories: ['Monitoring'],
    description: `Grafana gives you the ability to create, monitor, store, and share metrics with your team to keep tabs on your infrastructure.`,
    summary: `An open source analytics and monitoring solution with a focus on accessibility for metric visualization.`,
    related_guides: [
      {
        title: 'Deploy Grafana through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/grafana/',
      },
    ],
    website: 'https://grafana.com/',
    logo_url: 'grafana.svg',
    colors: {
      start: '606060',
      end: 'f9b716',
    },
  },
  {
    name: 'Grav',
    alt_name: 'CMS: content management system',
    alt_description: 'Markdown-based website CMS.',
    categories: ['Website'],
    description: `Build websites on a CMS that prioritizes speed and simplicity over customization and integration support. Create your content in Markdown and take advantage of powerful taxonomy to customize relationships between pages and other content.`,
    summary: 'Modern and open source flat-file content management system.',
    related_guides: [
      {
        title: 'Deploy Grav through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/grav/',
      },
    ],
    website: 'https://getgrav.org/',
    logo_url: 'grav.svg',
    colors: {
      start: '1a0629',
      end: 'b987cf',
    },
  },
  {
    name: 'Guacamole',
    alt_name: 'Virtual desktop',
    alt_description: 'Desktop cloud hosting.',
    categories: ['Development'],
    description: `Access your desktop from any device with a browser to keep your desktop hosted in the cloud.`,
    summary: 'Free open source clientless remote desktop gateway',
    related_guides: [
      {
        title: 'Deploy Apache Guacamole through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/guacamole/',
      },
    ],
    website: 'https://guacamole.apache.org/',
    logo_url: 'guacamole.svg',
    colors: {
      start: '304730',
      end: '213121',
    },
  },
  {
    name: 'HaltDOS Community WAF',
    alt_name: 'Community WAF',
    alt_description: 'Web Application Firewall.',
    categories: ['Security'],
    description: `Harden your web applications and APIs against OWASP Top 10 attacks. Haltdos makes it easy to manage WAF settings and review logs in an intuitive web-based GUI.`,
    summary: 'User-friendly web application firewall.',
    related_guides: [
      {
        title: 'Deploy Haltdos Community WAF through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/haltdos-community-waf/',
      },
    ],
    website: 'https://www.haltdos.com/',
    logo_url: 'haltdos.svg',
    colors: {
      start: '22324F',
      end: '00C1A9',
    },
  },
  {
    name: 'Harbor',
    alt_name: 'Container registry for Kubernetes.',
    alt_description: 'Container registry for Kubernetes.',
    categories: ['Development'],
    description: `Open source registry for images and containers. Linode recommends using Harbor with Linode Kubernetes Engine (LKE).`,
    summary: 'Cloud native container registry for Kubernetes and more.',
    related_guides: [
      {
        title: 'Deploy Harbor through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/harbor/',
      },
    ],
    website: 'https://goharbor.io/docs',
    logo_url: 'harbor.svg',
    colors: {
      start: '60b932',
      end: '4495d7',
    },
  },
  {
    name: 'HashiCorp Nomad',
    alt_name: 'Container scheduler and orchestrator',
    alt_description:
      'HashiCorp containerization tool to use instead of or with Kubernetes',
    categories: ['Development'],
    description:
      'A simple and flexible scheduler and orchestrator to deploy and manage containers and non-containerized applications across on-prem and clouds at scale.',
    summary: 'Flexible scheduling and orchestration for diverse workloads.',
    related_guides: [
      {
        title: 'Deploy HashiCorp Nomad through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/hashicorp-nomad',
      },
    ],
    website: 'https://www.nomadproject.io/docs',
    logo_url: 'nomad.svg',
    colors: {
      start: '60dea9',
      end: '545556',
    },
  },
  {
    name: 'HashiCorp Vault',
    alt_name: 'Security secrets management',
    alt_description: 'HashiCorp password and secrets management storage.',
    categories: ['Security'],
    description:
      'HashiCorp Vault is an open source, centralized secrets management system. It provides a secure and reliable way of storing and distributing secrets like API keys, access tokens, and passwords.',
    summary: 'An open source, centralized secrets management system.',
    related_guides: [
      {
        title: 'Deploy HashiCorp Vault through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/hashicorp-vault',
      },
    ],
    website: 'https://www.vaultproject.io/docs',
    logo_url: 'vault.svg',
    colors: {
      start: 'ffd712',
      end: '545556',
    },
  },
  {
    name: 'Jenkins',
    alt_name: 'Free automation tool',
    alt_description: 'CI/CD tool to delegate automation tasks and jobs.',
    categories: ['Development'],
    description: `Jenkins is an open source automation tool which can build, test, and deploy your infrastructure.`,
    summary: `A tool that gives you access to a massive library of plugins to support automation in your project's lifecycle.`,
    related_guides: [
      {
        title: 'Deploy Jenkins through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/jenkins/',
      },
    ],
    website: 'https://jenkins.io/',
    logo_url: 'jenkins.svg',
    colors: {
      start: 'd33833',
      end: 'd24939',
    },
  },
  {
    name: 'JetBackup',
    alt_name: 'Server backups management and control panel',
    alt_description: 'Enterprise-ready backups tool.',
    categories: ['Control Panels'],
    description: `Powerful and customizable backups for several websites and data all in the same interface. JetBackup integrates with any control panel via API, and has native support for cPanel and DirectAdmin. Easily backup your data to storage you already use, including Linode’s S3-compatible Object Storage.`,
    summary:
      'Advanced customizable backups to integrate with your preferred control panel.',
    related_guides: [
      {
        title: 'Deploy JetBackup through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/jetbackup/',
      },
    ],
    website: 'https://docs.jetapps.com/',
    logo_url: 'jetbackup.svg',
    colors: {
      start: 'ff6c2c',
      end: '1f2c38',
    },
  },
  {
    name: 'Jitsi',
    alt_name: 'Video chat and video conferencing',
    alt_description: 'Open source video conferencing alternative to Zoom.',
    categories: ['Media and Entertainment'],
    description: `Secure, stable, and free alternative to popular video conferencing services. Use built-in features to limit meeting access with passwords or stream on YouTube so anyone can attend.`,
    summary: 'Free, open source video conferencing and communication platform',
    related_guides: [
      {
        title: 'Deploy Jitsi through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/jitsi/',
      },
    ],
    website: 'https://jitsi.org/',
    logo_url: 'jitsi.svg',
    colors: {
      start: '1d76ba',
      end: '949699',
    },
  },
  {
    name: 'Joomla',
    alt_name: 'CMS: content management system',
    alt_description: 'Secure website CMS.',
    categories: ['Website'],
    description: `Free open source CMS optimized for building custom functionality and design.`,
    summary: 'Flexible and security-focused content management system.',
    related_guides: [
      {
        title: 'Deploy Joomla through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/joomla/',
      },
    ],
    website: 'https://www.joomla.org/',
    logo_url: 'joomla.svg',
    colors: {
      start: 'f2a13e',
      end: '5090cd',
    },
  },
  {
    name: 'Joplin',
    alt_name: 'Multimedia note-taking and digital notebook',
    alt_description:
      'Digital note-taking application alternative to Evernote and OneNote.',
    categories: ['Website'],
    description: `Capture your thoughts and securely access them from any device with a highly customizable note-taking software.`,
    summary: 'Open source multimedia note-taking app.',
    related_guides: [
      {
        title: 'Deploy Joplin through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/joplin/',
      },
    ],
    website: 'https://joplinapp.org/',
    logo_url: 'joplin.svg',
    colors: {
      start: '043872',
      end: '509df9',
    },
  },
  {
    name: 'Kali Linux',
    alt_name: 'Security research',
    alt_description:
      'Security research and testing platform with hundreds of tools for reverse engineering, penetration testing, and more.',
    categories: ['Security'],
    description: `Kali Linux is an open source, Debian-based Linux distribution that has become an industry-standard tool for penetration testing and security audits. Kali includes hundreds of free tools for reverse engineering, penetration testing and more. Kali prioritizes simplicity, making security best practices more accessible to everyone from cybersecurity professionals to hobbyists.`,
    summary:
      'Popular Linux distribution and tool suite for penetration testing and security research',
    related_guides: [
      {
        title: 'Deploy Kali Linux through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/kali-linux/',
      },
    ],
    website: 'https://www.kali.org/',
    logo_url: 'kalilinux.svg',
    colors: {
      start: '267ff7',
      end: '2fa1bc',
    },
  },
  {
    name: 'Kepler Builder',
    alt_name: 'CMS: content management system',
    alt_description: 'Drag and drop website CMS.',
    categories: ['Website'],
    description: `Use Kepler Builder to easily design and build sites in WordPress - no coding or design knowledge necessary.`,
    summary: 'Powerful drag & drop WordPress website builder',
    related_guides: [
      {
        title: 'Deploy Kepler through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/kepler/',
      },
    ],
    website: 'https://kepler.app/',
    logo_url: 'keplerbuilder.svg',
    colors: {
      start: '0166ff',
      end: '4395ff',
    },
  },
  {
    name: 'LAMP',
    alt_name: 'Web stack',
    alt_description: 'Essential software stack for Linux applications.',
    categories: ['Stacks'],
    description: `The LAMP stack consists of the Linux operating system, the Apache HTTP Server, the MySQL relational database management system, and the PHP programming language. This software environment is a foundation for popular PHP application
      frameworks like WordPress, Drupal, and Laravel. Upload your existing PHP application code to your new app or use a PHP framework to write a new application on the Linode.`,
    summary: `Build PHP-based applications with the LAMP software stack: Linux, Apache, MySQL, and PHP.`,
    related_guides: [
      {
        title: 'Deploy a LAMP Stack through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/lamp-stack/',
      },
    ],
    logo_url: 'lamp_flame.svg',
    colors: {
      start: '3c4043',
      end: 'bfa477',
    },
  },
  {
    name: 'LEMP',
    alt_name: 'Web stack',
    alt_description: 'Essential software stack for Linux applications.',
    categories: ['Stacks'],
    description: `LEMP provides a platform for applications that is compatible with the LAMP stack for nearly all applications; however, because NGINX is able to serve more pages at once with a more predictable memory usage profile, it may be more suited to high demand situations.`,
    summary: `The LEMP stack replaces the Apache web server component with NGINX (“Engine-X”), providing the E in the acronym: Linux, NGINX, MySQL/MariaDB, PHP.    `,
    related_guides: [
      {
        title: 'Deploy a LEMP Stack through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/lemp-stack/',
      },
    ],
    logo_url: 'lemp.svg',
    colors: {
      start: '2e7d32',
      end: '005138',
    },
  },
  {
    name: 'LiteSpeed cPanel',
    alt_name: 'Web server control panel',
    alt_description: 'Optimized control panel server.',
    categories: ['Website'],
    description: `High-performance LiteSpeed web server equipped with WHM/cPanel and WHM LiteSpeed Plugin.`,
    summary: 'Next-generation web server with cPanel and WHM.',
    related_guides: [
      {
        title: 'Deploy LiteSpeed cPanel through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/litespeed-cpanel/',
      },
    ],
    website: 'https://docs.litespeedtech.com/cp/cpanel/',
    logo_url: 'litespeedcpanel.svg',
    colors: {
      start: '353785',
      end: '6e92c7',
    },
  },
  {
    name: 'LiveSwitch',
    alt_name: 'Live streaming',
    alt_description: 'Audio and video streaming with E2E data encryption.',
    categories: ['Media and Entertainment'],
    description: `Stream live audio or video while maximizing customer engagement with advanced built-in features. Liveswitch provides real-time monitoring, audience polling, and end-to-end (E2E) data encryption.`,
    summary: 'High quality and reliable interactive live streaming.',
    related_guides: [
      {
        title: 'Deploy LiveSwitch through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/liveswitch/',
      },
    ],
    website: 'https://www.liveswitch.io/',
    logo_url: 'liveswitch.svg',
    colors: {
      start: '346ee0',
      end: '4d8eff',
    },
  },
  {
    name: 'MagicSpam',
    alt_name: 'Anti-spam email security',
    alt_description: 'Server-level spam prevention tool.',
    categories: ['Security'],
    description: `MagicSpam stops inbound spam from entering your server right at the SMTP layer to lower bandwidth and overhead, as well as secure mailboxes on your server from being compromised and used to send outbound spam. MagicSpam installs directly onto the email server without any need to change A/MX records to protect unlimited users and domains, and integrates natively with your control panel interface.`,
    summary:
      'Powerful anti-spam and email security solution for control panels (including cPanel and Plesk).',
    related_guides: [
      {
        title: 'Deploy Magicspam through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/magicspam/',
      },
    ],
    website: 'https://www.magicspam.com/anti-spam-features.php',
    logo_url: 'magicspam.svg',
    colors: {
      start: '9c001b',
      end: 'f4ac45',
    },
  },
  {
    name: 'Mastodon',
    alt_name: 'Open source social media',
    alt_description: 'Open source Twitter alternative.',
    categories: ['Media and Entertainment'],
    description: `Mastodon is an open-source and decentralized micro-blogging platform, supporting federation and public access to the server.`,
    summary:
      'Mastodon is an open-source and decentralized micro-blogging platform.',
    related_guides: [
      {
        title: 'Deploy Mastodon through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/mastodon/',
      },
    ],
    website: 'https://docs.joinmastodon.org/',
    logo_url: 'mastodon.svg',
    colors: {
      start: '6364FF',
      end: '563ACC',
    },
  },
  {
    name: 'MEAN',
    alt_name: 'Web framework',
    alt_description: 'Angular and Node.js stack.',
    categories: ['Development'],
    description: `MEAN is a full-stack JavaScript-based framework which accelerates web application development much faster than other frameworks.  All involved technologies are well-established, offer robust feature sets, and are well-supported by their maintaining organizations. These characteristics make them a great choice for your applications.`,
    summary: `A MEAN (MongoDB, Express, Angular, Node.js) stack is a free and open-source web software bundle used to build modern web applications:`,
    related_guides: [
      {
        title: 'Deploy a MEAN Stack through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/mean-stack/',
      },
    ],
    website: 'http://meanjs.org/',
    logo_url: 'mean.svg',
    colors: {
      start: '323232',
      end: '686868',
    },
  },
  {
    name: 'MERN',
    alt_name: 'Web stack',
    alt_description: 'React and Node.js stack.',
    categories: [],
    description: `MERN is a full stack platform that contains everything you need to build a web application: MongoDB, a document database used to persist your application's data; Express, which serves as the web application framework; React, used to build your application's user interfaces;
      and Node.js, which serves as the run-time environment for your application. All of these technologies are well-established, offer robust feature sets, and are well-supported by their maintaining organizations. These characteristics make them a great choice for your applications. Upload your
      existing MERN website code to your new Linode, or use MERN's scaffolding tool to start writing new web applications on the Linode.`,
    summary: `Build production-ready apps with the MERN stack: MongoDB, Express, React, and Node.js.`,
    related_guides: [
      {
        title: 'Deploy a MERN Stack through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/mern-stack/',
      },
    ],
    logo_url: 'mern.svg',
    colors: {
      start: '30383a',
      end: '256291',
    },
  },
  {
    name: 'Microweber',
    alt_name: 'Website builder',
    alt_description: 'Drag and drop website CMS.',
    categories: ['Development'],
    description: `Microweber is an easy Drag and Drop website builder and a powerful CMS of a new generation, based on the PHP Laravel Framework.`,
    summary: `Drag and drop CMS and website builder.`,
    related_guides: [
      {
        title: 'Deploy Microweber through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/microweber/',
      },
    ],
    website: 'https://microweber.com/',
    logo_url: 'microweber.svg',
    colors: {
      start: '4592ff',
      end: '4592ff',
    },
  },
  {
    name: 'Minecraft: Java Edition',
    alt_name: 'World building game',
    alt_description: 'Classic open world survival crafting game.',
    categories: ['Games'],
    description: `With over 100 million users around the world, Minecraft is the most popular online game of all time. Less of a game and more of a lifestyle choice, you and other players are free to build and explore in a 3D generated world made up of millions of mineable blocks. Collect resources by leveling mountains,
      taming forests, and venturing out to sea. Choose a home from the varied list of biomes like ice worlds, flower plains, and jungles. Build ancient castles or modern mega cities, and fill them with redstone circuit contraptions and villagers. Fight off nightly invasions of Skeletons, Zombies, and explosive
      Creepers, or adventure to the End and the Nether to summon the fabled End Dragon and the chaotic Wither. If that is not enough, Minecraft is also highly moddable and customizable. You decide the rules when hosting your own Minecraft server for you and your friends to play together in this highly addictive game.`,
    summary: `Build, explore, and adventure in your own 3D generated world.`,
    related_guides: [
      {
        title: 'Deploy a Minecraft Server through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/minecraft/',
      },
    ],
    website: 'https://www.minecraft.net/',
    logo_url: 'minecraft.svg',
    colors: {
      start: '97948f',
      end: 'd0c8c4',
    },
  },
  {
    name: 'Mist.io',
    alt_name: 'Multicloud control panel',
    alt_description: 'Multicloud deployment management tool.',
    categories: ['Control Panels'],
    description: `Streamline infrastructure management in one UI or by using the Mist.io RESTful API.`,
    summary:
      'Open source, unified interface and management platform for multi-cloud deployments',
    related_guides: [
      {
        title: 'Deploy Mist.io through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/mistio/',
      },
    ],
    website: 'https://mist.io/',
    logo_url: 'mistio.svg',
    colors: {
      start: '424242',
      end: '0099cb',
    },
  },
  {
    name: 'MongoDB',
    alt_name: 'NoSQL database',
    alt_description: 'Popular document database.',
    categories: ['Databases'],
    cluster_name: 'MongoDB Cluster',
    description: `MongoDB provides an alternative to traditional relational database management systems (RDBMS). In addition to its schema-free design and scalable architecture, MongoDB provides JSON output and specialized language-specific bindings that make it particularly attractive for use in custom application development and rapid prototyping.`,
    summary: `MongoDB is a database engine that provides access to non-relational, document-oriented databases.`,
    related_guides: [
      {
        title: 'Deploy MongoDB with Marketplace Apps',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/mongodb/',
      },
    ],
    cluster_guides: [
      {
        title: 'Deploy MongoDB Cluster with Marketplace Apps',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/mongodb-cluster/',
      },
    ],
    website: 'https://www.mongodb.com/',
    logo_url: 'mongodb.svg',
    colors: {
      start: '28aa52',
      end: '136149',
    },
  },
  {
    name: 'Moodle',
    alt_name: 'Online course CMS',
    alt_description: 'Open source course builder and education tool.',
    categories: ['Website'],
    description: `Robust open-source learning platform enabling online education for more than 200 million users around the world. Create personalized learning environments within a secure and integrated system built for all education levels with an intuitive interface, drag-and-drop features, and accessible documentation.`,
    summary:
      'World’s most popular learning management system built and maintained by an active developer community.',
    related_guides: [
      {
        title: 'Deploy Moodle through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/moodle/',
      },
    ],
    website: 'https://docs.moodle.org/',
    logo_url: 'moodle.svg',
    colors: {
      start: 'ff7800',
      end: '494949',
    },
  },
  {
    name: 'MySQL/MariaDB',
    alt_name: 'SQL database',
    alt_description: 'SQL database.',
    categories: ['Databases'],
    description: `MySQL, or MariaDB for Linux distributions, is primarily used for web and server applications, including as a component of the industry-standard LAMP and LEMP stacks.`,
    summary: `World's most popular open source database.`,
    related_guides: [
      {
        title: 'Deploy MySQL/MariaDB through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/mysql/',
      },
    ],
    website: 'https://www.mysql.com/',
    logo_url: 'mysql.svg',
    colors: {
      start: '1d758f',
      end: '8a9177',
    },
  },
  {
    name: 'Nextcloud',
    alt_name: 'File storage management & business tool suite',
    alt_description:
      'File storage alternative to Dropbox and office suite alternative to Microsoft Office.',
    categories: ['Productivity'],
    description: `Nextcloud AIO stands for Nextcloud All In One, and provides easy deployment and maintenance for popular Nextcloud tools. AIO includes Nextcloud, Nextcloud Office, OnlyOffice, and high-performance backend features.`,
    summary: `A safe home for all your data.`,
    related_guides: [
      {
        title: 'Deploy Nextcloud through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/nextcloud/',
      },
    ],
    logo_url: 'nextcloud.svg',
    colors: {
      start: '16a5f3',
      end: '2a2a36',
    },
  },
  {
    name: 'NirvaShare',
    alt_name: 'File sharing',
    alt_description:
      'File storage and sharing alternative to Dropbox and Google Drive.',
    categories: ['Productivity'],
    description: `Securely share and collaborate Linode S3 object storage files/folders with your internal or external users such as customers, partners, vendors, etc with fine access control and a simple interface. Nirvashare easily integrates with many external identity providers such as Active Directory, GSuite, AWS SSO, KeyClock, etc.`,
    summary:
      'Secure file sharing for better collaboration with employees, partners, vendors, and more.',
    related_guides: [
      {
        title: 'Deploy NirvaShare through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/nirvashare/',
      },
    ],
    website: 'https://nirvashare.com/setup-guide/',
    logo_url: 'nirvashare.svg',
    colors: {
      start: '1f4c8f',
      end: '252730',
    },
  },
  {
    name: 'NodeJS',
    alt_name: 'JavaScript environment',
    alt_description:
      'Versatile cross-platform JavaScript run-time (runtime) environment.',
    categories: ['Development'],
    description: `NodeJS is a free, open-source, and cross-platform JavaScript run-time environment that lets developers write command line tools and server-side scripts outside of a browser.`,
    summary:
      'Popular and versatile open source JavaScript run-time environment.',
    related_guides: [
      {
        title: 'Deploy NodeJS through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/nodejs/',
      },
    ],
    website: 'https://nodejs.org/',
    logo_url: 'nodejs.svg',
    colors: {
      start: '3d853c',
      end: '333333',
    },
  },
  {
    name: 'Odoo',
    alt_name: 'Marketing tool suite',
    alt_description:
      'Open source marketing and business platform with a CRM and email marketing.',
    categories: ['Productivity'],
    description: `Odoo is a free and comprehensive business app suite of tools that seamlessly integrate. Choose what you need to manage your business on a single platform, including a CRM, email marketing tools, essential project management functions, and more.`,
    summary:
      'Open source, all-in-one business app suite with more than 7 million users.',
    related_guides: [
      {
        title: 'Deploy Odoo through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/odoo/',
      },
    ],
    website: 'https://www.odoo.com/',
    logo_url: 'odoo.svg',
    colors: {
      start: '55354c',
      end: '027e84',
    },
  },
  {
    name: 'ONLYOFFICE Docs',
    alt_name: 'Office Docs',
    alt_description: 'Office Suite',
    categories: ['Productivity'],
    description: `Create and collaborate on text documents, spreadsheets, and presentations compatible with popular file types including .docx, .xlsx, and more. Additional features include real-time editing, paragraph locking while co-editing, and version history.`,
    summary: 'Open source comprehensive office suite.',
    related_guides: [
      {
        title: 'Deploy ONLYOFFICE Docs through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/onlyoffice/',
      },
    ],
    website: 'https://www.onlyoffice.com/',
    logo_url: 'onlyoffice.svg',
    colors: {
      start: 'ffa85b',
      end: 'ff6f3d',
    },
  },
  {
    name: 'OpenLiteSpeed Django',
    alt_name: 'Python framework',
    alt_description: 'Fast Python development with best practices.',
    categories: ['Development'],
    description: `Simple deployment for OLS web server, Python LSAPI, and CertBot.`,
    summary: 'OLS web server with Django development framework.',
    related_guides: [
      {
        title: 'Deploy OpenLiteSpeed Django through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/openlitespeed-django/',
      },
    ],
    website: 'https://docs.litespeedtech.com/cloud/images/django/',
    logo_url: 'openlitespeeddjango.svg',
    colors: {
      start: '318640',
      end: '5cbf8a',
    },
  },
  {
    name: 'OpenLiteSpeed NodeJS',
    alt_name: 'JavaScript environment',
    alt_description:
      'Versatile cross-platform JavaScript run-time (runtime) environment.',
    categories: ['Development'],
    description: `High-performance open source web server with Node and CertBot, in addition to features like HTTP/3 support and easy SSL setup.`,
    summary: 'OLS web server with NodeJS JavaScript runtime environment.',
    related_guides: [
      {
        title: 'Deploy OpenLiteSpeed Node.js through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/openlitespeed-nodejs/',
      },
    ],
    website: 'https://docs.litespeedtech.com/cloud/images/nodejs/',
    logo_url: 'openlitespeednodejs.svg',
    colors: {
      start: '3d596d',
      end: '33cccc',
    },
  },
  {
    name: 'OpenLiteSpeed Rails',
    alt_name: 'Ruby web application framework.',
    alt_description: 'Ruby web application framework with development tools.',
    categories: ['Development'],
    description: `Easy setup to run Ruby apps in the cloud and take advantage of OpenLiteSpeed server features like SSL, HTTP/3 support, and RewriteRules.`,
    summary: 'OLS web server with Ruby and CertBot.',
    related_guides: [
      {
        title: 'Deploy OpenLiteSpeed Rails through the Linode Marketplace ',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/openlitespeed-rails/',
      },
    ],
    website: 'https://docs.litespeedtech.com/cloud/images/rails/',
    logo_url: 'openlitespeedrails.svg',
    colors: {
      start: '8e1a4a',
      end: 'd94b7a',
    },
  },
  {
    name: 'OpenLiteSpeed WordPress',
    alt_name: 'CMS: content management system',
    alt_description: 'Popular website content management system.',
    categories: ['Website'],
    description: `Accelerated and scalable hosting for WordPress. Includes OpenLiteSpeed, PHP, MySQL Server, WordPress, and LiteSpeed Cache.`,
    summary: 'Blazing fast, open source alternative to LiteSpeed Web Server',
    related_guides: [
      {
        title: 'Deploy OpenLiteSpeed Wordpress through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/openlitespeed-wordpress/',
      },
    ],
    website: 'https://openlitespeed.org/',
    logo_url: 'openlitespeedwordpress.svg',
    colors: {
      start: '33cccc',
      end: '3d596d',
    },
  },
  {
    name: 'OpenVPN',
    alt_name: 'Free VPN',
    alt_description: 'Popular virtual private network.',
    categories: ['Security'],
    description: `OpenVPN is a widely trusted, free, and open-source virtual private network application. OpenVPN creates network tunnels between groups of computers that are not on the same local network, and it uses OpenSSL to encrypt your traffic.`,
    summary: `Open-source virtual private network (VPN) application. OpenVPN securely connects your computer to your servers, or to the public Internet.`,
    related_guides: [
      {
        title: 'Deploy OpenVPN through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/openvpn/',
      },
    ],
    website: 'https://openvpn.net/',
    logo_url: 'openvpn.svg',
    colors: {
      start: 'ea7e20',
      end: '193766',
    },
  },
  {
    name: 'Owncast',
    alt_name: 'Live streaming app',
    alt_description: 'Video and audio live streaming alternative to Twitch.',
    categories: ['Media and Entertainment'],
    description: `A live streaming and chat server for use with existing popular broadcasting software.`,
    summary:
      'The standalone “Twitch in a Box” open source streaming and chat solution.',
    related_guides: [
      {
        title: 'Deploy Owncast through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/owncast/',
      },
    ],
    website: 'https://owncast.online/',
    logo_url: 'owncast.svg',
    colors: {
      start: '7871ff',
      end: '2086e1',
    },
  },
  {
    name: 'Passky',
    alt_name: 'Pass Key',
    alt_description: 'Password Manager',
    categories: ['Security'],
    description: `Self-host a password manager designed to simplify and secure your digital life. Passky is a streamlined version of paid password managers designed for everyone to use.`,
    summary: 'Simple open source password manager.',
    related_guides: [
      {
        title: 'Deploy Passky through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/passky/',
      },
    ],
    website: 'https://passky.org/',
    logo_url: 'passky.svg',
    colors: {
      start: '709cff',
      end: '3A5EFF',
    },
  },
  {
    name: 'Peppermint',
    alt_name: 'Ticket management project management tool',
    alt_description: 'Open source project management tool.',
    categories: ['Productivity'],
    description: `Open source alternative to paid ticket management solutions with essential features including a streamlined task list, project and client management, and ticket prioritization.`,
    summary: 'Simple yet scalable open source ticket management.',
    related_guides: [
      {
        title: 'Deploy Peppermint through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/peppermint/',
      },
    ],
    website: 'https://peppermint.sh/',
    logo_url: 'peppermint.svg',
    colors: {
      start: '4cff4c',
      end: '0a0a0a',
    },
  },
  {
    name: 'Percona (PMM)',
    alt_name: 'Database monitoring app',
    alt_description: 'Visual MySQL/MariaDB database monitoring.',
    categories: ['Monitoring'],
    description: `Percona Monitoring and Management (PMM) is an open source GUI for managing and monitoring the performance of your MySQL, MariaDB, PostgreSQL, and MongoDB databases. This tool helps you optimize your database’s performance, manage your database instances, and keep track of and identify security issues.`,
    summary:
      'An open source analytics and performance monitoring solution for databases with a focus on user-friendly metrics visualizations.',
    related_guides: [
      {
        title:
          'Deploy Percona Monitoring and Management (PMM) through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/percona-monitoring-management/',
      },
    ],
    website:
      'https://www.percona.com/software/database-tools/percona-monitoring-and-management',
    logo_url: 'percona.svg',
    colors: {
      start: 'c41d13',
      end: 'fcb42f',
    },
  },
  {
    name: 'phpMyAdmin',
    alt_name: 'SQL database GUI',
    alt_description:
      'Web interface for MySQL/MariaDB operations and server administration.',
    categories: ['Databases'],
    description: `Intuitive web interface for MySQL and MariaDB operations, including importing/exporting data, administering multiple servers, and global database search.`,
    summary: 'Popular free administration tool for MySQL and MariaDB',
    related_guides: [
      {
        title: 'Deploy phpMyAdmin through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/phpmyadmin/',
      },
    ],
    website: 'https://www.phpmyadmin.net/',
    logo_url: 'phpmyadmin.svg',
    colors: {
      start: 'f89d10',
      end: '6c78af',
    },
  },
  {
    name: 'Pi-hole',
    alt_name: 'Network ad blocking',
    alt_description: 'Popular DNS privacy sinkhole.',
    categories: ['Security'],
    description: `Protect your network and devices from unwanted content. Avoid ads in non-browser locations with a free, lightweight, and comprehensive privacy solution you can self-host.`,
    summary: 'Free, open source, and highly scalable DNS sinkhole.',
    related_guides: [
      {
        title: 'Deploy Pi-hole through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/pihole/',
      },
    ],
    website: 'https://pi-hole.net/',
    logo_url: 'pihole.svg',
    colors: {
      start: '96060c',
      end: 'f60d1a',
    },
  },
  {
    name: 'Plesk',
    alt_name: 'WordPress control panel',
    alt_description: 'Popular WordPress server management.',
    categories: ['Control Panels'],
    description: `Plesk is a leading WordPress and website management platform and control panel. Plesk lets you build and manage multiple websites from a single dashboard to configure web services, email, and other applications. Plesk features hundreds of extensions, plus a complete WordPress toolkit. Use the Plesk One-Click App to manage websites hosted on your Linode.`,
    summary:
      'A secure, scalable, and versatile website and WordPress management platform.',
    related_guides: [
      {
        title: 'Deploy Plesk through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/plesk/',
      },
    ],
    website: 'https://www.plesk.com/',
    logo_url: 'plesk.svg',
    colors: {
      start: '53bce6',
      end: '4b5868',
    },
  },
  {
    name: 'Plex',
    alt_name: 'Media server',
    alt_description:
      'Video / media library storage and sharing across TVs, phones, computers, and more.',
    categories: [],
    description: `Organize, stream, and share your media library with friends, in addition to free live TV in 220+ countries.`,
    summary:
      'Media server and streaming service to stay entertained across devices',
    related_guides: [
      {
        title: 'Deploy Plex Media Server through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/plex/',
      },
    ],
    website: 'https://www.plex.tv/',
    logo_url: 'plex.svg',
    colors: {
      start: 'e5a00d',
      end: '332c37',
    },
  },
  {
    name: 'PostgreSQL',
    alt_name: 'SQL database',
    alt_description: 'MySQL alternative for SQL database.',
    categories: ['Databases'],
    cluster_name: 'PostgreSQL Cluster',
    description: `PostgreSQL is a popular open source relational database system that provides many advanced configuration options that can help optimize your database’s performance in a production environment.`,
    summary: `The PostgreSQL relational database system is a powerful, scalable, and standards-compliant open-source database platform.`,
    related_guides: [
      {
        title: 'Deploy PostgreSQL through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/postgresql/',
      },
    ],
    cluster_guides: [
      {
        title: 'Deploy PostgreSQL Cluster through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/postgresql-cluster/',
      },
    ],
    website: 'https://www.postgresql.org/',
    logo_url: 'postgresql.svg',
    colors: {
      start: '326690',
      end: '254078',
    },
  },
  {
    name: 'Pritunl',
    alt_name: 'Enterprise VPN',
    alt_description: 'Virtual private network for businesses and teams.',
    categories: ['Security'],
    description: `User-friendly VPN for both individual and commercial use. Choose from three pricing plans.`,
    summary: 'Enterprise open source VPN.',
    related_guides: [
      {
        title: 'Deploy Pritunl through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/pritunl/',
      },
    ],
    website: 'https://docs.pritunl.com/docs',
    logo_url: 'pritunl.svg',
    colors: {
      start: '2e4153',
      end: '2e72d2',
    },
  },
  {
    name: 'Prometheus',
    alt_name: 'Server monitoring',
    alt_description: 'Monitoring server.',
    categories: ['Monitoring'],
    description: `Prometheus is a powerful monitoring software tool that collects metrics from configurable data points at given intervals, evaluates rule expressions, and can trigger alerts if some condition is observed.`,
    summary:
      'Gain metrics and receive alerts with this open-source monitoring tool.',
    related_guides: [
      {
        title: 'Deploy Prometheus through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/prometheus/',
      },
    ],
    website: 'https://prometheus.io/',
    logo_url: 'prometheus.svg',
    colors: {
      start: 'e6522c',
      end: 'e27c37',
    },
  },
  {
    name: 'Prometheus & Grafana',
    alt_name: 'Server monitoring and visualization',
    alt_description: 'Monitoring server.',
    categories: ['Monitoring'],
    description: `Free industry-standard monitoring tools that work better together. Prometheus is a powerful monitoring software tool that collects metrics from configurable data points at given intervals, evaluates rule expressions, and can trigger alerts if some condition is observed. Use Grafana to create visuals, monitor, store, and share metrics with your team to keep tabs on your infrastructure.`,
    summary: 'Open source metrics and monitoring for real-time insights.',
    related_guides: [
      {
        title: 'Deploy Prometheus & Grafana through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/prometheus-grafana/',
      },
    ],
    website: 'https://prometheus.io/docs/visualization/grafana/',
    logo_url: 'prometheus_grafana.svg',
    colors: {
      start: 'f9b716',
      end: 'e6522c',
    },
  },
  {
    name: 'RabbitMQ',
    alt_name: 'Message broker',
    alt_description: 'Server work queue management.',
    categories: ['Development'],
    description: `Connect and scale applications with asynchronous messaging and highly available work queues, all controlled through an intuitive management UI.`,
    summary: 'Most popular open source message broker',
    related_guides: [
      {
        title: 'Deploy RabbitMQ through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/rabbitmq/',
      },
    ],
    website: 'https://www.rabbitmq.com/',
    logo_url: 'rabbitmq.svg',
    colors: {
      start: 'a9b5af',
      end: 'ff6600',
    },
  },
  {
    name: 'Redis',
    alt_name: 'High performance database',
    alt_description: 'In-memory caching database.',
    categories: ['Databases'],
    cluster_name: 'Redis Sentinel Cluster',
    description: `Redis is an open-source, in-memory, data-structure store, with the optional ability to write and persist data to a disk, which can be used as a key-value database, cache, and message broker. Redis features built-in transactions, replication, and support for a variety of data structures such as strings, hashes, lists, sets, and others.`,
    summary:
      'Flexible, in-memory, NoSQL database service supported in many different coding languages.',
    related_guides: [
      {
        title: 'Deploy Redis through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/redis/',
      },
    ],
    cluster_guides: [
      {
        title: 'Deploy Redis Sentinel Cluster through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/redis-cluster/',
      },
    ],
    website: 'https://redis.io/',
    logo_url: 'redis.svg',
    colors: {
      start: '222222',
      end: '722b20',
    },
  },
  {
    name: 'Restyaboard',
    alt_name: 'Kanban board project management tool',
    alt_description: 'Free alternative to Trello and Asana.',
    categories: ['Productivity'],
    description: `Restyaboard is an open-source alternative to Trello, but with additional smart features like offline sync, diff /revisions, nested comments, multiple view layouts, chat, and more.`,
    summary: 'Free and open source project management tool.',
    related_guides: [
      {
        title: 'Deploy Restyaboard through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/restyaboard/',
      },
    ],
    website: 'https://restya.com',
    logo_url: 'restyaboard.svg',
    colors: {
      start: 'f47564',
      end: '555555',
    },
  },
  {
    name: 'Rocket.Chat',
    alt_name: 'Chat software',
    alt_description: 'Free alternative to Slack, Microsoft Teams, and Skype.',
    categories: ['Productivity'],
    description: `Put data privacy first with an alternative to programs like Slack and Microsoft Teams.`,
    summary: 'Feature-rich self-hosted chat and collaboration platform.',
    related_guides: [
      {
        title: 'Deploy Rocket.Chat through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/rocketchat/',
      },
    ],
    website: 'https://docs.rocket.chat/',
    logo_url: 'rocketchat.svg',
    colors: {
      start: 'f5445c',
      end: '030d1a',
    },
  },
  {
    name: 'Ruby on Rails',
    alt_name: 'Web application framework',
    alt_description: 'Ruby web application framework with development tools.',
    categories: ['Development'],
    description: `Rails is a web application development framework written in the Ruby programming language. It is designed to make programming web applications easier by giving every developer a number of common tools they need to get started. Ruby on Rails empowers you to accomplish more with less code.`,
    summary: `Ruby on Rails is a web framework that allows web designers and developers to implement dynamic, fully featured web applications. `,
    related_guides: [
      {
        title: 'Deploy Ruby on Rails through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/ruby-on-rails/',
      },
    ],
    website: 'https://rubyonrails.org/',
    logo_url: 'rubyonrails.svg',
    colors: {
      start: '722b20',
      end: 'fa9999',
    },
  },
  {
    name: 'Rust',
    alt_name: 'Survival game',
    alt_description: 'Open world survival game.',
    categories: ['Games'],
    description: `In Rust, you must work with or against other players to ensure your own survival. Players are able to steal, lie, cheat, or trick each other. Build a shelter, hunt animals for food, craft weapons and armor, and much more. Hosting your own Rust server allows you to customize settings and curate the number of players in the world.`,
    summary: `A free-for-all battle for survival in a harsh open-world environment. In Rust, you can do anything--but so can everyone else.`,
    related_guides: [
      {
        title: 'Deploy Rust through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/rust/',
      },
    ],
    website: 'https://rust.facepunch.com/',
    logo_url: 'rust.svg',
    colors: {
      start: '050508',
      end: 'cd412b',
    },
  },
  {
    name: 'Saltcorn',
    alt_name: 'Low-code application builder',
    alt_description: 'Database low-code/no-code application builder.',
    categories: ['Development'],
    description: `Build applications without writing a single line of code. Saltcorn is a free platform that allows you to build an app with an intuitive point-and-click, drag-and-drop UI.`,
    summary: 'Open source, no-code database application builder.',
    related_guides: [
      {
        title: 'Deploy Saltcorn through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/saltcorn/',
      },
    ],
    website: 'https://saltcorn.com/',
    logo_url: 'saltcorn.svg',
    colors: {
      start: '995ad9',
      end: 'ff8e42',
    },
  },
  {
    name: 'Secure Your Server',
    alt_name: 'Secure server tool',
    alt_description: 'Limited user, hardened SSH, Fail2Ban Linode server.',
    categories: ['Security'],
    description: `Save time on securing your Linode by deploying an instance pre-configured with some basic security best practices: limited user account access, hardened SSH, and Fail2Ban for SSH Login Protection.`,
    summary: `Harden your Linode before you deploy with the Secure Your Server One-Click App.`,
    related_guides: [
      {
        title: 'Securing your Server',
        href: 'https://www.linode.com/docs/guides/set-up-and-secure/',
      },
    ],
    logo_url: 'secureyourserver.svg',
    colors: {
      start: '01b058',
      end: '32363b',
    },
  },
  {
    name: 'ServerWand',
    alt_name: 'Website control panel',
    alt_description: 'Host multiple sites on a Linode.',
    categories: ['Control Panels'],
    description: `Host multiple sites on a single server while managing apps, firewall, databases, backups, system users, cron jobs, SSL and email–  all in an intuitive interface.`,
    summary:
      'Magical control panel for hosting websites and managing your servers.',
    related_guides: [
      {
        title: 'Deploy ServerWand through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/serverwand/',
      },
    ],
    website: 'https://serverwand.com/',
    logo_url: 'serverwand.svg',
    colors: {
      start: '4c3148',
      end: 'a25c57',
    },
  },
  {
    name: 'Shadowsocks',
    alt_name: 'VPN proxy',
    alt_description: 'Secure SOCKS5 web proxy with data encryption.',
    categories: ['Security'],
    description:
      'Shadowsocks is a lightweight SOCKS5 web proxy tool. A full setup requires a Linode server to host the Shadowsocks daemon, and a client installed on PC, Mac, Linux, or a mobile device. Unlike other proxy software, Shadowsocks traffic is designed to be both indiscernible from other traffic to third-party monitoring tools, and also able to disguise itself as a normal direct connection. Data passing through Shadowsocks is encrypted for additional security and privacy.',
    summary:
      'A secure socks5 proxy, designed to protect your Internet traffic.',
    related_guides: [
      {
        title: 'Deploy Shadowsocks through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/shadowsocks/',
      },
    ],
    website: 'https://shadowsocks.org/',
    logo_url: 'shadowsocks.svg',
    colors: {
      start: '227dc0',
      end: '8d8d8d',
    },
  },
  {
    name: 'Splunk',
    alt_name: 'Data management',
    alt_description: 'Data security, data observability, data automation.',
    categories: ['Development'],
    description: `Popular data-to-everything platform with advanced security, observability, and automation features for machine learning and AI.`,
    summary:
      'All-in-one database deployment, management, and monitoring system.',
    related_guides: [
      {
        title: 'Deploy Splunk through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/splunk/',
      },
    ],
    website: 'https://docs.splunk.com/Documentation/Splunk',
    logo_url: 'splunk.svg',
    colors: {
      start: 'f89f24',
      end: 'ed0181',
    },
  },
  {
    name: 'Superinsight',
    alt_name: 'SuperinsightDB',
    alt_description:
      'A simple SQL interface to store and search unstructured data.',
    categories: ['Databases'],
    description: `Superinsight provides a simple SQL interface to store and search unstructured data. Superinsight is built on top of PostgreSQL to take advantage of powerful extensions and features, plus the ability to run machine learning operations using SQL statements.`,
    summary: 'Relational database for unstructured data.',
    related_guides: [
      {
        title: 'Deploy Superinsight through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/superinsight/',
      },
    ],
    website: 'https://www.superinsight.ai/',
    logo_url: 'superinsight.svg',
    colors: {
      start: 'E6645F',
      end: 'C54349',
    },
  },
  {
    name: 'Terraria',
    alt_name: 'World building game',
    alt_description: '2D open world survival crafting game.',
    categories: ['Games'],
    description: `Terraria generates unique environments where a player begins by digging for ore, and the further they dig the more adventure they find. Multiplayer mode can be either cooperative or PvP. Hosting your own Terraria server gives you control over the world, the players, and the objectives. Your world, your rules.`,
    summary: `Adventure, collect resources, build structures, and battle enemies in this wildly creative two-dimensional sandbox game.`,
    related_guides: [
      {
        title: 'Deploy Terraria through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/terraria/',
      },
    ],
    website: 'https://terraria.org/',
    logo_url: 'terraria.svg',
    colors: {
      start: '936543',
      end: '40924a',
    },
  },
  {
    name: 'TF2',
    alt_name: 'FPS game',
    alt_description: 'Team Fortress 2, classic first person shooter game.',
    categories: ['Games'],
    description: `Team Fortress 2 is a team-based multiplayer first-person shooter. In TF2, you and your team choose from a number of hero classes and different game modes, ensuring a unique in-game experience every match.
      Setting up a personal game server puts you in control of what game modes and maps you use, as well as a variety of other settings to customize your experience.`,
    summary: `Choose from 9 unique classes in this highly original FPS. Compete against players around the world in a variety of modes such as capture the flag, king of the hill, and more.`,
    related_guides: [
      {
        title: 'Deploy a Team Fortress 2 Server through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/team-fortress-2/',
      },
    ],
    website: 'http://www.teamfortress.com/',
    logo_url: 'tf2.svg',
    colors: {
      start: 'b95b26',
      end: '873d0c',
    },
  },
  {
    name: 'UniFi Network Application',
    alt_name: 'Networking control panel',
    alt_description: 'Interface for UniFi networking devices and software.',
    categories: ['Control Panels'],
    description: `UniFi Network Application is a versatile control panel that simplifies network management across regions, customizes access to wifi networks, and more. Manage and apply updates to UniFi networking devices to ensure your networks are performant and secure.`,
    summary: `Multi-use networking control panel`,
    related_guides: [
      {
        title:
          'Deploy the UniFi Network Application through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/unifi-network-application/',
      },
    ],
    website: 'https://www.ui.com/',
    logo_url: 'unifi.svg',
    colors: {
      start: '1681FC',
      end: '63666A',
    },
  },
  {
    name: 'Uptime Kuma',
    alt_name: 'Infrastructure monitoring',
    alt_description:
      'Infrastructure monitoring and aler alternative to Uptime Robot.',
    categories: ['Monitoring'],
    description: `Uptime Kuma is self-hosted alternative to Uptime Robot. Get real-time performance insights for HTTP(s), TCP/ HTTP(s) Keyword, Ping, DNS Record, and more. Monitor everything you need in one UI dashboard, or customize how you receive alerts with a wide range of supported integrations.`,
    summary: 'Free, comprehensive, and “fancy” monitoring solution.',
    related_guides: [
      {
        title: 'Deploy Uptime Kuma through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/uptime-kuma/',
      },
    ],
    website: 'https://github.com/louislam/uptime-kuma',
    logo_url: 'uptimekuma.svg',
    colors: {
      start: '67de92',
      end: 'baecca',
    },
  },
  {
    name: 'UTunnel VPN',
    alt_name: 'VPN',
    alt_description: 'Virtual private network.',
    categories: ['Security'],
    description: `UTunnel VPN is a robust cloud-based VPN server software solution. With UTunnel VPN, businesses could easily set up secure remote access to their business network. UTunnel comes with a host of business-centric features including site-to-site connectivity, single sign-on integration, 2-factor authentication, etc.`,
    summary:
      'A powerful, user-friendly Virtual Private Network (VPN) server application that supports multiple VPN protocols.',
    related_guides: [
      {
        title: 'Deploy UTunnel VPN through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/utunnel/',
      },
    ],
    website: 'https://www.utunnel.io/linode-vpn-server.html',
    logo_url: 'utunnel.svg',
    colors: {
      start: '2ec1cf',
      end: '1a32b1',
    },
  },
  {
    name: 'Valheim',
    alt_name: 'Viking survival game',
    alt_description: 'Open world surival crafting game.',
    categories: ['Games'],
    description: `In the relatively peaceful place called Valheim, traveling farther comes with a price: more enemies and greater challenges to stay alive. Experience a punishing combat system, intense boss battles, and a complex building system to construct Viking warships and more.`,
    summary:
      'Explore, build, and conquer in the popular open-world Viking survival game.',
    related_guides: [
      {
        title: 'Deploy Valheim through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/valheim/',
      },
    ],
    website: 'https://www.valheimgame.com/',
    logo_url: 'valheim.svg',
    colors: {
      start: '081e2b',
      end: 'bb470d',
    },
  },
  {
    name: 'VictoriaMetrics Single',
    alt_name: 'Database monitoring',
    alt_description: 'Time series database and database monitoring/metrics.',
    categories: ['Databases'],
    description: `VictoriaMetrics is designed to collect, store, and process real-time metrics.`,
    summary:
      'Free and open source time series database (TSDB) and monitoring solution.',
    related_guides: [
      {
        title: 'Deploy VictoriaMetrics Single through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/victoriametrics-single/',
      },
    ],
    website: 'https://victoriametrics.com/',
    logo_url: 'victoriametricssingle.svg',
    colors: {
      start: '6a1e6e',
      end: 'af3e56',
    },
  },
  {
    name: 'Virtualmin',
    alt_name: 'Website control panel',
    alt_description: 'Domain management and website control panel.',
    categories: ['Control Panels'],
    description: `Streamline domain management, included as part of Webmin. Choose between the standard free version or upgrade to their premium service to access more features.`,
    summary: 'Domain hosting and website control panel',
    related_guides: [
      {
        title: 'Deploy Virtualmin through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/virtualmin/',
      },
    ],
    website: 'https://www.virtualmin.com/',
    logo_url: 'virtualmin.svg',
    colors: {
      start: '58cc00',
      end: '005ebd',
    },
  },
  {
    name: 'VS Code Server',
    alt_name: 'Text editor',
    alt_description: 'Fancy development text editor.',
    categories: ['Development'],
    description: `Launch a portable development environment to speed up tests, downloads, and more.`,
    summary: 'Run VS code in the cloud, right from your browser',
    related_guides: [
      {
        title: 'Deploy VS Code through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/vscode/',
      },
    ],
    website: 'https://github.com/cdr/code-server',
    logo_url: 'vscodeserver.svg',
    colors: {
      start: '23a9f2',
      end: '0066b8',
    },
  },
  {
    name: 'WarpSpeed',
    alt_name: 'WireGuard VPN',
    alt_description: 'Virtual private network.',
    categories: ['Security'],
    description: `Feature-rich, self-hosted VPN based on WireGuard® protocol, plus convenient features like single sign-on, real-time bandwidth monitoring, and unlimited users/devices.`,
    summary: 'Secure low-latency VPN powered by WireGuard® protocol.',
    related_guides: [
      {
        title: 'Deploy WarpSpeed VPN through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/warpspeed/',
      },
    ],
    website: 'https://bunker.services/products/warpspeed',
    logo_url: 'warpspeed.svg',
    colors: {
      start: '1f76b7',
      end: '333333',
    },
  },
  {
    name: 'Wazuh',
    alt_name: 'Security monitoring',
    alt_description:
      'Security analytics for intrusion attempts and user action monitoring.',
    categories: ['Security'],
    description: `Infrastructure monitoring solution to detect threats, intrusion attempts, unauthorized user actions, and provide security analytics.`,
    summary: 'Free open source security monitoring solution.',
    related_guides: [
      {
        title: 'Deploy Wazuh through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/wazuh/',
      },
    ],
    website: 'https://documentation.wazuh.com/current/index.html',
    logo_url: 'wazuh.svg',
    colors: {
      start: '00a9e5',
      end: 'ffb600',
    },
  },
  {
    name: 'Webmin',
    alt_name: 'Linux & UNIX management',
    alt_description: 'Unix management in the browser.',
    categories: ['Control Panels'],
    description: `Web interface for Unix to optimize system management, both from the console and remotely.`,
    summary: 'Unix management in your browser',
    related_guides: [
      {
        title: 'Deploy Webmin through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/webmin/',
      },
    ],
    website: 'http://www.webmin.com/',
    logo_url: 'webmin.svg',
    colors: {
      start: '6ca034',
      end: '3a70c4',
    },
  },
  {
    name: 'Webuzo',
    alt_name: 'Single user control panel',
    alt_description:
      'Control panel to deploy and manage LAMP stack applications.',
    categories: ['Control Panels'],
    description: `Lightweight control panel with a suite of features to streamline app management.`,
    summary:
      'LAMP stack and single user control panel to simplify app deployment in the cloud.',
    related_guides: [
      {
        title: 'Deploy Webuzo through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/webuzo/',
      },
    ],
    website: 'http://www.webuzo.com/',
    logo_url: 'webuzo.svg',
    colors: {
      start: 'f1b55d',
      end: '445289',
    },
  },
  {
    name: 'WireGuard&reg;',
    alt_name: 'Free VPN',
    alt_description: 'Virtual private network.',
    categories: ['Security'],
    description: `Configuring WireGuard&reg; is as simple as configuring SSH. A connection is established by an exchange of public keys between server and client, and only a client whose public key is present in the server's configuration file is considered authorized. WireGuard sets up
      standard network interfaces which behave similarly to other common network interfaces, like eth0. This makes it possible to configure and manage WireGuard interfaces using standard networking tools such as ifconfig and ip. "WireGuard" is a registered trademark of Jason A. Donenfeld.`,
    summary: `Modern VPN which utilizes state-of-the-art cryptography. It aims to be faster and leaner than other VPN protocols and has a smaller source code footprint.`,
    related_guides: [
      {
        title: 'Deploy WireGuard through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/wireguard/',
      },
    ],
    website: 'https://www.wireguard.com/',
    logo_url: 'wireguard.svg',
    colors: {
      start: '88171a',
      end: '51171a',
    },
  },
  {
    name: 'WooCommerce',
    alt_name: 'Ecommerce site',
    alt_description: 'Popular secure WordPress ecommerce online store plugin.',
    categories: ['Website'],
    description: `With WooCommerce, you can securely sell both digital and physical goods, and take payments via major credit cards, bank transfers, PayPal, and other providers like Stripe. With more than 300 extensions to choose from, WooCommerce is extremely flexible.`,
    summary: `Highly customizable, secure, open source eCommerce platform built to integrate with Wordpress.`,
    related_guides: [
      {
        title: 'Deploy WooCommerce through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/woocommerce/',
      },
    ],
    website: 'https://woocommerce.com/features/',
    logo_url: 'woocommerce.svg',
    colors: {
      start: '96588a',
      end: '743b8a',
    },
  },
  {
    name: 'WordPress',
    alt_name: 'CMS: content management system',
    alt_description: 'Popular website content management system.',
    categories: ['Website'],
    description: `With 60 million users around the globe, WordPress is the industry standard for custom websites such as blogs, news sites, personal websites, and anything in-between. With a focus on best in class usability and flexibility, you can have a customized website up and running in minutes.`,
    summary:
      'Flexible, open source content management system (CMS) for content-focused websites of any kind.',
    related_guides: [
      {
        title: 'Deploy WordPress through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/wordpress/',
      },
    ],
    website: 'https://wordpress.org/',
    logo_url: 'wordpress.svg',
    colors: {
      start: '176086',
      end: '135478',
    },
  },
  {
    name: 'Yacht',
    alt_name: 'Docker GUI',
    alt_description: 'Web interface for managing Docker containers.',
    categories: ['Development'],
    description: `Simplify Docker deployments and make containerization easy for anyone to use. Please note: Yacht is still in alpha and is not recommended for production use.`,
    summary: 'Intuitive web interface for managing Docker containers.',
    related_guides: [
      {
        title: 'Deploy Yacht through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/yacht/',
      },
    ],
    website: 'https://github.com/SelfhostedPro/Yacht/',
    logo_url: 'yacht.svg',
    colors: {
      start: '41b883',
      end: 'c4c4c4',
    },
  },
  {
    name: 'Zabbix',
    alt_name: 'Infrastructure monitoring',
    alt_description: 'Enterprise infrastructure and IT resource montioring.',
    categories: ['Monitoring'],
    description: `Monitor, track performance and maintain availability for network servers, devices, services and other IT resources– all in one tool.`,
    summary: 'Enterprise-class open source distributed monitoring solution.',
    related_guides: [
      {
        title: 'Deploy Zabbix through the Linode Marketplace',
        href:
          'https://www.linode.com/docs/products/tools/marketplace/guides/zabbix/',
      },
    ],
    website: 'https://www.zabbix.com',
    logo_url: 'zabbix.svg',
    colors: {
      start: 'd40000',
      end: '252730',
    },
  },
];
