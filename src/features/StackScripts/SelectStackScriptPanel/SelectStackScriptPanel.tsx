import * as React from 'react';
import { withStyles, StyleRulesCallback, Theme, WithStyles } from 'material-ui';

import TabbedPanel from 'src/components/TabbedPanel';

import StackScriptsSection from './StackScriptsSection';

export interface ExtendedLinode extends Linode.Linode {
  heading: string;
  subHeadings: string[];
}
/* tslint:disable */
const data = [
  {
    deployments_total: 37,
    is_public: true,
    description: `Does nothing on its own.  Do not deploy directly.\r\n\r\nA collection of useful bash functions to be included in other bash StackScripts with a "source <ssinclude StackScriptID=1>" line.`,
    label: 'StackScript Bash Library',
    images: [
      'Arch',
      'CentOS 7',
      'Debian 8',
      'Fedora 25',
      'Gentoo',
      'OepnSUSELeap 42.2',
      'Slackware 14.2',
      'Ubuntu 16.04LTS',
      'Ubuntu 16.10',
      'Ubuntu 17.04',
      'CentOS 6.8',
      'Debian 7',
      'lFedora 25',
      'Slackware 13.37',
      'Slackware 14.1',
      'Ubuntu 14.04 LTS',
    ],
    deployments_active: 27,
    rev_note: 'Fix debconf to use metapackage',
    created: '2009-12-17T17:06:35',
    user_gravatar_id: 'ead4da00f4fe6a4bd0b4f11a510c031d',
    id: 1,
    script: '#!/bin/bash\n#\n# StackScript Bash Library\n#\n# Copyright (c) 2010 Linode LLC / Christopher S. Aker <caker@linode.com>\n# All rights reserved.\n#\n# Redistribution and use in source and binary forms, with or without modification, \n# are permitted provided that the following conditions are met:\n#\n# * Redistributions of source code must retain the above copyright notice, this\n# list of conditions and the following disclaimer.\n#\n# * Redistributions in binary form must reproduce the above copyright notice, this\n# list of conditions and the following disclaimer in the documentation and/or\n# other materials provided with the distribution.\n#\n# * Neither the name of Linode LLC nor the names of its contributors may be\n# used to endorse or promote products derived from this software without specific prior\n# written permission.\n#\n# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY\n# EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES\n# OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT\n# SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,\n# INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED\n# TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR\n# BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN\n# CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN\n# ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH\n# DAMAGE.\n\n###########################################################\n# System\n###########################################################\n\nfunction system_update {\n\tapt-get update\n\tapt-get -y install aptitude\n\taptitude -y full-upgrade\n}\n\nfunction system_primary_ip {\n\t# returns the primary IP assigned to eth0\n\techo $(ifconfig eth0 | awk -F: \'/inet addr:/ {print $2}\' | awk \'{ print $1 }\')\n}\n\nfunction get_rdns {\n\t# calls host on an IP address and returns its reverse dns\n\n\tif [ ! -e /usr/bin/host ]; then\n\t\taptitude -y install dnsutils > /dev/null\n\tfi\n\techo $(host $1 | awk \'/pointer/ {print $5}\' | sed \'s/\\.$//\')\n}\n\nfunction get_rdns_primary_ip {\n\t# returns the reverse dns of the primary IP assigned to this system\n\techo $(get_rdns $(system_primary_ip))\n}\n\nfunction system_set_hostname {\n\t# $1 - The hostname to define\n\tHOSTNAME="$1"\n\t\t\n\tif [ ! -n "$HOSTNAME" ]; then\n\t\techo "Hostname undefined"\n\t\treturn 1;\n\tfi\n\t\n\techo "$HOSTNAME" > /etc/hostname\n\thostname -F /etc/hostname\n}\n\nfunction system_add_host_entry {\n\t# $1 - The IP address to set a hosts entry for\n\t# $2 - The FQDN to set to the IP\n\tIPADDR="$1"\n\tFQDN="$2"\n\n\tif [ -z "$IPADDR" -o -z "$FQDN" ]; then\n\t\techo "IP address and/or FQDN Undefined"\n\t\treturn 1;\n\tfi\n\t\n\techo $IPADDR $FQDN  >> /etc/hosts\n}\n\n\n###########################################################\n# Users and Authentication\n###########################################################\n\nfunction user_add_sudo {\n\t# Installs sudo if needed and creates a user in the sudo group.\n\t#\n\t# $1 - Required - username\n\t# $2 - Required - password\n\tUSERNAME="$1"\n\tUSERPASS="$2"\n\n\tif [ ! -n "$USERNAME" ] || [ ! -n "$USERPASS" ]; then\n\t\techo "No new username and/or password entered"\n\t\treturn 1;\n\tfi\n\t\n\taptitude -y install sudo\n\tadduser $USERNAME --disabled-password --gecos ""\n\techo "$USERNAME:$USERPASS" | chpasswd\n\tusermod -aG sudo $USERNAME\n}\n\nfunction user_add_pubkey {\n\t# Adds the users public key to authorized_keys for the specified user. Make sure you wrap your input variables in double quotes, or the key may not load properly.\n\t#\n\t#\n\t# $1 - Required - username\n\t# $2 - Required - public key\n\tUSERNAME="$1"\n\tUSERPUBKEY="$2"\n\t\n\tif [ ! -n "$USERNAME" ] || [ ! -n "$USERPUBKEY" ]; then\n\t\techo "Must provide a username and the location of a pubkey"\n\t \treturn 1;\n\tfi\n\t\n\tif [ "$USERNAME" == "root" ]; then\n\t\tmkdir /root/.ssh\n\t\techo "$USERPUBKEY" >> /root/.ssh/authorized_keys\n\t\treturn 1;\n\tfi\n\t\n\tmkdir -p /home/$USERNAME/.ssh\n\techo "$USERPUBKEY" >> /home/$USERNAME/.ssh/authorized_keys\n\tchown -R "$USERNAME":"$USERNAME" /home/$USERNAME/.ssh\n}\n\nfunction ssh_disable_root {\n\t# Disables root SSH access.\n\tsed -i \'s/PermitRootLogin yes/PermitRootLogin no/\' /etc/ssh/sshd_config\n\ttouch /tmp/restart-ssh\n\t\n}\n\n###########################################################\n# Postfix\n###########################################################\n\nfunction postfix_install_loopback_only {\n\t# Installs postfix and configure to listen only on the local interface. Also\n\t# allows for local mail delivery\n\n\techo "postfix postfix/main_mailer_type select Internet Site" | debconf-set-selections\n\techo "postfix postfix/mailname string localhost" | debconf-set-selections\n\techo "postfix postfix/destinations string localhost.localdomain, localhost" | debconf-set-selections\n\taptitude -y install postfix\n\t/usr/sbin/postconf -e "inet_interfaces = loopback-only"\n\t#/usr/sbin/postconf -e "local_transport = error:local delivery is disabled"\n\n\ttouch /tmp/restart-postfix\n}\n\n\n###########################################################\n# Apache\n###########################################################\n\nfunction apache_install {\n\t# installs the system default apache2 MPM\n\taptitude -y install apache2\n\n\ta2dissite default # disable the interfering default virtualhost\n\n\t# clean up, or add the NameVirtualHost line to ports.conf\n\tsed -i -e \'s/^NameVirtualHost \\*$/NameVirtualHost *:80/\' /etc/apache2/ports.conf\n\tif ! grep -q NameVirtualHost /etc/apache2/ports.conf; then\n\t\techo \'NameVirtualHost *:80\' > /etc/apache2/ports.conf.tmp\n\t\tcat /etc/apache2/ports.conf >> /etc/apache2/ports.conf.tmp\n\t\tmv -f /etc/apache2/ports.conf.tmp /etc/apache2/ports.conf\n\tfi\n}\n\nfunction apache_tune {\n\t# Tunes Apache\'s memory to use the percentage of RAM you specify, defaulting to 40%\n\n\t# $1 - the percent of system memory to allocate towards Apache\n\n\tif [ ! -n "$1" ];\n\t\tthen PERCENT=40\n\t\telse PERCENT="$1"\n\tfi\n\n\taptitude -y install apache2-mpm-prefork\n\tPERPROCMEM=10 # the amount of memory in MB each apache process is likely to utilize\n\tMEM=$(grep MemTotal /proc/meminfo | awk \'{ print int($2/1024) }\') # how much memory in MB this system has\n\tMAXCLIENTS=$((MEM*PERCENT/100/PERPROCMEM)) # calculate MaxClients\n\tMAXCLIENTS=${MAXCLIENTS/.*} # cast to an integer\n\tsed -i -e "s/\\(^[ \\t]*MaxClients[ \\t]*\\)[0-9]*/\\1$MAXCLIENTS/" /etc/apache2/apache2.conf\n\n\ttouch /tmp/restart-apache2\n}\n\nfunction apache_virtualhost {\n\t# Configures a VirtualHost\n\n\t# $1 - required - the hostname of the virtualhost to create \n\n\tif [ ! -n "$1" ]; then\n\t\techo "apache_virtualhost() requires the hostname as the first argument"\n\t\treturn 1;\n\tfi\n\n\tif [ -e "/etc/apache2/sites-available/$1" ]; then\n\t\techo /etc/apache2/sites-available/$1 already exists\n\t\treturn;\n\tfi\n\n\tmkdir -p /srv/www/$1/public_html /srv/www/$1/logs\n\n\techo "<VirtualHost *:80>" > /etc/apache2/sites-available/$1\n\techo "    ServerName $1" >> /etc/apache2/sites-available/$1\n\techo "    DocumentRoot /srv/www/$1/public_html/" >> /etc/apache2/sites-available/$1\n\techo "    ErrorLog /srv/www/$1/logs/error.log" >> /etc/apache2/sites-available/$1\n    echo "    CustomLog /srv/www/$1/logs/access.log combined" >> /etc/apache2/sites-available/$1\n\techo "</VirtualHost>" >> /etc/apache2/sites-available/$1\n\n\ta2ensite $1\n\n\ttouch /tmp/restart-apache2\n}\n\nfunction apache_virtualhost_from_rdns {\n\t# Configures a VirtualHost using the rdns of the first IP as the ServerName\n\n\tapache_virtualhost $(get_rdns_primary_ip)\n}\n\n\nfunction apache_virtualhost_get_docroot {\n\tif [ ! -n "$1" ]; then\n\t\techo "apache_virtualhost_get_docroot() requires the hostname as the first argument"\n\t\treturn 1;\n\tfi\n\n\tif [ -e /etc/apache2/sites-available/$1 ];\n\t\tthen echo $(awk \'/DocumentRoot/ {print $2}\' /etc/apache2/sites-available/$1 )\n\tfi\n}\n\n###########################################################\n# mysql-server\n###########################################################\n\nfunction mysql_install {\n\t# $1 - the mysql root password\n\n\tif [ ! -n "$1" ]; then\n\t\techo "mysql_install() requires the root pass as its first argument"\n\t\treturn 1;\n\tfi\n\n\techo "mysql-server mysql-server/root_password password $1" | debconf-set-selections\n\techo "mysql-server mysql-server/root_password_again password $1" | debconf-set-selections\n\tapt-get -y install mysql-server mysql-client\n\n\techo "Sleeping while MySQL starts up for the first time..."\n\tsleep 5\n}\n\nfunction mysql_tune {\n\t# Tunes MySQL\'s memory usage to utilize the percentage of memory you specify, defaulting to 40%\n\n\t# $1 - the percent of system memory to allocate towards MySQL\n\n\tif [ ! -n "$1" ];\n\t\tthen PERCENT=40\n\t\telse PERCENT="$1"\n\tfi\n\n\tsed -i -e \'s/^#skip-innodb/skip-innodb/\' /etc/mysql/my.cnf # disable innodb - saves about 100M\n\n\tMEM=$(awk \'/MemTotal/ {print int($2/1024)}\' /proc/meminfo) # how much memory in MB this system has\n\tMYMEM=$((MEM*PERCENT/100)) # how much memory we\'d like to tune mysql with\n\tMYMEMCHUNKS=$((MYMEM/4)) # how many 4MB chunks we have to play with\n\n\t# mysql config options we want to set to the percentages in the second list, respectively\n\tOPTLIST=(key_buffer sort_buffer_size read_buffer_size read_rnd_buffer_size myisam_sort_buffer_size query_cache_size)\n\tDISTLIST=(75 1 1 1 5 15)\n\n\tfor opt in ${OPTLIST[@]}; do\n\t\tsed -i -e "/\\[mysqld\\]/,/\\[.*\\]/s/^$opt/#$opt/" /etc/mysql/my.cnf\n\tdone\n\n\tfor i in ${!OPTLIST[*]}; do\n\t\tval=$(echo | awk "{print int((${DISTLIST[$i]} * $MYMEMCHUNKS/100))*4}")\n\t\tif [ $val -lt 4 ]\n\t\t\tthen val=4\n\t\tfi\n\t\tconfig="${config}\\n${OPTLIST[$i]} = ${val}M"\n\tdone\n\n\tsed -i -e "s/\\(\\[mysqld\\]\\)/\\1\\n$config\\n/" /etc/mysql/my.cnf\n\n\ttouch /tmp/restart-mysql\n}\n\nfunction mysql_create_database {\n\t# $1 - the mysql root password\n\t# $2 - the db name to create\n\n\tif [ ! -n "$1" ]; then\n\t\techo "mysql_create_database() requires the root pass as its first argument"\n\t\treturn 1;\n\tfi\n\tif [ ! -n "$2" ]; then\n\t\techo "mysql_create_database() requires the name of the database as the second argument"\n\t\treturn 1;\n\tfi\n\n\techo "CREATE DATABASE $2;" | mysql -u root -p$1\n}\n\nfunction mysql_create_user {\n\t# $1 - the mysql root password\n\t# $2 - the user to create\n\t# $3 - their password\n\n\tif [ ! -n "$1" ]; then\n\t\techo "mysql_create_user() requires the root pass as its first argument"\n\t\treturn 1;\n\tfi\n\tif [ ! -n "$2" ]; then\n\t\techo "mysql_create_user() requires username as the second argument"\n\t\treturn 1;\n\tfi\n\tif [ ! -n "$3" ]; then\n\t\techo "mysql_create_user() requires a password as the third argument"\n\t\treturn 1;\n\tfi\n\n\techo "CREATE USER \'$2\'@\'localhost\' IDENTIFIED BY \'$3\';" | mysql -u root -p$1\n}\n\nfunction mysql_grant_user {\n\t# $1 - the mysql root password\n\t# $2 - the user to bestow privileges \n\t# $3 - the database\n\n\tif [ ! -n "$1" ]; then\n\t\techo "mysql_create_user() requires the root pass as its first argument"\n\t\treturn 1;\n\tfi\n\tif [ ! -n "$2" ]; then\n\t\techo "mysql_create_user() requires username as the second argument"\n\t\treturn 1;\n\tfi\n\tif [ ! -n "$3" ]; then\n\t\techo "mysql_create_user() requires a database as the third argument"\n\t\treturn 1;\n\tfi\n\n\techo "GRANT ALL PRIVILEGES ON $3.* TO \'$2\'@\'localhost\';" | mysql -u root -p$1\n\techo "FLUSH PRIVILEGES;" | mysql -u root -p$1\n\n}\n\n###########################################################\n# PHP functions\n###########################################################\n\nfunction php_install_with_apache {\n\taptitude -y install php5 php5-mysql libapache2-mod-php5\n\ttouch /tmp/restart-apache2\n}\n\nfunction php_tune {\n\t# Tunes PHP to utilize up to 32M per process\n\n\tsed -i\'-orig\' \'s/memory_limit = [0-9]\\+M/memory_limit = 32M/\' /etc/php5/apache2/php.ini\n\ttouch /tmp/restart-apache2\n}\n\n###########################################################\n# Wordpress functions\n###########################################################\n\nfunction wordpress_install {\n\t# installs the latest wordpress tarball from wordpress.org\n\n\t# $1 - required - The existing virtualhost to install into\n\n\tif [ ! -n "$1" ]; then\n\t\techo "wordpress_install() requires the vitualhost as its first argument"\n\t\treturn 1;\n\tfi\n\n\tif [ ! -e /usr/bin/wget ]; then\n\t\taptitude -y install wget\n\tfi\n\n\tVPATH=$(apache_virtualhost_get_docroot $1)\n\n\tif [ ! -n "$VPATH" ]; then\n\t\techo "Could not determine DocumentRoot for $1"\n\t\treturn 1;\n\tfi\n\n\t# download, extract, chown, and get our config file started\n\tcd $VPATH\n\twget http://wordpress.org/latest.tar.gz\n\ttar xfz latest.tar.gz\n\tchown -R www-data: wordpress/\n\tcd $VPATH/wordpress\n\tcp wp-config-sample.php wp-config.php\n\tchown www-data wp-config.php\n\tchmod 640 wp-config.php\n\n\t# database configuration\n\tWPPASS=$(randomString 20)\n\tmysql_create_database "$DB_PASSWORD" wordpress\n\tmysql_create_user "$DB_PASSWORD" wordpress "$WPPASS"\n\tmysql_grant_user "$DB_PASSWORD" wordpress wordpress\n\n\t# configuration file updates\n\tfor i in {1..4}\n\t\tdo sed -i "0,/put your unique phrase here/s/put your unique phrase here/$(randomString 50)/" wp-config.php\n\tdone\n\n\tsed -i \'s/database_name_here/wordpress/\' wp-config.php\n\tsed -i \'s/username_here/wordpress/\' wp-config.php\n\tsed -i "s/password_here/$WPPASS/" wp-config.php\n\n\t# http://downloads.wordpress.org/plugin/wp-super-cache.0.9.8.zip\n}\n\n###########################################################\n# Other niceties!\n###########################################################\n\nfunction goodstuff {\n\t# Installs the REAL vim, wget, less, and enables color root prompt and the "ll" list long alias\n\n\taptitude -y install wget vim less\n\tsed -i -e \'s/^#PS1=/PS1=/\' /root/.bashrc # enable the colorful root bash prompt\n\tsed -i -e "s/^#alias ll=\'ls -l\'/alias ll=\'ls -al\'/" /root/.bashrc # enable ll list long alias <3\n}\n\n\n###########################################################\n# utility functions\n###########################################################\n\nfunction restartServices {\n\t# restarts services that have a file in /tmp/needs-restart/\n\n\tfor service in $(ls /tmp/restart-* | cut -d- -f2-10); do\n\t\t/etc/init.d/$service restart\n\t\trm -f /tmp/restart-$service\n\tdone\n}\n\nfunction randomString {\n\tif [ ! -n "$1" ];\n\t\tthen LEN=20\n\t\telse LEN="$1"\n\tfi\n\n\techo $(</dev/urandom tr -dc A-Za-z0-9 | head -c $LEN) # generate a random string\n}',
    user_defined_fields: [],
    username: 'linode',
    updated: '2017-05-31T20:56:28',
  },
  {
    deployments_total: 0,
    is_public: true,
    description: 'Does nothing on its own. Do not deploy directly.\r\n\r\nA collection of useful Python functions to be included in other StackScripts.',
    label: 'StackScript Python Library',
    images: [
      'CentOS 7',
      'Debian 7',
      'Debian 8',
      'Fedora 22',
      'Ubuntu 14.04 LTS',
    ],
    deployments_active: 0,
    rev_note: 'Initial import.',
    created: '2010-01-12T23:08:19',
    user_gravatar_id: 'ead4da00f4fe6a4bd0b4f11a510c031d',
    id: 3,
    script: '#!/usr/bin/env python\n\n"""\nPython Library StackScript\n\n\tAuthor: Ricardo N Feliciano <rfeliciano@linode.com>\n\tVersion: 1.0.0.0\n\tRequirements:\n\t\t- n/a\n\nThis StackScript is not meant to be directly deployed. Includes a host of\nfunctions to do very common task on a distro, as implemented in Python. The\nfunctions in this library are designed to be run accross the Linode Core\nDistributions:\n\t- Ubuntu\n\t- CentOS\n\t- Debian\n\t- Fedora\n"""\n\n\nimport crypt\nimport fcntl\nimport logging\nimport os\nimport platform\nimport pwd\nimport socket\nimport subprocess\nimport sys\nimport time\ntry:\n\timport apt\nexcept:\n\ttry:\n\t\timport yum\n\texcept:\n\t\ttry:\n\t\t\timport dnf\n\t\texcept ImportError:\n\t\t\tprint("Package manager support was not found.")\n\t\t\t\n\ndistro = None\n"""String list: Contains details of the distribution."""\n\n\ndef end():\n\t"""End the StackScript cleanly."""\n\t\n\t# Should the StackScripts themselves be removed here at some point?\n\tlogging.info("The StackScript has been completed.")\n\tsubprocess.check_output(\'echo "The StackScript has completed. Press enter to continue." | wall -n\', shell=True)\n\n\ndef init():\n\t"""Start features we consider StackScript standard."""\n\t\n\t# Sanity check for CentOS 7 & Fedora 22\n\tif os.path.exists("/var/log/stackscript.log"):\n\t\tsys.exit(1) # StackScript already started once, bail\n\t\n\twith open("/etc/profile.d/stackscript.sh", "w") as f:\n\t\tf.write("""#!/bin/bash\nif pgrep -f "python /root/StackScript" &>/dev/null\nthen\n\techo "####################################################################"\n\techo "#####"\n\techo "#####  Warning: Your StackScript is still running"\n\techo "#####"\n\techo "#####"\n\techo "#####  Please do not make any system changes until it "\n\techo "#####  completes. Log file is located at: "\n\techo "#####    /var/log/stackscript.log"\n\techo "####################################################################"\n\techo " "\nelse\n\techo "####################################################################"\n\techo "#####"\n\techo "#####  The StackScript has completed. Enjoy your system."\n\techo "#####"\n\techo "#####"\n\techo "#####  For reference, the logfile is located at: "\n\techo "#####    /var/log/stackscript.log"\n\techo "####################################################################"\n\techo " "\n\trm /etc/profile.d/stackscript.sh\nfi""")\n\t\n\tlogging_start()\n\n\ndef logging_start(the_file="/var/log/stackscript.log", the_level=logging.INFO):\n\t"""Turn on logging."""\n\t\n\tlogging.basicConfig(filename=the_file, level=the_level)\n\tlogging.info("Logging has started. " + str(time.time()))\n\n\ndef system_detect_distro():\n\t"""Prepares distro information.\n\t\n\tThis is critical to support the Linode Core Distributions with a single\n\tscript.\n\t"""\n\tglobal distro\n\n\t# add support for logging\n\t\n\tdistro = dict(zip((\'distname\', \'version\', \'codename\'),\n\tplatform.linux_distribution(full_distribution_name=0)))\n\t\n\tdistro[\'distname\'] = distro[\'distname\'].lower()\n\n\tif distro[\'distname\'] in (\'debian\', \'ubuntu\'):\n\t\tdistro[\'family\'] = "debian"\n\telif distro[\'distname\'] in (\'fedora\', \'centos\'):\n\t\tdistro[\'family\'] = "redhat"\n\telse:\n\t\traise NotImplementedError("This distribution is not supported.")\n\n\ndef system_IP_get():\n\t"""Return IPv4 address configured on eth0.\n\t\n\tThis basically is a disgusting hack. Please let me know if you find a\n\tcleaner way to do this."""\n\t# add support for logging\n\n\ts = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)\n\treturn socket.inet_ntoa(fcntl.ioctl(\n\t\ts.fileno(),\n\t\t0x8915, # SIOCGIFADDR\n\t\tstruct.pack(\'256s\', "eth0")\n\t)[20:24])\n\n\ndef system_IP_rdns(IP):\n\t"""Get PTR for given IP address."""\n\t# add support for logging\n\n\treturn socket.gethostbyaddr(IP)[0]\n\n\ndef system_package_install(package, update_first=True):\n\t"""Install a package with the appropriate package manager."""\n\t# add support for logging\n\n\tif distro is None:\n\t\tsystem_detect_distro()\n\n\tsystem_update() if update_first else None\n\t\n\tif distro[\'family\'] == "debian":\n\t\tos.environ[\'DEBIAN_FRONTEND\'] = "noninteractive"\n\t\tcache = apt.Cache()\n\t\tpkg = cache[package]\n\t\tpkg.mark_install()\n\t\tcache.commit()\n\telif distro[\'distname\'] == "centos":\n\t\tyb = yum.YumBase()\n\t\tyb.conf.assumeyes = True\n\t\tyb.install(name=package)\n\t\tyb.resolveDeps()\n\t\tyb.processTransaction()\n\t\tyb.close()\n\telif distro[\'distname\'] == "fedora":\n\t\tdnfb = dnf.Base()\n\t\tdnfb.conf.assumeyes = True\n\t\tdnfb.read_all_repos()\n\t\tdnfb.fill_sack()\n\t\tdnfb.install(package)\n\t\tdnfb.resolve()\n\t\tdnfb.download_packages(dnfb.transaction.install_set)\n\t\tdnfb.do_transaction()\n\t\tdnfb.close()\n\n\ndef system_update():\n\t"""Uses the distro\'s package manager to update packages."""\n\t#add support for logging\n\t\n\tif distro is None:\n\t\tsystem_detect_distro()\n\t\n\tif distro[\'family\'] == "debian":\n\t\tcache = apt.Cache()\n\t\tcache.update()\n\t\tcache.open(None)\n\t\tcache.upgrade()\n\t\tcache.commit()\n\telif distro[\'distname\'] == "centos":\n\t\tyb = yum.YumBase()\n\t\tyb.conf.assumeyes = True\n\t\tyb.update()\n\t\tyb.resolveDeps()\n\t\tyb.processTransaction()\n\t\tyb.close()\n\telif distro[\'distname\'] == "fedora":\n\t\tdnfb = dnf.Base()\n\t\tdnfb.conf.assumeyes = True\n\t\t#dnfb.read_all_repos() #updates were failing with this line\n\t\tdnfb.fill_sack()\n\t\tdnfb.upgrade_all()\n\t\tdnfb.resolve()\n\t\tdnfb.do_transaction()\n\t\tdnfb.close()\n\n\ndef user_add(username, password, groups):\n\t"""Creates a Linux user account.\n\t\n\tArgs:\n\t\tusername (String): A Linux username.\n\t\tpassword (String): Password for the user.\n\t\tgroups (tuple): Groups that the user should be added to.\n\t\n\tReturns:\n\t\tbool: True if successful, False otherwise.\n\t"""\n\n\t# need to implement logging\n\t# need to implement group functionality\n\n\treturn subprocess.call([\'useradd\', \'-m\', \'-p\', crypt.crypt(password, "22"), \'-s\', \'/bin/bash\', username])\n\n\ndef user_add_pubkey(username, key):\n\t"""Adds the public SSH key to the specified user."""\n\t# need to implement logging\n\t\n\tif username != "root":\n\t\tos.seteuid(pwd.getpwnam(username).pw_uid)\n\t\tos.setegid(pwd.getpwnam(username).pw_gid)\n\t\n\tpubkey_dir = os.path.join(os.getenv("HOME"), ".ssh")\n\t\n\tif not os.path.isdir(pubkey_dir):\n\t\tos.makedirs(pubkey_dir)\n\t\n\twith open(os.path.join(pubkey_dir, "authorized_keys")) as f:\n\t\tf.write(key)\n\t\n\tif username != "root":\n\t\tos.seteuid(0)\n\t\tos.setegid(0)',
    user_defined_fields: [],
    username: 'linode',
    updated: '2015-09-14T20:52:25',
  },
  {
    deployments_total: 3,
    is_public: true,
    description: 'Installs Apache on a Linode. Can also be used as a library for other StackScripts.',
    label: 'Apache',
    images: [
      'CentOS 7',
      'Debian 7',
      'Debian 8',
      'Fedora 22',
      'Ubuntu 14.04 LTS',
    ],
    deployments_active: 3,
    rev_note: 'Initial import.',
    created: '2010-01-12T23:28:46',
    user_gravatar_id: 'ead4da00f4fe6a4bd0b4f11a510c031d',
    id: 5,
    script: '#!/usr/bin/env python\n\n"""\nApache Web Server (httpd) StackScript\n\t\n\tAuthor: Ricardo N Feliciano <rfeliciano@linode.com>\n\tVersion: 1.0.0.0\n\tRequirements:\n\t\t- ss://linode/python-library <ssinclude StackScriptID="3">\n\nThis StackScript both deploys as well as provides a library of functions for\nthe Apache Web Server (httpd). The functions in this StackScript are designed\nto be run across the Linode Core Distributions:\n\t- Ubuntu\n\t- CentOS\n\t- Debian\n\t- Fedora\n"""\n\nimport os\nimport subprocess\nimport sys\n\ntry: # we need to rename the included StackScript before we can import it\n\tos.rename("/root/ssinclude-3", "/root/pythonlib.py")\nexcept:\n\tpass\n\nimport pythonlib\n\n\ndef httpd_install(start=True):\n\t"""Install Apache Web Server (httpd)"""\n\t# add logging support\n\n\tpackage = {\n\t\t\'debian\': \'apache2\',\n\t\t\'redhat\': \'httpd\'\n\t}\n\n\tpythonlib.system_package_install(package[pythonlib.distro[\'family\']])\n\n\tif(pythonlib.distro[\'family\']=="redhat" and start):\n\t\tsubprocess.call(["systemctl", "start", "httpd"])\n\n\ndef httpd_site_enable():\n\t"""Add a virtual host configuration to Apache httpd."""\n\t# add logging support\n\n\t# this doesn\'t do anything yet\n\n\n#def httpd_mod_enable(mod):\n#\t"""Enable `mod` in Apache.\n#\t\n#\tArgs:\n#\t\tmod String: module to enable. Name should be what you would give the\n#\t\ta2enmod command.\n#\t"""\n#\t# add logging support\n#\n#\tif\n#\n#\tThis function has been delayed until a proper x-platform solution is made.\n\n\ndef main():\n\t"""Install Apache httpd."""\n\t# add logging support\n\t\n\tpythonlib.init()\n\tpythonlib.system_update()\n\thttpd_install()\n\n\tpythonlib.end()\n\n\nif __name__ == "__main__":\n\tsys.exit(main())',
    user_defined_fields: [],
    username: 'linode',
    updated: '2015-09-14T20:53:05',
  },
  {
    deployments_total: 42,
    is_public: true,
    description: 'Install MySQL or MariaDB to a Linode. Can also be used as a library for other StackScripts.',
    label: 'MySQL',
    images: [
      'CentOS 7',
      'Debian 7',
      'Debian 8',
      'Fedora 22',
      'Ubuntu 14.04 LTS',
    ],
    deployments_active: 25,
    rev_note: 'Initial import.',
    created: '2010-01-12T23:53:50',
    user_gravatar_id: 'ead4da00f4fe6a4bd0b4f11a510c031d',
    id: 7,
    script: '#!/usr/bin/env python\n\n"""\nMySQL StackScript\n\t\n\tAuthor: Ricardo N Feliciano <rfeliciano@linode.com>\n\tVersion: 1.0.0.0\n\tRequirements:\n\t\t- ss://linode/python-library <ssinclude StackScriptID="3">\n\nThis StackScript both deploys and provides a library for MySQL. The functions \nin this StackScript are designed to be run across the Linode Core Distributions:\n\t- Ubuntu\n\t- CentOS\n\t- Debian\n\t- Fedora\n\nStackScript User Defined Variables:\n\n<UDF name="db_root_password" label="MySQL/MariaDB root password" default="" />\n"""\n\nimport os\nimport subprocess\nimport sys\n\ntry: # we\'ll need to rename included StackScripts before we can import them\n\tos.rename("/root/ssinclude-3", "/root/pythonlib.py")\nexcept:\n\tpass\n\nimport pythonlib\n\n\ndef mysql_install(root_pw = False, db_name = False):\n\t"""Install MySQL or MariaDB"""\n\t# add logging support\n\n\tpackage = {\n\t\t\'debian\': \'mysql\',\n\t\t\'redhat\': \'mariadb\'\n\t}\n\n\tpythonlib.system_package_install(package[pythonlib.distro[\'family\']] +\n\t"-server")\n\t\n\tmysql_start()\n\n\t# if provided with a root password, set it\n\tif root_pw :\n\t\tsubprocess.call([\'mysqladmin\', \'-u\', \'root\', \'password\', root_pw])\n\t\n\t# if a database name was provided, let\'s create it\n\tif db_name :\n\t\tsubprocess.call(\'mysql -uroot -p\' + root_pw + \' -e "create database \' + db_name + \'"\', shell=True)\n\n\ndef mysql_start():\n\t"""Start MariaDB on CentOS and Fedora"""\n\n\tif pythonlib.distro[\'family\']  == "redhat":\n\t\tsubprocess.call([\'systemctl\', \'start\', \'mariadb.service\'])\n\n\ndef main():\n\t"""Install MySQL or MariaDB"""\n\t# add logging support\n\t\n\tpythonlib.init()\n\tpythonlib.system_update()\n\n\tif os.environ[\'DB_ROOT_PASSWORD\'] != "":\n\t\tmysql_install(os.environ[\'DB_ROOT_PASSWORD\'])\n\telse:\n\t\tmysql_install()\n\n\tpythonlib.end()\n\n\nif __name__ == "__main__":\n\tsys.exit(main())',
    user_defined_fields: [
      {
        name: 'db_root_password',
        label: 'MySQL/MariaDB root password',
        default: '',
      },
    ],
    username: 'linode',
    updated: '2015-09-14T20:53:10',
  },
  {
    deployments_total: 3,
    is_public: true,
    description: '',
    label: 'PHP',
    images: [
      'CentOS 7',
      'Debian 7',
      'Debian 8',
      'Fedora 22',
      'Ubuntu 14.04 LTS',
    ],
    deployments_active: 0,
    rev_note: 'v1.0.1',
    created: '2010-01-13T00:24:59',
    user_gravatar_id: 'ead4da00f4fe6a4bd0b4f11a510c031d',
    id: 8,
    script: '#!/usr/bin/env python\n\n"""\nPHP StackScript\n\t\n\tAuthor: Ricardo N Feliciano <rfeliciano@linode.com>\n\tVersion: 1.0.1.2\n\tRequirements:\n\t\t- ss://linode/python-library <ssinclude StackScriptID="3">\n\nThis StackScript both deploys as well as provides a library of functions for\nPHP. The functions in this StackScript are designed to be run across the \nLinode Core Distributions:\n\t- Ubuntu\n\t- CentOS\n\t- Debian\n\t- Fedora\n"""\n\nimport os\nimport subprocess\nimport sys\n\ntry: # we\'ll need to rename included StackScripts before we can import them\n\tos.rename("/root/ssinclude-3", "/root/pythonlib.py")\nexcept:\n\tpass\n\nimport pythonlib\n\n\ndef php_apache_mod_install():\n\t"""Install Apache httpd PHP module."""\n\t# add logging support\n\n\tpackage = {\n\t\t\'debian\': \'php5\',\n\t\t\'redhat\': \'php\'\n\t}\n\n\tpythonlib.system_package_install(package[pythonlib.distro[\'family\']])\n\n\n#def php_fpm_install():\n\n\ndef php_install():\n\t"""Install PHP.\n\t\n\tDefaults to installing the mod_PHP implemention of PHP.\n\t"""\n\t# add logging support\n\n\tphp_apache_mod_install()\n\n\ndef php_install_module(module, update_index=True):\n\t"""Install a PHP module."""\n\n\tprefix = {\n\t\t\'debian\': \'php5-\',\n\t\t\'redhat\': \'php-\'\n\t}\n\n\tpythonlib.system_package_install(prefix[pythonlib.distro[\'family\']] + module, update_index)\n\n\ndef php_install_module_common():\n\t"""Install most common PHP modules.\n\n\tInstall GD, mcrypt, pear, mysql, and the cli."""\n\t\n\tphp_install_module("gd")\n\t#php_install_module("mcrypt", False) #not in CentOS7 repos :(\n\t#php_install_module("pear", False) # both families use php-pear so\n\t#installing php5-pear in the Debian family will fail\n\tphp_install_module("mysql", False)\n\tphp_install_module("cli", False)\n\trestart()\n\n\ndef restart():\n\tif pythonlib.distro[\'family\'] == "debian":\n\t\tsubprocess.call([\'service\', \'apache2\', \'restart\'])\n\telif pythonlib.distro[\'family\'] == "redhat":\n\t\tsubprocess.call([\'systemctl\', \'restart\', \'httpd\'])\n\n\ndef main():\n\t"""Install PHP."""\n\t# add logging support\n\t\n\tpythonlib.init()\n\tpythonlib.system_update()\n\tphp_install()\n\n\tpythonlib.end()\n\n\nif __name__ == "__main__":\n\tsys.exit(main())',
    user_defined_fields: [],
    username: 'linode',
    updated: '2015-09-24T00:03:28',
  },
  {
    deployments_total: 2834,
    is_public: true,
    description: 'Installs a full LAMP stack on a Linode. Uses MySQL for Debian and Ubuntu and MariaDB for CentOS and Fedora (the new defaults). This can also be used as a library for other StackScripts.',
    label: 'LAMP Stack',
    images: [
      'CentOS 7',
      'Debian 7',
      'Debian 8',
      'Fedora 22',
      'Ubuntu 14.04 LTS',
    ],
    deployments_active: 1442,
    rev_note: 'Initial import.',
    created: '2010-01-13T01:50:15',
    user_gravatar_id: 'ead4da00f4fe6a4bd0b4f11a510c031d',
    id: 9,
    script: '#!/usr/bin/env python\n\n"""\nLAMP StackScript\n\t\n\tAuthor: Ricardo N Feliciano <rfeliciano@linode.com>\n\tVersion: 1.0.0.0\n\tRequirements:\n\t\t- ss://linode/python-library <ssinclude StackScriptID="3">\n\t\t- ss://linode/apache <ssinclude StackScriptID="5">\n\t\t- ss://linode/mysql <ssinclude StackScriptID="7">\n\t\t- ss://linode/php <ssinclude StackScriptID="8">\n\nThis StackScript both deploys and provides a library of functions for\ncreating a LAMP stack. The functions in this StackScript are designed to be \nrun across Linode\'s core distributions:\n\t- Ubuntu\n\t- CentOS\n\t- Debian\n\t- Fedora\n\nStackScript User-Defined Variables (UDF): \n\n<UDF name="db_root_password" label="MySQL/MariaDB root password" />\n<UDF name="db_name" label="Create Database" default="" example="create this empty database" />\n"""\n\nimport os\nimport sys\n\ntry: # we\'ll need to rename included StackScripts before we can import them\n\tos.rename("/root/ssinclude-3", "/root/pythonlib.py")\n\tos.rename("/root/ssinclude-5", "/root/apache.py")\n\tos.rename("/root/ssinclude-7", "/root/mysql.py")\n\tos.rename("/root/ssinclude-8", "/root/php.py")\nexcept:\n\tpass\n\nimport pythonlib\nimport apache\nimport mysql\nimport php\n\n\ndef main():\n\t"""Install Apache, MySQL/MariaDB, and PHP."""\n\t# add logging support\n\tpythonlib.init()\n\t\n\tif os.environ[\'DB_ROOT_PASSWORD\'] != "":\n\t\tdb_root_password = os.environ[\'DB_ROOT_PASSWORD\']\n\telse:\n\t\tdb_root_password = False\n\t\n\tif os.environ[\'DB_NAME\'] != "":\n\t\tdb_name = os.environ[\'DB_NAME\']\n\telse:\n\t\tdb_name = False\n\n\tpythonlib.system_update()\n\tapache.httpd_install()\n\tmysql.mysql_install(db_root_password, db_name)\n\tphp.php_install()\n\tphp.php_install_module_common()\n\n\tpythonlib.end()\n\n\nif __name__ == "__main__":\n\tsys.exit(main())',
    user_defined_fields: [
      {
        name: 'db_root_password',
        label: 'MySQL/MariaDB root password',
      },
      {
        name: 'db_name',
        example: 'create this empty database',
        label: 'Create Database',
        default: '',
      },
    ],
    username: 'linode',
    updated: '2018-02-15T00:30:34',
  },
  {
    deployments_total: 20436,
    is_public: true,
    description: 'Installs a fully functioning, ready to go LAMP stack that\'s optimized specifically for your Linode\'s resources.  By default, it creates a VirtualHost using the reverse DNS of your Linode\'s primary IP.  \r\n\r\nOptionally creates a MySQL database and user, and assigns that user grants to the database.\r\n\r\nYou may use this as an example for creating more VirtualHosts.  Set up VirtualHosts, install your sites, point your domains to your Linode, and you\'re set!',
    label: 'LAMP',
    images: [
      'Ubuntu 12.04 LTS',
    ],
    deployments_active: 8180,
    rev_note: '',
    created: '2010-01-13T02:21:52',
    user_gravatar_id: 'ead4da00f4fe6a4bd0b4f11a510c031d',
    id: 10,
    script: '#!/bin/bash\n# <UDF name="db_password" Label="MySQL root Password" />\n# <UDF name="db_name" Label="Create Database" default="" example="Optionally create this database" />\n# <UDF name="db_user" Label="Create MySQL User" default="" example="Optionally create this user" />\n# <UDF name="db_user_password" Label="MySQL User\'s Password" default="" example="User\'s password" />\n\n\nsource <ssinclude StackScriptID="1">\n\nsystem_update\npostfix_install_loopback_only\nmysql_install "$DB_PASSWORD" && mysql_tune 40\nmysql_create_database "$DB_PASSWORD" "$DB_NAME"\nmysql_create_user "$DB_PASSWORD" "$DB_USER" "$DB_USER_PASSWORD"\nmysql_grant_user "$DB_PASSWORD" "$DB_USER" "$DB_NAME"\nphp_install_with_apache && php_tune\napache_install && apache_tune 40 && apache_virtualhost_from_rdns\ngoodstuff\nrestartServices',
    user_defined_fields: [
      {
        name: 'db_password',
        label: 'MySQL root Password',
      },
      {
        name: 'db_name',
        example: 'Optionally create this database',
        label: 'Create Database',
        default: '',
      },
      {
        name: 'db_user',
        example: 'Optionally create this user',
        label: 'Create MySQL User',
        default: '',
      },
      {
        name: 'db_user_password',
        example: 'User\'s password',
        label: 'MySQL User\'s Password',
        default: '',
      },
    ],
    username: 'linode',
    updated: '2015-09-14T20:54:01',
  },
];
/* tslint:enable */

type ClassNames = 'root' | 'tab';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
    maxHeight: '400px',
  },
  tab: {
    maxHeight: '400px',
    overflowX: 'hidden',
  },
});

interface Props {
  selectedId?: number;
  onSelect: (id: number) => void;
}

type StyledProps = Props & WithStyles<ClassNames>;

type CombinedProps = StyledProps;

class SelectLinodePanel extends React.Component<CombinedProps> {

  render() {
    const { classes, onSelect, selectedId } = this.props;

    return (
      <TabbedPanel
        rootClass={classes.root}
        header="Select StackScript"
        tabClass={classes.tab}
        tabs={[
          {
            title: 'My StackScripts',
            render: () => <StackScriptsSection
              onSelect={onSelect}
              stackScripts={data}
              selectedId={selectedId}
            />,
          },
          {
            title: 'My StackScripts',
            render: () => <StackScriptsSection
              onSelect={onSelect}
              stackScripts={data}
              selectedId={selectedId}
            />,
          },
          {
            title: 'My StackScripts',
            render: () => <StackScriptsSection
              onSelect={onSelect}
              stackScripts={data}
              selectedId={selectedId}
            />,
          },
        ]}
      />
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(SelectLinodePanel);
