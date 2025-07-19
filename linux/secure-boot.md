# 为 Arch Linux 启用安全启动
物理保护数据的最后一道防线

标签：[Linux](/linux/)
>参考 Arch Linux 中文维基 [UEFI/安全启动#sbctl](https://wiki.archlinuxcn.org/wiki/UEFI/安全启动#sbctl) 以及 Bilibili UP [unixchad](https://space.bilibili.com/34569411) 的视频 [在Arch Linux上启用UEFI/安全启动：sbctl](https://www.bilibili.com/video/BV14mLzzmEmx/) 编写
## 安全启动的作用（为什么需要安全启动？）
虽然在我们的教程里把`/boot`放进了加密分区内，但总会有未加密的引导加载器（如果你按照我的教程安装的话那就是`/efi`）暴露在外面

那么这时，假如有攻击者能从物理层面上接触到你的电脑，那么 TA 就有可能对我们的引导加载器做手脚，使其能够在我们下次开启电脑时记录下我们的解密密钥甚至**任何信息**，并发送给攻击者（这被称为“[邪恶女佣攻击](https://zh.wikipedia.org/wiki/邪恶女佣攻击)”）

>（在某些极端情况下甚至不需要物理接触，如果攻击者已经在你的设备开机时黑入，那么 TA 同样可以植入病毒）

为了应对这种情况，我们就需要安全启动了。当它被开启后，在我们启动系统前，安全启动会检查我们的引导加载器上是否存在签名、签名是否与自身保存的密钥对应，如果其中一项是否，那么就会拒绝启动，从而保证系统不被篡改
## 签署引导加载器
### 安装 sbctl
我们先安装`sbctl`
```console
# pacman -S sbctl
```
### 进入 setup mode
> [!CAUTION]
> 请注意，开启这个模式后就可以朝 BIOS 内写入密钥了，请保证只在设置密钥时打开，否则恶意攻击者也可以向你的主板内写入 TA 的密钥

首先重启到你的 BIOS 设置，找到`安全/Security`页面，把安全启动关闭并把模式设置为`setup mode`并删除所有预装密钥（这部分几乎所有主板都不一样，请自行摸索，实在抱歉）（如果找不到`setup mode`的选项那么删除所有密钥大概应该就能进入），然后保存并重启

重启后我们使用`sbctl`检查安全启动状态
```console
$ sbctl status
Installed:      ✗ sbctl is not installed
Setup Mode:     ✗ Enabled
Secure Boot:    ✗ Disabled
Vendor Keys:    none
```
如果显示如上三个`✗`以及`none`的话，我们就可以开始下一步了，如果不是，你可能需要回去检查一下你的 BIOS 设置
>没错，是`✗`，第一个`✗`代表我们还没有给引导加载器签名，第二个`✗`表示开启了`setup mode`，第三个`✗`表示安全启动是关闭状态，这都代表不安全，但这正是我们现在需要的状态
然后`none`代表我们删除了所有预装密钥，这是为了保证以后我们的 BIOS 只信任我们自己的密钥，而不是包括设备制造商或微软的
### 生成密钥并登记到 BIOS
使用`sbctl`生成密钥
```console
# sbctl create-keys
```
稍等片刻，密钥便生成好了，生成的密钥会被放在`/var/lib/sbctl/`这个路径下（不需要去动，只要知道就好了）
然后我们将登记到 BIOS 中
```console
# sbctl enroll-keys
```
> [!CAUTION]
> 如果你有使用双系统的需求或启用安全启动后系统无法启动，请使用`sbctl enroll-keys -m`，这会同时登记微软的密钥

> [!TIP]
> 运行`sbctl enroll-keys`后会马上关闭`setup mode`，如果需要更改密钥或重新导入，需要到 BIOS 界面重新开启
### 签署文件
终于，我们正式开始签署我们的文件

首先列出所有待签署的文件
```console
# sbctl verify
Verifying file database and EFI images in /efi...
✗ /efi/EFI/BOOT/BOOTX64.EFI is not signed
✗ /efi/EFI/Linux/arch-linux-fallback.efi is not signed
✗ /efi/EFI/Linux/arch-linux.efi is not signed
✗ /efi/EFI/systemd/systemd-bootx64.efi is not signed
failed to verify file /efi/loader/entries.srel: /efi/loader/entries.srel: invalid pe header
failed to verify file /efi/loader/loader.conf: /efi/loader/loader.conf: invalid pe header
failed to verify file /efi/loader/random-seed: /efi/loader/random-seed: invalid pe header
```
如果你按照我的教程并使用`systemd-boot`作为引导加载器，那么你的输出应该跟我类似，使用`grub`会有所不同，但大同小异，挨个签名就好

>你可能有注意到，这个列表里有一些`failed to verify`开头的文件，这代表了它不是一个需要被签署的二进制文件，可以被安全的忽略

如果你是把`esp`分区挂载到了`/boot`下，那么这里会列出你安装的内核（如`/boot/vmlinuz-linux`），你需要一并签名

接下来，我们来挨个签署它们，使用`-s`参数来追踪，使引导加载器或内核更新后能自动重新签署
```console
# sbctl sign -s /efi/EFI/BOOT/BOOTX64.EFI
```
以此类推，直到所有文件被签署完毕
```console
# sudo sbctl verify
Verifying file database and EFI images in /efi...
✓ /efi/EFI/BOOT/BOOTX64.EFI is signed
✓ /efi/EFI/Linux/arch-linux-fallback.efi is signed
✓ /efi/EFI/Linux/arch-linux.efi is signed
✓ /efi/EFI/systemd/systemd-bootx64.efi is signed
failed to verify file /efi/loader/entries.srel: /efi/loader/entries.srel: invalid pe header
failed to verify file /efi/loader/loader.conf: /efi/loader/loader.conf: invalid pe header
failed to verify file /efi/loader/random-seed: /efi/loader/random-seed: invalid pe header
```
> [!CAUTION]
> 如果你使用`systemd-boot`作为引导加载器，那么你需要关闭用于更新的`systemd-boot-update.service`这个`systemd`服务，转而用`systemd-boot-pacman-hook`这个在`aur`的软件包进行更新

>（参考 Arch Linux 中文维基中 [Systemd-boot#自动更新](https://wiki.archlinuxcn.org/wiki/Systemd-boot#自动更新) 及 [UEFI/安全启动#使用pacman钩子自动签署](https://wiki.archlinuxcn.org/wiki/UEFI/安全启动#使用pacman钩子自动签署) 中的**提示**）
## 启用安全启动
再次运行`sbctl status`
```console
$ sbctl status     
Installed:      ✓ sbctl is installed
Owner GUID:     xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Setup Mode:     ✓ Disabled
Secure Boot:    ✗ disabled
Vendor Keys:    none
```
如果一切顺利，你的输出应该跟上面所示的一样了（其实在登记完密钥后就已经应该是这样了）

此时我们再进入 BIOS，开启安全启动，见证奇迹的发生

如果成功重启，再次运行`sbctl status`
```console
$ sbctl status     
Installed:      ✓ sbctl is installed
Owner GUID:     xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Setup Mode:     ✓ Disabled
Secure Boot:    ✓ Enabled
Vendor Keys:    none
```
那么恭喜你🎉，你成功为你的 Arch Linux 亲手启用了安全启动
