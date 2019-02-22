

module.exports = {
    from: 'testmailforatolye15@gmail.com',
    host: 'smtp.gmail.com', // hostname
    secureConnection: true, // use SSL
    port: 465, // port for secure SMTP
    transportMethod: 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts
    auth: {
    user: process.env.SMTP_USER, // gmail id
    pass: process.env.SMTP_PASSWORD, // gmail password
    }
  }
