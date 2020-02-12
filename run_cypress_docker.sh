# COMMIT=$(git rev-parse --short --verify HEAD)
# # TAG="cloudci/$COMMIT"
# NAME="cloudci_e2e_$COMMIT"
# # echo "Building image tag $TAG"
# # docker build -f Dockerfile-e2e -t $TAG .
# # echo "Starting Server in container: $NAME"
# # echo "docker run --rm --name $NAME $TAG yarn workspace linode-manager start"
# # $(docker run --rm --name $NAME $TAG yarn workspace linode-manager start)&

# # echo "Sleeping for 60 sec"
# # sleep 60
# # echo "Starting e2e"
# # docker exec $NAME yarn cy:e2e
# # echo "stopping"
# # docker stop $NAME

# docker run --rm -v $(pwd):/home/node/app -w /home/node/app node:10-alpine yarn install:all
# docker run --rm -v $(pwd):/home/node/app -w /home/node/app node:10-alpine yarn workspace linode-js-sdk-build
# docker run --rm --name $NAME -v $(pwd):/home/node/app -w /home/node/app node:10-alpine yarn workspace linode-manager start
# docker run --rm -v $(pwd):/home/node/app -w /home/node/app/packages/manager cypress/included:4.0.1

echo "starting server"
nohup yarn workspace linode-manager start&
echo "sleeping 60sec"
sleep 60
yarn cy:e2e


