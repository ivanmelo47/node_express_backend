
import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Node Express Backend API',
            version: '1.0.0',
            description: 'API documentation for the Node Express Backend application',
            contact: {
                name: 'API Support',
                email: 'support@example.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:4000/api/v1',
                description: 'Development server',
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
    apis: [
        './src/modules/**/docs/*.ts',
        './dist/modules/**/docs/*.js',
        './src/app.ts',
        './dist/app.js'
    ], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
