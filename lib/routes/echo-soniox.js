const service = ({logger, makeService}) => {
  const svc = makeService({path: '/echo-soniox'});

  svc.on('session:new', (session) => {
    session.locals = {logger: logger.child({call_sid: session.call_sid})};
    logger.info({session}, `new incoming call: ${session.call_sid}`);

    session
      .on('close', onClose.bind(null, session))
      .on('error', onError.bind(null, session))
      .on('/echo', onSpeechEvent.bind(null, session));

    session
      .pause({length: 1.5})
      .gather({
        // eslint-disable-next-line max-len
        say: {text: 'Hi there!  In this session we will be testing the soniox speech recognizer.  What is your policy number?.'},
        input: ['speech'],
        actionHook: '/echo',
        timeout: 15,
        recognizer: {
          vendor: 'soniox',
          language: 'en-US',
          sonioxOptions: {
            apiKey: process.env.SONIOX_API_KEY,
            storage: {
              id: 'cognigy-testing'
            }
          }
        }
      })
      .send();
  });
};

const onSpeechEvent = async(session, evt) => {
  const {logger} = session.locals;
  logger.info(`got speech evt: ${JSON.stringify(evt)}`);

  switch (evt.reason) {
    case 'speechDetected':
      echoSpeech(session, evt);
      break;
    case 'timeout':
      reprompt(session);
      break;
    default:
      session.reply();
      break;
  }
};

const echoSpeech = async(session, evt) => {
  const {transcript, confidence} = evt.speech.alternatives[0];

  session
    // eslint-disable-next-line max-len
    .say({text: `<speak>Thank you.  Your policy number is: <say-as interpret-as="characters">${transcript}</say-as>.  We detected that with an average confidence score of ${confidence.toFixed(2)}`})
    .gather({
      say: {text: 'What is your policy number?.'},
      input: ['speech'],
      actionHook: '/echo',
      timeout: 15,
      recognizer: {
        vendor: 'soniox',
        language: 'en-US',
        sonioxOptions: {
          apiKey: process.env.SONIOX_API_KEY,
          storage: {
            id: 'cognigy-testing'
          }
        }
      }
    })
    .reply();
};

const reprompt = async(session, evt) => {
  session
    .gather({
      say: {text: 'Are you still there?  I didn\'t hear anything.'},
      input: ['speech'],
      actionHook: '/echo'
    })
    .reply();
};

const onClose = (session, code, reason) => {
  const {logger} = session.locals;
  logger.info({session, code, reason}, `session ${session.call_sid} closed`);
};

const onError = (session, err) => {
  const {logger} = session.locals;
  logger.info({err}, `session ${session.call_sid} received error`);
};

module.exports = service;
