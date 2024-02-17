import nodemailer from 'nodemailer';

export const sendWelcomeEmail = async user => {
  try {
    let mailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'cnsender2@gmail.com',
        pass: 'qrqulwdosrfoimld'
      }
    });

    const htmlContent = `
      <html>
        <body>
          <h1>Welcome to Our Service!</h1>
          <img src="../../assets/logo.png" alt="Company Logo" style="max-width: 100%;" />
          <p>Thank you for joining us.</p>
        </body>
      </html>
    `;

    let mailDetails = {
      from: 'cnsender2@gmail.com',
      to: user.email,
      subject: 'Welcome mail',
      html: htmlContent
    };

    await mailTransporter.sendMail(mailDetails);

    console.log('Email sent successfully');
  } catch (err) {
    console.error('Error Occurs', err);
  }
};
