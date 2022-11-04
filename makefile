.PHONY: clean
clean:
	@rm -rf build

.PHONY: prepare
prepare:
	zx fetch.js

# see https://fedorapeople.org/groups/risc-v/disk-images/readme.txt
.PHONY: start
start: prepare
	@qemu-system-riscv64 \
		-nographic \
		-M virt \
		-smp 4 \
    -m 2G \
		-kernel build/bbl \
		-object rng-random,filename=/dev/urandom,id=rng0 \
    -device virtio-rng-device,rng=rng0 \
    -append "console=ttyS0 ro root=/dev/vda" \
    -device virtio-blk-device,drive=hd0 \
    -drive file=build/stage4-disk.img,format=raw,id=hd0 \
    -device virtio-net-device,netdev=usernet \
    -netdev user,id=usernet,hostfwd=tcp::10000-:22
