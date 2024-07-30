const { exec } = require('child_process');
const os = require('os');
const path = require('path');

// Function to remove all files in a directory using OS-specific commands
const removeAllFilesInDirectory = (directoryPath) => {
  return new Promise((resolve, reject) => {
    // Determine the command based on the operating system
    const platform = os.platform();
    let command;

    if (platform === 'win32') {
      // Windows command to delete all files in a directory
      command = `del /Q /F ${path.join(directoryPath, '*')}`;
    } else {
      // Unix-based command to delete all files in a directory
      command = `rm -rf ${path.join(directoryPath, '*')}`;
    }

    // Execute the command
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error.message}`);
        // reject(error);
      } else {
        console.log(`Command executed successfully: ${stdout}`);
        resolve();
      }
    });
  });
};



// Middleware to clear images directory
const emptyImagesDirectory = async (req, res, next) => {
  try {
    const directoryPath = path.join(__dirname, '../public/images/');

    // First, delete files in the root of images directory
    await removeAllFilesInDirectory(directoryPath);

    // Then, delete files in /blogs and /products directories
    await removeAllFilesInDirectory(directoryPath+'/products/');
    await removeAllFilesInDirectory(directoryPath+'/blogs/');


    next();
  } catch (error) {
    // res.status(500).json({ message: 'Error clearing images directory' });
    console.log(error.message)
  }
};

module.exports = emptyImagesDirectory;
