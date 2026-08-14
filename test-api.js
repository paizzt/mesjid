async function test() {
    try {
        const res = await fetch('http://localhost:3000/api/auth/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer invalid_token'
            },
            body: JSON.stringify({
                nama_lengkap: 'Test Update'
            })
        });
        
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('text/html')) {
            const text = await res.text();
            console.log('Status:', res.status);
            console.log('Returned HTML! Length:', text.length);
            if (text.includes('Cannot PUT')) {
                console.log('ROUTE NOT FOUND (Cannot PUT)');
            }
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
