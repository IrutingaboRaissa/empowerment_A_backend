import fetch from 'node-fetch';

async function testServer() {
  try {
    console.log('Testing server connection...');
    const response = await fetch('http://localhost:5000/health');
    const data = await response.json();
    console.log('Server response:', data);
  } catch (error) {
    console.error('Error testing server:', error);
  }
}

testServer(); 