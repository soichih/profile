tag=1.1.2

docker build -t soichih/profile ..
if [ ! $? -eq 0 ]; then
    echo "failed to build"
    exit
fi
docker tag soichih/profile soichih/profile:$tag
docker push soichih/profile:$tag
