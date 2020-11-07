# Ubuntu Server (14.04): Buenas prácticas de configuración
_by Juan Ramón Gavilanes (<jrgavilanes@gmail.com>)_

## Índice.
 - 1.-  [Configuración inicial con Ubuntu Server](#1.0)
   - 1.1.- [Login como root.](#1.1)
   - 1.2.- [Crear nuevo usuario y escalarlo.](#1.2)
   - 1.3.- [Añadir clave pública de autentificación.](#1.3)
   - 1.4.- [Configurar demonio SSH: eliminar acceso de root.](#1.4)
   - 1.5.- [Configurar un firewall básico.](#1.5)
   - 1.6.- [Configurar zonas horarias y sincronización __N__etwork  __T__ime __P__rotocol.](#1.6)
   - 1.7.- [Crear un archivo SWAP.](#1.7)
   - 1.8.- [Bibliografia](#1.8)
 - 2.- [Servidores Web](#2.0)
   - 2.1.- [Nginx](#2.1)
   - 2.2.- [Mysql y PHP](#2.2)
   - 2.3.- [Bibliografía](#2.3)
 - 3.-[Más aplicaciones](#3.0)
   - 3.1.- [Node js](#3.1)
   - 3.2.- [Wordpress](#3.2)
   - 3.3.- [Laravel](#3.3)
   - 3.4.- [Bibliografía](#3.4)
 - 4.- [Seguridad](#4.0)
   - 4.1.- [Actualizar sistema](#4.1) 
   - 4.2.- [Crear e instalar certificado SSL](#4.2)
   - 4.3.- [Bibliografía](#4.3)
 - 5.- [Otros](#5.0)
   - 5.1.- [Chequear velocidad de internet desde la terminal](#5.1) 
   - 5.2.- [Listar el total de paquetes instalados](#5.2)
   - 5.3.- [Mi Bibliografía](#5.3)
   - 5.4-  [Iniciamos automáticamente contenedores o servicios al iniciar el sistema](#5.4)
   - 5.5-  [SSH Server y Networking](#5.5)
 
  

## 1.-  Configuración inicial con Ubuntu Server <a name="1.0"></a>

### 1.1.- Login como root.<a name="1.1"></a>
```
local$: ssh root@SERVER_IP_ADDRESS
```
¿Quieres saber más sobre [cómo conectar con tu servidor con SSH](https://www.digitalocean.com/community/tutorials/how-to-connect-to-your-droplet-with-ssh?utm_source=Customerio&utm_medium=Email_Internal&utm_campaign=Email_UbuntuDistroNginxWelcome)?

### 1.2.- Crear nuevo usuario y escalarlo.<a name="1.2"></a>
```
# adduser demoUser
# gpasswd -a demoUser sudo
```
Si queremos volver a cambiar la clave de usuario, escribiremos:
```
# sudo passwd demoUser
```


### 1.3.- Añadir clave pública de autentificación.<a name="1.3"></a>
Genera par de claves en tu máquina local ( si no tienes ninguna todavía )
```
local$: ssh-keygen
```
Asumiendo que su usuario es localuser está será la salida generada por el comando:

```
ssh-keygen output
Generating public/private rsa key pair.
Enter file in which to save the key (/Users/localuser/.ssh/id_rsa):
```
__Recuerda que no hay que compartir la clave privada con nadie!!__

Después de generar el par de claves SSH, debes __copiar la clave pública__ a tu nuevo servidor.

```
local$: ssh-copy-id demoUser@SERVER_IP_ADDRESS
```


### 1.4.- Configurar demonio SSH: eliminar acceso de root.<a name="1.4"></a>
En el servidor y conectados como root, editarmos el archivo de configuración de SSH y bloqueamos el acceso de root por ssh.
```
vi /etc/ssh/sshd_config
```
|  /etc/ssh/sshd_config         |
|-----------------------------------|
|  PermitRootLogin __no__  |
<br>
Si queremos forzar la conexión ssh usando sólo claves privadas, evitando por tanto, la conexión por password abierto, deberemos cambiar el siguiente parámetro:

|  /etc/ssh/sshd_config         |
|-----------------------------------|
|  PasswordAuthentication __no__  |
<br>


Tras realizar las modificaciones deseadas, salvamos y reiniciamos el servicio
    # service ssh restart

__Antes de desconectar nuestra sesión como root__, abrimos otro terminal y __comprobamos__ que __el nuevo usuario conecta__ correctamente. Si necesitamos escalar privilegios con el nuevo usuario, sólo debemos incluir la palabra _sudo_ al inicio del comando.

---

_Combo: Si además queremos proteger nuestra conexión de SSH de ataques de fuerza bruta, podemos instalar __fail2ban__:_
```
# apt-get update
# apt-get install fail2ban
```
Por defecto, baneará (expulsará:) 10 minutos al usuario que se equivoque 3 veces al introducir su password en un período de 10 minutos.

¿Quieres saber más sobre [cómo proteger SSH](https://www.digitalocean.com/community/tutorials/how-to-protect-ssh-with-fail2ban-on-ubuntu-14-04)?


### 1.5.- Configurando un firewall básico.<a name="1.5"></a>
Ubuntu incorpora de serie una herramienta llamada __ufw__, para configurar las políticas de firewall. Nuestra estrategia básica será bloquear por defecto todo lo que no necesitemos.

El demonio SSH corre por defecto en el puerto 22, y ufw permite referenciarlo por nombre:
```
sudo ufw allow ssh
```
En caso en que hayamos modificado el puerto por el que está escuchando, habrá que referenciar el puerto junto con el protocolo:
```
sudo ufw allow 4444/tcp
```

Si queremos ejecutar un servidor HTTP convecional, necesitaremos abrir el puerto 80:
```
sudo ufw allow 80/tcp
```

Si queremos que el servidor tenga SSL/TSL activado, también deberemos permitir el tráfico en su puerto:
```
sudo ufw allow 443/tcp
```

Necesitas correo SMTP?
```
sudo ufw allow 25/tcp
```

Quieres cerrar un puerto abierto?
```
sudo deny 25/tcp
```

Una vez tengamos las excepciones, las podemos revisar escribiendo:
```
sudo ufw show added
```

Si todo está ok, podemos activar el firewall escribiendo:
```
sudo ufw enable
```
Este comando bloqueará el tráfico a los puertos, instalará las excepciones que hemos indicado y configurará el servicio para que arranque automáticamente siempre que lo haga el servidor.

¿Quieres saber más sobre [configuración avanzada del firewall](https://www.digitalocean.com/community/tutorials/how-to-setup-a-firewall-with-ufw-on-an-ubuntu-and-debian-cloud-server)?


### 1.6.- Configurar zonas horarias y sincronización __N__etwork  __T__ime __P__rotocol.<a name="1.6"></a>
Ejecuta el siguiente comando para establecer la zona horaria que quieres para el servidor.
```
sudo dpkg-reconfigure tzdata
```
Configurar sincronización NTP, para sincronizar la hora con otros servidores de Internet.
```
sudo apt-get update
sudo apt-get install ntp
```
¿Quieres saber más sobre [NTP](https://www.digitalocean.com/community/tutorials/how-to-set-up-time-synchronization-on-ubuntu-12-04)?


## 1.7.- Crear un archivo SWAP.<a name="1.7"></a>
El tamaño que debe tener un __espacio SWAP__ depende de la situación, pero el doble de la memoria RAM disponible es un buen punto de partida. Si queremos que tenga __4 G__igas este es el comando a ejecutar:
```
sudo fallocate -l 4G /swapfile
```
__Restringimos el acceso__ para que otros usuarios o procesos no puedan afectarle
```
sudo chmod 600 /swapfile
```
__Formateamos__ el archivo como swap
```
sudo mkswap /swapfile
```
Lo __activamos__
```
sudo swapon /swapfile
```
__Guardamos__ configuración para que __inicie automáticamente__ al arrancar el sistema.
```
sudo sh -c 'echo "/swapfile none swap sw 0 0" >> /etc/fstab'
```

### 1.8.- Bibliografía.<a name="1.8"></a>
- [Initial Server Setup with Ubuntu 14.04](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-14-04)
- [Additional Recommended Steps for New Ubuntu 14.04 Servers](https://www.digitalocean.com/community/tutorials/additional-recommended-steps-for-new-ubuntu-14-04-servers)
- [How To Protect SSH with Fail2Ban on Ubuntu 14.04](https://www.digitalocean.com/community/tutorials/how-to-protect-ssh-with-fail2ban-on-ubuntu-14-04)
- [7 Security Measures to Protect your Servers](https://www.digitalocean.com/community/tutorials/7-security-measures-to-protect-your-servers?utm_source=Customerio&utm_medium=Email_Internal&utm_campaign=Email_UbuntuDistroNginxWelcome)
- [How To Choose an Effective Backup Strategy for your VPS](https://www.digitalocean.com/community/tutorials/how-to-choose-an-effective-backup-strategy-for-your-vps?utm_source=Customerio&utm_medium=Email_Internal&utm_campaign=Email_UbuntuDistroNginxWelcome)
- [How To Use SFTP to Securely Transfer Files with a Remote Server](https://www.digitalocean.com/community/tutorials/how-to-choose-an-effective-backup-strategy-for-your-vps?utm_source=Customerio&utm_medium=Email_Internal&utm_campaign=Email_UbuntuDistroNginxWelcome)

## 2.-  Servidores Web <a name="2.0"></a>
### 2.1.- Nginx.<a name="2.1"></a>
Instalación:
```
sudo apt-get update
sudo apt-get install nginx
```
Comprobamos el acceso desde el navegador web. Si necesitamos la dirección pública de la máquina, ejecutamos:
```
ip addr show eth0 | grep inet | awk '{ print $2; }' | sed 's/\/.*$//'
```
__Manejando el proceso Nginx:__

__Detener__ el servidor web:
```
sudo service nginx stop
```
__Arrancar__ el servidor web:
```
sudo service nginx start
```
__Reiniciar__ el servidor web:
```
sudo service nginx restart
```
Nos aseguramos que el servidor web __iniciará automáticamente__ al arrancar el servidor:
```
sudo update-rc.d nginx defaults
```
Configuramos el directorio Document root, que por defecto, está en ___/usr/share/nginx/html___ para dejarlo en ___/var/www___
```
//En este ejemplo configuramos la esctructura de directorio para alojar dos sitios web.
sudo mkdir -p /var/www/example.com/html
sudo mkdir -p /var/www/test.com/html
//Le damos privilegios a nuestro usuario regular.
sudo chown -R $USER:$USER /var/www/example.com/html
sudo chown -R $USER:$USER /var/www/test.com/html
//Aseguramos que los permisos de la raíz sean los correctos.
sudo chmod -R 755 /var/www
```
Creamos los archivos ___Server Block___
```
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/example.com
```
Editamos el nuevo archivo example.com, y lo dejamos así:
```
server {
    listen 80 default_server;
    listen [::]:80 default_server ipv6only=on;

    root /var/www/example.com/html;
    index index.html index.htm;

    server_name example.com www.example.com;

    location / {
        try_files $uri $uri/ =404;
    }
}
```
Activamos el nuevo Server Block y reiniciamos el servidor.
```
sudo ln -s /etc/nginx/sites-available/example.com /etc/nginx/sites-enabled/
```
Ya estaríamos sirviendo nuestro nuevo sitio web, sin embargo, nos queda por hacer unos sencillos ajustes:
```
//Eliminamos el enlace del sitio que se crea por defecto.
sudo rm /etc/nginx/sites-enabled/default
```
Descomentamos un parámetro en el archivo de configuración de nginx

|  /etc/nginx/nginx.conf         |
|-----------------------------------|
|  server_names_hash_bucket_size 64; |
<br>
Reiniciamos nginx
```
sudo service nginx restart
```

Por defecto el archivo LOG se almacena en:
```
/var/log/nginx/error.log
```

### 2.2.- Mysql y PHP.<a name="2.2"></a>
#### Instalación de MySQL
```
sudo apt-get update
sudo apt-get install mysql-server
//Generamos la estructura de directorios:
sudo mysql_install_db
//Protegemos la base de datos corriendo este script de seguridad
sudo mysql_secure_installation
```
#### Instalación de PHP
```
sudo apt-get install php5-fpm php5-mysql php5-cli php5-mcrypt
//Si planeamos ejecutar wordpress añadir: ->  php5-gd libssh2-php
```
Configuramos el archivo de configuración de PHP para hacerlo más seguro. Buscamos el parámetro __cgi.fix_pathinfo__, lo descomentamos y ponemos su valor a __0__.

|  /etc/php5/fpm/php.ini         |
|-----------------------------------|
|  cgi.fix_pathinfo=0 |
<br>
Y ahora reiniciamos el procesador PHP
```
sudo service php5-fpm restart
```
#### Configuración de Nginx para usar PHP
Abrimos el Server Block del la aplicación que queremos que ejecute PHP, y lo dejamos así, realizando los cambios pertinentes al arrea de  __root__, y __server_name__.

```
sudo vi /etc/nginx/sites-available/default
```
```
server {
    listen 80 default_server;
    listen [::]:80 default_server ipv6only=on;

    root /usr/share/nginx/html;
    index index.php index.html index.htm;

    server_name server_domain_name_or_IP;

    location / {
        try_files $uri $uri/ =404;
    }

    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }

    location ~ \.php$ {
        try_files $uri =404;
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        fastcgi_pass unix:/var/run/php5-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```
Reiniciamos el servicio
```
sudo service nginx restart
```
Probamos el servidor cargando un archivo .php con la función __phpinfo();__


### 2.3.- Bibliografía.<a name="2.3"></a>
- [How To Install Nginx on Ubuntu 14.04 LTS](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-14-04-lts?utm_source=Customerio&utm_medium=Email_Internal&utm_campaign=Email_UbuntuDistroNginxWelcome)
- [How To Set Up Nginx Server Blocks (Virtual Hosts) on Ubuntu 14.04 LTS](https://www.digitalocean.com/community/tutorials/how-to-set-up-nginx-server-blocks-virtual-hosts-on-ubuntu-14-04-lts?utm_source=Customerio&utm_medium=Email_Internal&utm_campaign=Email_UbuntuDistroNginxWelcome)
- [How To Install Apache Tomcat 7 on Ubuntu 14.04 via Apt-Get](https://www.digitalocean.com/community/tutorials/how-to-install-apache-tomcat-7-on-ubuntu-14-04-via-apt-get?utm_source=Customerio&utm_medium=Email_Internal&utm_campaign=Email_UbuntuDistroNginxWelcome)
- [How To Set Up Apache Virtual Hosts on Ubuntu 14.04 LTS](https://www.digitalocean.com/community/tutorials/how-to-set-up-apache-virtual-hosts-on-ubuntu-14-04-lts?utm_source=Customerio&utm_medium=Email_Internal&utm_campaign=Email_UbuntuDistroNginxWelcome)
- [Introduction to Nginx and LEMP on Ubuntu 14.04](https://www.digitalocean.com/community/tutorial_series/introduction-to-nginx-and-lemp-on-ubuntu-14-04)
- [How To Upgrade to PHP 7 on Ubuntu 14.04](https://www.digitalocean.com/community/tutorials/how-to-upgrade-to-php-7-on-ubuntu-14-04)

## 3.-  Otras aplicaciones <a name="3.0"></a>
### 3.1.- Node Js.<a name="3.1"></a>
Hay varios métodos, ver bibliografía, pero el que más me ha gustado es instalarlo a través de NVM, ya que permite tener varios sistemas instalados y elegir cual usar.

Se instala así:
```
sudo apt-get update
sudo apt-get install build-essential libssl-dev
```
Ahora hay que obtener el script de instalación más actual desde [la página github del desarrollador](https://github.com/creationix/nvm). A día de hoy el siguiente script es el más actual:
```
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.29.0/install.sh | bash
```
Una vez instalado, cerramos la sesión y la volvemos a arrancar.

El siguiente comando nos permite elegir que versión de node queremos instalar:
```
nvm ls-remote
```
```
...
    iojs-v3.0.0
    iojs-v3.1.0
    iojs-v3.2.0
    iojs-v3.3.0
    iojs-v3.3.1
         v4.0.0
         v4.1.0
         v4.1.1
         v4.1.2
         v4.2.0
```
Si queremos instalar la última en nuestro sistema, ejecutamos:
```
nvm install 4.2.0
```
Para ver la versión de node que estamos usando ahora mismo escribimos:
```
node -v
```
Para ver las versiones que tenemos instaladas en nuestro sistema:
```
nvm ls
```
Para cambiar a otra versión que tengamos instalada:
```
nvm use 0.11.13
```
Para establecer una versión por defecto:
```
nvm alias default 4.2.0
nvm use default
```
### 3.2.- Wordpress.<a name="3.2"></a>
### 3.3.- Laravel.<a name="3.3"></a>

Preparación:
```
sudo apt-get update && apt-get upgrade
```
Instalación
```
sudo apt-get install php5-fpm php5-mysql php5-cli php5-mcrypt
```
__Configuramos Nginx__
```
sudo mkdir /var/www/laravel
sudo vi /etc/nginx/sites-available/laravel
```
Y copiamos esto:
```
server {
        listen 80;

        root /var/www/laravel/public/;
        index index.php index.html index.htm;

        server_name laravel.jrgware.test www.laravel.jrgware.test;

        location / {
             try_files $uri $uri/ /index.php$is_args$args;
        }

        # pass the PHP scripts to FastCGI server listening on /var/run/php5-fpm.sock
        location ~ \.php$ {
                try_files $uri /index.php =404;
                fastcgi_pass unix:/var/run/php5-fpm.sock;
                fastcgi_index index.php;
                fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
                include fastcgi_params;
        }
}
```

Activamos el sitio:
```
sudo ln -s /etc/nginx/sites-available/laravel /etc/nginx/sites-enabled/
```

__Configuramos PHP__

Editamos su archivo de configuración:
```
sudo vi  /etc/php5/fpm/php.ini
```
Buscamos la linea __cgi.fix_pathinfo__ y la dejamos así:
```
cgi.fix_pathinfo=0
```
Ahora editamos:
```
sudo vi /etc/php5/fpm/pool.d/www.conf
```
Si existe esta linea:
```
listen = 127.0.0.1:9000
```

la sustituimos por esta:
```
listen = /var/run/php5-fpm.sock
```

Salvamos todos los cambios y reiniciamos servicios:
```
sudo service php5-fpm restart
sudo service nginx restart
```
__Configuramos Composer__
```
sudo curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```
Ya podemos instalar Laravel
```
sudo composer create-project laravel/laravel /var/www/laravel/
```
Para finalizar establecemos los permisos de la carpeta
```
sudo chgrp -R www-data /var/www/laravel
sudo chmod -R 775 /var/www/laravel/storage
```


### 3.4.- Bibliografía.<a name="3.4"></a>
- [How To Install Node.js on an Ubuntu 14.04 server](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-an-ubuntu-14-04-server)
- [How To Install WordPress with Nginx on Ubuntu 14.04](https://www.digitalocean.com/community/tutorials/how-to-install-wordpress-with-nginx-on-ubuntu-14-04)
- [How To Install Laravel with Nginx on an Ubuntu 12.04 LTS VPS](https://www.digitalocean.com/community/tutorials/how-to-install-laravel-with-nginx-on-an-ubuntu-12-04-lts-vps)

## 4.-  Seguridad <a name="4.0"></a>

### 4.1.-  Actualizar sistema <a name="4.1"></a>
```
$ sudo apt-get update
$ sudo apt-get upgrade
$ sudo shutdown -r now //reiniciar servidor.

```
### 4.2.-  Crear e instalar certificado SSL <a name="4.2"></a>
```
$ sudo mkdir /etc/nginx/ssl
$ sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/nginx/ssl/nginx.key -out /etc/nginx/ssl/nginx.crt
//el campo más importante es (e.g. server FQDN or YOUR name), que debe ser el nombre del dominio o la ip pública del servidor.

// /etc/nginx/sites-available/my-server-block
server {
        listen 80 default_server;
        listen [::]:80 default_server ipv6only=on;

        listen 443 ssl;                                              // <-- Línea añadida

        root /usr/share/nginx/html;
        index index.html index.htm;

        server_name your_domain.com;
        ssl_certificate /etc/nginx/ssl/nginx.crt;           // <-- Línea añadida
        ssl_certificate_key /etc/nginx/ssl/nginx.key;  // <-- Línea añadida

        location / {
                try_files $uri $uri/ =404;
        }
}

$ sudo service nginx restart

```
Para que nuestro certificado esté avalado por una entidad y no muestre mensajes preocupantes en los navegadores, podemos usar los servicios de Let's Encrypt, mirar en bibliografía el articulo que lo explica detalladamente.

### 4.3.-  Bibliografía <a name="4.3"></a>
- [How To Create an SSL Certificate on Nginx for Ubuntu 14.04](https://www.digitalocean.com/community/tutorials/how-to-create-an-ssl-certificate-on-nginx-for-ubuntu-14-04)
- [Updating Ubuntu 14.04 -- Security Updates](https://www.digitalocean.com/community/questions/updating-ubuntu-14-04-security-updates)
- [How To Secure Nginx with Let's Encrypt on Ubuntu 14.04](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-14-04)

## 5.- Otros <a name="5.0"></a>
### 5.1.- Chequear velocidad de internet desde la terminal <a name="5.1"></a>
```
$ wget -O speedtest-cli https://raw.github.com/sivel/speedtest-cli/master/speedtest_cli.py
$ chmod +x speedtest-cli
$ ./speedtest-cli
```

### 5.2.- Listar el total de paquetes instalados <a name="5.2"></a>
 
Utilizamos el siguiente comando:
```
dpkg --get-selections
```

Gracias a este herramienta también es posible exportar la lista de paquetes instalados:
```
dpkg --get-selections > mis_paquetes
```

Luego podemos instalarlos en otra máquina:

```
dpkg --set-selections < mis_paquetes
apt-get dselect-upgrade
```

El comando dpkg –l da la lista de paquetes instalados pero con mayor información. Sin embargo, no es posible utilizarlo para instalar una lista de paquetes. 

### 5.3.- Mi Bibliografía <a name="5.3"></a>

[Mi Manual Digital Ocean](https://docs.google.com/document/d/1V-QEbGHa6ZhkpXp_-GwKbyHBLo551QryOeY2M-qVWM0/edit?usp=sharing)

[Repositorio configuraciones](https://github.com/jrgavilanes/configuraciones)


### 5.4- Iniciamos automáticamente contenedores o servicios al iniciar el sistema (autoexec.bat) <a name="5.4"></a>

file: /etc/rc.local
```
#!/bin/sh -e
#
# rc.local
#
# This script is executed at the end of each multiuser runlevel.
# Make sure that the script will "exit 0" on success or any other
# value on error.
#
# In order to enable or disable this script just change the execution
# bits.
#
# By default this script does nothing.


docker start rstudio1 && docker exec -it rstudio1 bash arrancaservicios.sh
docker start rstudio2

exit 0
```

### 5.5 SSH server y Networking <a name="5.5"></a>
instalar
```bash
$ sudo apt-get install openssh-server
```

### Pon IP estática al servidor
```bash
$ ifconfig -a
...
enp0s8: flags=4098<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        ether 08:00:27:e5:78:0f  txqueuelen 1000  (Ethernet)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
 ...

$ cat /etc/network/interfaces
auto lo
iface lo inet loopback

auto enp0s8
iface enp0s8 inet static
address 192.168.56.100

```
### Poner nombre del host
```bash
$ cat /etc/hostname 
apihub

```

## Lista de hosts accesibles
```
cat /etc/hosts
127.0.0.1	localhost
127.0.1.1	MateBook

# The following lines are desirable for IPv6 capable hosts
::1     ip6-localhost ip6-loopback
fe00::0 ip6-localnet
ff00::0 ip6-mcastprefix
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters

192.168.56.100	apihub
192.168.56.101	app1
192.168.56.102	app2
192.168.56.110	central1

```


## Autentificación SSH Key

### Genera clave privada/publica en cliente
```bash
ssh-keygen -t rsa -b 4096
```

### Sube la clave publica al servidor

#### modo facil
```bash
$ ssh-copy-id janrax@servidor 
```

#### modo dificil
```bash
# desde cliente
$ scp /home/janrax/.ssh/id_rsa.pub janrax@server:/home/janrax/.ssh/uploaded_key.pub
# en servidor
$ cat /home/janrax/.ssh/uploaded_key.pub >> /home/janrax/.ssh/authorized_keys
$ chmod 700 /home/janrax/.ssh
$ chmod 600 /home/janrax/.ssh/*
```

### Que ssh solo permita conexión con clave publica/privada
```
$ cat vi /etc/ssh/sshd_config 
...
PasswordAuthentication no
...

$ sudo service ssh restart
```
