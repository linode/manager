FROM node:8.11.2-stretch

WORKDIR /src

RUN apt-get update
RUN apt-get install -y apt-transport-https ca-certificates
RUN curl -o- -L https://yarnpkg.com/install.sh | bash
RUN $HOME/.yarn/bin/yarn install

COPY . .

# Install Deps
RUN yarn

ENTRYPOINT ["yarn"]
