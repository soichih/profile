docker run \
    --name sca-profile1 \
    -v `pwd`/config:/app/api/config \
    -v `pwd`/db:/db \
    --rm -it soichih/sca-profile
