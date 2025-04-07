module.exports = {
    apps: [{
        name: 'API.caltex',
        script: './ktp_server_mssql.js',
        error_file: "./logs/api-caltex-err.log",
        out_file: "./logs/api-caltex-out.log",
        watch: false,
        time: true,
        max_memory_restart: '100M',
        exec_mode: 'cluster',
        instances: 1,
        cron_restart: '38 1 * * *',
        env: {
            NODE_ENV: 'development',
        },
        env_production: {
            NODE_ENV: 'production',
        }
    }]
}