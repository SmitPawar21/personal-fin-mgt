const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'src', 'routes');
const files = fs.readdirSync(dir);

for (const file of files) {
  if (file.endsWith('.js') && file !== 'healthRoutes.js' && file !== 'authRoutes.js') {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/const \{ verifyToken \} = require\('\.\.\/middlewares\/authMiddleware'\);/g, "const verifyToken = require('../middlewares/authMiddleware');");
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
}
