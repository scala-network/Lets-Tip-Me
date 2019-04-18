var config = {};

////Dev environment
config.env = 'dev';
config.https_cert = '';
config.https_key = '';

////Production environment
// config.env = 'production';
// config.https_cert = 'PATH/TO/YOUR/SSL/CERTFICIATE';
// config.https_key = 'PATH/TO/YOUR/SSL/PRIVATE_KEY';

////RPC Wallet
config.rpc_wallet_address = '127.0.0.1';
config.rpc_wallet_port = '18082';
config.rpc_login = 'username';
config.rpc_password = 'password';

/////
config.hostname = 'letstip.me';
config.noreply = 'no-reply@letstip.me'

////In production sendmail_devPort='' sendmail_devHost='' smtpPort='25'
config.sendmail_devPort = '25';
config.sendmail_devHost = 'localhost';
config.smtpPort = '';

////Sessions
config.session_secret = 'a secret random string';

module.exports = config;
