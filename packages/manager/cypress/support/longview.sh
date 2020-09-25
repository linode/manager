#!/usr/bin/expect -f

# set linodeIp [lindex $argv 0]
# set linodePassword [lindex $argv 1]
# set curlCommand [lindex $argv 2]

spawn ssh root@$env(LINODEIP)
expect "*?yes/no"
send "yes\r"
expect "*?assword"
send "$env(LINODEPASSWORD)\r"
expect "*?localhost"
send "$env(CURLCOMMAND)\r"
expect "*?localhost"
send "sudo systemctl start longview\r"
expect "*?localhost"
send "exit\r"
exit
interact
