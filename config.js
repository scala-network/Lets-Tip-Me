var config = {};

config.env = 'dev';
config.https_cert = '/etc/letsencrypt/live/funding.torque.cash/fullchain.pem';
config.https_key = '/etc/letsencrypt/live/funding.torque.cash/privkey.pem';
config.rpc_wallet_address = '127.0.0.1';
config.rpc_wallet_port = '18082';

//In production sendmail_devPort='null' sendmail_devHost='null' smtpPort='25'
config.sendmail_devPort = '25';
config.sendmail_devHost = 'devsmtphost';
config.smtpPort = '';

module.exports = config;
