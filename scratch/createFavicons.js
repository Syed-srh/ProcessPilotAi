const fs = require('fs');
const path = require('path');

// Standard crisp PNG binary payload for 32x32 dark brand icon
const pngBase64 = `iVBORw0KGgoAAAANSU56GgoAAAANSU5EUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABWSURBVFhH7c1BDQAwDASh+zd9V8gogW1m7u3d977v2y2BAQEDAgYEDAgYEBAwIGBAwIGAAQEDAgYEDAgYEBAwIGBAQMCAgAEBAwIGBAQMCBgQMCBgQMBwANcBBW+wYd4AAAAASUVORK5CYII=`;
const buffer = Buffer.from(pngBase64, 'base64');

const publicDir = path.resolve(__dirname, '../../client/public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), buffer);
fs.writeFileSync(path.join(publicDir, 'favicon-16x16.png'), buffer);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), buffer);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), buffer);

console.log('Favicon files written to client/public successfully.');
