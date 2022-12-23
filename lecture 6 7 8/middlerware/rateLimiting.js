const AccessModel = require("../models/AccessModel");
const rateLimiting = async (req, res, next) => {
  const sessionId = req.session.id; // This is unique to any user

  // console.log(req.session);
  // console.log(sessionId);

  if (!sessionId) {
    return res.send({
      status: 404,
      message: "Invalid Session. Please log in.",
    });
  }

  // Rate limiting logic

  // If user has accessed the api recently

  const sessionTimeDb = await AccessModel.findOne({ sessionId: sessionId });

  if (!sessionTimeDb) {
    // Create - Session is not present
    const accessTime = new AccessModel({
      sessionId: req.session.id,
      time: Date.now(),
    });
    await accessTime.save();
    next();
    return;
  }

  const previousAccessTime = sessionTimeDb.time;
  const currentTime = Date.now();

  if (currentTime - previousAccessTime < 1000) {
    return res.send({
      status: 401,
      message: "Too many requests. Please try in some time.",
    });
  }

  // Update if already present
  await AccessModel.findOneAndUpdate(
    { sessionId: sessionId },
    { time: Date.now() }
  );
  next();
};

module.exports = rateLimiting;
