#!/bin/bash
export HOME="/root"
cd ~

# install python
apt-get -y install python2.7

# install node
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.0/install.sh | bash
. .nvm/nvm.sh
nvm install 11

# clone repo
git clone https://github.com/multiparty/jiff-benchmarking.git
cd jiff-benchmarking
git submodule init
git submodule update

# configure repo
npm install --unsafe-perm
#

# for clients:
#   if just one client per machine (one core)
#     ./script.sh <parties> <replicas> <IP> <computation ID> > out &
#
#   if running several clients per machines (multi-cores):
#     ./script.sh <parties> <replicas> <IP> <computation ID> > out1 &
#     sleep 10
#     ./script.sh <parties> <replicas> <IP> <computation ID> > out2 &
#     sleep 10
#     ./script.sh <parties> <replicas> <IP> <computation ID> > out3 &
#     sleep 10
#     ./script.sh <parties> <replicas> <IP> <computation ID> > out4 &

# for server do:
# screen
# <enter>
# node server > out
# ...
# ...
# Ctrl-A then Ctrl-D to detach screen
# Ctrl-D to exist ssh

# node --max-old-space-size=8192 server.js > out
