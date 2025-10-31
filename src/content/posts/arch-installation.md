---
title: 全盘加密安装 Arch Linux
description: 使用 LUKS+LVM
published: 2025-07-04
tags: [Arch Linux, 安全]
category: GNU/Linux
---
>本文参考 Arch Linux 中文维基中的 [安装指南](https://wiki.archlinuxcn.org/wiki/安装指南) 和 [dm-crypt/加密整个系统](https://wiki.archlinuxcn.org/wiki/Dm-crypt/加密整个系统)   
>以及 Bilibili UP主 [unixchad](https://space.bilibili.com/34569411) 的视频 [全盘加密安装Arch Linux的一切（困难模式）](https://www.bilibili.com/video/BV1DTT2zSE5R/) 编写

>本文不适合双系统用户，打算安装双系统的用户请**不要**参照本文

之前安装的时候没做记录，刚好现在把笔记本系统也给重装一下，顺便做个记录
## 为什么要加密？
这个嘛……就我个人认为，数据安全是一个非常重要的事，每个人都有保护好自己个人数据安全的义务

当然，如果你要说“我又不干什么亏心事，怕什么隐私泄露”，那我只能说：我嘴笨，说不过你，但是我觉得保护自己的数据安全是很重要的
## 安装前的准备
### 获取安装镜像
第一件事当然是下载准备一个 Arch Linux 的 ISO 镜像，在 [官网](https://archlinux.org/download/) 找到`BitTorrent Download (recommended)`下的链接使用你的 Torrent 下载器下载，你也可以选择从 [清华大学镜像站](https://mirrors.tuna.tsinghua.edu.cn/archlinux/iso/latest/) 或 [中科大镜像站](https://mirrors.ustc.edu.cn/archlinux/iso/latest/) 下载，下载`archlinux-20XX.0X.01-x86_64.iso`即可

如果从镜像站下载的话建议验证一下哈希，使用
```console
$ sha256sum /path/to/archlinux-20XX.0X.01-x86_64.iso
```
获取 sha256 的值，并与镜像站中的`sha256sums.txt`内的值对比，如果不一致，可以选择删掉重下或尝试换一个镜像站下载
### 写入安装镜像
当准备好安装镜像之后我们就需要把它写入一个启动介质，比如一个 U 盘

使用你的方法把安装镜像写入 U 盘，我个人会选择使用 [Ventoy](https://www.ventoy.net/cn/)
## 安装基本系统
> [!WARNING]
> 请注意，接下来的操作会清空你的硬盘，请务必做好重要文件备份！
### 从安装介质启动
将你的安装介质插入你要安装 Arch Linux 的电脑，并选择从安装介质启动

在此之前，你可能需要先关闭安全启动，关闭方法每个品牌或型号的主板都可能会有差异，在此不做赘述

启动后选择第一项回车进入
```
Arch Linux install medium (x86_64, UEFI)
```
稍微等待一会，你会看到一个类似这样的界面：
```ansi
Arch Linux 6.15.4-arch2-1 (tty1)

archiso login: root (automatic login)

To install [36mArch Linux[0m follow the installation guide:
https://wiki.archlinux.org/title/Installation_guide

For Wi-Fi, authenticate to the wireless network using the [35miwctl[0m utility.
For mobile broadband (WWAN) modems, connect with the [35mmmcli[0m utility.
Ethernet, WLAN and WWAN interfaces using DHCP should work automatically.

After connecting to the internet, the installation guide can be accessed
via the convenience script [35mInstallation_guide[0m.

                                          
[31mroot[0m@archiso [34m~[0m # 
```
这就算启动成功了
### 连网
> [!NOTE]
>如果你是使用网线连接或者手机 USB 网络共享，那你可以直接跳到[验证网络连接](#验证网络连接)

我们使用 [iwd](https://wiki.archlinuxcn.org/wiki/Iwd) 来连接无线网络

输入`iwctl`进入如下界面
```ansi
[31mroot[0m@archiso [34m~[0m # iwctl
NetworkConfigurationEnabled: disabled
StateDirectory: /var/lib/iwd
Version: 3.9
[32m[iwd][0m# 
```
输入`device list`来获取网卡信息
```ansi
[32m[iwd][0m# device list
                                    Devices                                   [30m*
--------------------------------------------------------------------------------
  Name                  Address               Powered     Adapter     Mode      
--------------------------------------------------------------------------------[0m
  wlan0                 XX:XX:XX:XX:XX:XX     on          phy0        station     

[32m[iwd][0m# 
```
此处的`wlan0`就是无线网卡，你的可能会有所不同，记住它  

接着输入`station wlan0 scan`来扫描附近的网络，记得把`wlan0`替换为你的网卡名称，这一步不会输出任何信息

如果你不知道你要连接的 WiFi 名称，可以通过输入`station wlan0 get-networks`来列出附近的 WiFi

最后，输入`station wlan0 connect 网络名称`来连接网络，如果有密码，会让你输入密码

联网完成后输入`exit`退出 iwd
### 验证网络连接
使用 ping 来检测是否已经连上网络
```ansi
[31mroot[0m@archiso [34m~[0m # ping -c 3 archlinux.org
PING archlinux.org (95.217.163.246) 56(84) bytes of data.
64 bytes from archlinux.org (95.217.163.246): icmp_seq=1 ttl=50 time=201 ms
64 bytes from archlinux.org (95.217.163.246): icmp_seq=2 ttl=50 time=205 ms
64 bytes from archlinux.org (95.217.163.246): icmp_seq=3 ttl=50 time=199 ms

--- archlinux.org ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2002ms
rtt min/avg/max/mdev = 199.000/201.667/205.000/2.494 ms
[31mroot[0m@archiso [34m~[0m # 
```
### 分区并挂载硬盘
> [!CAUTION]
> 再次提醒，此操作会清空硬盘上所有数据，请务必做好备份！
#### 分区
使用`lsblk`列出电脑上的硬盘（为了直观简洁，我只保留要操作的硬盘）
```ansi
[31mroot[0m@archiso [34m~[0m # lsblk
NAME       MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS
sda          8:0    0 476.9G  0 disk 
├─sda1       8:1    0   286M  0 part 
└─sda2       8:2    0 476.7G  0 part 
[31mroot[0m@archiso [34m~[0m # 
```
这里我们需要安装系统的盘是`sda`

（你的设备可能会跟我显示的不一样，请自行根据大小及分区判断）

我的`sda`内已经装过系统了，如果你是第一次装系统，你可能看不到里面有分区，不过这不影响接下来的操作

我们使用 [fdisk](https://wiki.archlinuxcn.org/wiki/Fdisk) 来创建分区

输入`fdisk /dev/你想要分区的硬盘`进入`fdisk`工具
```ansi
[31mroot[0m@archiso [34m~[0m # fdisk /dev/sda

[32mWelcome to fdisk (util-linux 2.41.1).[0m
Changes will remain in memory only, until you decide to write them.
Be careful before using the write command.


Command (m for help): 
```
输入`g`创建一个`GPT`格式的分区表
```ansi
Command (m for help): g
Created a new GPT disklabel (GUID: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX).

Command (m for help): 
```
输入`n`创建一个新分区
```ansi
Command (m for help): n
Partition number (1-128, default 1): 
First sector (2048-1000215182, default 2048): 
Last sector, +/-sectors or +/-size{K,M,G,T,P} (2048-1000215182, default 1000214527): +1G

Created a new partition 1 of type 'Linux filesystem' and of size 1 GiB.
[31mPartition #1 contains a vfat signature.[0m

Do you want to remove the signature? [Y]es/[N]o: Y

The signature will be removed by a write command.

Command (m for help): 
```
此处从上到下分别是：

`Partition number`磁盘序号（默认 1 回车）

`First sector`起始位置 （默认 2048 回车）

`Last sector`终止位置 （我们要创建 1G 的 EFI 分区，所以输入 `+1G` 回车）

`Partition #1 contains a vfat signature.`这是因为曾经在这里有过一个 FAT32 分区，工具发现了一个 vfat 签名，如果你是在一块全新的硬盘上操作，则不会出现该提示

`Do you want to remove the signature?`是否要移除该 vfat 签名？（输入 `Y` 回车）

接着我们输入`t`来更改分区类型，分区类型输入`EFI System`
```ansi
Command (m for help): t
Selected partition 1
Partition type or alias (type L to list all): EFI System
Changed type of partition 'Linux filesystem' to 'EFI System'.

Command (m for help): 

```
接着我们再次输入`n`创建第二个分区
```ansi
Command (m for help): n
Partition number (2-128, default 2): 
First sector (2099200-1000215182, default 2099200): 
Last sector, +/-sectors or +/-size{K,M,G,T,P} (2099200-1000215182, default 1000214527): 

Created a new partition 2 of type 'Linux filesystem' and of size 475.9 GiB.

Command (m for help): 
```

这次全部默认，让它创建一个利用所有剩余空间的主分区

然后输入`w`写入我们所有的操作并退出`fdisk`
```ansi
Command (m for help): w
The partition table has been altered.
Calling ioctl() to re-read partition table.
Syncing disks.

[31mroot[0m@archiso [34m~[0m # 
```
最后，使用`lsblk`验证分区状态
```ansi
[31mroot[0m@archiso [34m~[0m # lsblk
NAME       MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS
sda          8:0    0 476.9G  0 disk 
├─sda1       8:1    0     1G  0 part 
└─sda2       8:2    0 475.9G  0 part 
[31mroot[0m@archiso [34m~[0m # 
```
可以看到，`sda`中已经创建了一个 1G 大小的`sda1`和一个 475.9G 大小的`sda2`
#### 格式化和加密
接下来对分区进行对应的格式化和加密

首先，将`sda1`格式化为 EFI 使用的 FAT32 格式

输入`mkfs.fat -F 32 /dev/sda1`进行格式化
```ansi
[31mroot[0m@archiso [34m~[0m # mkfs.fat -F 32 /dev/sda1
mkfs.fat 4.2 (2021-01-31)
[31mroot[0m@archiso [34m~[0m # 
```
接下来我们使用 [cryptsetup](https://wiki.archlinuxcn.org/wiki/Dm-crypt/设备加密) 来加密`sda2`

输入`cryptsetup luksFormat /dev/sda2`
```ansi
[31mroot[0m@archiso [34m~[0m # cryptsetup luksFormat /dev/sda2

WARNING!
========
This will overwrite data on /dev/sda2 irrevocably.

Are you sure? (Type 'yes' in capital letters): YES
Enter passphrase for /dev/sda2: 
Verify passphrase: 
[31mroot[0m@archiso [34m~[0m # 
```
它会警告我们，此操作会删除磁盘中的所有数据，输入大写的`YES`确认操作

然后输入两次你想为这个加密容器创建的密码，注意密码不会显示，稍作等待就创建成功了

接着我们打开这个加密容器，并进行进一步分区

输入`cryptsetup open /dev/sda2 cry0`来打开容器（`cry0`是解密后映射到的名称，你可以按自己喜好修改）
```ansi
[31mroot[0m@archiso [34m~[0m # cryptsetup open /dev/sda2 cry0
Enter passphrase for /dev/sda2: 
cryptsetup open /dev/sda2 cry0  6.74s user 0.09s system 123% cpu 5.556 total
[31mroot[0m@archiso [34m~[0m # 
```
输入密码，完成解密，解密后的分区映射在`/dev/mapper/cry0`
#### 创建文件系统
我们使用 LVM+ext4 作为我们的文件系统，其实 LVM 可以搭配任何格式，这里只是以 ext4 为例
##### 创建 LVM 卷组
使用`pvcreate`在解密后的分区上创建物理卷
```ansi
[31mroot[0m@archiso [34m~[0m # pvcreate /dev/mapper/cry0
  Physical volume "/dev/mapper/cry0" successfully created.
[31mroot[0m@archiso [34m~[0m # 
```
> [!WARNING]
> 此处要操作的是`/dev/mapper/cry0`而不是`/dev/sda2`，不要搞错了

再使用`vgcreate`在物理卷上创建逻辑卷组
```ansi
[31mroot[0m@archiso [34m~[0m # vgcreate vg0 /dev/mapper/cry0 
  Volume group "vg0" successfully created
[31mroot[0m@archiso [34m~[0m # 
```
接下来使用`lvcreate`开始创建逻辑卷
```ansi
[31mroot[0m@archiso [34m~[0m # lvcreate -L 16G vg0 -n swap
  Logical volume "swap" created.
[31mroot[0m@archiso [34m~[0m # lvcreate -L 64G vg0 -n root 
  Logical volume "root" created.
[31mroot[0m@archiso [34m~[0m # lvcreate -l +100%FREE vg0 -n home
  Logical volume "home" created.
[31mroot[0m@archiso [34m~[0m # 
```
我这里创建了三个逻辑卷，分别命名为`swap`、`root`、`home`

顾名思义，`swap`分区是用来做`swap`的（推荐设置为物理内存的一到二倍）

`root`分区则是根分区，我这里分 64GB，应该够用

`home`则是用户家目录，把剩下的所有空间全部分配

全部创建好后可以输入`lsblk`验证
```ansi
[31mroot[0m@archiso [34m~[0m # lsblk
NAME           MAJ:MIN RM   SIZE RO TYPE  MOUNTPOINTS
sda              8:0    0 476.9G  0 disk  
├─sda1           8:1    0     1G  0 part  
└─sda2           8:2    0 475.9G  0 part  
  └─cry0       253:2    0 475.9G  0 crypt 
    ├─vg0-swap 253:3    0    16G  0 lvm   
    ├─vg0-root 253:4    0    64G  0 lvm   
    └─vg0-home 253:5    0 395.9G  0 lvm   
[31mroot[0m@archiso [34m~[0m # 
```
##### 格式化逻辑卷并挂载
接下来，分别格式化创建好的各个逻辑卷（即分区）
```ansi
[31mroot[0m@archiso [34m~[0m # mkfs.ext4 /dev/vg0/root
mke2fs 1.47.3 (8-Jul-2025)
Creating filesystem with 16777216 4k blocks and 4194304 inodes
Filesystem UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Superblock backups stored on blocks: 
	32768, 98304, 163840, 229376, 294912, 819200, 884736, 1605632, 2654208, 
	4096000, 7962624, 11239424

Allocating group tables: done                            
Writing inode tables: done                            
Creating journal (131072 blocks): done
Writing superblocks and filesystem accounting information: done   

[31mroot[0m@archiso [34m~[0m # mkfs.ext4 /dev/vg0/home
mke2fs 1.47.3 (8-Jul-2025)
Creating filesystem with 103788544 4k blocks and 25952256 inodes
Filesystem UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Superblock backups stored on blocks: 
	32768, 98304, 163840, 229376, 294912, 819200, 884736, 1605632, 2654208, 
	4096000, 7962624, 11239424, 20480000, 23887872, 71663616, 78675968, 
	102400000

Allocating group tables: done                            
Writing inode tables: done                            
Creating journal (262144 blocks): done
Writing superblocks and filesystem accounting information: done     

[31mroot[0m@archiso [34m~[0m # 
```
接下来按顺序挂载所有分区
```ansi
[31mroot[0m@archiso [34m~[0m # mount /dev/vg0/root /mnt
[31mroot[0m@archiso [34m~[0m # mount --mkdir /dev/vg0/home /mnt/home
[31mroot[0m@archiso [34m~[0m # mount --mkdir /dev/sda1 /mnt/boot 
[31mroot[0m@archiso [34m~[0m # 
```
> [!WARNING]
> 如果你要使用`systemd-boot`作为你的引导加载器，那么建议把`esp`分区挂载到`/mnt/efi`而非`/mnt/boot`

最后使用`lsblk`检查挂载情况
```ansi
[31mroot[0m@archiso [34m~[0m # lsblk
NAME           MAJ:MIN RM   SIZE RO TYPE  MOUNTPOINTS
sda              8:0    0 476.9G  0 disk  
├─sda1           8:1    0     1G  0 part  /mnt/boot
└─sda2           8:2    0 475.9G  0 part  
  └─cry0       253:2    0 475.9G  0 crypt 
    ├─vg0-swap 253:3    0    16G  0 lvm   
    ├─vg0-root 253:4    0    64G  0 lvm   /mnt
    └─vg0-home 253:5    0 395.9G  0 lvm   /mnt/home
[31mroot[0m@archiso [34m~[0m # 
```
### 开始安装系统
首先切换镜像源
```ansi
[31mroot[0m@archiso [34m~[0m # echo 'Server = https://mirrors.tuna.tsinghua.edu.cn/archlinux/$repo/os/$arch' > /etc/pacman.d/mirrorlist
```
这行命令的意思是将镜像源网站`Server = https://mirrors.tuna.tsinghua.edu.cn/archlinux/$repo/os/$arch"`写入`/etc/pacman.d/mirrorlist`内并替换原来的内容

之后刷新软件包缓存并更新密钥环
```ansi
[31mroot[0m@archiso [34m~[0m # pacman -Sy --needed archlinux-keyring
```
接下来往新系统里安装最基础的软件包

使用`pacstrap`命令把软件包安装到`/mnt`分区内
```ansi
[31mroot[0m@archiso [34m~[0m # pacstrap -K /mnt base linux linux-headers linux-firmware intel-ucode
```
当然你也可以选用其他的内核，只要将`linux`和`linux-headers`替换为你想要安装的内核即可，比如`linux-lts`和`linux-lts-headers`

如果你是 AMD 的 CPU ，那么就把`intel-ucode`换成`amd-ucode`

使用`genfstab`生成`fstab`文件
```ansi
[31mroot[0m@archiso [34m~[0m # genfstab -U /mnt > /mnt/etc/fstab
```
### 进入系统
使用`arch-chroot`进入我们刚安装好的系统
```ansi
[31mroot[0m@archiso [34m~[0m # arch-chroot /mnt
```
此时你的终端样式会发生改变，变成`[root@archiso /]# `

设置时区
```ansi
[root@archiso /]# ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
```
时间同步
```ansi
[root@archiso /]# systemctl enable systemd-timesyncd.service
Created symlink '/etc/systemd/system/dbus-org.freedesktop.timesync1.service' → '/usr/lib/systemd/system/systemd-timesyncd.service'.
Created symlink '/etc/systemd/system/sysinit.target.wants/systemd-timesyncd.service' → '/usr/lib/systemd/system/systemd-timesyncd.service'.
[root@archiso /]# hwclock --systohc
```
启用`systemd-timesyncd.service`服务并生成`/etc/adjtime`

接下来安装一些基本工具
```ansi
[root@archiso /]# pacman -S base-devel lvm2 neovim networkmanager
```
`base-devel`：一些基本的工具包（包括`sudo`）

`lvm2`：LVM 管理工具

`neovim`：文本编辑器（不会用`vim`可以替换成`nano`）

`networkmanager`：网络管理器

接下来设置本地化

使用`nvim`（或`nano`，如果你安装的是`nano`的话）打开`/etc/locale.gen`
```ansi
[root@archiso /]# nvim /etc/locale.gen
```
找到如下两行（不挨着）
```
#en_US.UTF-8 UTF-8
#zh_CN.UTF-8 UTF-8
```
去除它们前面的注释
```
en_US.UTF-8 UTF-8
zh_CN.UTF-8 UTF-8
```
保存退出（`vim`输入`:wq`；`nano`按`Ctrl+O`写入，按`Ctrl+X`退出）

然后运行`locale-gen`生成本地化信息
```ansi
[root@archiso /]# locale-gen
Generating locales...
  en_US.UTF-8... done
  zh_CN.UTF-8... done
Generation complete.
[root@archiso /]# 
```
新建`/etc/locale.conf`文件
```ansi
[root@archiso /]# nvim /etc/locale.conf
```
输入以下内容
```conf
LANG=en_US.UTF-8
```
> [!IMPORTANT]
> 请不要输入zh_CN.UTF-8，否则会导致 TTY 终端显示豆腐块，无法正常使用！

接下来创建一个主机名
```ansi
[root@archiso /]# nvim /etc/hostname
```
写入你想要的主机名，比如：
```hostname
Shiori-archlinux
```
将主机名写入`hosts`
```ansi
[root@archiso /]# nvim /etc/hosts
```
添加一行`127.0.1.1`
```hosts
# Static table lookup for hostnames.
# See hosts(5) for details.
127.0.0.1        localhost
::1              localhost
127.0.1.1        Shiori-archlinux.localdomain Shiori-archlinux
```
编辑`crypttab`
```ansi
[root@archiso /]# nvim /etc/crypttab
```
在里面写下一行
```
swap /dev/vg0/swap /dev/urandom swap,cipher=aes-xts-plain64,size=512,sector-size=4096
```
然后我们修改一下刚刚生成的`fstab`
```ansi
[root@archiso /]# nvim /etc/fstab
```
新增一行，启用`swap`
```
/dev/mapper/swap none swap defaults 0 0
```
为`root`用户设置一个密码
```ansi
[root@archiso /]# passwd
New password: 
Retype new password: 
passwd: password updated successfully
[root@archiso /]# 
```
同样是输入两遍，屏幕上不显示
### 安装引导加载器
我们选用`grub`或`systemd-boot`或`refind`来作为我们的引导加载器，请自行选择

首先编辑`mkinitcpio.conf`
```ansi
[root@archiso /]# nvim /etc/mkinitcpio.conf
```
找到`HOOKS=`这一行，我们将钩子替换为`systemd`提供的
```
HOOKS=(base systemd autodetect microcode modconf kms keyboard sd-vconsole block sd-encrypt lvm2 filesystems fsck)
```
使用`systemd`替换了`udev`，使用`sd-vconsole`替换了`keymap`和`consolefont`，在`block`和`filesystems`之间加入`sd-encrypt`，在`sd-encrypt`后添加`lvm2`

创建`/etc/vconsole.conf`
```ansi
[root@archiso /]# nvim /etc/vconsole.conf
```
在里面添加
```
KEYMAP=us
```
#### 1. grub
首先安装`grub`软件包
```ansi
[root@archiso /]# pacman -S grub efibootmgr
```
生成`initramfs`
```ansi
[root@archiso /]# mkinitcpio -P
```
获取加密分区的 UUID
```ansi
[root@archiso /]# blkid -s UUID -o value /dev/sda2
```
会输出一串类似`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`的 UUID，记住它，等会要用

接下来配置`grub`

打开`/etc/default/grub`
```ansi
[root@archiso /]# nvim /etc/default/grub
```
编辑`GRUB_CMDLINE_LINUX=""`这一行

```
GRUB_CMDLINE_LINUX="rd.luks.name=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx=cry0"
```
把`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`替换为刚刚输出的 UUID

接着安装`grub`到 EFI 分区
```ansi
[root@archiso /]# grub-install --target=x86_64-efi --efi-directory=/boot --bootloader-id=archlinux --removable --modules="tpm" --disable-shim-lock
```
为支持某些主板，使用`--removable`将`grub`安装到`/efi/EFI/BOOT/BOOTX64.EFI`

为支持安全启动，使用`--modules="tpm" --disable-shim-lock`安装

生成`grub`配置
```ansi
[root@archiso /]# grub-mkconfig -o /boot/grub/grub.cfg
```
> [!NOTE]
> 可以安装`grub-hook-ca`来实现自动更新
#### 2. systemd-boot
使用`bootctl`将`systemd-boot`安装到 EFI 分区内
```ansi
[root@archiso /]# bootctl install
Created "/efi/EFI".
Created "/efi/EFI/systemd".
Created "/efi/EFI/BOOT".
Created "/efi/loader".
Created "/efi/loader/keys".
Created "/efi/loader/entries".
Created "/efi/EFI/Linux".
Copied "/usr/lib/systemd/boot/efi/systemd-bootx64.efi" to "/efi/EFI/systemd/systemd-bootx64.efi".
Copied "/usr/lib/systemd/boot/efi/systemd-bootx64.efi" to "/efi/EFI/BOOT/BOOTX64.EFI".
[33m⚠ Mount point '/efi' which backs the random seed file is world accessible, which is a security hole! ⚠
⚠ Random seed file '/efi/loader/.#bootctlrandom-seedxxxxxxxxxxxxxxxx' is world accessible, which is a security hole! ⚠[0m
Random seed file /efi/loader/random-seed successfully written (32 bytes).
[root@archiso /]# 
```
这里会输出两个警告，但是不重要，这就安装好了

接下来把`initramfs`镜像安装到 EFI 分区内

获取加密分区的 UUID
```ansi
[root@archiso /]# blkid -s UUID -o value /dev/sda2
```
会输出一串类似`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`的 UUID，记住它，等会要用

接下来创建一个内核参数文件
```ansi
[root@archiso /]# mkdir -p /etc/kernel
[root@archiso /]# nvim /etc/kernel/cmdline
```
写入以下内容（注意把 UUID 换成你刚刚获取的）

```
rd.luks.name=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx=cry0 root=/dev/vg0/root
```

接下来我们更改内核配置文件让它在 EFI 分区内生成 UKI 镜像
```ansi
[root@archiso /]# nvim /etc/mkinitcpio.d/linux.preset
```
> [!NOTE]
> 在本例中是`linux.preset`，如果你安装了其他内核，请一并修改对应的配置文件（比如`linux-lts.preset`）

找到
```
default_image="/boot/initramfs-linux.img"
#default_uki="/efi/EFI/Linux/arch-linux.efi"
```
两行

在`default_image=`前面加上注释，将`default_uki=`前面的注释删除
```
#default_image="/boot/initramfs-linux.img"
default_uki="/efi/EFI/Linux/arch-linux.efi"
```
注意下面的`fallback`镜像也同样处理
```
#default_image="/boot/initramfs-linux-fallback.img"
default_uki="/efi/EFI/Linux/arch-linux-fallback.efi"
```
生成`initramfs`镜像
```ansi
[root@archiso /]# mkinitcpio -P
```
（可选但推荐）删除`/boot`分区的`initramfs`镜像
```ansi
[root@archiso /]# rm /boot/initramfs-*.img
```
#### 3. refind
首先安装`refind`
```ansi
[root@archiso /]# pacman -S refind
```
生成`initramfs`镜像
```ansi
[root@archiso /]# mkinitcpio -P
```
使用`refind-install`将`refind`安装到 EFI 分区内
```ansi
[root@archiso /]# refind-install --usedefault /dev/sda1
```
获取加密分区的 UUID
```ansi
[root@archiso /]# blkid -s UUID -o value /dev/sda2
```
会输出一串类似`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`的 UUID，记住它，等会要用

接下来创建一个 refind 配置文件
```ansi
[root@archiso /]# nvim /boot/refind_linux.conf
```
写入以下内容（注意把 UUID 换成你刚刚获取的）

```
"Arch Linux" "rd.luks.name=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx=cry0 root=/dev/vg0/root rw initrd=intel-ucode.img initrd=initramfs-linux.img"
```
注意最后一个参数的`initrd=initramfs-linux.img`要改成你实际的`initramfs`镜像的名称，可以使用`ls /boot`查看
### 创建新用户
重启前我们先创建一个普通用户，以便我们后续不用一直使用`root`用户进行操作

使用`useradd`创建一个用户，并将其添加进`wheel`组

我的用户名是`hiruocha`，你可以按自己的喜好修改
```ansi
[root@archiso /]# useradd -m -G wheel hiruocha
```
使用`-m`参数创建一个带有家目录的普通用户，使用`-G`参数将用户添加进`whell`组内

然后使用`passwd hiruocha`为该用户创建一个密码

为了让该用户能使用`sudo`，我们还需要编辑`sudo`的配置文件
```ansi
[root@archiso /]# EDITOR=nvim visudo
```
将`nvim`修改为你安装的编辑器

找到`# %wheel ALL=(ALL:ALL) ALL`这一行，去掉前面的注释
```
%wheel ALL=(ALL:ALL) ALL
```
保存并退出
### 完成安装
#### 重启
输入`exit`退出`arch-chroot`

输入`reboot`即可重启

重启后输入分区解密密码解密分区

随后输入我们刚创建的用户名和密码进入系统
```ansi
Arch Linux 6.15.4-arch2-1 (tty1)

Shiori-archlinux login: hiruocha
Password: 
```
#### 联网
进入新系统后，启动`NetworkManager`的`systemd`服务
```console
$ sudo systemctl enable --now NetworkManager
```
使用`nmtui`连接无线网络
```console
$ nmtui
```
会进入一个伪图形界面，使用上下左右移动，回车进入，`Esc`退出

找到你的网络并连接即可

此时你便可以开始愉快的滚动更新系统了
```console
$ sudo pacman -Syu
```
（然后就炸了💥
### 安全启动
见 [为 Arch Linux 启用安全启动](/posts/arch-secure-boot)
## 安装桌面环境
鸽了
