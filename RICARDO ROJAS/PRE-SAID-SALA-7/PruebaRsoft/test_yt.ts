import * as dotenv from 'dotenv';
dotenv.config();
import { google } from 'googleapis';

async function run() {
  const youtube = google.youtube({ version: 'v3', auth: process.env.YOUTUBE_API_KEY });
  console.log('KEY:', process.env.YOUTUBE_API_KEY?.substring(0,6) + '...');
  try {
    const res = await youtube.channels.list({ part: ['snippet', 'statistics'], id: ['UCX6OQ3DkcsbYNE6H8uQquQA'] } as any);
    console.log('Result ID Array:', res.data.items?.length, 'items');
  } catch (e: any) {
    console.log('Error 1:', e.message);
  }

  try {
    const res2 = await youtube.channels.list({ part: ['snippet', 'statistics'], id: 'UCX6OQ3DkcsbYNE6H8uQquQA' } as any);
    console.log('Result ID String:', res2.data.items?.length, 'items');
  } catch (e: any) {
    console.log('Error 1:', e.message);
  }

  try {
    const handleRes = await youtube.channels.list({ part: ['snippet'], forHandle: '@MrBeast' } as any);
    console.log('Result Handle:', handleRes.data.items?.length, 'items');
    console.log('Actual ID for MrBeast:', handleRes.data.items?.[0]?.id);
  } catch (e: any) {
    console.log('Error 2:', e.message);
  }
  
  try {
    const handleRes = await youtube.channels.list({ part: ['snippet'], forUsername: 'MrBeast6000' } as any);
    console.log('Result Username:', handleRes.data.items?.length, 'items');
  } catch (e: any) {
    console.log('Error 3:', e.message);
  }
}
run();
