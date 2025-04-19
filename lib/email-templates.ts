interface EmailTemplateProps {
  url: string;
  host: string;
}

export function getVerificationEmailTemplate({
  url,
  host,
}: EmailTemplateProps) {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Verify your email</title>
    <style>
      .container { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background: #ffffff;
      }
      .button {
        background-color: #DD2D82;
        border-radius: 4px;
        color: #ffffff;
        display: inline-block;
        font-size: 16px;
        font-weight: bold;
        line-height: 1;
        padding: 15px 30px;
        text-decoration: none;
        margin: 24px 0;
      }
      .link {
        color: #000000;
        word-break: break-all;
      }
      .footer {
        color: #666666;
        font-size: 12px;
        margin-top: 24px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Welcome to Trainingsplatz!</h1>
      <p>Click the button below to verify your email address and start tracking your training:</p>
      <a href="${url}" class="button">Verify Email</a>
      <p>Or copy and paste this URL into your browser:</p>
      <p class="link">${url}</p>
      <p class="footer">
        If you didn't request this email, you can safely ignore it.<br/>
        This link will expire in 24 hours.<br/>
        From ${host}
      </p>
    </div>
  </body>
</html>
`;
}

export function getMagicLinkEmailTemplate({
  url,
  host,
}: EmailTemplateProps) {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Sign in to Trainer</title>
    <style>
      .container { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background: #ffffff;
      }
      .button {
        background-color: #DD2D82;
        border-radius: 4px;
        color: #ffffff;
        display: inline-block;
        font-size: 16px;
        font-weight: bold;
        line-height: 1;
        padding: 15px 30px;
        text-decoration: none;
        margin: 24px 0;
      }
      .link {
        color: #000000;
        word-break: break-all;
      }
      .footer {
        color: #666666;
        font-size: 12px;
        margin-top: 24px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Sign in to Trainingsplatz</h1>
      <p>Click the button below to sign in to your account:</p>
      <a href="${url}" class="button">Sign In</a>
      <p>Or copy and paste this URL into your browser:</p>
      <p class="link">${url}</p>
      <p class="footer">
        If you didn't request this email, you can safely ignore it.<br/>
        This link will expire in 24 hours.<br/>
        From ${host}
      </p>
    </div>
  </body>
</html>
`;
} 