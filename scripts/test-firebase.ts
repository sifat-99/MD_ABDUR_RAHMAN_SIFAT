import mongoose from "mongoose";

const RTDB_URL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL?.replace(/\/$/, "");
const STORAGE_BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const RTDB_SECRET = process.env.FIREBASE_DATABASE_SECRET;

async function runDiagnostics() {
  console.log("=== FIREBASE & MONGODB DIAGNOSTICS ===");
  console.log("RTDB URL:", RTDB_URL);
  console.log("Storage Bucket:", STORAGE_BUCKET);
  console.log("Database Secret present:", Boolean(RTDB_SECRET));
  console.log("----------------------------------------");

  // 1. Test RTDB Read
  console.log("\n1. Testing Firebase Realtime Database READ...");
  try {
    const readUrl = RTDB_SECRET ? `${RTDB_URL}/.json?auth=${RTDB_SECRET}&shallow=true` : `${RTDB_URL}/.json?shallow=true`;
    const res = await fetch(readUrl);
    console.log("   Status:", res.status, res.statusText);
    const text = await res.text();
    if (res.ok) {
      console.log("   ✅ Realtime Database READ SUCCESS!");
      console.log("   Root keys:", text.slice(0, 150));
    } else {
      console.log("   ❌ Realtime Database READ FAILED:", text);
    }
  } catch (err: any) {
    console.log("   ❌ Network error:", err.message);
  }

  // 2. Test RTDB Write
  console.log("\n2. Testing Firebase Realtime Database WRITE...");
  try {
    const writeUrl = RTDB_SECRET ? `${RTDB_URL}/_diagnostic_test.json?auth=${RTDB_SECRET}` : `${RTDB_URL}/_diagnostic_test.json`;
    const res = await fetch(writeUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ test: true, timestamp: new Date().toISOString() }),
    });
    console.log("   Status:", res.status, res.statusText);
    const text = await res.text();
    if (res.ok) {
      console.log("   ✅ Realtime Database WRITE SUCCESS!");
      // Clean up
      const delUrl = RTDB_SECRET ? `${RTDB_URL}/_diagnostic_test.json?auth=${RTDB_SECRET}` : `${RTDB_URL}/_diagnostic_test.json`;
      await fetch(delUrl, { method: "DELETE" });
    } else {
      console.log("   ❌ Realtime Database WRITE FAILED:", text);
      if (res.status === 401) {
        console.log("   👉 Reason: Security Rules in Firebase Console are blocking access (Permission Denied).");
      }
    }
  } catch (err: any) {
    console.log("   ❌ Network error:", err.message);
  }

  // 3. Test Storage Bucket
  console.log("\n3. Testing Firebase Storage Bucket...");
  const bucketCandidates = [
    STORAGE_BUCKET,
    "md-abdur-rahman-sifat.firebasestorage.app",
    "md-abdur-rahman-sifat.appspot.com",
  ].filter(Boolean);

  for (const b of Array.from(new Set(bucketCandidates))) {
    try {
      const res = await fetch(`https://firebasestorage.googleapis.com/v0/b/${b}/o`);
      console.log(`   Bucket [${b}]: Status ${res.status} ${res.statusText}`);
      if (res.status === 404) {
        console.log(`   👉 Bucket [${b}] does not exist yet. (Storage needs to be activated in Firebase Console).`);
      } else if (res.status === 401 || res.status === 403) {
        console.log(`   👉 Bucket [${b}] exists, but Storage Rules are blocking unauthenticated access.`);
      } else if (res.ok) {
        console.log(`   ✅ Bucket [${b}] is ACTIVE and accessible!`);
      }
    } catch (err: any) {
      console.log(`   ❌ Error checking bucket ${b}:`, err.message);
    }
  }

  // 4. Test MongoDB Atlas
  console.log("\n4. Testing MongoDB Atlas Backup...");
  try {
    await mongoose.connect(process.env.MONGODB_URI || "");
    const db = mongoose.connection.db;
    if (db) {
      const collections = await db.listCollections().toArray();
      console.log("   ✅ MongoDB Atlas is CONNECTED! DB Name:", db.databaseName);
      console.log("   Collections found:", collections.length);
      for (const c of collections.slice(0, 5)) {
        const count = await db.collection(c.name).countDocuments();
        console.log(`     - ${c.name}: ${count} documents`);
      }
    }
    await mongoose.disconnect();
  } catch (err: any) {
    console.log("   ❌ MongoDB Atlas connection error:", err.message);
  }

  console.log("\n========================================");
}

runDiagnostics().catch(console.error);
