#!/usr/bin/env zx

const RemoteImg = 'archriscv-20220727.tar.zst'; // NJU mirror
const InitScript = path.join(__dirname, 'init');
const BusyboxTarget = path.join(__dirname, 'build/busybox');
const RootImg = path.join(__dirname, 'build/rootfs.img');
const ELF = path.join(__dirname, 'build/main.out');
const MountDir = '/mnt/mini';

if (!fs.existsSync(MountDir)) {
  fs.mkdirSync(MountDir);
  echo(`Created dir ${chalk.green(MountDir)}`);
}

within(async () => {
  if (!fs.existsSync(RootImg)) {
    await $`dd if=/dev/zero of=${RootImg} bs=1G count=1`;
    await $`mkfs.ext4 -F ${RootImg}`;
    await echo(`Created root fs ${chalk.green(RootImg)}`);

    await $`sudo mount -o loop ${RootImg} ${MountDir}`;

    cd(MountDir);

    const RemoteImgUrl = `https://mirror.nju.edu.cn/archriscv/images/${RemoteImg}`

    await $`sudo wget ${RemoteImgUrl}`;
    await $`sudo tar -xvf ${RemoteImg}`;
    await $`sudo rm -rf ${RemoteImg}`;

    if (fs.existsSync(ELF)) {
      await $`sudo cp ${ELF} .`;
    }

    cd("..");

    await $`sudo umount ${MountDir}`;
    await echo(`Built ${chalk.green(RootImg)}`);
  } else {
    await echo(`${chalk.green(RootImg)} already exists.`);
  }
})
