export const campaignProductDeliveredEmailBody = (name: string) => `
<html>
<head>
  <style>
    body {
      font-family: Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f6f8;
    }

    .container {
      max-width: 600px;
      margin: 30px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }

    .header {
      background-color: #6f42c1;
      color: #ffffff;
      text-align: center;
      padding: 20px;
    }

    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }

    .content {
      padding: 30px;
      color: #333333;
    }

    .content p {
      font-size: 16px;
      line-height: 1.6;
      margin: 16px 0;
    }

    .status-box {
      text-align: center;
      margin: 30px 0;
    }

    .status {
      display: inline-block;
      padding: 12px 24px;
      font-size: 20px;
      font-weight: bold;
      color: #6f42c1;
      background-color: #f3efff;
      border-radius: 6px;
      letter-spacing: 2px;
    }

    .footer {
      background-color: #f4f6f8;
      text-align: center;
      padding: 20px;
      font-size: 14px;
      color: #777777;
    }

    .footer a {
      color: #007bff;
      text-decoration: none;
    }

    .signature {
      margin-top: 30px;
    }
  </style>
</head>

<body>

  <div class="container">

    <div class="header">
      <h1>Your Campaign Product Has Been Delivered</h1>
    </div>

    <div class="content">

      <p>Hello${name ? ` ${name}` : ''},</p>

      <p>Your campaign product has been successfully delivered.</p>

      <div class="status-box">
        <div class="status">DELIVERED</div>
      </div>

      <p>
        You can now start using the product and share your honest review as part of the campaign.
      </p>

      <p>
        Your feedback is important and helps brands improve their products.
      </p>

      <p>
        If you have any questions, feel free to reach out to us at 
        <a href="mailto:support@sampli.io">support@sampli.io</a>.
      </p>

      <div class="signature">
        <p>We appreciate your participation!</p>

        <p>
          Best regards,<br/>
          <strong>The Sampli Team</strong>
        </p>
      </div>

    </div>

    <div class="footer">
      <p>© ${new Date().getFullYear()} Sampli. All rights reserved.</p>
    </div>

  </div>

</body>
</html>
`;
