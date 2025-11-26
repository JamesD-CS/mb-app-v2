// __tests__/handleCreatePost.test.js

// 1) Mock ioredis so no real Redis connections happen
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    publish: jest.fn().mockResolvedValue(1),
    subscribe: jest.fn().mockResolvedValue(1),
    on: jest.fn(),
    quit: jest.fn().mockResolvedValue(undefined),
  }));
});

// 2) Mock bullmq so Worker/Queue/QueueEvents don't hit Redis
jest.mock('bullmq', () => {
  const MockWorker = jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    close: jest.fn().mockResolvedValue(undefined),
  }));

  const MockQueue = jest.fn().mockImplementation(() => ({
    add: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
  }));

  const MockQueueEvents = jest.fn().mockImplementation(() => ({
    on: jest.fn(),                                  // 👈 THIS fixes "qe.on is not a function"
    close: jest.fn().mockResolvedValue(undefined),  // for graceful shutdown
  }));

  return {
    Worker: MockWorker,
    Queue: MockQueue,
    QueueEvents: MockQueueEvents,
  };
});

// Mock the db module
jest.mock('../db.js', () => ({
  query: jest.fn(),
}));

const  db = require( '../db.js');
const { handleCreatePost } = require('../postWorker.js');


describe('handleCreatePost', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('inserts a new post with the correct SQL and params, and returns postId', async () => {
    // Arrange
    const fakeJob = {
      data: {
        forum_id: 42,
        body: 'Hello world',
        title: 'My first post',
        poster_id: 'user-123',
        post_time: new Date('2025-01-01T00:00:00Z'),
        parent_post_id: null,
      },
    };

    // Mock db.db.query to simulate a successful insert returning id 100
    db.query.mockResolvedValue({
      rows: [{ id: 100 }],
    });

    // Act
    const result = await handleCreatePost(fakeJob);

    // Assert: db.db.query called once with the right SQL and params
    expect(db.query).toHaveBeenCalledTimes(1);
    const [sql, params] = db.query.mock.calls[0];

    // Basic checks on SQL
    expect(sql).toMatch(/INSERT INTO posts/i);
    expect(sql).toMatch(/ON CONFLICT \(poster_id\) DO NOTHING/i);
    expect(sql).toMatch(/RETURNING id/i);

    // Params order must match function
    expect(params).toEqual([
      42,
      'Hello world',
      'My first post',
      'user-123',
      fakeJob.data.post_time,
      null,
    ]);

    // Return value
    expect(result).toEqual({ ok: true, postId: 100 });
  });

  it('returns ok: true and postId: null when insert hits a conflict', async () => {
    const fakeJob = {
      data: {
        forum_id: 42,
        body: 'Duplicate body',
        title: 'Duplicate title',
        poster_id: 'existing-user',
        post_time: new Date('2025-01-01T01:00:00Z'),
        parent_post_id: null,
      },
    };

    // Simulate conflict: no rows returned by INSERT ... ON CONFLICT DO NOTHING
    db.query.mockResolvedValue({ rows: [] });

    const result = await handleCreatePost(fakeJob);

    expect(db.query).toHaveBeenCalledTimes(1);

    // still reports ok, but postId is null (idempotent behavior)
    expect(result).toEqual({ ok: true, postId: null });
  });
});
