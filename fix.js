const fs = require('fs');
let content = fs.readFileSync('src/controllers/userController.js', 'utf8');

content = content.replace(/user\.name = req\.body\.name \|\| user\.name;/g, 'user.fullName = req.body.fullName || user.fullName;');
content = content.replace(/name: updatedUser\.name,/g, 'fullName: updatedUser.fullName,');

content = content.replace(/if \(req\.body\.password\) \{\s*user\.password = req\.body\.password;\s*\}/g, `if (req.body.password) { user.password = req.body.password; }
    if (req.file) { user.profilePicture = \`/uploads/\${req.file.filename}\`; }`);

content = content.replace(/xp: updatedUser\.xp\s*\}\);/g, `xp: updatedUser.xp,
      profilePicture: updatedUser.profilePicture
    });`);

fs.writeFileSync('src/controllers/userController.js', content);
console.log('Fixed userController.js');
