.PHONY: clean
clean:
	@rm -rf build

.PHONY: prepare
prepare:
	zx install-third-party.js
	zx mkfs.js

.PHONY: start
start: prepare
	@qemu-system-riscv64 \
		-M virt \
		-kernel build/vmlinux \
		-nographic \
		-drive file=build/rootfs.img,format=raw,id=hd0 \
		-device virtio-blk-device,drive=hd0 \
		-append "root=/dev/vda rw console=ttyS0,9600"
