#!/bin/bash

# Define the target directory
#TARGET_DIR="/Users/agorthi/Downloads/repo/manager"
TARGET_DIR=$(pwd)

# Filter only the relevant part of the path (e.g., "manager")
# Assuming the relevant part is the last directory in the path
RELEVANT_DIR=$(basename "$TARGET_DIR")

# Define the second target directory based on the first
TARGET_DIR2="$TARGET_DIR/packages/manager"

# Function to run pnpm commands
run_pnpm_commands() {
    echo "Running pnpm clean..."
    pnpm clean || { echo "pnpm clean failed"; exit 1; }

    echo "Running pnpm install..."
    pnpm install || { echo "pnpm install failed"; exit 1; }

    echo "Running pnpm bootstrap..."
    pnpm bootstrap || { echo "pnpm bootstrap failed"; exit 1; }

    echo "Running pnpm dev..."
    pnpm dev || { echo "pnpm dev failed"; exit 1; }

    echo "pnpm commands completed successfully."
}

# Check if we are in the correct directory, if not, navigate there
if [ "$(pwd)" != "$TARGET_DIR" ]; then
    echo "Not in the correct directory. Changing to $TARGET_DIR..."
    cd "$TARGET_DIR" || { echo "Failed to change directory to $TARGET_DIR"; exit 1; }
else
    echo "Already in the correct directory: $TARGET_DIR"
fi

# Display the current Git branch
current_branch=$(git branch --show-current)
echo "You are currently on the branch: $current_branch"

# Prompt for the action you want to perform
echo "Choose an option:"
echo "1) Create a branch and run pnpm commands."
echo "2) Skip branch creation and just run pnpm commands."
echo "3) Run Cypress Automation tests."

read -p "Enter option (1, 2, or 3): " choice

# Option 1: Create branch and run pnpm commands
if [ "$choice" == "1" ]; then
    # Ask for the remote repository name (e.g., aclp, linode)
    read -p "Enter the remote repository name (e.g., aclp or linode): " remote_repo

    # Set the target branch based on the provided remote repository
    if [ "$remote_repo" == "aclp" ]; then
        targetbranch="aclp_develop"
    elif [ "$remote_repo" == "linode" ]; then
        targetbranch="develop"
    else
        echo "Invalid remote repository! Supported options are 'aclp' or 'linode'. Exiting."
        exit 1
    fi

    # Fetch the latest updates from the specified remote repository
    echo "Fetching latest updates from remote repository: $remote_repo..."
    git fetch "$remote_repo" || { echo "Failed to fetch from $remote_repo"; exit 1; }

    # Get the current date in the format "Month Day"
    current_date=$(date "+%B %d")
    month=$(echo "$current_date" | cut -d ' ' -f 1)  # Month name (e.g., March)
    day=$(echo "$current_date" | cut -d ' ' -f 2)    # Day of the month (e.g., 17)

    # Ask for the new branch name
    read -p "Enter the branch name to create: " branchname

    # Construct the full branch name with the required format
    branchname_with_prefix="${branchname}_${remote_repo}_${month}_${day}"

    # Construct the git command
    command="git checkout -b $branchname_with_prefix $remote_repo/$targetbranch"

    # Print the command that will be executed
    echo "The following command will be executed:"
    echo "$command"

    # Ask for user confirmation to create the branch
    read -p "Do you want to execute this git command? (y/n): " confirm_git

    # Execute the git command if user confirms
    if [ "$confirm_git" == "y" ] || [ "$confirm_git" == "Y" ]; then
        echo "Executing: $command"
        eval "$command" || { echo "Failed to execute git command"; exit 1; }
        echo "Successfully created and checked out to branch: $branchname_with_prefix from $remote_repo/$targetbranch"
    else
        echo "Aborted. Command not executed."
        exit 1
    fi

    # Run pnpm commands after branch creation
    osascript -e "tell application \"Terminal\" to do script \"cd '$TARGET_DIR' && pnpm clean && pnpm install && pnpm bootstrap && pnpm dev\""

    # Wait for 70 seconds before opening the second terminal
    sleep 70

    # Run the Cypress tests in the second terminal
    osascript -e "tell application \"Terminal\" to do script \"cd '$TARGET_DIR2' && pnpm cy:run -s 'cypress/e2e/core/cloudpulse/*.spec.ts'\""

fi

