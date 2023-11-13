#!/usr/bin/expect -f
# this script is used in the longview test
set timeout 120

spawn ssh root@$env(LINODEIP)

# Proceed through unknown host warning, enter password.
expect "yes/no" {
    send "yes\r"
    expect "*?assword" {
        send "$env(LINODEPASSWORD)\r"
    }
}

# Execute the Longview installation command shown in the Cloud Manager UI.
expect "*root@localhost:~#" {
    send "$env(CURLCOMMAND)\r"
}

# Start Longview, confirm that it is running, and exit.
expect "*root@localhost:~#" {
  send "sudo systemctl start longview\r"
  send "sudo systemctl status longview\r"
}

expect "*active (running)*"
send "exit\r"
expect "%closed."
exit
interact
