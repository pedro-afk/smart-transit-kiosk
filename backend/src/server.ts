import app from './config/api';
import { prisma } from './config/db';
import { env } from './config/env';

prisma.$connect().then(() => {
    console.log('Database connection established');
}).catch((error) => {
    console.error('Database connection error:', error);
});

app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
});
