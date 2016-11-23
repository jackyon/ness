#!/usr/bin/env node
import fs from "fs";
import chokidar from "chokidar";
import recursive from "recursive-readdir";
import minimatch from "minimatch";
const exec = require("child_process").exec;
const cwd = process.cwd();
const optionsPath = __dirname + "/setting.json";
const argv = require("yargs")
	.usage("用法: ness [--use|-u] plugin")
	.alias("u", "use")
	.describe("u", "postcss 插件名称 (可以多个插件一起使用)")
	.version(() => {
		return [
			"版本号",
			require("./node_modules/ness/package.json").version
		].join(" ");
	})
	.alias("v", "version")
	.describe("v", "显示版本")
	.help("h")
	.alias("h", "help")
	.describe("h", "显示帮助")
	.check((argv) => {
		if (!argv.u && getOptions().length === 0) {
			// console.log("请带参数")
			throw "首次运行需要设置plugin name, 请带参数, 如: ness -u xxx 或 ness --use xxx";
		}
		return true;
	})
	.argv;
const argvU = argv.u;
let options, postcssExecPlugin;


/*
 获得默认setting参数
 */
function getOptions() {
	const buffer = fs.readFileSync(optionsPath);
	options = JSON.parse(buffer.toString());
	return options;
};


/*
 设置参数并且保存至配置文件
 */
function setOption(param, value) {
	const writeData = JSON.stringify({[param]: value}, null, 2);
	fs.writeFileSync(optionsPath, writeData);
};


/*
 检查是否有多个plugin参数
 */
function isMultiplePlugin(argv) {
	const movePostcssImportToFirst = (argv) => {
		argv.map((plugin, index) => {
			if (plugin === "postcss-import") {
				if (index !== 0) {
					argv.splice(-1, 1);
					argv.unshift("postcss-import");
				}
			}
		})
	}

	movePostcssImportToFirst(argv);

	if (Array.isArray(argv)) {
		let tempString = "postcss";
		argv.map(plugin => {
			tempString += ` -w -u ${plugin}`
		})
		postcssExecPlugin = tempString;
	} else {
		postcssExecPlugin = `postcss -w -u ${argv}`
	}
}


/*
 检查是否带有argv参数，没有的话从setting.json里头获取默认参数
 */
if (argvU) {
	setOption("plugin", argvU);
	isMultiplePlugin(argvU);
} else {
	const plugins = getOptions().plugin
	isMultiplePlugin(plugins)
}


/*
 监听文件变动
 */
const watcher = chokidar.watch('.', {ignored: /[\/\\]\./});
watcher.on('change', (path) => {
	if (path.split(".").pop() === "ness") {
		checkImports(path);

		//如果是根目录ness文件，不生成wxss文件
		if (!path.includes("/")) return;

		generateWxss(path);
	}
});


/*
 检查是否引用了其它ness
 */
function generateWxss(filePath) {
	const pathSplitArray = filePath.split("/"),
		  targetName = pathSplitArray.pop().split(".")[0],
		  targetPath = pathSplitArray.slice(0, -1).join("/"),
		  outputPath = `${targetPath}/${targetName}/${targetName}.wxss`;

	exec(`${postcssExecPlugin} -o ${outputPath} ${filePath}`, (error, stdout, stderr) => {
		if (error) {
			console.error(`exec error: ${error}`);
			return;
		}
	});
}


/*
 检查是否引用了其它ness
 */
function checkImports(filename) {
	recursive(
		cwd, 
		[
			"node_modules", 
			".*",
			"*.wxml",
			"*.json",
			"*.scss",
			"*.wxss",
			"*.js",
			"*.jpg",
			"*.md",
			"*.png"
		], 
		function (err, files) {
			files = files.filter(minimatch.filter("*.ness", {matchBase: true}))
			files.map(filePath => {
				const fileContent = fs.readFileSync(filePath).toString();
				//检查ness中是否有引用filename, 有的话重新生成wxss
				if (fileContent.includes(filename)) {
					generateWxss(filePath)
				}
			})
		}
	);
}
