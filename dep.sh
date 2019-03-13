#!/bin/bash

# install python
sudo apt-get -y install python2.7

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
npm install
# ./script.sh <parties> <replicas> <IP> <computation ID> &

# for server do:
# screen
# <enter>
# node server > out
# ...
# ...
# Ctrl-A then Ctrl-D to detach screen
# Ctrl-D to exist ssh
