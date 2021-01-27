# Notas rápidas


## todo

ya guardo mensaje enviado, falta refrescar pantalla y propagar por socket.

## instalar version node concreta
```bash
apt update -y && apt install curl -y
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
si eres root: curl -sL https://deb.nodesource.com/setup_14.x | bash -
apt update -y && apt install nodejs
node -v
npm -v

## Zona horarias
apt install tzdata
dpkg-reconfigure tzdata
```





## Comandos docker
```bash
docker-compose up -d
docker-compose down --volumes 
docker-compose ps
docker exec -it nodejsejemplo_ubuntu_1 bash
docker-compose start
docker-compose stop
```



## Esquema BD

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

insert into usuarios (email, password) values ('jrgavilanes@gmail.com','juanra');
insert into usuarios (email, password) values ('usuario2','2222222');

update usuarios set email = 'otro22@ya.com' where id = 2;

CREATE TABLE chats (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    image_url VARCHAR(100) DEFAULT 'https://robohash.org/DEFECTO',
    num_mensajes INT UNSIGNED DEFAULT 0,
    gendate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    moddate TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_nombre (nombre)
);

INSERT INTO chats (NOMBRE) VALUES('MI CHAT');

CREATE TABLE mensajes (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    chat_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    mensaje VARCHAR(255) NOT NULL,
    gendate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES chats(id),
    FOREIGN KEY (user_id) REFERENCES usuarios(id)
);

INSERT INTO mensajes (chat_id, user_id, mensaje) VALUES ('34', '27', 'esto es 1'); 
INSERT INTO mensajes (chat_id, user_id, mensaje) VALUES ('34', '27', 'esto es 2'); 
INSERT INTO mensajes (chat_id, user_id, mensaje) VALUES ('34', '39','esto es nuevo');

```

## Ejemplos knex

```javascript
const usuarios = await db.schema.raw('select email,password from usuarios where id = 1');

```