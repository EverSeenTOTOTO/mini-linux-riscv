#!/usr/bin/env zx

const Cpus = Math.floor(os.cpus().length / 2);
const CrossCompiler = 'riscv64-unknown-linux-gnu-';
const BuildDir = path.join(__dirname, 'build');

if (!fs.existsSync(BuildDir)) {
  fs.mkdirSync(BuildDir);
  echo(`Created dir ${chalk.green(BuildDir)}`);
}

cd(BuildDir);

within(async () => {
  // install busybox

  const Busybox = 'busybox-1.35.0';
  const BusyboxUrl = `https://busybox.net/downloads/${Busybox}.tar.bz2`
  const BusyboxTarget = path.join(BuildDir, 'busybox');

  if (fs.existsSync(BusyboxTarget)) {
    await echo(`${chalk.green(BusyboxTarget)} already exists.`);
  } else {
    if (!fs.existsSync(Busybox)) {
      await $`wget ${BusyboxUrl}`;
      await $`tar -xvf ${Busybox}.tar.bz2`;
    }

    cd(Busybox);

    await $`make CROSS_COMPILE=${CrossCompiler} defconfig`;
    // await $`make CROSS_COMPILE=${CrossCompiler} menuconfig`;
    await $`make CROSS_COMPILE=${CrossCompiler} -j${Cpus}`;
    await $`cp busybox ${BusyboxTarget}`;
    await echo(`Copied busybox to ${chalk.green(BusyboxTarget)}`);
  }
}).then(() => {
  // install kernel

  within(async () => {
    const Kernel = 'linux-5.17.5';
    const KernelUrl = `https://cdn.kernel.org/pub/linux/kernel/v5.x/${Kernel}.tar.xz`;
    const KernelTarget = path.join(BuildDir, 'vmlinux');

    if (fs.existsSync(KernelTarget)) {
      await echo(`${chalk.green(KernelTarget)} already exists.`);
    } else {
      if (!fs.existsSync(Kernel)) {
        await $`wget ${KernelUrl}`;
        await $`tar -xvf ${Kernel}.tar.xz`;
      }

      cd(Kernel);

      await $`make ARCH=riscv CROSS_COMPILE=${CrossCompiler} defconfig`;
      await $`make ARCH=riscv CROSS_COMPILE=${CrossCompiler} -j${Cpus}`;
      await $`cp ${Kernel}/arch/riscv/boot/Image ${KernelTarget}`;
      await echo(`Copied vmlinux to ${chalk.green(KernelTarget)}`);
    }
  })
})
