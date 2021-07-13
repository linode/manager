#!/usr/bin/env bash

cat << EOF

            '||'      '||' '|.   '|'  ..|''||   '||''|.   '||''''|
             ||        ||   |'|   |  .|'    ||   ||   ||   ||  .
             ||        ||   | '|. |  ||      ||  ||    ||  ||''|
             ||        ||   |   |||  '|.     ||  ||    ||  ||
            .||.....| .||. .|.   '|   ''|...|'  .||...|'  .||.....|


                ..|'''.| '||'       ..|''||   '||'  '|' '||''|.
              .|'     '   ||       .|'    ||   ||    |   ||   ||
              ||          ||       ||      ||  ||    |   ||    ||
              '|.      .  ||       '|.     ||  ||    |   ||    ||
               ''|....'  .||.....|  ''|...|'    '|..'   .||...|'


    '||    ||'     |     '|.   '|'     |      ..|'''.|  '||''''|  '||''|.
     |||  |||     |||     |'|   |     |||    .|'     '   ||  .     ||   ||
     |'|..'||    |  ||    | '|. |    |  ||   ||    ....  ||''|     ||''|'
     | '|' ||   .''''|.   |   |||   .''''|.  '|.    ||   ||        ||   |.
    .|. | .||. .|.  .||. .|.   '|  .|.  .||.  ''|...'|  .||.....| .||.  '|'


       .|'''.|  |''||''|     |     '||''|.   |''||''| '||'  '|' '||''|.
       ||..  '     ||       |||     ||   ||     ||     ||    |   ||   ||
        ''|||.     ||      |  ||    ||''|'      ||     ||    |   ||...|'
      .     '||    ||     .''''|.   ||   |.     ||     ||    |   ||
      |'....|'    .||.   .|.  .||. .||.  '|'   .||.     '|..'   .||.


              .|'''.|    ..|'''.| '||''|.   '||' '||''|.  |''||''|
              ||..  '  .|'     '   ||   ||   ||   ||   ||    ||
               ''|||.  ||          ||''|'    ||   ||...|'    ||
             .     '|| '|.      .  ||   |.   ||   ||         ||
             |'....|'   ''|....'  .||.  '|' .||. .||.       .||.



EOF

echo "Installling homebrew from https://brew.sh"
bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew update --force
# Use brew bundle to install git, volta, and github cli
echo "installing Git, Volta, and Github CLI using homebrew"
brew bundle --no-lock --file=- <<EOF
     brew "git"
     brew "volta"
     brew "gh"
EOF

echo "Adding paths to your zsh and bash configs"

bash_config=".bash_profile"
zsh_config=".zshrc"
echo export VOLTA_HOME='$HOME/.volta' >> "$HOME/$bash_config"
echo export PATH='$VOLTA_HOME/bin:$PATH' >> "$HOME/$bash_config"
echo export VOLTA_HOME='$HOME/.volta' >> "$HOME/$zsh_config"
echo export PATH='$VOLTA_HOME/bin:$PATH' >> "$HOME/$zsh_config"

echo "Installing Nodejs v14.15.4"
volta install node@14.15.4
echo "Installing Yarn"
volta install yarn@1
if [ "$1" == '--no-fork' ]; then
    echo "You are ready to run and make changes to the cloud manager!"
    exit 1
elif [ "$1" == "" ]; then
    gh auth login
    gh repo fork https://github.com/linode/manager
    gh repo clone manager
    cd manager
    yarn
    echo "You are ready to run and make changes to the cloud manager!"
else
    echo "Unknown argument $1"
fi
