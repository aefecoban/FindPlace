const fs = require("fs-extra");
const { exec } = require("child_process");

function Compile(){
    exec("tsc", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        copyFiles();
    })
}

function copyFiles(){
    fs.copy('./src', './dist', {
        filter: (src, dest) => {
            if(!src.endsWith(".ts")) return src;
        },
        preserveTimestamps : true,
        dereference : true,
        overwrite : true,
        errorOnExist : false
    })
    .then(() => {
        console.log('JS files copied successfully.');
    })
    .catch(err => {
        console.error('Error copying JS files: ', err);
    });
}

Compile();