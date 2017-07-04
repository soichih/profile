
pm2 delete profile
pm2 start api/profile.js --name profile --watch --ignore-watch="\.log$ \.sh$ ui"
pm2 save
