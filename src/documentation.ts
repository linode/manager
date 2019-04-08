/**
 * The docs in this file are intended for reuse throughout the app by means of the setDocs function.
 * In a component that will use the Docs sidebar, import as many of the objects below as needed, then
 * pass them as an array to the setDocs method. The usual pattern is:
 *
 * import { Domains } from 'src/documentation';
 *
 * ...
 *
 * static docs = [ Domains ]
 *
 * compose(
 *  ...
 *  setDocs(Domains.docs)
 * )
 */

export const Domains: Linode.Doc = {
  title: 'DNS Manager',
  body:
    'The Domains section of the Linode Manager is a comprehensive DNS management interface that allows you to add DNS records for all of your domain names. This guide covers the use of the Domains section and basic domain zone setup. For an introduction to DNS in general, see our Introduction to DNS Records guide.',
  src: 'https://linode.com/docs/platform/manager/dns-manager-new-manager/'
};

export const SecurityControls: Linode.Doc = {
  title: 'Linode Manager Security Controls',
  body:
    'The Linode Manager is the gateway to all of your Linode products and services, and you should take steps to protect it from unauthorized access. This guide documents several of Linode Manager’s features that can help mitigate your risk. Whether you’re worried about malicious users gaining access to your username and password, or authorized users abusing their access privileges, Linode Manager’s built-in security tools can help.',
  src:
    'https://linode.com/docs/security/linode-manager-security-controls-new-manager/'
};

export const BillingAndPayments: Linode.Doc = {
  title: 'Billing and Payments',
  body:
    'We’ve done our best to create straightforward billing and payment policies. Still have questions? Use this guide to learn how our hourly billing works and how to make payments, update your billing information, get referral credits, and remove services. If you have a question that isn’t answered here, please feel free to contact support.',
  src:
    'https://linode.com/docs/platform/billing-and-support/billing-and-payments-new-manager/'
};

export const AccountsAndPasswords: Linode.Doc = {
  title: 'Accounts and Passwords',
  body:
    'Maintaining your user Linode Manager accounts, passwords, and contact information is just as important as administering your Linode. This guide shows you how to control access to the Linode Manager, update your contact information, and modify account passwords. Note that the information in this guide applies to the Linode Manager only, except for the section on resetting the root password.',
  src:
    'https://linode.com/docs/platform/manager/accounts-and-passwords-new-manager/'
};

export const Images: Linode.Doc = {
  title: 'Linode Images',
  body:
    'Linode Images allows you to take snapshots of your disks, and then deploy them to any Linode under your account. This can be useful for bootstrapping a master image for a large deployment, or retaining a disk for a configuration that you may not need running, but wish to return to in the future. Linode Images will be retained whether or not you have an active Linode on your account, which also makes them useful for long term storage of a private template that you may need in the future. There is no additional charge to store Images for Linode users, with a limit of 2GB per Image and 3 Images per account.',
  src: 'https://linode.com/docs/platform/disk-images/linode-images-new-manager/'
};

export const StackScripts: Linode.Doc = {
  title: 'Automate Deployment with StackScripts',
  body:
    'StackScripts provide Linode users with the ability to automate the deployment of custom systems on top of our default Linux distribution images. Linodes deployed with a StackScript run the script as part of the first boot process. This guide explains how StackScripts work, and offer several examples of how to use them.',
  src: 'https://linode.com/docs/platform/stackscripts-new-manager/'
};

export const BlockStorage: Linode.Doc = {
  title: 'How to Use Block Storage with Your Linode',
  body:
    'Linode’s Block Storage service allows you to attach additional storage volumes to your Linode. A single volume can range from 10 GiB to 10,000 GiB in size and costs $0.10/GiB per month. They can be partitioned however you like and can accommodate any filesystem type you choose. Up to eight volumes can be attached to a single Linode, be it new or already existing, so you do not need to recreate your server to add a Block Storage Volume.',
  src:
    'https://linode.com/docs/platform/block-storage/how-to-use-block-storage-with-your-linode-new-manager/'
};

export const MonitoringYourServer: Linode.Doc = {
  title: 'Monitoring and Maintaining Your Server',
  body:
    'Now that your Linode is up and running, it’s time to think about monitoring and maintaining your server. This guide introduces the essential tools and skills you’ll need to keep your server up to date and minimize downtime. You’ll learn how to monitor the availability and performance of your system, manage your logs, and update your server’s software.',
  src:
    'https://linode.com/docs/uptime/monitoring-and-maintaining-your-server-new-manager/'
};

export const NodeBalancerReference: Linode.Doc = {
  title: 'NodeBalancer Reference Guide',
  body:
    'This is the NodeBalancer reference guide. Please see the NodeBalancer Getting Started Guide for practical examples.',
  src:
    'https://linode.com/docs/platform/nodebalancer/nodebalancer-reference-guide-new-manager/'
};

