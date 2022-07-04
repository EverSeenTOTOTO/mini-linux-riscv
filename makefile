.PHONY: clean
clean:
	@rm -rf build

.PHONY: prepare
prepare:
	zx install-third-party.js
	# zx mkfs.js
	cp -v build/busybox initramfs/bin
	cd initramfs && find . -print0 | cpio --null -ov --format=newc | gzip -9 > ../build/initramfs.cpio.gz && tree

.PHONY: start
start: prepare
	@qemu-system-riscv64 \
		-M virt \
		-kernel build/vmlinux \
		-nographic \
		-initrd build/initramfs.cpio.gz \
		-append "console=ttyS0,9600"
