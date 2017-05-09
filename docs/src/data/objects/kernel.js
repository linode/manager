module.exports = {"name":"Kernel","prefix":"krnl","description":"Kernel objects describe a Linux kernel that can be booted on a Linode. Some special kernels are available that have special behavior, such as \"Direct Disk\", which will boot your disk directly instead of supplying a kernel directly to the hypervisor. The latest kernels are \"linode/latest_64\" (64 bit) and \"linode/latest\" (32bit).\n","schema":{"id":{"_type":"string","_value":"linode/3.5.2-x86_64-linode26"},"description":{"_type":"string","_value":"null","_description":"Additional, descriptive text about the kernel."},"xen":{"_type":"boolean","_value":false,"_description":"If this kernel is suitable for Xen Linodes.","_filterable":true},"kvm":{"_type":"boolean","_value":true,"_description":"If this kernel is suitable for KVM Linodes.","_filterable":true},"label":{"_type":"string","_value":"3.5.2-x86_64-linode26","_description":"The friendly name of this kernel.","_filterable":true},"version":{"_type":"string","_value":"3.5.2","_description":"Linux Kernel version.","_filterable":true},"x64":{"_type":"boolean","_value":true,"_description":"True if this is a 64-bit kernel, false for 32-bit.","_filterable":true},"current":{"_type":"boolean","_value":true,"_filterable":true},"deprecated":{"_type":"boolean","_value":false,"_filterable":true},"latest":{"_type":"boolean","_value":true}}};