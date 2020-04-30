/* eslint-disable no-console */

// https://github.com/substack/node-smtp-protocol
// working but needs patches to fix broken TLS

const smtp = require('smtp-protocol');

function cb(err, code, lines) {
  console.log(err, code, lines);
}

function send() {
  smtp.connect('localhost', 25, {}, (mail) => {
    mail.ehlo('wyse', (err, code, lines) => {
      cb(err, code, lines);
      // mail.startTLS({}, cb);
      // mail.verify('vlado@wyse', cb);
      // mail.login('vlado', 'cReate314', 'PLAIN', cb);
      mail.from('vlado@wyse', cb);
      mail.to('vlado@wyse', cb);
      mail.data(cb);
      const pipe = mail.message(cb);
      pipe.write('this is a test message\n');
      pipe.end();
      mail.quit(cb);
    });
  });
}

send();
