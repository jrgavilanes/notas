# Notas rápidas

## instalar version node concreta

apt update -y && apt install curl
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
si eres root: curl -sL https://deb.nodesource.com/setup_14.x | bash -
apt update -y && apt install nodejs
node -v
npm -v

## Zona horarias
apt install tzdata
dpkg-reconfigure tzdata





## Comandos docker

docker-compose up -d

docker-compose down --volumes 

docker-compose ps

docker exec -it nodejsejemplo_ubuntu_1 bash

docker-compose start

docker-compose stop



## Esquema BD

http://knexjs.org/

```sql
CREATE TABLE usuarios (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(50) NOT NULL,
    password VARCHAR(100) NOT NULL,
    gendate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    moddate TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_email (email)
);


INSERT INTO `usuarios` (`id`, `email`, `password`, `gendate`, `moddate`) VALUES (NULL, 'jrgavilanes@gmail.com', 'juanra', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

insert into usuarios (email, password) values ('otro','otro');

update usuarios set email = 'otro22@ya.com' where id = 2;

```
