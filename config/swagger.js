import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Seoul Festival API',
      version: '1.0.0',
      description: 'API for Seoul Festival Information',
    },
    servers: [
      {
        url: 'http://localhost:8000',
      },
    ],
    components: {
      schemas: {
        Festival: {
          type: 'object',
          properties: {
            event_name: {
              type: 'string',
            },
            category: {
              type: 'string',
            },
            district: {
              type: 'string',
            },
            place: {
              type: 'string',
            },
            start_date: {
              type: 'string',
              format: 'date-time',
            },
            end_date: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'], // files containing annotations as above
};

const specs = swaggerJsdoc(options);

export default specs;

