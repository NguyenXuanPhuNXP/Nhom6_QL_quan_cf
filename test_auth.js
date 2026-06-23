const bcrypt = require('bcryptjs');

// Generate hash for admin123
bcrypt.hash('admin123', 10, (err, hash) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  console.log('Hash for admin123:', hash);
  
  // Test: verify the hash
  bcrypt.compare('admin123', hash, (err, result) => {
    if (err) {
      console.error('Error:', err);
      return;
    }
    console.log('Verification result:', result);
  });
});

// Also test with testuser / test123
bcrypt.hash('test123', 10, (err, hash) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  console.log('Hash for test123:', hash);
});
