echo "starting server"
nohup yarn workspace linode-manager start&
echo "sleeping 60sec"
sleep 60
yarn cy:e2e


