/**
 * Interview Replay Controller
 * Stores and retrieves timestamped replay events (Q&A turns, AI scores) per session.
 * In production these would live in a time-series table in PostgreSQL.
 */

const mockDb = require('../../models/mockDb');

// ---------------------------------------------------------------------------
// POST /api/interviews/replay/save
// Body: { sessionId, events: [{ t, type, payload }] }
// ---------------------------------------------------------------------------
exports.saveReplay = (req, res) => {
  try {
    const userId = req.user.userId;
    const { sessionId, events } = req.body;

    if (!sessionId || !Array.isArray(events)) {
      return res.status(400).json({ message: 'sessionId and events array are required' });
    }

    // Persist replay as a special record type in mockDb sessions
    const existing = mockDb.sessions?.findOne({ sessionId, userId });

    if (existing) {
      mockDb.sessions.updateOne(
        { sessionId, userId },
        { events: [...(existing.events || []), ...events], updatedAt: new Date().toISOString() }
      );
    } else {
      if (mockDb.sessions) {
        mockDb.sessions.create({
          sessionId,
          userId,
          events,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
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
exports.getReplay = (req, res) => {
  try {
    const userId = req.user.userId;
    const { sessionId } = req.params;

    // Try to find session in interviews history
    const history = mockDb.interviews?.findMany({ userId }) || [];
    const session = history.find(h => h.id === sessionId || h.sessionId === sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Replay not found for this session' });
    }

    // Try to find saved replay events
    const replay = mockDb.sessions?.findOne?.({ sessionId, userId });

    return res.status(200).json({
      session: {
        id: session.id,
        company: session.company,
        role: session.role,
        type: session.type,
        startedAt: session.startedAt,
        scoreCard: session.scoreCard,
      },
      events: replay?.events || [],
      hasDetailedReplay: (replay?.events?.length || 0) > 0,
    });
  } catch (err) {
    console.error('Get Replay Error:', err);
    return res.status(500).json({ message: 'Failed to retrieve replay' });
  }
};

// ---------------------------------------------------------------------------
// GET /api/interviews/replay
// ---------------------------------------------------------------------------
exports.listReplays = (req, res) => {
  try {
    const userId = req.user.userId;
    const history = mockDb.interviews?.findMany?.({ userId }) || [];

    const replays = history
      .filter(h => h.status === 'completed' && h.scoreCard)
      .map(h => ({
        sessionId: h.id,
        company: h.company,
        role: h.role,
        type: h.type,
        completedAt: h.scoreCard?.completedAt || h.startedAt,
        overallScore: h.scoreCard?.overallScore || 0,
        technicalScore: h.scoreCard?.technicalScore || 0,
        communicationScore: h.scoreCard?.communicationScore || 0,
      }))
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

    return res.status(200).json({ replays, total: replays.length });
  } catch (err) {
    console.error('List Replays Error:', err);
    return res.status(500).json({ message: 'Failed to list replays' });
  }
};
