#!/usr/bin/expect -f
# Connects to a Linode via SSH and installs Longview using a given command.

set timeout 120

# Wait 15 seconds before attempting to connect to Linode.
# This mitigates a rare issue where connecting too quickly after provisioning and
# booting yields a connection refused error.
sleep 15

# SSH into the Linode.
# Disable strict host key checking and pass a null path for the host file so that
# developers do not have their `known_hosts` file modified when running this test,
# preventing rare cases where recycled IPs can trigger a warning that causes the
# test to fail.
spawn ssh root@$env(LINODEIP) -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no

# Answer SSH password prompt.
expect "*?assword" {
    send "$env(LINODEPASSWORD)\r"
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
