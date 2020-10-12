FROM freesurfer/freesurfer:7.1.1
COPY license.txt /usr/local/freesurfer/.license

RUN curl -sL https://rpm.nodesource.com/setup_14.x | bash -
RUN yum install -y nodejs

WORKDIR /freesurferweb
COPY server freesurferweb/server
COPY src freesurferweb/src
COPY package*.json freesurferweb/
COPY webpack*.js freesurferweb/

RUN cd freesurferweb && npm i