# Simple Chrome Extension Template
A simple Chrome Extension created using a template. This extension override's Chrome's new tab with a simple HTML page. This HTML page references a JS and CSS file. No node_modules, no dependencies, no automated CI/CD, no complexity. Everything is kept super basic. 

## What does this include? 
### Override Chrome's new tab
This extension will automatically override the new tab page. A single extension is limited to overriding only one of the three possible pages: `bookmarks`, `history` or `newtab`.

```json
"chrome_url_overrides" : {
    "newtab": "newtab.html"
},
```

Just delete the above block from the `manifest.json` file to remove the entry point of this functionality. If you want to remove all references to this code, you'll also have to delete the referenced file from this repo.

## Building and testing it locally
Follow [these instructions](https://superuser.com/a/247654) to install this extension locally. Use this folder as the folder containing the extensions code to load. Once installed, the extension will take effect and you should be able to spot all the changes.

## Design assets
This repo has boilerplate icons and images which you'd want to replace with something apt to the extension you're building. Duplicate my [Figma Chrome extension template](https://www.figma.com/community/file/1127061326249481158) to get started with your design requirements for your Chrome extension.

## Comprehensive Chrome extension template
For a more comprehensive template, visit [this GitHub repository](https://github.com/ClydeDz/chrome-extension-template).

## Credits
Developed by [Clyde D'Souza](https://clydedsouza.net/)