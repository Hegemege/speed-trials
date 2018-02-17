npm run build-prod
cd server
npm run build-prod
cd ..
cp -R server/dist/. /var/www/speed-trials
rm -rf /var/www/speed-trials/static
cp -R dist/. /var/www/speed-trials/static
pm2 restart speedtrials

