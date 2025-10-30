---
title: Pure sh Bible
description: 纯 POSIX sh 替代外部进程的方法合集。
published: 2025-10-31
date: 2019-09-19
tags: [Shell, POSIX Shell, 搬运]
category: GNU/Linux
author: Dylan Araps
licenseName: MIT
sourceLink: https://github.com/dylanaraps/pure-sh-bible
---
>仅搬运，使用 AI 翻译  
>以下为原文

<p align="center"><b>另请参阅: <a href="https://github.com/dylanaraps/pure-bash-bible">pure bash bible (📖 纯 bash 替代外部进程的方法合集)。</a></b></p>

<br>

<p align="center"><img src="https://user-images.githubusercontent.com/6799467/65238742-e0ba4c80-dacc-11e9-9c2a-3dd20a6f138d.png" width="300px"></p>
<h1 align="center">pure sh bible</h1> <p
align="center">纯 POSIX sh 替代外部进程的方法合集。</p><br><br>

<img src="https://user-images.githubusercontent.com/6799467/65239338-4eb34380-dace-11e9-8fe2-7b5e28f1bced.png" width="40%" align="right">

这本书的目标是记录仅使用内置 POSIX `sh` 功能来执行各种任务的常见和鲜为人知的方法。使用此圣经中的代码片段可以帮助从脚本中删除不需要的依赖项，并且在大多数情况下使它们更快。我在开发 [KISS Linux](https://kisslinux.xyz/) 和其他小型项目时发现了这些技巧并发现了一些新的技巧。

下面的代码片段都使用 `shellcheck` 进行了代码检查。

看到有描述不正确、有缺陷或完全错误的内容？请提交 issue 或发送 pull request。如果圣经缺少某些内容，请提交 issue，我们将找到解决方案。

- Leanpub 图书: (*即将推出*)
- 为我买杯咖啡: <a href="https://www.patreon.com/dyla"><img src="https://img.shields.io/badge/donate-patreon-yellow.svg"> </a>

<br>

# 目录

<!-- vim-markdown-toc GFM -->

* [字符串操作](#字符串操作)
    * [从字符串开头删除模式](#从字符串开头删除模式)
    * [从字符串末尾删除模式](#从字符串末尾删除模式)
    * [删除字符串开头和结尾的空白字符](#删除字符串开头和结尾的空白字符)
    * [删除字符串中所有空白字符并截断空格](#删除字符串中所有空白字符并截断空格)
    * [检查字符串是否包含子字符串](#检查字符串是否包含子字符串)
    * [检查字符串是否以子字符串开头](#检查字符串是否以子字符串开头)
    * [检查字符串是否以子字符串结尾](#检查字符串是否以子字符串结尾)
    * [根据分隔符分割字符串](#根据分隔符分割字符串)
    * [删除字符串中的引号](#删除字符串中的引号)
* [文件操作](#文件操作)
    * [解析 `key=val` 文件](#解析-keyval-文件)
    * [获取文件的前 N 行](#获取文件的前-n-行)
    * [获取文件的行数](#获取文件的行数)
    * [统计目录中的文件或目录数量](#统计目录中的文件或目录数量)
    * [创建空文件](#创建空文件)
* [文件路径](#文件路径)
    * [获取文件路径的目录名](#获取文件路径的目录名)
    * [获取文件路径的基本名称](#获取文件路径的基本名称)
* [循环](#循环)
    * [循环遍历（*小范围*）数字](#循环遍历小范围数字)
    * [循环遍历可变范围的数字](#循环遍历可变范围的数字)
    * [循环遍历文件内容](#循环遍历文件内容)
    * [循环遍历文件和目录](#循环遍历文件和目录)
* [变量](#变量)
    * [根据另一个变量命名变量](#根据另一个变量命名变量)
* [转义序列](#转义序列)
    * [文本颜色](#文本颜色)
    * [文本属性](#文本属性)
    * [光标移动](#光标移动)
    * [擦除文本](#擦除文本)
* [参数扩展](#参数扩展)
    * [前缀和后缀删除](#前缀和后缀删除)
    * [长度](#长度)
    * [默认值](#默认值)
* [条件表达式](#条件表达式)
    * [文件条件](#文件条件)
    * [变量条件](#变量条件)
    * [变量比较](#变量比较)
* [算术运算符](#算术运算符)
    * [赋值](#赋值)
    * [算术运算](#算术运算)
    * [位运算](#位运算)
    * [逻辑运算](#逻辑运算)
    * [其他运算](#其他运算)
* [算术运算](#算术运算-1)
    * [三元测试](#三元测试)
    * [检查数字是否为浮点数](#检查数字是否为浮点数)
    * [检查数字是否为整数](#检查数字是否为整数)
* [陷阱](#陷阱)
    * [在脚本退出时执行某些操作](#在脚本退出时执行某些操作)
    * [忽略终端中断 (CTRL+C, SIGINT)](#忽略终端中断-ctrlc-sigint)
* [过时语法](#过时语法)
    * [命令替换](#命令替换)
* [内部和环境变量](#内部和环境变量)
    * [打开用户首选的文本编辑器](#打开用户首选的文本编辑器)
    * [获取当前工作目录](#获取当前工作目录)
    * [获取当前 shell 的 PID](#获取当前-shell-的-pid)
    * [获取当前 shell 选项](#获取当前-shell-选项)
* [后记](#后记)

<!-- vim-markdown-toc -->


# 字符串操作

## 从字符串开头删除模式

**示例函数:**

```sh
lstrip() {
    # 用法: lstrip "字符串" "模式"
    printf '%s\n' "${1##$2}"
}
```

**使用示例:**

```shell
$ lstrip "The Quick Brown Fox" "The "
Quick Brown Fox
```

## 从字符串末尾删除模式

**示例函数:**

```sh
rstrip() {
    # 用法: rstrip "字符串" "模式"
    printf '%s\n' "${1%%$2}"
}
```

**使用示例:**

```shell
$ rstrip "The Quick Brown Fox" " Fox"
The Quick Brown
```

## 删除字符串开头和结尾的空白字符

这是 `sed`、`awk`、`perl` 和其他工具的替代方案。下面的函数通过找到所有开头和结尾的空白字符并将其从字符串的开头和结尾删除来工作。

**示例函数:**

```sh
trim_string() {
    # 用法: trim_string "   example   string    "

    # 删除所有开头的空白字符。
    # '${1%%[![:space:]]*}': 删除除开头空白字符以外的所有内容。
    # '${1#${XXX}}': 从字符串开头删除空白字符。
    trim=${1#${1%%[![:space:]]*}}

    # 删除所有结尾的空白字符。
    # '${trim##*[![:space:]]}': 删除除结尾空白字符以外的所有内容。
    # '${trim%${XXX}}': 从字符串结尾删除空白字符。
    trim=${trim%${trim##*[![:space:]]}}

    printf '%s\n' "$trim"
}
```

**使用示例:**

```shell
$ trim_string "    Hello,  World    "
Hello,  World

$ name="   John Black  "
$ trim_string "$name"
John Black
```

## 删除字符串中所有空白字符并截断空格

这是 `sed`、`awk`、`perl` 和其他工具的替代方案。下面的函数通过滥用单词分割来创建一个没有开头/结尾空白字符并且空格被截断的新字符串。

**示例函数:**

```sh
# shellcheck disable=SC2086,SC2048
trim_all() {
    # 用法: trim_all "   example   string    "

    # 禁用通配符匹配，使下面的单词分割安全。
    set -f

    # 将参数列表设置为按单词分割的字符串。
    # 这会删除所有开头/结尾的空白字符并将
    # 所有多个空格实例减少为单个空格（"  " -> " "）。
    set -- $*

    # 将参数列表作为字符串打印。
    printf '%s\n' "$*"

    # 重新启用通配符匹配。
    set +f
}
```

**使用示例:**

```shell
$ trim_all "    Hello,    World    "
Hello, World

$ name="   John   Black  is     my    name.    "
$ trim_all "$name"
John Black is my name.
```

## 检查字符串是否包含子字符串

**使用 case 语句:**

```shell
case $var in
    *sub_string1*)
        # 执行某些操作
    ;;

    *sub_string2*)
        # 执行其他操作
    ;;

    *)
        # 其他情况
    ;;
esac
```

## 检查字符串是否以子字符串开头

**使用 case 语句:**

```shell
case $var in
    sub_string1*)
        # 执行某些操作
    ;;

    sub_string2*)
        # 执行其他操作
    ;;

    *)
        # 其他情况
    ;;
esac
```

## 检查字符串是否以子字符串结尾

**使用 case 语句:**

```shell
case $var in
    *sub_string1)
        # 执行某些操作
    ;;

    *sub_string2)
        # 执行其他操作
    ;;

    *)
        # 其他情况
    ;;
esac
```

## 根据分隔符分割字符串

这是 `cut`、`awk` 和其他工具的替代方案。

**示例函数:**

```sh
split() {
    # 禁用通配符匹配。
    # 这确保单词分割是安全的。
    set -f

    # 存储 'IFS' 的当前值，以便
    # 稍后可以恢复它。
    old_ifs=$IFS

    # 将字段分隔符更改为我们要
    # 分割的内容。
    IFS=$2

    # 创建一个参数列表，在每个
    # '$2' 出现的地方进行分割。
    #
    # 禁用这个是安全的，因为它只是警告
    # 单词分割，这是我们期望的行为。
    # shellcheck disable=2086
    set -- $1

    # 每行打印一个列表值。
    printf '%s\n' "$@"

    # 恢复 'IFS' 的值。
    IFS=$old_ifs

    # 重新启用通配符匹配。
    set +f
}
```

**使用示例:**

```shell
$ split "apples,oranges,pears,grapes" ","
apples
oranges
pears
grapes

$ split "1, 2, 3, 4, 5" ", "
1
2
3
4
5
```

## 删除字符串中的引号

**示例函数:**

```sh
trim_quotes() {
    # 用法: trim_quotes "字符串"

    # 禁用通配符匹配。
    # 这使得下面的单词分割安全。
    set -f

    # 存储 'IFS' 的当前值，以便
    # 稍后可以恢复它。
    old_ifs=$IFS

    # 将 'IFS' 设置为 ["']。
    IFS=\"\'

    # 创建一个参数列表，在
    # ["'] 处分割字符串。
    #
    # 禁用这个 shellcheck 错误，因为它只
    # 警告单词分割，这是我们期望的。
    # shellcheck disable=2086
    set -- $1

    # 将 'IFS' 设置为空白以删除由
    # ["'] 删除留下的空格。
    IFS=

    # 打印去掉引号的字符串。
    printf '%s\n' "$*"

    # 恢复 'IFS' 的值。
    IFS=$old_ifs

    # 重新启用通配符匹配。
    set +f
}
```

**使用示例:**

```shell
$ var="'Hello', \"World\""
$ trim_quotes "$var"
Hello, World
```

# 文件操作

## 解析 `key=val` 文件

这可以用于解析简单的 `key=value` 配置文件。

```shell
# 设置 'IFS' 告诉 'read' 在哪里分割字符串。
while IFS='=' read -r key val; do
    # 跳过包含注释的行。
    # （以 '#' 开头的行）。
    [ "${key##\#*}" ] || continue

    # '$key' 存储键。
    # '$val' 存储值。
    printf '%s: %s\n' "$key" "$val"

    # 或者用以下内容替换 'printf'
    # 使用 '$val' 的值填充名为 '$key' 的变量。
    #
    # 注意: 我会扩展这个检查以确保 'key' 是
    #       一个有效的变量名。
    # export "$key=$val"
    #
    # 带有错误处理的示例:
    # export "$key=$val" 2>/dev/null ||
    #     printf 'warning %s is not a valid variable name\n' "$key"
done < "file"
```

## 获取文件的前 N 行

`head` 命令的替代方案。

**示例函数:**

```sh
head() {
    # 用法: head "n" "文件"
    while IFS= read -r line; do
        printf '%s\n' "$line"
        i=$((i+1))
        [ "$i" = "$1" ] && return
    done < "$2"

    # 在循环中使用的 'read' 将跳过
    # 文件的最后一行，如果它不包含
    # 换行符而是包含 EOF。
    #
    # 最后一行迭代被跳过，因为 'read'
    # 在遇到 EOF 时以 '1' 退出。但是，'read'
    # 仍然会填充变量。
    #
    # 这确保最后一行在适用时始终被打印。
    [ -n "$line" ] && printf %s "$line"
}
```

**使用示例:**

```shell
$ head 2 ~/.bashrc
# Prompt
PS1='➜ '

$ head 1 ~/.bashrc
# Prompt
```

## 获取文件的行数

`wc -l` 的替代方案。

**示例函数:**

```sh
lines() {
    # 用法: lines "文件"

    # '|| [ -n "$line" ]': 这确保以
    # EOL 而不是换行符结尾的行仍然
    # 在循环中被操作。
    #
    # 'read' 在看到 EOL 时以 '1' 退出，
    # 没有添加的测试，行不会被发送
    # 到循环。
    while IFS= read -r line || [ -n "$line" ]; do
        lines=$((lines+1))
    done < "$1"

    printf '%s\n' "$lines"
}
```

**使用示例:**

```shell
$ lines ~/.bashrc
48
```

## 统计目录中的文件或目录数量

这通过将全局匹配的输出传递给函数然后计算参数数量来工作。

**示例函数:**

```sh
count() {
    # 用法: count /path/to/dir/*
    #        count /path/to/dir/*/
    [ -e "$1" ] \
        && printf '%s\n' "$#" \
        || printf '%s\n' 0
}
```

**使用示例:**

```shell
# 计算目录中的所有文件。
$ count ~/Downloads/*
232

# 计算目录中的所有目录。
$ count ~/Downloads/*/
45

# 计算目录中的所有 jpg 文件。
$ count ~/Pictures/*.jpg
64
```

## 创建空文件

`touch` 的替代方案。

```shell
:>file

# 或者（shellcheck 会对此发出警告）
>file
```

# 文件路径

## 获取文件路径的目录名

`dirname` 命令的替代方案。

**示例函数:**

```sh
dirname() {
    # 用法: dirname "路径"

    # 如果 '$1' 为空，则将 'dir' 设置为 '.'，否则为 '$1'。
    dir=${1:-.}

    # 从字符串末尾删除所有尾随的正斜杠 '/'。
    #
    # "${dir##*[!/]}": 从字符串开头删除所有非正斜杠，
    # 只留下尾随斜杠。
    # "${dir%%"${}"}": 从原始字符串末尾删除上述
    # 替换的结果（正斜杠字符串）。
    dir=${dir%%"${dir##*[!/]}"}

    # 如果变量*不*包含任何正斜杠，
    # 将其值设置为 '.'。
    [ "${dir##*/*}" ] && dir=.

    # 删除最后一个正斜杠 '/' *之后*的所有内容。
    dir=${dir%/*}

    # 再次从字符串末尾删除所有尾随的正斜杠 '/'（见上文）。
    dir=${dir%%"${dir##*[!/]}"}

    # 打印结果字符串，如果为空，
    # 打印 '/'。
    printf '%s\n' "${dir:-/}"
}
```

**使用示例:**

```shell
$ dirname ~/Pictures/Wallpapers/1.jpg
/home/black/Pictures/Wallpapers/

$ dirname ~/Pictures/Downloads/
/home/black/Pictures/
```

## 获取文件路径的基本名称

`basename` 命令的替代方案。

**示例函数:**

```sh
basename() {
    # 用法: basename "路径" ["后缀"]

    # 从字符串末尾删除所有尾随的正斜杠 '/'。
    #
    # "${1##*[!/]}": 从字符串开头删除所有非正斜杠，
    # 只留下尾随斜杠。
    # "${1%%"${}"}:  从原始字符串末尾删除上述
    # 替换的结果（正斜杠字符串）。
    dir=${1%${1##*[!/]}}

    # 删除最后一个正斜杠 '/' 之前的所有内容。
    dir=${dir##*/}

    # 如果向函数传递了后缀，则从结果字符串末尾删除它。
    dir=${dir%"$2"}

    # 打印结果字符串，如果为空，
    # 打印 '/'。
    printf '%s\n' "${dir:-/}"
}
```

**使用示例:**

```shell
$ basename ~/Pictures/Wallpapers/1.jpg
1.jpg

$ basename ~/Pictures/Wallpapers/1.jpg .jpg
1

$ basename ~/Pictures/Downloads/
Downloads
```

# 循环

## 循环遍历（*小范围*）数字

`seq` 的替代方案，仅适用于小范围和静态数字范围。数字列表也可以替换为单词列表、变量等。

```shell
# 从 0 到 10 循环。
for i in 0 1 2 3 4 5 6 7 8 9 10; do
    printf '%s\n' "$i"
done
```

## 循环遍历可变范围的数字

`seq` 的替代方案。

```shell
# 从 var 到 var 循环。
start=0
end=50

while [ "$start" -le "$end" ]; do
    printf '%s\n' "$start"
    start=$((start+1))
done
```

## 循环遍历文件内容

```shell
while IFS= read -r line || [ -n "$line" ]; do
    printf '%s\n' "$line"
done < "file"
```

## 循环遍历文件和目录

不要使用 `ls`。

**注意:** 当通配符不匹配任何内容（空目录或没有匹配的文件）时，变量将包含未展开的通配符。为了避免处理未展开的通配符，请使用适当的[文件条件](#文件条件)检查变量中包含的文件的存在性。请注意，符号链接会被解析。

```shell
# 贪婪示例。
for file in *; do
    [ -e "$file" ] || [ -L "$file" ] || continue
    printf '%s\n' "$file"
done

# 目录中的 PNG 文件。
for file in ~/Pictures/*.png; do
    [ -f "$file" ] || continue
    printf '%s\n' "$file"
done

# 遍历目录。
for dir in ~/Downloads/*/; do
    [ -d "$dir" ] || continue
    printf '%s\n' "$dir"
done
```

# 变量

## 根据另一个变量命名变量

```shell
$ var="world"
$ eval "hello_$var=value"
$ eval printf '%s\n' "\$hello_$var"
value
```

# 转义序列

与普遍看法相反，使用原始转义序列没有问题。使用 `tput` 抽象了与手动打印相同的 ANSI 序列。更糟糕的是，`tput` 实际上不是可移植的。有许多 `tput` 变体，每个都有不同的命令和语法（*尝试在 FreeBSD 系统上使用 `tput setaf 3`*）。原始序列是可以的。

## 文本颜色

**注意:** 需要 RGB 值的序列仅在真彩色终端仿真器中有效。

| 序列 | 作用 | 值 |
| -------- | ---------------- | ----- |
| `\033[38;5;<NUM>m` | 设置文本前景色。 | `0-255`
| `\033[48;5;<NUM>m` | 设置文本背景色。 | `0-255`
| `\033[38;2;<R>;<G>;<B>m` | 将文本前景色设置为 RGB 颜色。 | `R`, `G`, `B`
| `\033[48;2;<R>;<G>;<B>m` | 将文本背景色设置为 RGB 颜色。 | `R`, `G`, `B`

## 文本属性

| 序列 | 作用 |
| -------- | ---------------- |
| `\033[m`  | 重置文本格式和颜色。
| `\033[1m` | 粗体文本。 |
| `\033[2m` | 淡化文本。 |
| `\033[3m` | 斜体文本。 |
| `\033[4m` | 下划线文本。 |
| `\033[5m` | 慢闪烁。 |
| `\033[7m` | 交换前景和背景颜色。 |
| `\033[8m` | 隐藏文本。 |
| `\033[9m` | 删除线文本。 |


## 光标移动

| 序列 | 作用 | 值 |
| -------- | ---------------- | ----- |
| `\033[<LINE>;<COLUMN>H` | 将光标移动到绝对位置。 | `line`, `column`
| `\033[H` | 将光标移动到起始位置（`0,0`）。 |
| `\033[<NUM>A` | 将光标向上移动 N 行。 | `num`
| `\033[<NUM>B` | 将光标向下移动 N 行。 | `num`
| `\033[<NUM>C` | 将光标向右移动 N 列。 | `num`
| `\033[<NUM>D` | 将光标向左移动 N 列。 | `num`
| `\033[s` | 保存光标位置。 |
| `\033[u` | 恢复光标位置。 |


## 擦除文本

| 序列 | 作用 |
| -------- | ---------------- |
| `\033[K` | 从光标位置擦除到行尾。
| `\033[1K` | 从光标位置擦除到行首。
| `\033[2K` | 擦除整个当前行。
| `\033[J` | 从当前行擦除到屏幕底部。
| `\033[1J` | 从当前行擦除到屏幕顶部。
| `\033[2J` | 清屏。
| `\033[2J\033[H` | 清屏并将光标移动到 `0,0`。


# 参数扩展

## 前缀和后缀删除

| 参数 | 作用 |
| --------- | ---------------- |
| `${VAR#PATTERN}` | 从字符串开头删除模式的最短匹配。 |
| `${VAR##PATTERN}` | 从字符串开头删除模式的最长匹配。 |
| `${VAR%PATTERN}` | 从字符串末尾删除模式的最短匹配。 |
| `${VAR%%PATTERN}` | 从字符串末尾删除模式的最长匹配。 |

## 长度

| 参数 | 作用 |
| --------- | ---------------- |
| `${#VAR}` | 变量的字符长度。

## 默认值

| 参数 | 作用 |
| --------- | ---------------- |
| `${VAR:-STRING}` | 如果 `VAR` 为空或未设置，使用 `STRING` 作为其值。
| `${VAR-STRING}` | 如果 `VAR` 未设置，使用 `STRING` 作为其值。
| `${VAR:=STRING}` | 如果 `VAR` 为空或未设置，将 `VAR` 的值设置为 `STRING`。
| `${VAR=STRING}` | 如果 `VAR` 未设置，将 `VAR` 的值设置为 `STRING`。
| `${VAR:+STRING}` | 如果 `VAR` 不为空，使用 `STRING` 作为其值。
| `${VAR+STRING}` | 如果 `VAR` 已设置，使用 `STRING` 作为其值。
| `${VAR:?STRING}` | 如果为空或未设置则显示错误。
| `${VAR?STRING}` | 如果未设置则显示错误。


# 条件表达式

用于 `[ ]` `if [ ]; then` 和 `test`。

## 文件条件

| 表达式 | 值  | 作用 |
| ---------- | ------ | ---------------- |
| `-b`       | `file` | 如果文件存在且是块特殊文件。
| `-c`       | `file` | 如果文件存在且是字符特殊文件。
| `-d`       | `file` | 如果文件存在且是目录。
| `-e`       | `file` | 如果文件存在。
| `-f`       | `file` | 如果文件存在且是常规文件。
| `-g`       | `file` | 如果文件存在且设置了 set-group-id 位。
| `-h`       | `file` | 如果文件存在且是符号链接。
| `-p`       | `file` | 如果文件存在且是命名管道（*FIFO*）。
| `-r`       | `file` | 如果文件存在且可读。
| `-s`       | `file` | 如果文件存在且大小大于零。
| `-t`       | `fd`   | 如果文件描述符已打开且指向终端。
| `-u`       | `file` | 如果文件存在且设置了 set-user-id 位。
| `-w`       | `file` | 如果文件存在且可写。
| `-x`       | `file` | 如果文件存在且可执行。
| `-L`       | `file` | 如果文件存在且是符号链接。
| `-S`       | `file` | 如果文件存在且是套接字。

## 变量条件

| 表达式 | 值 | 作用 |
| ---------- | ----- | ---------------- |
| `-z`       | `var` | 如果字符串长度为零。
| `-n`       | `var` | 如果字符串长度非零。

## 变量比较

| 表达式 | 作用 |
| ---------- | ---------------- |
| `var = var2` | 等于。
| `var != var2` | 不等于。
| `var -eq var2` | 等于（*代数比较*）。
| `var -ne var2` | 不等于（*代数比较*）。
| `var -gt var2` | 大于（*代数比较*）。
| `var -ge var2` | 大于或等于（*代数比较*）。
| `var -lt var2` | 小于（*代数比较*）。
| `var -le var2` | 小于或等于（*代数比较*）。


# 算术运算符

## 赋值

| 运算符 | 作用 |
| --------- | ---------------- |
| `=`       | 初始化或更改变量的值。

## 算术运算

| 运算符 | 作用 |
| --------- | ---------------- |
| `+` | 加法
| `-` | 减法
| `*` | 乘法
| `/` | 除法
| `%` | 取模
| `+=` | 加等于（*增加变量*）
| `-=` | 减等于（*减少变量*）
| `*=` | 乘等于（*乘以变量*）
| `/=` | 除等于（*除以变量*）
| `%=` | 模等于（*变量除法的余数*）

## 位运算

| 运算符 | 作用 |
| --------- | ---------------- |
| `<<` | 按位左移
| `<<=` | 左移等于
| `>>` | 按位右移
| `>>=` | 右移等于
| `&` | 按位与
| `&=` | 按位与等于
| `\|` | 按位或
| `\|=` | 按位或等于
| `~` | 按位非
| `^` | 按位异或
| `^=` | 按位异或等于

## 逻辑运算

| 运算符 | 作用 |
| --------- | ---------------- |
| `!` | 非
| `&&` | 与
| `\|\|` | 或

## 其他运算

| 运算符 | 作用 | 示例 |
| --------- | ---------------- | ------- |
| `,` | 逗号分隔符 | `((a=1,b=2,c=3))`


# 算术运算

## 三元测试

```shell
# 如果 var2 大于 var，将 var 的值设置为 var2。
# 'var2 > var': 要测试的条件。
# '? var2': 如果测试成功。
# ': var': 如果测试失败。
var=$((var2 > var ? var2 : var))
```

## 检查数字是否为浮点数

**示例函数:**

```sh
is_float() {
    # 用法: is_float "数字"

    # 测试检查输入是否包含
    # '.'。这会过滤掉整数。
    [ -z "${1##*.*}" ] &&
        printf %f "$1" >/dev/null 2>&1
}
```

**使用示例:**

```shell
$ is_float 1 && echo true
$

$ is_float 1.1 && echo true
$ true
```

## 检查数字是否为整数

**示例函数:**

```sh
is_int() {
    # 用法: is_int "数字"
    printf %d "$1" >/dev/null 2>&1
}
```

**使用示例:**

```shell
$ is_int 1 && echo true
$ true

$ is_int 1.1 && echo true
$
```

# 陷阱

陷阱允许脚本在各种信号上执行代码。在 [pxltrm](https://github.com/dylanaraps/pxltrm)（*用 bash 编写的像素艺术编辑器*）中，陷阱用于在窗口大小调整时重绘用户界面。另一个用例是在脚本退出时清理临时文件。

应该在脚本开始附近添加陷阱，这样任何早期错误也会被捕获。

## 在脚本退出时执行某些操作

```shell
# 在脚本退出时清屏。
trap 'printf \\033[2J\\033[H\\033[m' EXIT

# 在脚本退出时运行函数。
# 'clean_up' 是函数的名称。
trap clean_up EXIT
```

## 忽略终端中断 (CTRL+C, SIGINT)

```shell
trap '' INT
```

# 过时语法

## 命令替换

使用 `$()` 而不是 `` ` ` ``。

```shell
# 正确。
var="$(command)"

# 错误。
var=`command`

# $() 可以轻松嵌套，而 `` 不能。
var="$(command "$(command)")"
```

# 内部和环境变量

## 打开用户首选的文本编辑器

```shell
"$EDITOR" "$file"

# 注意: 这个变量可能为空，设置一个后备值。
"${EDITOR:-vi}" "$file"
```

## 获取当前工作目录

这是 `pwd` 内置命令的替代方案。

```shell
"$PWD"
```

## 获取当前 shell 的 PID

```
"$"
```

## 获取当前 shell 选项

```
"$-"
```

# 后记

感谢阅读！如果这本圣经以任何方式帮助了您，并且您想要回报，请考虑捐赠。捐赠给了我时间来使这成为最好的资源。不能捐赠？没关系，给仓库加星并与您的朋友分享吧！

<a href="https://www.patreon.com/dyla"><img src="https://img.shields.io/badge/donate-patreon-yellow.svg"></a>

继续摇滚。🤘

>附原许可证：
>```
>The MIT License (MIT)
>
>Copyright (c) 2019 Dylan Araps
>
>Permission is hereby granted, free of charge, to any person obtaining a copy
>of this software and associated documentation files (the "Software"), to deal
>in the Software without restriction, including without limitation the rights
>to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
>copies of the Software, and to permit persons to whom the Software is
>furnished to do so, subject to the following conditions:
>
>The above copyright notice and this permission notice shall be included in all
>copies or substantial portions of the Software.
>
>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
>IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
>FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
>AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
>LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
>OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
>SOFTWARE.
>```
