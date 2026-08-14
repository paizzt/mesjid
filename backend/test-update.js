const jwt = require('jsonwebtoken');

async function test() {
    try {
        const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET || '1234567890', { expiresIn: '1h' });

        const res = await fetch('http://localhost:3000/api/auth/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                username: 'bendahara', // this is taken by user 2
                nama_lengkap: 'Faisal Faiz Baru'
            })
        });
        
        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Data:', data);
    } catch (err) {
        console.error('Fetch Error:', err);
    }
}
test();
