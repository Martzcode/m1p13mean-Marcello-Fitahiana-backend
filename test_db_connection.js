const mongoose = require('mongoose');

async function testConnection() {
    const uri = 'mongodb://mean_db_user:dKPNvNFuqIuXjYs7@ac-okw31wf-shard-00-00.byfajqp.mongodb.net:27017,ac-okw31wf-shard-00-01.byfajqp.mongodb.net:27017,ac-okw31wf-shard-00-02.byfajqp.mongodb.net:27017/centrecommercial?replicaSet=atlas-okw31wf-shard-0&ssl=true&authSource=admin';
    try {
        console.log('Attempting to connect to MongoDB Atlas...');
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000, family: 4 });
        console.log('SUCCESS: Connected to database');
        process.exit(0);
    } catch (error) {
        console.error('FAILED to connect:');
        console.error(error);
        process.exit(1);
    }
}

testConnection();
