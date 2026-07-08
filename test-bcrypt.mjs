import bcrypt from 'bcryptjs'

const oldHash = '$2b$10$2kZ7CWW50doh6FevhMQo8uLMSec6flLu2SrwaeZyFEUpMEY/5sH3W'

console.log('Old hash verify with senha123:', bcrypt.compareSync('senha123', oldHash))
console.log('Old hash verify with 123:', bcrypt.compareSync('123', oldHash))

const newHash = bcrypt.hashSync('senha123', 10)
console.log('New hash:', newHash)
console.log('New hash verify:', bcrypt.compareSync('senha123', newHash))
