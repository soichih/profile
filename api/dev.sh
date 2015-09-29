#DEBUG=profile:* env=dev PORT=12402 nodemon -i node_modules ./index.js

pm2 delete profile
pm2 start profile.js --watch --ignore-watch="\.log$ \.sh$"

pm2 logs profile
