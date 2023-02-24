module.exports = ({logger, makeService}) => {
  require('./echo-soniox')({logger, makeService});
  require('./echo-google')({logger, makeService});
  require('./echo-nuance')({logger, makeService});
};