export const NodeBalancerGettingStarted: Linode.Doc = {
  title: 'Getting Started with NodeBalancers',
  body:
    'Nearly all applications that are built using Linodes can benefit from load balancing, and load balancing itself is the key to expanding an application to larger numbers of users. Linode now provides NodeBalancers, which can ease the deployment and administration of a load balancer.',
  src:
    'https://linode.com/docs/platform/nodebalancer/getting-started-with-nodebalancers-new-manager/'
};

export const LinodeAPI: Linode.Doc = {
  title: 'Getting Started with the Linode API',
  body:
    'The Linode API allows you to automate any task that can be performed by the Linode Manager, such as creating Linodes, managing IP addresses and DNS, and opening support tickets.',
  src:
    'https://linode.com/docs/platform/api/getting-started-with-the-linode-api-new-manager/'
};

export const LISH: Linode.Doc = {
  title: 'Using the Linode Shell (Lish)',
  src: 'https://www.linode.com/docs/networking/using-the-linode-shell-lish/',
  body: 'Learn how to use Lish as a shell for managing or rescuing your Linode.'
};

export const LinodeGettingStarted: Linode.Doc = {
  title: 'Getting Started with Linode',
  src: 'https://linode.com/docs/getting-started-new-manager/',
  body: `This guide will help you set up your first Linode.`
};

export const SecuringYourServer: Linode.Doc = {
  title: 'How to Secure your Server',
  src: 'https://linode.com/docs/security/securing-your-server/',
  body: `This guide covers basic best practices for securing a production server,
  including setting up user accounts, configuring a firewall, securing SSH,
  and disabling unused network services.`
};

export const AppsDocs: Linode.Doc[] = [
  {
    title: 'Deploy Wordpress with One-Click Apps',
    src:
      'https://linode.com/docs/platform/one-click/deploying-wordpress-with-one-click-apps/',
    body: 'Create Custom Instances and Automate Deployment with StackScripts.'
  },
  {
    title: 'Deploy Drupal with One-Click Apps',
    src:
      'https://linode.com/docs/platform/one-click/deploying-drupal-with-one-click-apps/',
    body: 'Create Custom Instances and Automate Deployment with StackScripts.'
  },
  {
    title: 'Deploy WooCommerce with One-Click Apps',
    src: 'https://linode.com/docs/platform/one-click/one-click-woocommerce/',
    body: 'Create Custom Instances and Automate Deployment with StackScripts.'
  },
  {
    title: 'Deploy Gitlab with One-Click Apps',
    src:
      'https://linode.com/docs/platform/one-click/deploy-gitlab-with-one-click-apps/',
    body: 'Create Custom Instances and Automate Deployment with StackScripts.'
  },
  {
    title: 'Deploy LAMP with One-Click Apps',
    src:
      'https://linode.com/docs/platform/one-click/deploy-lamp-stack-with-one-click-apps/',
    body: 'Create Custom Instances and Automate Deployment with StackScripts.'
  },
  {
    title: 'Deploy MERN with One-Click Apps',
    src:
      'https://linode.com/docs/platform/one-click/deploy-mern-with-one-click-apps/',
    body: 'Create Custom Instances and Automate Deployment with StackScripts.'
  },
  {
    title: 'Deploy OpenVPN with One-Click Apps',
    src: 'https://linode.com/docs/platform/one-click/one-click-openvpn/',
    body: 'Create Custom Instances and Automate Deployment with StackScripts.'
  },
  {
    title: 'Deploy WireGuard with One-Click Apps',
    src:
      'https://linode.com/docs/platform/one-click/deploy-wireguard-with-one-click-apps/',
    body: 'Create Custom Instances and Automate Deployment with StackScripts.'
  },
  {
    title: 'Deploy Minecraft with One-Click Apps',
    src:
      'https://linode.com/docs/platform/one-click/deploying-minecraft-with-one-click-apps/',
    body: 'Create Custom Instances and Automate Deployment with StackScripts.'
  },
  {
    title: 'Deploy Counter-Strike: Global Offensive with One-Click Apps',
    src:
      'https://linode.com/docs/platform/one-click/deploying-cs-go-with-one-click-apps/',
    body: 'Create Custom Instances and Automate Deployment with StackScripts.'
  },
  {
    title: 'Deploy Team Fortress 2 with One-Click Apps',
    src:
      'https://linode.com/docs/platform/one-click/deploying-team-fortress-2-with-one-click-apps/',
    body: 'Create Custom Instances and Automate Deployment with StackScripts.'
  },
  {
    title: 'Deploy Ark with One-Click Apps',
    src:
      'https://linode.com/docs/platform/one-click/deploying-ark-survival-evolved-with-one-click-apps/',
    body: 'Create Custom Instances and Automate Deployment with StackScripts.'
  },
  {
    title: 'Deploy Rust with One-Click Apps',
    src:
      'https://linode.com/docs/platform/one-click/deploying-rust-with-one-click-apps/',
    body: 'Create Custom Instances and Automate Deployment with StackScripts.'
  },
  {
    title: 'Deploy Terraria with One-Click Apps',
    src:
      'https://linode.com/docs/platform/one-click/deploying-terraria-with-one-click-apps/',
    body: 'Create Custom Instances and Automate Deployment with StackScripts.'
  }
];
