docker rm -f sca-profile1
docker run \
    --restart=always \
    --net mca \
    --name sca-profile1 \
    -v `pwd`/config:/app/api/config \
    -v `pwd`/db:/db \
    -p 30080:80 \
    -p 38080:8080 \
    -d soichih/sca-profile

