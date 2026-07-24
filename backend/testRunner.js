const db = require('./config/database');
const logger = require('./utils/loggerService');

async function testConnection() {
    console.log('🧪 ==========================================');
    console.log('🧪  DATABASE CONNECTION TEST');
    console.log('🧪 ==========================================\n');

    try {
        // Test 1: Database Connection
        console.log('📌 [1/6] Testing database connection...');
        const connection = await db.getConnection();
        console.log('✅ Database connected successfully');
        connection.release();

        // Test 2: List All Tables
        console.log('\n📌 [2/6] Checking tables...');
        const [tables] = await db.query('SHOW TABLES');
        const tableNames = tables.map(row => Object.values(row)[0]);
        console.log(`✅ Tables found: ${tableNames.length}`);
        console.log(`   📋 ${tableNames.join(', ')}`);

        // Test 3: Students Table
        console.log('\n📌 [3/6] Testing students table...');
        try {
            const [studentCount] = await db.query('SELECT COUNT(*) as count FROM students');
            console.log(`✅ Total students: ${studentCount[0].count}`);
            
            if (studentCount[0].count > 0) {
                const [sample] = await db.query('SELECT * FROM students LIMIT 1');
                console.log(`   📝 Sample student: ${sample[0]?.full_name || 'N/A'} (ID: ${sample[0]?.admission_number || 'N/A'})`);
            }
        } catch (error) {
            console.error('❌ Students table error:', error.message);
        }

        // Test 4: Teachers Table
        console.log('\n📌 [4/6] Testing teachers table...');
        try {
            const [teacherCount] = await db.query('SELECT COUNT(*) as count FROM teachers');
            console.log(`✅ Total teachers: ${teacherCount[0].count}`);
            
            if (teacherCount[0].count > 0) {
                const [sample] = await db.query('SELECT * FROM teachers LIMIT 1');
                console.log(`   📝 Sample teacher: ${sample[0]?.full_name || 'N/A'} (ID: ${sample[0]?.teacher_id || 'N/A'})`);
            }
        } catch (error) {
            console.error('❌ Teachers table error:', error.message);
        }

        // Test 5: Attendance Table
        console.log('\n📌 [5/6] Testing attendance table...');
        try {
            const [attendanceCount] = await db.query('SELECT COUNT(*) as count FROM attendance');
            console.log(`✅ Total attendance records: ${attendanceCount[0].count}`);
        } catch (error) {
            console.error('❌ Attendance table error:', error.message);
        }

        // Test 6: Results Table
        console.log('\n📌 [6/6] Testing results table...');
        try {
            const [resultsCount] = await db.query('SELECT COUNT(*) as count FROM results');
            console.log(`✅ Total results: ${resultsCount[0].count}`);
        } catch (error) {
            console.error('❌ Results table error:', error.message);
        }

        // Test 7: Notices Table
        console.log('\n📌 [7/7] Testing notices table...');
        try {
            const [noticesCount] = await db.query('SELECT COUNT(*) as count FROM notices');
            console.log(`✅ Total notices: ${noticesCount[0].count}`);
        } catch (error) {
            console.error('❌ Notices table error:', error.message);
        }

        // Summary
        console.log('\n📊 ==========================================');
        console.log('📊  TEST SUMMARY');
        console.log('📊 ==========================================');
        
        // Get database size
        try {
            const [dbSize] = await db.query(
                "SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb FROM information_schema.tables WHERE table_schema = DATABASE()"
            );
            console.log(`📦 Database size: ${dbSize[0]?.size_mb || 0} MB`);
        } catch (error) {
            // Ignore
        }

        // Get last activity
        try {
            const [lastActivity] = await db.query(
                'SELECT created_at FROM activity_logs ORDER BY created_at DESC LIMIT 1'
            );
            if (lastActivity[0]) {
                console.log(`🕐 Last activity: ${lastActivity[0].created_at}`);
            }
        } catch (error) {
            // Ignore
        }

        console.log('\n✅ ==========================================');
        console.log('✅  ALL TESTS PASSED SUCCESSFULLY');
        console.log('✅ ==========================================');
        
        logger.info('Database test completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ ==========================================');
        console.error('❌  TEST FAILED');
        console.error('❌ ==========================================');
        console.error('❌ Error:', error.message);
        console.error('❌ Stack:', error.stack);
        console.error('❌ ==========================================');
        
        logger.error('Database test failed: ' + error.message);
        process.exit(1);
    }
}

// Run the test
testConnection();