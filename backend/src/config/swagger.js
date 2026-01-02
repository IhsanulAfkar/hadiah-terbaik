const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'KUA-Dukcapil Internal System API',
            version: '1.0.0',
            description: 'API Documentation for KUA & Dukcapil Integration System',
            contact: {
                name: 'Backend Support',
            },
        },
        servers: [
            {
                url: process.env.API_URL || 'http://localhost:3000/api/v1',
                description: 'Development Server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/routes/*.js'], // Scan routes for annotations
};

const specs = swaggerJsdoc(options);

module.exports = specs;
