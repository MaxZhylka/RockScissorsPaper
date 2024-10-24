
const mongoose = require('mongoose');
const express = require('express');
const userRouter= require('./routers/authRouter');
require('dotenv').config();
const http = require('http');
const dbUrl= process.env.DB_URI;
const cors = require('cors');
const cookieParser=require('cookie-parser')
const port=process.env.PORT;

const app=express();
const errorMidlleware=require('./middlewaree/error-middleware');
const setupWebSocket = require('./websockets/ws-connection');

app.use(express.json());
app.use(cookieParser());
app.use(cors(
    {
        origin: process.env.CLIENT_ADRESS,
        credentials: true
    }
));
app.use('/', userRouter);
app.use(errorMidlleware);
const server = http.createServer(app);
setupWebSocket(server);
run=()=>
{
try{
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB подключен'))
    .catch(err => console.log('Ошибка подключения к MongoDB:', err));


    server.listen(port,()=>{console.log(`Сервер запущен на порту ${port}`)})
}catch(e)
{
    console.error(e);
}
}

run();