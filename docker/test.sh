docker rm -f sca-profile1
id=$(docker run \
    --restart=always \
    --net mca \
    --name sca-profile1 \
    -v `pwd`/config:/app/api/config \
    -v `pwd`/db:/db \
    -p 20380:80 \
    -p 28380:8080 \
    -d soichih/sca-profile)
docker logs -f $id
