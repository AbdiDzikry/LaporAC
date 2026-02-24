const fs = require('fs');
const path = require('path');

const seederPath = 'c:/5. Magang Dharma/4. LaporAC/backend/database/seeders/DatabaseSeeder.php';
let content = fs.readFileSync(seederPath, 'utf8');

const parsedPath = 'c:/5. Magang Dharma/4. LaporAC/parsed_seed.txt';
const parsedData = fs.readFileSync(parsedPath, 'utf8');

// Replace everything from // 3. up to The command info
const startMarker = '// 3. ';
const endMarker = "$this->command->info('Dummy data seeded successfully! Login with admin123 / admin123');";

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
    const newContent = content.substring(0, startIndex) + parsedData + '\n        ' + content.substring(endIndex);
    fs.writeFileSync(seederPath, newContent);
    console.log('Seeder updated successfully.');
} else {
    console.log('Markers not found.');
}
