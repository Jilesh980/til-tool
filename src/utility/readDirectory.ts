import path from "path";
import fs from "fs";

export function readDirectory(dirName: string) {
  try {
    let filesArray: string[] = [];
    fs.readdirSync(path.join(__dirname, dirName)).forEach((file: string) => {
      if (path.extname(file) == ".txt") {
        filesArray.push(file);
      }
    });
    return filesArray;
  } catch (err) {
    console.log(err);
    process.exit(-1);
  }
}
