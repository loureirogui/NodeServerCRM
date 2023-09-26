const bcrypt = require('bcrypt');
const { secretKey } = require('./config'); // Imports secretKet that helps do crypto your secure information
const plainPassword = 'yourPassword'; // Replace by the password that you wants and run this code, then put manually on database
const saltRounds = 10;

bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
  if (err) {
    console.error('Erro ao criar o hash da senha:', err);
  } else {
    console.log('Senha criptografada:', hash);
  }
});