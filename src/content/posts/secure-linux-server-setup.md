---
title: The Basics of Configuring and Securing Your New Linux Server
description: >-
  Learn how to secure and configure a new Linux server for hosting workloads.
pubDate: "Oct 01 2024"
---

I wanted outline my approach to configuring a Linux server. This article will cover the process of getting a freshly installed server to a state that it's ready to host workloads and be exposed to the internet. While this article focuses on Debian, it should also be applicable to Ubuntu, and with some adjustments, to the RHEL family.

# The pieces of a secure Linux server

Generally after getting a new server I would follow these steps. I normally run these steps in this order that they are written.

## Set up non-root user

First thing in securing a linux server is to create a new user and add it to the sudo group to allow the user to elevate access when needed. For one it will minimize accidents by avoiding making system wide changes due to a typo. Some of the other security benefits will become more clear when we get to the ssh section.

```bash
sudo adduser <new_user>

sudo usermod --append --groups sudo <new_user>
```

You can test this by switching to the new user and running a command that requires sudo.

```bash
sudo su <new_user>
sudo ls /
```

## Authorized Keys

Adding public key from your host machine will allow you to authenticate to the server without using the password later. First generate the key if you don't have one.

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

Copy the public key to the server using the following command:

```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub new_user@server_ip
```

Once you authenticate to the server your key will be copied and placed into `~/.ssh/authorized_keys` file.

## Configure SSH

Configuring SSH access is crucial, and care must be taken not to make errors that could lock you out of the server. The changes I make are not using root for ssh, disabling password authentication and only allowing users to authenticate using public keys. I also like to change the ssh port. It's what people call security through obscurity, but it does also cut back on bots trying to connect to your server and keeps the logs less cluttered.

I like to keep the original `sshd_config` unchanged so I can refer to it later. This approach applies custom changes by adding configuration files to `/etc/ssh/sshd_config.d/` directory. First navigate to

```bash
cd /etc/ssh/sshd_config.d/
```

These configuration files will overwrite the default configuration located in `/etc/ssh/sshd_config`. Check what files are there. Sometimes cloud providers like to add ssh configuration here. This might mess you up. You might think you disabled password authentication, but there might be a file changing that setting here. So delete all that and create your own file.

```bash
sudo vi /etc/ssh/sshd_config.d/50-custom.conf
```

Inside the file insert this configuration.

```
Port <new_port>
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
AllowUsers <new_user>
```

Now just change permissions of the file.

`sudo chmod 600 /etc/ssh/sshd_config.d/50-custom.conf`

The configuration file should be `rw-r--r--   212 root root` root user can read and write to the file while everyone else can just read it.

Restart the ssh service to apply the changes

`sudo systemctl restart ssh`

## update, upgrade, install

Next, update the server's packages and install some essential tools. First Update the local package index and upgrade the packages to their latest versions.

```bash
sudo apt update
sudo apt upgrade --yes
```

Then install the packages that are important for operating the server. The essentials in my opinion are:

```bash
sudo apt install -y ufw git fail2ban net-tools wget curl
```

For here you can install some optional packages that you like using. Here are a few suggestions that I like:

- `ncdu`: Disk usage analyzer
- `btop`: System resource monitor

## UFW setup

ufw is a great user friendly tool for managing the firewall. If you mess this up you might lock yourself out of the server, but the basic setup that I start with is.

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow <new_ssh_port> comment 'SSH'
```

Pretty straight forward. Allow all outgoing traffic, but only open the ssh port for ingress. Now just enable the firewall.

```bash
sudo ufw enable
```

For even more security you can limit the ssh port to only allow connection from a certain IPs if you wish. This could be your home or office.

## Configure unattended upgrades

Unattended upgrades automatically handle package upgrades at regular intervals. The scope of upgrades depends on the configuration. On Debian `unattended-upgrades` are preinstalled and enabled by default. The default settings are good as well. I like to make a few changes though. Mostly to help keep the server lean and ensure that outdated packages are regularly cleaned up.

There are a few files to know about.

`/etc/apt/apt.conf.d/20auto-upgrades`: enables unattended upgrades to run.

`/etc/apt/apt.conf.d/50unattended-upgrades` the default settings for unattended upgrades.

First open `20auto-upgrades` with vi.

```bash
sudo vi /etc/apt/apt.conf.d/20auto-upgrades
```

You should see these settings already there.

```
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
```

These will update the package index daily and run upgrades daily for certain repositories. I like to add `APT::Periodic::AutocleanInterval "7";` to it. This will run `apt-get autoclean` every 7 days. Removes packages from the local package cache that are no longer available for download from the repositories. So final file would be

```
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
```

To apply changes to `/etc/apt/apt.conf.d/50unattended-upgrades` while leaving the default file unchanged for future reference create a new file

```bash
sudo vi /etc/apt/apt.conf.d/52unattended-upgrades-local
```

Yes the name has to be exactly that. This will include repositories that will be followed and a few cleanup settings.

```
"Unattended-Upgrade::Origins-Pattern {"
  "origin=Debian,codename=${distro_codename},label=Debian";
  "origin=Debian,codename=${distro_codename},label=Debian-Security";
  "origin=Debian,codename=${distro_codename}-security,label=Debian-Security";
  "origin=Debian,codename=${distro_codename},label=Debian-Updates";
};

Unattended-Upgrade::Remove-New-Unused-Dependencies "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
```

I add `"origin=Debian,codename=${distro_codename},label=Debian-Updates";` which includes non-security, essential updates (bug fixes and critical changes) released before the next stable point release. The settings at the bottom cleans up dependencies helping to keep the server lean.

## Fail2Ban setup

Fail2Ban is a tool that helps protect your server from brute-force attacks by banning IP addresses that have multiple failed authentication attempts. I think the default settings fine and don't really change anything. The default settings can be seen here.

```
/etc/fail2ban/jail.conf
```

## Final notes

By following these steps, we have set up a non-root user, configured secure SSH access, enabled a firewall, automated package updates, and added a basic level of protection against brute-force attacks. From here you can proceed by installing Docker or the runtime of your choice and hosting an application.

## The automated solution

I've made a script to make this faster for myself. It's designed to sit on my local machine. It copies itself and executes itself on remote servers. It's opinionated to suite how I like to do things. You are welcome to copy it and tweak it as you see fit. Here is the link https://github.com/andrius-ordojan/server-sweet-spot
