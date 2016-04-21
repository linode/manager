FROM debian:jessie-backports
MAINTAINER Linode Developers <developers@linode.com>

VOLUME ["/target"]

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update
RUN apt-get -y install apt-utils
RUN apt-get -y install build-essential libffi-dev libssl-dev libmysqlclient-dev python3-all python3-pip python3-virtualenv python3-setuptools devscripts dh-exec dh-systemd git python3-cffi python3-cryptography python3-ply python3-pycparser python3-coverage python3-nose libpython3-dev cython fakeroot ruby-sass
RUN apt-get -y install python-all python-pip python-virtualenv python-setuptools libpython-dev
RUN apt-get clean

# The lines above match the deb/ Dockerfile -- leaving them matching is a good thing, we could extend later. 
# in the meanwhile the matching instructions create an image docker will reuse - taking less space.

RUN curl -sL https://deb.nodesource.com/setup_5.x | bash -

RUN apt-get update && \
    apt-get -y install \
        nodejs \
    && apt-get clean

ENV HOME /tmp

WORKDIR /target

RUN useradd -ms /bin/bash apinext

ENTRYPOINT [".jenkins/prbuilder/build.sh"]
