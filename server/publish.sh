#!/bin/bash

npm run build-prod

sudo cp dist/api.js /var/www/speedtrials_api/speedtrials_api.js

pm2 restart speedtrials_api