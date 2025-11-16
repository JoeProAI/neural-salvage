// Quick script to check what's in Firestore for an asset
const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

async function checkAsset() {
  const assetId = process.argv[2];
  
  if (!assetId) {
    console.error('Usage: node scripts/check-asset.js <asset-id>');
    console.error('Get asset ID from the URL: /gallery/[THIS-IS-THE-ID]');
    process.exit(1);
  }
  
  console.log(`\n🔍 Checking asset: ${assetId}\n`);
  
  try {
    const assetDoc = await db.collection('assets').doc(assetId).get();
    
    if (!assetDoc.exists) {
      console.error('❌ Asset not found in database!');
      process.exit(1);
    }
    
    const data = assetDoc.data();
    
    console.log('✅ Asset found!\n');
    console.log('📝 Basic Info:');
    console.log('  Filename:', data.filename);
    console.log('  Type:', data.type);
    console.log('  Title:', data.title || '(not set)');
    console.log('  Description:', data.description || '(not set)');
    console.log('\n🤖 AI Analysis:');
    
    if (data.aiAnalysis) {
      console.log('  Caption:', data.aiAnalysis.caption || '(none)');
      console.log('  Transcript:', data.aiAnalysis.transcript || '(none)');
      console.log('  Tags:', data.aiAnalysis.tags?.join(', ') || '(none)');
      console.log('  Analyzed At:', data.aiAnalysis.analyzedAt?.toDate());
      
      if (data.aiAnalysis.transcript) {
        console.log('\n📄 Full Transcript:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(data.aiAnalysis.transcript.substring(0, 500));
        if (data.aiAnalysis.transcript.length > 500) {
          console.log('... (truncated)');
        }
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      }
    } else {
      console.log('  ❌ No AI analysis data found!');
    }
    
    console.log('\n💰 Payment Info:');
    console.log('  AI Analysis Paid:', data.aiAnalysisPaid || false);
    console.log('  Paid At:', data.paidAt?.toDate() || '(not set)');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAsset().then(() => process.exit(0));
