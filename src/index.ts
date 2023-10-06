import { Command } from "commander";
import myInfo from "../package.json";
import { syncReadFile } from "./utility/readFile";
import { htmlCreator } from "./utility/writeFile";
import { readDirectory } from "./utility/readDirectory";
import path from "path";
import fs from "fs";
const program = new Command();
import toml from "toml";

// Command line inter face to use options
program
  .name("ts-node src/index.ts")
  .usage("<fileName/dirName> -o output <dirname> -s <stylesheetURL>");

program.version(
  myInfo.name + " " + myInfo.version,
  "-v, --version",
  "outputs the current version"
);
program.argument("<fileName/dirName>", "converts file to html");
program.option("-l, --lang <language>", "indicates the language to use");
program.option("-o, --output <dirName>", "creates a specified directory");
program.option("-s, --stylesheet <stylesheetURL>", "sets a stylesheet to HTML");
program.option("-c, --config <configFile>", "path to TOML-based config file"); // adding this line for config file
const options = program.opts();
program.parse(process.argv);
const arg = program.args[0];
const configFile = options.config;
// Function to handle errors and exit with a message
function handleError(message: string) {
  console.error(message);
  process.exit(-1);
}

try {
  const configData = fs.readFileSync(configFile, "utf8");
  const config = toml.parse(configData);

  // Handle errors properly by checking the type of 'error'
  if (typeof Error === 'object' && Error !== null && 'message' in Error) {
    handleError(`Error reading or parsing config file: ${(Error as Error).message}`);
  } else {
    handleError(`Error reading or parsing config file: ${Error}`);
  }
} catch (error) {
  handleError(`Error reading or parsing config file: ${error}`);
}

// Validate options and handle defaults
//const langValue = options.lang || ""; // Use default if not provided
//const outputValue = options.output || "til"; // Use "til" as the default directory
//const styleValue = options.stylesheet || ""; // Use default if not provided

const langValue = program.opts().lang;
const outputValue = program.opts().output;
const styleValue = program.opts().stylesheet;

const fileExt = arg.substring(arg.lastIndexOf("."));
if (fs.existsSync(arg)) {
  {
    fs.rmSync(path.join(__dirname, `../til`), { recursive: true, force: true });
    fs.mkdirSync(path.join(__dirname, `../til`));

    // a single .txt file is used as an input
    if (fileExt === ".txt") {
      const filename = path.parse(arg).name;

      // if option -s is selected
      if (options.stylesheet) {
        fs.writeFileSync(
          path.join(__dirname, `../til/${filename}.html`),
          htmlCreator(
            syncReadFile(path.join("../../", arg)),
            filename,
            styleValue,
            ""
          )
        );
        // if option -l is selected
      } else if (options.lang) {
        fs.writeFileSync(
          path.join(__dirname, `../til/${filename}.html`),
          htmlCreator(
            syncReadFile(path.join("../../", arg)),
            filename,
            "",
            langValue
          )
        );
      } else {
        fs.writeFileSync(
          path.join(__dirname, `../til/${filename}.html`),
          htmlCreator(syncReadFile(path.join("../../", arg)), filename, "", "")
        );
      }
    }
    // a directory is used as an input
    else if (!arg.includes(".")) {
      const filesArray = readDirectory(path.join("../../", arg));

      if (options.stylesheet) {
        for (let i = 0; i < filesArray.length; i++) {
          const filename = path.parse(filesArray[i]).name;
          fs.writeFileSync(
            path.join(__dirname, `../til/${filename}.html`),
            htmlCreator(
              syncReadFile(path.join("../../", arg, filesArray[i])),
              filename,
              styleValue,
              ""
            )
          );
        }
      } else if (options.lang) {
        for (let i = 0; i < filesArray.length; i++) {
          const filename = path.parse(filesArray[i]).name;
          fs.writeFileSync(
            path.join(__dirname, `../til/${filename}.html`),
            htmlCreator(
              syncReadFile(path.join("../../", arg, filesArray[i])),
              filename,
              "",
              langValue
            )
          );
        }
      } else {
        for (let i = 0; i < filesArray.length; i++) {
          const filename = path.parse(filesArray[i]).name;
          fs.writeFileSync(
            path.join(__dirname, `../til/${filename}.html`),
            htmlCreator(
              syncReadFile(path.join("../../", arg, filesArray[i])),
              filename,
              "",
              ""
            )
          );
        }
      }
    } else {
      console.log("Invalid fileName/dirName");
      process.exit(-1);
    }
  }
  // options is output, overwrite the file/dir above
  if (options.output) {
    // remove the existing dir and til directory
    fs.rmSync(path.join(__dirname, `../til`), { recursive: true, force: true });
    fs.rmSync(path.join(__dirname, `../${outputValue}`), {
      recursive: true,
      force: true,
    });
    fs.mkdirSync(path.join(__dirname, `../${outputValue}`));

    // a single .txt file is used as an input
    if (fileExt === ".txt") {
      const filename = path.parse(arg).name;
      fs.writeFileSync(
        path.join(__dirname, `../${outputValue}/${filename}.html`),
        htmlCreator(syncReadFile(path.join("../../", arg)), filename)
      );
    }
    // a directory is used as an input
    else {
      const filesArray = readDirectory(path.join("../../", arg));
      for (let i = 0; i < filesArray.length; i++) {
        const filename = path.parse(filesArray[i]).name;
        fs.writeFileSync(
          path.join(__dirname, `../${outputValue}/${filename}.html`),
          htmlCreator(
            syncReadFile(path.join("../../", arg, filesArray[i])),
            filename
          )
        );
      }
    }
  }
  process.exit(0);
} else {
  console.log("Please type valid fileName/dirName");
  process.exit(-1);
}
