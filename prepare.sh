mkdir buildlibs
cd buildlibs

echo "=== INSTALL BABEL ==="
npm install --save @babel/standalone

cp node_modules/@babel/standalone/babel.min.js ../libs/
cd ..

rm -rf buildlibs