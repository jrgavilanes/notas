const express = require('express')
const jwt = require('jsonwebtoken');

const app = express()
const port = 3000

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');


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

app.get('/usuario', verificarAuth, async(req,res)=>{
    return res.json({data: 'privado: hola nano'});
});

app.get('/ejemplo', (req, res) => {
    let user = {userid: 123456, email: "jrgavilanes@gmail.com", password: "1234", rol: "admin"};
    let token = jwt.sign({data: user}, 'secretito', {expiresIn: 5})
    return res.json({
        user,
        token
    })
});

app.get('/nabo', (req, res) => {
    res.render('ej.ejs', {nano: 'juanra'});
});


app.get('*',(req,res)=>{
    return res.status(404).json({msg: 'página no encontrada'});
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

