#!/usr/bin/env zx

async function download(name) {
  const target = path.join('build', name);
  
  if(fs.existsSync(target)) {
    await echo(`${chalk.green(name)} already exists.`);
  } else {
    await $`wget https://fedorapeople.org/groups/risc-v/disk-images/${name}`;

    if (/\.xz$/.test(name)) {
      await $`unxz ${name}`;
      name = name.replace(/\.xz$/g, '');
    }

    await $`mv ${name} build/${name}`;
  }
}

within(() => {
  return Promise.all([
    download('bbl'),
    download('stage4-disk.img.xz')
  ]);
});
