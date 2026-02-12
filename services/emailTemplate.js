module.exports = ({ emailFrom, downloadLink, size, expires }) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f9; color: #333; }
        .container { max-width: 600px; margin: 40px auto; padding: 20px; }
        .card { background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); text-align: center; }
        .header { margin-bottom: 30px; }
        .logo-text { font-size: 28px; font-weight: 800; color: #0b84ff; letter-spacing: -1px; }
        .logo-text span { color: #333; }
        h1 { font-size: 22px; color: #222; margin-bottom: 10px; }
        p { font-size: 16px; color: #555; line-height: 1.6; margin: 0 0 20px; }
        .meta-box { background-color: #f8fbff; border: 1px solid #e1efff; border-radius: 8px; padding: 15px; margin-bottom: 30px; display: inline-block; width: 100%; box-sizing: border-box; }
        .meta-item { display: inline-block; margin: 0 15px; text-align: left; }
        .meta-label { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
        .meta-value { font-size: 15px; color: #333; font-weight: 600; }
        .btn { display: inline-block; background-color: #0b84ff; color: #ffffff !important; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; transition: background 0.3s; }
        .footer { margin-top: 30px; font-size: 13px; color: #999; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="header">
                <div class="logo-text">easy<span>Share</span></div>
            </div>
            <h1>File Shared With You</h1>
            <p><strong>${emailFrom}</strong> has sent you a file via easyShare.</p>
            
            <div class="meta-box">
                <div class="meta-item">
                    <div class="meta-label">File Size</div>
                    <div class="meta-value">${size}</div>
                </div>
            </div>

            <div>
                <a href="${downloadLink}" class="btn">Download File</a>
            </div>

            <div class="footer">
                This is an automated email from easyShare. Please do not reply.
            </div>
        </div>
    </div>
</body>
</html>
    `;
};

