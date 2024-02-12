mkdir buildlibs
cd buildlibs

echo "=== INSTALL BABEL ==="
npm install --save @babel/standalone

cp node_modules/@babel/standalone/babel.min.js ../libs/
cd ..

curl -s https://cdn.tailwindcss.com/3.4.1 > libs/tailwind.js

#rm -rf buildlibs