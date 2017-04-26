module.exports = {"name":"Kernels","sort":3,"base_path":"/linode/kernels","description":"Kernel endpoints provide a means of viewing <a href=\"#object-kernel\"> kernel objects</a>.\n","endpoints":[{"type":"list","resource":"kernels","description":"Returns collection of kernels.\n","methods":[{"description":"Returns list of <a href=\"#object-kernel\">kernels</a>.\n","examples":[{"name":"curl","value":"curl https://$api_root/$version/linode/kernels\n"},{"name":"python","value":"import kernels\nTODO\n"}],"name":"GET","resource":{"name":"Kernel","prefix":"krnl","description":"Kernel objects describe a Linux kernel that can be booted on a Linode. Some special kernels are available that have special behavior, such as \"Direct Disk\", which will boot your disk directly instead of supplying a kernel directly to the hypervisor. The latest kernels are \"linode/latest_64\" (64 bit) and \"linode/latest\" (32bit).\n","schema":[{"name":"id","type":"string","value":"linode/3.5.2-x86_64-linode26"},{"name":"description","description":"Additional, descriptive text about the kernel.","type":"string","value":"null"},{"name":"xen","description":"If this kernel is suitable for Xen Linodes.","type":"boolean","value":false},{"name":"kvm","description":"If this kernel is suitable for KVM Linodes.","type":"boolean","value":true},{"name":"label","description":"The friendly name of this kernel.","type":"string","value":"3.5.2-x86_64-linode26"},{"name":"version","description":"Linux Kernel version.","type":"string","value":"3.5.2"},{"name":"x64","description":"True if this is a 64-bit kernel, false for 32-bit.","type":"boolean","value":true},{"name":"current","type":"boolean","value":true},{"name":"deprecated","type":"boolean","value":false},{"name":"latest","type":"boolean","value":true}],"endpoints":null,"methods":null}}],"endpoints":null,"path":"linode/kernels"},{"type":"resource","resource":"kernels","description":"Returns information about a specific kernel.\n","methods":[{"description":"Returns information about this <a href=\"#object-kernel\">kernel</a>.\n","examples":[{"name":"curl","value":"curl https://$api_root/$version/linode/kernels/$kernel_id\n"},{"name":"python","value":"import kernels\nTODO\n"}],"name":"GET","resource":{"name":"Kernel","prefix":"krnl","description":"Kernel objects describe a Linux kernel that can be booted on a Linode. Some special kernels are available that have special behavior, such as \"Direct Disk\", which will boot your disk directly instead of supplying a kernel directly to the hypervisor. The latest kernels are \"linode/latest_64\" (64 bit) and \"linode/latest\" (32bit).\n","schema":[{"name":"0"},{"name":"1"},{"name":"2"},{"name":"3"},{"name":"4"},{"name":"5"},{"name":"6"},{"name":"7"},{"name":"8"},{"name":"9"}],"endpoints":null,"methods":null}}],"endpoints":null,"path":"linode/kernels/:id"}],"basePath":"/linode/kernels","methods":null};