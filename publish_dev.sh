npm run build-dev
rm -rf server/app/public
cp -R dist/. server/app/public/
echo 'Next, execute npm run dev in server/'