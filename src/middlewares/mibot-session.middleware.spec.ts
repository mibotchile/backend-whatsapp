import { MibotSessionMiddleware } from './mibot-session.middleware'

describe('MibotSessionMiddleware', () => {
  it('should be defined', () => {
    expect(new MibotSessionMiddleware()).toBeDefined()
  })
})
