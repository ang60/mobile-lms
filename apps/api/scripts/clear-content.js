/**
 * Clears all content from the database so the seed (CPA sections at 10 KES) runs on next API start.
 * Run from apps/api: node scripts/clear-content.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB || 'mobile-lms';
const url = uri.includes('?') ? uri : `${uri}/${dbName}`;

async function main() {
  await mongoose.connect(url);
  const collName = mongoose.pluralize() ? 'contententities' : 'ContentEntity';
  const result = await mongoose.connection.db.collection(collName).deleteMany({});
  console.log(`Deleted ${result.deletedCount} content document(s). Restart the API to seed CPA content.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
