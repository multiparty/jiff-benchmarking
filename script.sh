PARTIES="$1"
REPLICAS="$2"
IP="$3"
COMPUTATION_ID="$4"

cd parties

echo "{" > ./config.json
echo "\"hostname\": \"http://$IP:8080\"," >> ./config.json
echo "\"parties\": $PARTIES," >> ./config.json
echo "\"replicas\": $REPLICAS," >> ./config.json
echo "\"domains\": [1, 5]," >> ./config.json
echo "\"products\": [5, 1]" >> ./config.json
echo "}" >> ./config.json

node party.js $COMPUTATION_ID
