export const formatRSIEmail = (data) => {
  let html = `<h2>📊 RSI Screener Update</h2>`;

  for (const tf in data) {
    html += `<h3>${tf.toUpperCase()}</h3>`;

    // ✅ OVERSOLD
    html += `<b style="color:green;">Oversold (20–30)</b><br/>`;

    if (data[tf].oversold.length === 0) {
      html += `No stocks<br/>`;
    } else {
      data[tf].oversold.forEach((s) => {
        const value = Object.values(s)[1];
        html += `${s.symbol} - ${value}<br/>`;
      });
    }

    html += `<br/>`;

    // ✅ OVERBOUGHT
    html += `<b style="color:red;">Overbought (70–80)</b><br/>`;

    if (data[tf].overbought.length === 0) {
      html += `No stocks<br/>`;
    } else {
      data[tf].overbought.forEach((s) => {
        const value = Object.values(s)[1];
        html += `${s.symbol} - ${value}<br/>`;
      });
    }

    html += `<hr/>`;
  }

  return html;
};