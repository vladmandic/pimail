/* eslint-disable no-console */
/* eslint-disable no-return-assign */

const nodemailer = require('nodemailer'); // https://nodemailer.com/about/
const Imap = require('imap'); // https://github.com/mscdex/node-imap

const config = {
  smtp: { host: 'pidash.ddns.net', port: 25 },
  imap: { host: 'pidash.ddns.net', port: 993, tls: true, user: 'vlado', password: 'cReate314' },
};

const testMsg = {
  from: 'Vladimir Mandic <vlado@wyse>',
  to: 'vlado@wyse',
  subject: 'subject',
  text: 'replaced by stripped text from html',
  html: 'hello world html',
};

async function sendMail(message) {
  const transport = nodemailer.createTransport(config.smtp);
  // eslint-disable-next-line no-param-reassign
  if (message.html) message.text = message.html.replace(/<[^>]+>/g, '');
  const res = await transport.sendMail(message);
  return res;
}

async function readMail(folder) {
  const imap = new Imap(config.imap);
  const messages = [];
  return new Promise((resolve, reject) => {
    imap.once('ready', () => {
      imap.openBox(folder, true, (err, box) => {
        if (err) throw err;
        const f = imap.seq.fetch(`1:${box.messages.total}`, { bodies: '', struct: true });
        f.on('message', (msg) => {
          const message = {};
          msg.on('body', (stream) => {
            let body = '';
            stream.on('data', (chunk) => body += chunk.toString('utf8'));
            stream.once('end', () => {
              message.head = Imap.parseHeader(body);
              message.body = body;
            });
          });
          msg.once('attributes', (attrs) => message.attr = attrs);
          msg.once('end', () => messages.push(message));
        });
        f.once('error', (e) => reject(e));
        f.once('end', () => {
          resolve(messages);
          imap.end();
        });
      });
    });
    imap.once('error', (e) => reject(e));
    imap.connect();
  });
}

async function test() {
  // const res = await sendMail(testMsg);
  // console.log('send', res);

  const msgs = await readMail('INBOX');
  for (const msg of msgs) {
    const flags = msg.attr.flags.join(', ').replace('\\', '');
    let type = '';
    let boundary;
    switch (msg.attr.struct[0].type) {
      case 'text':
        type = `text/${msg.attr.struct[0].subtype} size:${msg.attr.struct[0].size}`;
        break;
      case 'alternative':
        type = `multipart/${msg.attr.struct.length - 1}`;
        boundary = msg.attr.struct[0].params.boundary;
        break;
      default: type = `${msg.attr.struct[0].type}`;
    }
    console.log(msg.attr.date, `flags:${flags || 'New '} type:${type} from:"${msg.head.from[0]}" to:"${msg.head.to[0]}" subject"${msg.head.subject[0]}"`);
    // console.log('boundary', boundary);
    // console.log('body', msg.body);
  }
}

test();
