#!/usr/bin/env zx

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
    await $`dd if=/dev/zero of=${RootImg} bs=1M count=128`;
    await $`mkfs.ext4 -F ${RootImg}`;
    await echo(`Created root fs ${chalk.green(RootImg)}`);

    await $`sudo mount -o loop ${RootImg} ${MountDir}`;

    cd(MountDir);

    await $`sudo mkdir -p bin etc dev lib proc sbin tmp usr usr/bin usr/lib usr/sbin`;
    await $`sudo cp ${BusyboxTarget} bin`;
    await $`sudo file bin/busybox`;
    await $`sudo ln -s ../bin/busybox sbin/init`;
    await $`sudo ln -s ../bin/busybox bin/sh`;
    await $`sudo tree`;

    // init 
    await $`sudo mkdir etc/init.d`;
    await $`sudo cp ${InitScript} etc/init.d/rcS`;
    await $`sudo chmod +x etc/init.d/rcS`;

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
