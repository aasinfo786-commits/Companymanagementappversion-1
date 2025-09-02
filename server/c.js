const bcrypt = require('bcryptjs');

const oldPassword = 'abc@123';
const hashed = '$2b$10$VuWqJ5iNK0lwIJprYrA6He.yuWSBgzLINfwfg8OirDmGX7df0ZlVW';

bcrypt.compare(oldPassword, hashed).then(result => {
  console.log('Password match result:', result);
});
