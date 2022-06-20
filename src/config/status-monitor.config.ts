import { StatusMonitorConfiguration } from 'nest-status-monitor'

export const statusMonitorConfig:StatusMonitorConfiguration = {
  pageTitle: 'Nest.js Monitoring Page',
  port: Number(process.env.APP_PORT),
  path: '/status',
  ignoreStartsWith: '/health/alive',
  spans: [
    {
      interval: 1, // Every second
      retention: 60 // Keep 60 datapoints in memory
    },
    {
      interval: 5, // Every 5 seconds
      retention: 60
    },
    {
      interval: 15, // Every 15 seconds
      retention: 60
    },
    {
      interval: 60, // Every 60 seconds
      retention: 600
    }
  ],
  chartVisibility: {
    cpu: true,
    mem: true,
    load: true,
    responseTime: true,
    rps: true,
    statusCodes: true
  },
  healthChecks: [{
    protocol: 'http',
    host: 'localhost',
    path: '/health/alive',
    port: Number(process.env.APP_PORT)
  },
  {
    protocol: 'http',
    host: 'localhost',
    path: '/health/dead',
    port: Number(process.env.APP_PORT)
  }]
}