# Option 2: Skip branch creation and just run pnpm commands
if [ "$choice" == "2" ]; then
    echo "You are currently on the branch: $current_branch"
    echo "Skipping branch creation. Proceeding to pnpm commands..."

    # Ask for confirmation to run pnpm commands
    read -p "Do you want to proceed with pnpm clean, install, bootstrap, and dev? (y/n): " confirm_pnpm

    if [ "$confirm_pnpm" == "y" ] || [ "$confirm_pnpm" == "Y" ]; then
        # Get the current branch name
        current_branch=$(git branch --show-current)
        echo "Current branch is: $current_branch"

        # Print the output of git branch -vv
        echo "Output of git branch -vv:"
        git branch -vv

        # Extract the remote branch details for the current branch
        remote_branch_info=$(git branch -vv | grep "^\* $current_branch" | awk '{print $4}' | sed 's/[][]//g')
        remote_name=$(echo "$remote_branch_info" | cut -d'/' -f1)
        branch_name=$(echo "$remote_branch_info" | cut -d'/' -f2)

        # Print the extracted remote and branch names
        echo "Extracted remote branch info: $remote_branch_info"
        echo "Extracted remote name: $remote_name"
        echo "Extracted branch name: $branch_name"

        # Check if the remote branch info is valid
        if [ -n "$remote_branch_info" ]; then
            # Change to the target directory
            echo "Changing to target directory: $TARGET_DIR"
            cd "$TARGET_DIR" || { echo "Failed to change directory to $TARGET_DIR. Exiting."; exit 1; }

            # Pull the latest changes from the remote branch
            echo "Pulling the latest changes from $remote_name/$branch_name..."
            read -p "Are you sure you want to pull from $remote_name/$branch_name? (y/n): " confirm

            if [ "$confirm" == "y" ] || [ "$confirm" == "Y" ]; then
                git pull "$remote_name" "$branch_name"
            else
                echo "Pull operation canceled."
            fi
        else
            echo "No remote branch information found for the current branch."
            echo "The current branch is not tracking any remote branch."
            echo "Skipping pull."
        fi

        # Run the pnpm commands
        run_pnpm_commands

    else
        echo "Aborted. Exiting script."
        exit 1
    fi
fi

# Option 3: Run Cypress Automation tests
if [ "$choice" == "3" ]; then
    echo "You chose to run the Cypress automation tests."

    # Ask for confirmation to run the automation tests
    read -p "Do you want to proceed with running the Cypress tests? (y/n): " confirm_automation

    if [ "$confirm_automation" == "y" ] || [ "$confirm_automation" == "Y" ]; then
        # Ask if the user wants to start the server first or just run the tests
        read -p "Would you like to start the server and run the automation tests? (YES for both, NO to run only the automation tests) " start_server

        if [ "$start_server" == "y" ] || [ "$start_server" == "Y" ]; then
            echo "Starting the server and then running Cypress tests..."

            # Check if port 3000 is in use, if yes, kill the process
            echo "Checking if port 3000 is in use..."
            PORT_3000_PROCESS=$(lsof -ti:3000)

            if [ -n "$PORT_3000_PROCESS" ]; then
                echo "Port 3000 is in use. Killing the process..."
                kill -9 "$PORT_3000_PROCESS" || { echo "Failed to kill process on port 3000"; exit 1; }
                echo "Process on port 3000 killed successfully."
            else
                echo "Port 3000 is not in use."
            fi

            # Step 1: Start the server in the first terminal
            osascript -e "tell application \"Terminal\" to do script \"cd '$TARGET_DIR' && pnpm clean && pnpm install && pnpm bootstrap && pnpm dev\""

            # Wait for 70 seconds before opening the second terminal
            sleep 70

            # Step 2: Run the Cypress tests in the second terminal
            osascript -e "tell application \"Terminal\" to do script \"cd '$TARGET_DIR2' && pnpm cy:run -s 'cypress/e2e/core/cloudpulse/*'\""

            echo "Cypress automation tests are now running in a new terminal window."
        else
            echo "Skipping server startup. Running Cypress tests only..."

            # Step 2: Just run the Cypress tests (no server start)
            osascript -e "tell application \"Terminal\" to do script \"cd '$TARGET_DIR2' && pnpm cy:run -s 'cypress/e2e/core/cloudpulse/*'\""

            echo "Cypress automation tests are now running in a new terminal window."
        fi
    else
        echo "Aborted. Exiting script."
        exit 1
    fi
fi
