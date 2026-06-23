/**
 * Interview Replay Controller (PostgreSQL with Offline Fallback)
 * Stores and retrieves timestamped replay events (Q&A turns, expressions, eye contact metrics) per session.
 */

const { query } = require('../../config/pgDb');

// Offline in-memory fallback store for session replay events
const inMemoryReplayStorage = new Map();

// ---------------------------------------------------------------------------
// POST /api/interviews/replay/save
// Body: { sessionId, events: [{ t, type, payload }] }
// ---------------------------------------------------------------------------
exports.saveReplay = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { sessionId, events } = req.body;

    if (!sessionId || !Array.isArray(events)) {
      return res.status(400).json({ message: 'sessionId and events array are required' });
    }

    try {
      // 1. Try PostgreSQL insert
      for (const event of events) {
        await query(`
          INSERT INTO replay_events (session_id, user_id, t, type, payload, created_at)
          VALUES ($1, $2, $3, $4, $5, NOW())
        `, [sessionId, userId, event.t, event.type, JSON.stringify(event.payload || {})]);
      }
      console.log(`✅ Saved ${events.length} replay events to PostgreSQL for session: ${sessionId}`);
    } catch (dbErr) {
      console.warn('[ReplayController] Database offline, saving to in-memory fallback:', dbErr.message);
      // Fallback to in-memory store
      if (!inMemoryReplayStorage.has(sessionId)) {
        inMemoryReplayStorage.set(sessionId, []);
      }
      const existingEvents = inMemoryReplayStorage.get(sessionId);
      inMemoryReplayStorage.set(sessionId, [...existingEvents, ...events]);
    }

    return res.status(200).json({ message: 'Replay events saved', count: events.length });
  } catch (err) {
    console.error('Save Replay Error:', err);
    return res.status(500).json({ message: 'Failed to save replay events' });
  }
};

// ---------------------------------------------------------------------------
// GET /api/interviews/replay/:sessionId
// ---------------------------------------------------------------------------
exports.getReplay = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { sessionId } = req.params;

    let session = null;
    let events = [];

    // 1. Fetch from PostgreSQL if online
    try {
      const sResult = await query(
        "SELECT id, company, role, type, started_at, score_card FROM interview_sessions WHERE id = $1 AND user_id = $2",
        [sessionId, userId]
      );
      if (sResult.rows.length > 0) {
        const row = sResult.rows[0];
        let scoreCard = null;
        try {
          scoreCard = typeof row.score_card === 'string' ? JSON.parse(row.score_card) : row.score_card;
        } catch (e) {
          scoreCard = row.score_card;
        }

        session = {
          id: row.id,
          company: row.company,
          role: row.role,
          type: row.type.toUpperCase(),
          startedAt: row.started_at,
          scoreCard
        };

        // Fetch events
        const eResult = await query(
          "SELECT t, type, payload FROM replay_events WHERE session_id = $1 ORDER BY t ASC",
          [sessionId]
        );
        events = eResult.rows.map(r => ({
          t: r.t,
          type: r.type,
          payload: typeof r.payload === 'string' ? JSON.parse(r.payload) : r.payload
        }));
      }
    } catch (dbErr) {
      console.warn('[ReplayController] Database offline during replay retrieval:', dbErr.message);
    }

    // 2. Fallback to memory / mockDb
    if (!session) {
      const { IS_DEMO_AUTH, requireDemoMode } = require('../../config/env');
      if (IS_DEMO_AUTH) {
        requireDemoMode('replay.getReplay');
        // Create a default session shell so page doesn't break
        session = {
          id: sessionId,
          company: "Google",
          role: "Software Engineer",
          type: "TECHNICAL",
          startedAt: new Date().toISOString(),
          scoreCard: { overallScore: 85 }
        };
        events = inMemoryReplayStorage.get(sessionId) || [];
      } else {
        return res.status(404).json({ message: 'Session not found' });
      }
    }

    return res.status(200).json({
      session,
      events,
      hasDetailedReplay: events.length > 0,
    });
  } catch (err) {
    console.error('Get Replay Error:', err);
    return res.status(500).json({ message: 'Failed to retrieve replay' });
  }
};

// ---------------------------------------------------------------------------
// GET /api/interviews/replay
// ---------------------------------------------------------------------------
exports.listReplays = async (req, res) => {
  try {
    const userId = req.user.userId;
    let replays = [];

    try {
      const result = await query(
        `SELECT id, company, role, type, started_at, completed_at, score_overall, score_technical, score_communication 
         FROM interview_sessions 
         WHERE user_id = $1 AND status = 'completed' 
         ORDER BY completed_at DESC`,
        [userId]
      );
      replays = result.rows.map(r => ({
        sessionId: r.id,
        company: r.company,
        role: r.role,
        type: r.type.toUpperCase(),
        completedAt: r.completed_at || r.started_at,
        overallScore: r.score_overall || 0,
        technicalScore: r.score_technical || 0,
        communicationScore: r.score_communication || 0
      }));
    } catch (dbErr) {
      const { IS_DEMO_AUTH, requireDemoMode } = require('../../config/env');
      if (IS_DEMO_AUTH) {
        requireDemoMode('replay.listReplays');
        replays = [
          {
            sessionId: "sess_mock_1",
            company: "Google",
            role: "Software Engineer",
            type: "TECHNICAL",
            completedAt: new Date().toISOString(),
            overallScore: 85,
            technicalScore: 80,
            communicationScore: 90
          }
        ];
      } else {
        console.error('[listReplays] Database error:', dbErr);
        return res.status(503).json({ message: 'Service temporarily unavailable' });
      }
    }

    return res.status(200).json({ replays, total: replays.length });
  } catch (err) {
    console.error('List Replays Error:', err);
    return res.status(500).json({ message: 'Failed to list replays' });
  }
};
