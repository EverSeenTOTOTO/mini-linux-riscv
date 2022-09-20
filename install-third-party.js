#!/usr/bin/env zx

const Cpus = Math.floor(os.cpus().length / 2);
const CrossCompiler = 'riscv64-unknown-linux-gnu-';
const BuildDir = path.join(__dirname, 'build');

if (!fs.existsSync(BuildDir)) {
  fs.mkdirSync(BuildDir);
  echo(`Created dir ${chalk.green(BuildDir)}`);
}

cd(BuildDir);

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
    await $`cp build/${Kernel}/arch/riscv/boot/Image ${KernelTarget}`;
    await echo(`Copied vmlinux to ${chalk.green(KernelTarget)}`);
  }
})
