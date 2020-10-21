# base image
FROM debian:buster
RUN sed -i s@/deb.debian.org/@/mirrors.aliyun.com/@g /etc/apt/sources.list
RUN apt-get update

# install nodejs
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get install -y nodejs npm

# setup repo
RUN mkdir -p /code
ADD . /code
WORKDIR /code
RUN npm install

CMD node authd.js
