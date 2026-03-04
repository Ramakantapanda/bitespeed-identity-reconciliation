const fetch = require('node-fetch');

async function testIdentify(payload) {
    const res = await fetch('http://localhost:3000/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log('Request:', JSON.stringify(payload));
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('--------------------------------------------------');
}

async function runTests() {
    // Scenario 1: Completely new contact
    await testIdentify({ email: "lorraine@hillvalley.edu", phoneNumber: "123456" });

    // Scenario 2: New secondary contact
    await testIdentify({ email: "mcfly@hillvalley.edu", phoneNumber: "123456" });

    // Scenario 3: Request that shouldn't create anything (exact match of a node)
    await testIdentify({ email: null, phoneNumber: "123456" });

    // Scenario 4: Consolidating primaries
    // Create another primary
    await testIdentify({ email: "george@hillvalley.edu", phoneNumber: "919191" });
    await testIdentify({ email: "biffsucks@hillvalley.edu", phoneNumber: "717171" });

    // Update: connect George and Biffsucks
    await testIdentify({ email: "george@hillvalley.edu", phoneNumber: "717171" });
}

runTests();
