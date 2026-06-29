#!/usr/bin/env bash
set -e

MOBILE_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Fixing babel.config.js..."
cat > "$MOBILE_DIR/babel.config.js" << 'EOF'
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
    ],
  };
};
EOF

echo "Fixing app.json..."
node - << 'JSEOF'
const fs = require("fs");
const path = require("path");
const file = path.join(__dirname, "app.json");
const cfg = JSON.parse(fs.readFileSync(file, "utf8"));
const expo = cfg.expo;

delete expo.icon;
delete expo.splash;

if (expo.android?.adaptiveIcon) {
  delete expo.android.adaptiveIcon.foregroundImage;
}

if (expo.web) {
  delete expo.web.favicon;
}

fs.writeFileSync(file, JSON.stringify(cfg, null, 2) + "\n");
console.log("app.json updated.");
JSEOF

echo ""
echo "Done. Now run:  yarn expo start --lan"
