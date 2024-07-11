import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoute from './api/user/user.route';
import setupSwagger from './swaggerConfig';


// import * as middlewares from './middlewares';
import api from './api';


import connectDb  from './db';

dotenv.config();



require('dotenv').config();

connectDb();

const app = express();


setupSwagger(app);

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());


// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.get('/', (req, res) =>{
  // eslint-disable-next-line @typescript-eslint/object-curly-spacing
  res.send({ 'mesaage' : 'Hello world'});
});


app.use('/api/v1', api);
app.use('/person', userRoute);

// app.use(middlewares.notFound);
// app.use(middlewares.errorHandler);

export default app;
