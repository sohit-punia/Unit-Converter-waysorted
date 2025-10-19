// code.js - final plugin main
// Shows UI at the correct compact size and handles export message.
figma.showUI(__html__, { width: 1033, height: 240});

figma.ui.onmessage = async (msg) => {
  if (!msg || !msg.type) return;

  if (msg.type === 'close') {
    figma.closePlugin();
    return;
  }

  if (msg.type === 'export-frame') {
    const sel = figma.currentPage.selection;
    if (!sel || sel.length === 0) {
      figma.notify('Please select a frame (or node) to export.');
      figma.ui.postMessage({ type: 'export-failed', error: 'No selection' });
      return;
    }
    const node = sel[0];
    try {
      const dpi = Number(msg.dpi) || 72;
      const scale = dpi / 72;
      const bytes = await node.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: scale } });
      const base64 = figma.base64Encode(bytes);
      figma.ui.postMessage({ type: 'export-ready', base64, fileName: msg.fileName || 'export.png' });
      figma.notify('Export ready — check the UI to download.');
    } catch (err) {
      const em = (err && err.message) ? err.message : String(err);
      figma.notify('Export failed: ' + em);
      figma.ui.postMessage({ type: 'export-failed', error: em });
    }
  }
};
