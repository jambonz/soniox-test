module.exports = {
  apps : [{
    name: 'soniox-test',
    script: 'app.js',
    instance_var: 'INSTANCE_ID',
    exec_mode: 'fork',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      LOGLEVEL: 'info',
      WS_PORT: 3080,
      SONIOX_API_KEY: 'your-api-key-here'
    }
  }]
};
