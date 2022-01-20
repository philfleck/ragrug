#FROM jenkins/jenkins:latest
#FROM ubuntu:18.04
#FROM ubuntu:bionic
FROM ubuntu:20.04
ENV TZ=Europe/Brussels

EXPOSE 443
EXPOSE 80
EXPOSE 1880

MAINTAINER RagRug

RUN mkdir -p /nrm/node_modules
RUN mkdir /runtime
WORKDIR /runtime

ENV TERM=xterm
ENV HOME /root

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN apt-get update -y && \
apt-get install -y \
apt-transport-https \
software-properties-common \
wget \
htop \
nano \
rsync \
build-essential \
python \
npm \
&& \
apt-get update

RUN npm install -g --unsafe-perm node-red
RUN npm install --prefix /nrm \
flat \
node-red-contrib-flat \
node-red-dashboard \
node-red-contrib-python-function \
node-red-contrib-influxdb \
node-red-contrib-cloudantplus \
node-red-contrib-md5 \
node-red-node-ui-table \
node-red-contrib-ui-upload \
node-red-contrib-re-postgres \
node-red-contrib-file-upload



COPY boot.sh /runtime
RUN chmod +x boot.sh

#ENTRYPOINT ["./boot.sh"]
CMD ["./boot.sh"]




#### DUMP
# grafana
#RUN wget -q -O - https://packages.grafana.com/gpg.key | apt-key add -
#RUN add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
#RUN apt-get install -y \
#grafana

# other stuff
#RUN apt-get install -y python python-pip
#RUN npm install -g nodemon
#RUN npm config set registry https://registry.npmjs.org
#COPY package.json /app/package.json
#RUN npm install \
# && mv /app/node_modules /node_modules
