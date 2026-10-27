const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');

const db = new DatabaseSync('C:/Users/ganes/.local/share/opencode/opencode.db', { readOnly: true });
const rows = db.prepare("SELECT * FROM session_message WHERE text LIKE '%simplified%'").all();
console.log('Matching rows:', rows.length);

for (const row of rows) {
  console.log('Row keys:', Object.keys(row));
  console.log('Row text:', row.text);
  if (row.files) {
    console.log('Files type:', typeof row.files);
    const files = typeof row.files === 'string' ? JSON.parse(row.files) : row.files;
    console.log('Files count:', files.length);
    if (files.length > 0) {
      const f = files[0];
      console.log('File mime:', f.mime, 'data len:', f.data?.length);
      if (f.data) {
        fs.writeFileSync('public/mythallar_logo_original.png', Buffer.from(f.data, 'base64'));
        console.log('SUCCESS! Saved public/mythallar_logo_original.png, size:', fs.statSync('public/mythallar_logo_original.png').size);
      }
    }
  } else {
    // Check all properties
    for (const [k, v] of Object.entries(row)) {
      if (typeof v === 'string' && v.includes('iVBORw0KGgo')) {
        console.log(`Found base64 in field ${k}!`);
        const json = JSON.parse(v);
        console.log('Parsed json keys:', Object.keys(json));
      }
    }
  }
}
