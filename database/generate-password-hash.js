const bcrypt = require('bcryptjs');

async function generateHash() {
    try {
        const password = '123456';
        const saltRounds = 12;
        const hash = await bcrypt.hash(password, saltRounds);
        console.log('Password:', password);
        console.log('Hash:', hash);
        console.log('\nCopy hash này vào database script:');
        console.log(`'${hash}'`);
    } catch (error) {
        console.error('Error:', error);
    }
}

generateHash();