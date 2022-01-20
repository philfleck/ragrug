docker rm $(docker ps -q -f status=exited -f "name=ragrug")
