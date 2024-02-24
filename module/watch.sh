trap 'kill %1; kill %2' SIGINT SIGHUP SIGQUIT SIGTERM
npx webpack --watch --config webpack.dev.js &  npx webpack --watch --config webpack.cjs-dev.js & npx tsc --watch -p tsconfig.json 
