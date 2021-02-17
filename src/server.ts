import express from "express";
import bodyParser from 'body-parser';
// import pool from './dbconfig/dbconnector';

class Server{

    private app;

    constructor() {
        this.app = express();
        // this.dbConnect();
    }

    // private dbConnect() {
    //     pool.connect(function (err, client, done) {
    //         if (err) throw new Error(err);
    //         console.log('Connected');
    //       }); 
    // }

    public start = (port: number) => {
        return new Promise((resolve, reject) => {
            this.app.listen(port, () => {
                resolve(port);
            }).on('error', (err: Object) => reject(err));
        });
    }
}


const app = express();
const port = 8080; // default port to listen

// define a route handler for the default home page
app.get( "/", ( req, res ) => {
    res.send( "Hello world!" );
} );

// start the Express server
app.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` );
} );