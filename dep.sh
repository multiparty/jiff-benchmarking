# python
sudo apt-get install python2.7

# node
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.0/install.sh | bash
. ~/.nvm/nvm.sh
nvm install 11

git clone https://github.com/multiparty/jiff-benchmarking.git
cd jiff-benchmarking

npm install
# ./script.sh <parties> <replicas> <IP> <computation ID>
