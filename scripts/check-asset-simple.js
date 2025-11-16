// Check asset via deployed API
const assetId = process.argv[2] || '5tzlpXoorEqbq5jCWWFa';

const API_URL = 'https://neural-salvage.vercel.app';

async function checkAsset() {
  console.log(`\n🔍 Checking asset: ${assetId}\n`);
  
  try {
    const response = await fetch(`${API_URL}/api/assets/${assetId}`);
    
    if (!response.ok) {
      console.error(`❌ API returned ${response.status}: ${response.statusText}`);
      process.exit(1);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      console.error('❌ API returned error:', data.error);
      process.exit(1);
    }
    
    const asset = data.asset;
    
    console.log('✅ Asset found!\n');
    console.log('📝 Basic Info:');
    console.log('  Filename:', asset.filename);
    console.log('  Type:', asset.type);
    console.log('  Title:', asset.title || '(not set)');
    console.log('  Description:', asset.description || '(not set)');
    console.log('\n🤖 AI Analysis:');
    
    if (asset.aiAnalysis) {
      console.log('  Caption:', asset.aiAnalysis.caption || '(none)');
      console.log('  Transcript:', asset.aiAnalysis.transcript || '(none)');
      console.log('  Tags:', asset.aiAnalysis.tags?.join(', ') || '(none)');
      console.log('  Analyzed At:', asset.aiAnalysis.analyzedAt);
      
      if (asset.aiAnalysis.transcript) {
        console.log('\n📄 Full Transcript (first 500 chars):');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(asset.aiAnalysis.transcript.substring(0, 500));
        if (asset.aiAnalysis.transcript.length > 500) {
          console.log('... (truncated, total length:', asset.aiAnalysis.transcript.length, 'chars)');
        }
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      }
    } else {
      console.log('  ❌ No AI analysis data found!');
    }
    
    console.log('\n💰 Payment Info:');
    console.log('  AI Analysis Paid:', asset.aiAnalysisPaid || false);
    console.log('  Paid At:', asset.paidAt || '(not set)');
    
    console.log('\n🔗 View at:', `${API_URL}/gallery/${assetId}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAsset().then(() => process.exit(0));
