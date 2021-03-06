const express = require('express')
const jwt = require('jsonwebtoken');

const bcrypt = require('bcrypt');
const saltRounds = 10;

const port = 5000

const db = require('knex')({
  client: 'mysql',
  connection: {
      host : process.env.DB_HOST,
      user : process.env.DB_USER,
      password : process.env.DB_PASSWORD,
      database : process.env.DB_DATABASE
  }
});

const app = express()

const http = require('http').Server(app);
const io = require('socket.io')(http);

// body-parser killer ;-)
app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use(express.static('public'));



const verificarAuth = (req, res, next) => {
    
  const token = req.headers.token || req.query.token

  jwt.verify(token, 'secretito', (err, decoded) => {

      if(err) {
          return res.status(401).json({
              mensaje: 'Error de token',
              err
          })
      }

      // Creamos una nueva propiedad con la info del usuario
      req.usuario = decoded.data; //data viene al generar el token en login.js
      next();

  });

}


// app.get('/', async (req, res) => {
//   // res.send('Hello Worldsa11!')
//   // db.schema.raw('select email from usuarios').then(data=>console.log(data.rows));
//   // const usuarios = await db.schema.raw('select email,password from usuarios where id = 1');
//   const usuarios = await db.select('email','password').from('usuarios').where({id:2});
  
//   if (usuarios.length) {
//     const {email, password} = usuarios[0];
//     return res.json({email,password});    
//   }
//   res.status(404).json({msg: 'Registro no encontrado'});

// });

app.post('/login', async (req,res)=>{

  
  // req.body.colega = 'juanra';
  // console.log("pues", req.body)
  // res.json(req.body);

  const {email, password } = req.body;

  let datos = await db('usuarios').where({email,}).select('id','password','email');
  if (datos.length>0) {
    const userid = datos[0].id;
    const password_encriptado = datos[0].password;
    const email_almacenado = datos[0].email;
    // console.log('llega', userid, password_encriptado);
    const valida = await bcrypt.compare(password, password_encriptado);
    if (valida && email===email_almacenado) {
      const user = {userid, email};
      let token = jwt.sign({data: user}, 'secretito', {expiresIn: 3600})
      return res.json({
        // user,
        token
      });
    } else {
      return res.status(404).json({msg: 'Usuario no válido'});
    }
  } else {
    return res.status(404).json({msg: 'Usuario no válido'});
  }
  

  // let user = {userid: 123456, email: req.body.email};
  // let token = jwt.sign({data: user}, 'secretito', {expiresIn: 3600})
  // return res.json({
  //     user,
  //     token
  // })

});



// app.get('/privado', verificarAuth, async (req,res)=>{

//   res.json({msg: 'mensaje privado ok'});

// });

// app.post('/mandanga', (req,res)=>{
// console.log(req.body);
// req.body.id='miide';
// res.status(201).json(req.body);

// });

// app.listen(port, () => {
//   console.log(`Example app listening at http://localhost:${port}`)
// })


http.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});

io.on('connection', function(socket) {
  console.log('A user connected');
  //Whenever someone disconnects this piece of code executed
  socket.on('disconnect', function () {
     console.log('A user disconnected');
  });
  socket.on('mensajito',(dato)=>{
    console.log('llega', dato);
    // socket.emit('mensajito', 'refresca');
    io.sockets.emit('mensajito', 'refrescaaaaa');
  });
});





app.post('/register', async (req,res)=>{

  try {

    // console.log('llega', req.body);
    const {email, password } = req.body;

    const salt = await bcrypt.genSalt(saltRounds);
    const password_encriptado = await bcrypt.hash(password, salt);
  

    let userid = await db('usuarios').insert({email: email, password: password_encriptado});
    userid = userid[0];

    // console.log('pues', respuesta[0]);
    // res.send(respuesta)

    const user = {userid, email};
    let token = jwt.sign({data: user}, 'secretito', {expiresIn: 3600})
    return res.json({
        // user,
        token
    });

    
  } catch (error) {

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({msg:'cuenta de email ya existe'});
    }

    return res.status(400).json({msg:'No se ha podido registrar al usuario'});
    
  }

});


app.post('/crearChat', verificarAuth, async (req,res)=>{

  try {
    const { nombre_chat, imagen_chat } = req.body;
    // console.log(req.body);
    const respuesta = await db('chats').insert({ nombre: nombre_chat, image_url: imagen_chat });
    // console.log(respuesta)
    if (!respuesta.length) {
      return res.status(400).json({ msg: 'Error al crear chat' });
    }
    res.json({ id_chat: respuesta[0] });
  } catch (e) {
    if (e.code==='ER_DUP_ENTRY') {
      return res.status(400).json({ msg: 'El nombre del chat ya existe' });
    }
    res.status(400).json({ msg: 'Error al crear chat' });
  }

});


app.get('/verChats', verificarAuth, async (req,res)=>{

  try {
    // const { nombre_chat, imagen_chat } = req.body;
    // console.log(req.body);
    const chats = await db.select('id', 'nombre', 'image_url').from('chats').orderBy('id','desc');
    // console.log(chats)
    if (!chats.length) {
      return res.status(404).json({ msg: 'No hay chats' });
    }
    res.json({ chats });
  } catch (e) {
    res.status(400).json({ msg: 'Error al mostrar chats' });
  }

});


app.get('/verChat/:id', verificarAuth, async (req,res)=>{

  // console.log('llega',req.params.id, req.usuario);

  try {
    // const { nombre_chat, imagen_chat } = req.body;
    // console.log(req.body);
    // const mensajes = await db.select('*').from('mensajes').where({chat_id:req.params.id}).orderBy('id','desc');
    const mensajes = await db.schema.raw(`select c.nombre, m.id, m.mensaje, u.email, m.gendate 
                                          from mensajes m, chats c, usuarios u 
                                          where m.chat_id=c.id 
                                                and m.chat_id=${req.params.id}
                                                and m.user_id = u.id
                                          order by m.id desc`);    
    // console.log('mensajes',mensajes)
    if (!mensajes[0].length) {
      console.log('no hay mensajes');
      return res.status(404).json({ msg: 'No hay mensajes' });
    }

    // console.log('sale',mensajes);
    const datos_chat = {'nombre_chat': mensajes[0][0].nombre};
    const msgs = [];
    for (let m in mensajes[0]) {
      // console.log('m es', m);
      const r = {};
      r.id = mensajes[0][m].id;
      r.mensaje = mensajes[0][m].mensaje;
      r.autor = mensajes[0][m].email;
      r.gendate = mensajes[0][m].gendate;
      msgs.push(r);
    }

    // console.log('envio', datos_chat);
    
    res.json({ datos_chat, msgs });
  } catch (e) {
    console.log('error', e);
    res.status(400).json({ msg: 'Error al mostrar chats' });
  }
  

});

app.post('/sendMessage', verificarAuth, async (req,res)=>{

  // console.log('entrooooo');
  // console.log(req.usuario);
  
  try {
    const { id_chat, msg } = req.body;
    console.log(req.body);
    const respuesta = await db.schema.raw(`INSERT INTO mensajes (chat_id, user_id, mensaje) VALUES ('${id_chat}', '${req.usuario.userid}', '${msg}');`);    
    // console.log(respuesta)
    if (!respuesta.length) {
      return res.status(400).json({ msg: 'Error al enviar mensaje' });
    }
    // console.log('sale', respuesta[0].insertId);
    res.json({ id_mensaje: respuesta[0] });
  } catch (e) {
    console.log('error:', e);
    res.status(400).json({ msg: 'Error al enviar mensaje' });
  }

});