#!/usr/bin/expect -f
# this script is used in the longview test
spawn ssh root@$env(LINODEIP)
sleep 65
expect "*yes/no*"
send "yes\r"
expect "*assword"
send "$env(LINODEPASSWORD)\r"
expect "*root@localhost:~#"
send "$env(CURLCOMMAND)\r"
expect "*root@localhost:~#"
send "sudo systemctl start longview\r"
expect "*root@localhost:~#"
send "exit\r"
expect "%closed."
sleep 60
exit
interact
