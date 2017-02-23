docker build -t soichih/sca-profile ..
if [ ! $? -eq 0 ]; then
    echo "failed to build"
    exit
fi
docker tag soichih/sca-profile soichih/sca-profile:1.0.0
docker push soichih/sca-profile
