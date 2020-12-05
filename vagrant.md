## Vagrant - Comandos básicos

vagrant up

vagrant halt

vagrant reload --provision

vagrant destroy

vagrant ssh

user: vagrant, pass: vagrant

You need to ssh to the vm as usual and then edit /etc/ssh/sshd_config . There you need to set PasswordAuthentication to yes instead of no . This will allow password authentication

Vagrantfile
```
$configuracion_inicial = <<-SCRIPT
  sudo apt-get update
  sudo apt-get install nginx -y
SCRIPT

Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/focal64"
  config.vm.network "public_network", ip: "192.168.1.75"
  #config.vm.synced_folder ".", "/home/vagrant", disabled:false
  config.vm.provision "shell", inline: $configuracion_inicial
end
```

