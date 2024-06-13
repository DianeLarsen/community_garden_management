const pool = require('./utils/db'); // Adjust the path as necessary

async function testDatabase() {
    try {
        const res = await pool.query('SELECT * FROM test_table');
        console.log('Database connected successfully. Data:', res.rows);
    } catch (err) {
        console.error('Error querying the database:', err);
    } finally {
        pool.end();
    }
}

testDatabase();