#!/usr/bin/expect -f

# set linodeIp [lindex $argv 0]
# set linodePassword [lindex $argv 1]
# set curlCommand [lindex $argv 2]

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
