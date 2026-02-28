const { MongoClient } = require('mongodb');

async function testConnection() {
    const uri = 'mongodb+srv://mean_db_user:dKPNvNFuqIuXjYs7@mean-cluster.byfajqp.mongodb.net/centrecommercial?appName=mean-cluster';
    const client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5000,
        family: 4
    });

    try {
        console.log('Attempting to connect via pure MongoClient...');
        await client.connect();
        console.log('SUCCESS: Connected to MongoDB Atlas!');

        const db = client.db('test');
        const collections = await db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

    } catch (error) {
        console.error('FAILED to connect:');
        console.error(error);
    } finally {
        await client.close();
    }
}

testConnection();
