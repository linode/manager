FROM node:8.11.0-wheezy

WORKDIR /src

COPY . .

RUN apt-get update
RUN apt-get install -y apt-transport-https ca-certificates
RUN curl -o- -L https://yarnpkg.com/install.sh | bash
RUN $HOME/.yarn/bin/yarn install

# Install Deps
RUN yarn

ENTRYPOINT ["yarn"]
