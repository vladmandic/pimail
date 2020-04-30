/* eslint-disable consistent-return */
/* eslint-disable no-console */
const mailx = require('mailx');

const config = {
  smtp: { host: 'localhost', port: 25, username: null, password: null }, // username & password are optional; TLS will be used automatically if announced by server
  imap: { host: 'localhost', port: 143, secure: false, username: 'vlado', password: 'cReate314' }, // username & password are mandatory; secure forces imaps vs imap
};

async function send() {
  return new Promise((resolve, reject) => {
    let smtp;
    if (config.smtp.username && config.smtp.password) smtp = mailx.transport(config.smtp.host, config.smtp.port, config.smtp.username, config.smtp.password);
    else smtp = mailx.transport(config.smtp.host, config.smtp.port);
    const msg = mailx.message();
    msg.setFrom('Vladimir Mandic', 'vlado@wyse');
    msg.addTo('vlado', 'vlado@wyse');
    msg.addHeader('return-path', 'cyan00@gmai.com');
    msg.setSubject('hello');
    msg.setText('hi ! how are u?');
    msg.setHtml('hi ! how are u? <b>hugs</b>');
    smtp.send(msg, (err, res) => (err ? reject(err) : resolve(res)));
  });
}

async function read() {
  return new Promise((resolve, reject) => {
    const protocol = config.imap.secure ? 'imaps' : 'imap';
    const imap = mailx.store(protocol, config.imap.host, config.imap.port, config.imap.username, config.imap.password);
    const messages = [];
    imap.connect(async (errConnect) => {
      if (errConnect) reject(errConnect);
      const inbox = imap.getInbox();
      inbox.fail((errInbox) => reject(errInbox));
      inbox.done((res) => {
        for (let i = 0; i < (res && res.received ? res.received : 0); i++) {
          inbox.getNextMessage((err, msg) => (msg ? messages.push(msg) : ''));
        }
        imap.close();
        resolve(messages);
      });
    });
  });
}

function test() {
  send()
    .then((msg) => console.log('send', msg))
    .catch((err) => console.log('send failed', err));
  read()
    .then((msgs) => msgs.forEach((msg) => console.log('read', msg.from, msg.to[0], msg.date, `"${msg.subject}"`)))
    .catch((err) => console.log('read failed', err));
}

test();
