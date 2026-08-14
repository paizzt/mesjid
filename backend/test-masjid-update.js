const jwt = require('jsonwebtoken');

async function test() {
    try {
        const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET || '1234567890', { expiresIn: '1h' });

        const res = await fetch('http://localhost:3000/api/masjid/1', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                nama_masjid: 'Masjid Agung',
                alamat: 'Jl. Masjid',
                ketua_pengurus: 'Faisal Faiz',
                countdown_duration: 600
            })
        });
        
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('text/html')) {
            const text = await res.text();
            console.log('Status:', res.status);
            console.log('HTML returned:', text.substring(0, 100));
        } else {
            const data = await res.json();
            console.log('Status:', res.status);
            console.log('Data:', data);
        }
    } catch (err) {
        console.error('Fetch Error:', err);
    }
}
test();
