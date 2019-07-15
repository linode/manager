import { storiesOf } from '@storybook/react';
import * as React from 'react';

import ScriptCode from './ScriptCode';

const code = `#!/usr/bin/env python
"""
WordPress StackScript
	Author: Ricardo N Feliciano <rfeliciano@linode.com>
	Version: 1.0.0.0
	Requirements:
		- ss://linode/python-library <ssinclude StackScriptID="3">
		- ss://linode/apache <ssinclude StackScriptID="5">
		- ss://linode/mysql <ssinclude StackScriptID="7">
		- ss://linode/php <ssinclude StackScriptID="8">
		- ss://linode/lamp-stack <ssinclude StackScriptID="9">
This StackScript both deploys and provides a library of functions for creating
a basic WordPress install. This StackScript is designed to be run across
Linode's Core Distributions:
	- Ubuntu LTS
	- CentOS
	- Debian
StackScript User-Defined Variables (UDF):
	
	<UDF name="db_root_password" label="MariaDB/MySQL root password" />
	<UDF name="db_name" label="Database name for WordPress" default="wordpress" />
"""
import os
import pwd
import shutil
import sys
import tarfile
import urllib
import subprocess
try: # we'll need to rename included StackScripts before we can import them
	os.rename("/root/ssinclude-3", "/root/pythonlib.py")
	os.rename("/root/ssinclude-5", "/root/apache.py")
	os.rename("/root/ssinclude-7", "/root/mysql.py")
	os.rename("/root/ssinclude-8", "/root/php.py")
	os.rename("/root/ssinclude-9", "/root/lamp.py")
except:
	pass
import pythonlib
import apache
import mysql
import php
import lamp
def install(path):
	"""Install WordPress."""
	#logging support
	
	shutil.rmtree(path)
	urllib.urlretrieve("https://wordpress.org/latest.tar.gz", "wordpress.tar.gz")
	tarball = tarfile.open("wordpress.tar.gz")
	tarball.extractall(os.path.dirname(path))
	tarball.close()
	os.rename(os.path.dirname(path) + "/wordpress", path)
	
	# might be better off a part of the Apache StackScript in the future
	httpd_user = {
		'debian': 'www-data',
		'redhat': 'apache'
	}
	
	# Recursively set permissions for our web directory
	os.chown(path, pwd.getpwnam(httpd_user[pythonlib.distro['family']]).pw_uid, -1)
	for root, dirs, files in os.walk(path):  
		for found_dirs in dirs:  
			os.chown(os.path.join(root, found_dirs), pwd.getpwnam(httpd_user[pythonlib.distro['family']]).pw_uid, -1)
		for found_files in files:
			os.chown(os.path.join(root, found_files), pwd.getpwnam(httpd_user[pythonlib.distro['family']]).pw_uid, -1)
def main():
	"""Install WordPress on a basic LAMP stack.
	
	Most of the initial code in this function needs to be pulled from the LAMP
	StackScript rather than placed here.
	"""
	# add logging support
	pythonlib.init()
	
	if os.environ['DB_ROOT_PASSWORD'] != "":
		db_root_password = os.environ['DB_ROOT_PASSWORD']
	else:
		db_root_password = False
	
	if os.environ['DB_NAME'] != "":
		db_name = os.environ['DB_NAME']
	else:
		db_name = False
	
	pythonlib.system_update()
	apache.httpd_install()
	mysql.mysql_install(db_root_password, db_name)
	php.php_install()
	php.php_install_module_common()
	
	# might be better off a part of the Apache StackScript in the future
	httpd_docroot = "/var/www/html"
	if pythonlib.distro['distname'] == "debian" and float(pythonlib.distro['version']) < 8.0 :
		httpd_docroot = "/var/www"
	
	install(httpd_docroot)
        bashCommand = "firewall-cmd --zone=public --add-service=http --permanent && firewall-cmd --reload"
        proc = subprocess.Popen(bashCommand, shell=True)
	pythonlib.end()
if __name__ == "__main__":
	sys.exit(main())`;

storiesOf('ScriptCode', module).add(
  'ScriptCode with some stackScript code',
  () => <ScriptCode script={code} />
);
