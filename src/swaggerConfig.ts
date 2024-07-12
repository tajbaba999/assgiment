import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Pharmacy API',
      version: '1.0.0',
      description: 'API documentation for the Pharmacy application',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description : 'Development server',
      },
      {
        url: 'https://medlr-1g0g.onrender.com',
        description: 'Production server',
      },
    ],
  },
  apis: [
    './src/api/medicine/*.ts',
    './src/api/pharmacies/*.ts',
    './src/api/user/*.ts',
  ],
};

const swaggerSpec = swaggerJsDoc(options);

const setupSwagger = (app: Application) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export default setupSwagger;
