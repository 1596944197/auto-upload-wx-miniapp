/* eslint-disable no-console */
import ci from 'miniprogram-ci';
import dotenv from 'dotenv';
import { spawn } from 'child_process';

dotenv.config();

const isBuildMode = process.argv[2] === 'build';
if (isBuildMode) {
  const child = spawn('yarn', ['build:mp-weixin'], { shell: true, cwd: '..' });

  child.stdout.on('data', (data) => {
    console.log(data.toString());
  });

  child.stderr.on('data', (error) => {
    console.error(error.toString());
  });

  child.on('error', (error) => {
    console.error(`执行出错: ${error}`);
  });

  child.on('close', async (code) => {
    if (code === 0) {
      start();
    } else {
      console.error(`子进程退出，退出码 ${code}`);
    }
  });
} else {
  start();
}

async function start() {
  try {
    const projectPath = process.env.PROJECT_PATH;
    const project = new ci.Project({
      appid: process.env.APPID,
      type: 'miniProgram',
      projectPath,
      privateKeyPath: process.env.PRIVATE_KEY_PATH,
      ignores: ['node_modules/**/*'],
    });
    const now = new Date(); // 获取当前时间
    const year = now.getFullYear().toString().substr(-2); // 获取年份后两位
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // 获取月份并补零
    const day = now.getDate().toString().padStart(2, '0'); // 获取日期并补零
    const hours = now.getHours().toString().padStart(2, '0'); // 获取小时并补零
    const minutes = now.getMinutes().toString().padStart(2, '0'); // 获取分钟并补零
    const seconds = now.getSeconds().toString().padStart(2, '0'); // 获取秒数并补零
    const version = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    const result = await ci.upload({
      robot: 1,
      version,
      project,
      desc: `ci自动上传${new Date().toLocaleDateString()}`,
      setting: {
        es6: true,
        es7: true,
        minify: true,
        ignoreUploadUnusedFiles: true,
      },
      // allowIgnoreUnusedFiles: true, 不可以加，加了报错
      onProgressUpdate: console.log,
    });
    console.log(result);
  } catch (error) {
    console.warn(error);
  }
}
