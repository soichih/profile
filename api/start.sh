#DEBUG=profile:* env=dev PORT=12402 nodemon -i node_modules ./index.js

pm2 delete sca-profile
pm2 start profile.js --name sca-profile --watch --ignore-watch="\.log$ \.sh$"
pm2 save
