import { createRequire } from 'module';
import { WebSocket } from 'ws';
import { writeFileSync } from 'fs';

const WS_URL = 'ws://localhost:9222/devtools/page/CF1E4231ACA1ED49D3CB1950B87F961A';
const OUT = 'C:/Users/Rafay/.gemini/antigravity-ide/brain/f566e78a-6643-422c-acfe-320f4bdd0166/nba_screenshot.png';

const ws = new WebSocket(WS_URL);
let id = 1;

function send(method, params = {}) {
  return new Promise((resolve) => {
    const msgId = id++;
    const handler = (data) => {
      const msg = JSON.parse(data);
      if (msg.id === msgId) {
        ws.off('message', handler);
        resolve(msg.result);
      }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });
}

ws.on('open', async () => {
  try {
    // Set viewport
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1280, height: 900, deviceScaleFactor: 1, mobile: false
    });
    // Wait for page to settle
    await new Promise(r => setTimeout(r, 1000));
    // Take screenshot
    const result = await send('Page.captureScreenshot', { format: 'png' });
    const buf = Buffer.from(result.data, 'base64');
    writeFileSync(OUT, buf);
    console.log('Screenshot saved to', OUT);
  } catch (e) {
    console.error(e);
  } finally {
    ws.close();
  }
});

ws.on('error', (e) => console.error('WS error:', e.message));
