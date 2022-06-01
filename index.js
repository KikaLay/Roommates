// Importar módulos 
const http = require('http');
const url = require('url');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const agregarRoommate = require('./funciones/getUser')

http
    .createServer((req,res) => {

        if(req.url == ('/') && req.method == 'GET') {
            res.writeHead(200,{'Content-Type':'text:html'});
            fs.readFile('index.html','utf8',(err,html) => {
                res.end(html);
            })
        }

        
        let roommatesJSON = JSON.parse(fs.readFileSync('./archivos/roommates.json','utf8'));
        let roommates = roommatesJSON.roommates; 

       
        if(req.url.startsWith('/roommate') && req.method == 'GET'){
            res.end(JSON.stringify(roommatesJSON,null,1))
        }
    
        
        if(req.url.startsWith('/roommate') && req.method == 'POST'){

            let nombre;
            let apellido;

            req.on('data', () => {

            })

            req.on('end', () => {

                agregarRoommate()
                    .then((datos) => {
                        nombre = datos.results[0].name.first;
                        apellido = datos.results[0].name.last;

                       
                        const roommate = {
                            id: uuidv4(),
                            nombre: nombre + ' ' + apellido,
                            debe:'',
                            recibe:''
                        }

                        
                        roommates.push(roommate);

                       
                        fs.writeFile('./archivos/roommates.json',JSON.stringify(roommatesJSON,null,1),()=>{
                            res.end();
                        });
                        
                });
                
            })
        }



        
        let gastosJSON = JSON.parse(fs.readFileSync('./archivos/gastos.json','utf8'));
        let gastos = gastosJSON.gastos;
        
     
        if(req.url.startsWith('/gastos') && req.method == 'GET'){
            res.end(JSON.stringify(gastosJSON,null,1));
        }

        if(req.url.startsWith('/gasto') && req.method == 'POST'){
            let body;

            req.on('data',(payload) => {
                body = JSON.parse(payload);
            });

            req.on('end',() => {
                gasto = {
                    id: uuidv4(),
                    roommate: body.roommate,
                    descripcion: body.descripcion,
                    monto: body.monto
                };

                gastos.push(gasto);

                fs.writeFileSync('./archivos/gastos.json',JSON.stringify(gastosJSON,null,1));
                res.end();
                console.log('Gasto registrado con éxito en el archivo gastos.json');
            })
        }

        
        if(req.url.startsWith('/gasto') && req.method == 'PUT') {
            let body;

            
            const { id } = url.parse(req.url,true).query;

            req.on('data',(payload) => {
                body = JSON.parse(payload);
                body.id = id;
            });

            req.on('end', () => {
                gastosJSON.gastos = gastos.map((g) => {
                    if ( g.id == body.id){
                        return body;
                    }
                    return g;
                });

                

                fs.writeFileSync('./archivos/gastos.json',JSON.stringify(gastosJSON,null,1));
                res.end()
            })
        }

        
        if(req.url.startsWith('/gasto') && req.method == 'DELETE') {

            const { id } = url.parse(req.url,true).query;

            gastosJSON.gastos = gastos.filter((g) => g.id !== id);

            fs.writeFileSync('./archivos/gastos.json',JSON.stringify(gastosJSON,null,1));
            res.end();
        }

    })
    .listen(3000, console.log("servidor corriendo en el puerto 3000"))