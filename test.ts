import Database from "better-sqlite3";
const db = new Database("prompts.db");
try {
  const rows = db.prepare("SELECT * FROM saved_prompts").all();
  console.log("Prompts:", rows);
} catch (e) {
  console.error(e);
}
