import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { stream } from 'hono/streaming'

import { api, startCronJobs } from './routes/api.js'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', cors({
  origin: '*', // Restrict in production
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

// Mount API
app.route('/api', api)

// Start background sync
startCronJobs()

app.get('/', (c) => {
  return c.text('Motorsport Platform API is running')
})

// Basic SSE endpoint for live updates
app.get('/api/live', async (c) => {
  c.header('Content-Type', 'text/event-stream')
  c.header('Cache-Control', 'no-cache')
  c.header('Connection', 'keep-alive')

  return stream(c, async (stream) => {
    // Keep connection alive and send periodic updates
    let isConnected = true
    c.req.raw.signal.addEventListener('abort', () => {
      isConnected = false
      console.log('Client disconnected from SSE')
    })

    // Initial message
    await stream.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: new Date().toISOString() })}\n\n`)

    while (isConnected) {
      await stream.sleep(5000) // Send ping or update every 5 seconds
      if (isConnected) {
        await stream.write(`data: ${JSON.stringify({ type: 'PING', timestamp: new Date().toISOString() })}\n\n`)
      }
    }
  })
})

const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
