import Participant from "../models/Participant.js";
import Conference from "../models/Conference.js";
import { getIO } from "../socket.js";
import mongoose from "mongoose";


// src/controllers/dashboardController.js

export const getDashboardStats = async (req, res) => {
  try {
    const { conferenceId } = req.query;
    if (!conferenceId) {
      return res.status(400).json({ success: false, msg: "Missing conferenceId parameter" });
    }
    const cleanConferenceId = String(conferenceId).trim();
    
    // Resolve conference details (slug, name, or ObjectId)
    const targetConference = await Conference.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(cleanConferenceId) ? cleanConferenceId : undefined },
        { slug: cleanConferenceId },
        { name: cleanConferenceId }
      ].filter(Boolean)
    });
    
    const finalConferenceId = targetConference ? String(targetConference._id) : cleanConferenceId;

    // Run parallel count optimizations using indexes
    const [
      total,
      checkedIn,
      printed,
      kitbagCollected,
      certificateGiven,
      hallEntriesAgg,
      hallExitsAgg,
      workshopScansCount,
      foodLogsGrouped
    ] = await Promise.all([
      Participant.countDocuments({ conferenceId: finalConferenceId }),
      Participant.countDocuments({ conferenceId: finalConferenceId, isCheckedIn: true }),
      Participant.countDocuments({ conferenceId: finalConferenceId, printed: true }),
      Participant.countDocuments({ conferenceId: finalConferenceId, kitbagCollected: true }),
      Participant.countDocuments({ conferenceId: finalConferenceId, certificateGiven: true }),
      Participant.aggregate([
        { $match: { conferenceId: finalConferenceId } },
        { $group: { _id: null, total: { $sum: { $cond: [ { $isArray: "$hallEntries" }, { $size: "$hallEntries" }, 0 ] } } } }
      ]),
      Participant.aggregate([
        { $match: { conferenceId: finalConferenceId } },
        { $group: { _id: null, total: { $sum: { $cond: [ { $isArray: "$hallExits" }, { $size: "$hallExits" }, 0 ] } } } }
      ]),
      Participant.countDocuments({ conferenceId: finalConferenceId, "workshopScans.0": { $exists: true } }),
      Participant.aggregate([
        { $match: { conferenceId: finalConferenceId } },
        { $project: { foodLogsArray: { $objectToArray: "$foodLogs" } } },
        { $unwind: "$foodLogsArray" },
        { $match: { "foodLogsArray.v": true } },
        { $group: { _id: "$foodLogsArray.k", count: { $sum: 1 } } }
      ])
    ]);

    const hallEntriesCount = hallEntriesAgg[0]?.total || 0;
    const hallExitsCount = hallExitsAgg[0]?.total || 0;

    const totalDays = Number(targetConference?.totalDays) || 9;

    // Construct day-specific meal stats (supports Day 1 - Day 9 dynamically)
    const food = {};
    const dailyAttendance = {};
    for (let d = 1; d <= Math.max(5, totalDays); d++) {
      food[`day${d}`] = { breakfast: 0, lunch: 0, dinner: 0 };
      dailyAttendance[`day${d}`] = 0;
    }
    
    foodLogsGrouped.forEach(item => {
      if (item._id) {
        const [dayPart, mealPart] = item._id.split("-");
        if (food[dayPart] && mealPart) {
          food[dayPart][mealPart] = item.count;
        }
      }
    });

    // Aggregate daily check-in attendance
    const attendanceLogsGrouped = await Participant.aggregate([
      { $match: { conferenceId: finalConferenceId } },
      { $project: { attendanceLogsArray: { $objectToArray: "$attendanceLogs" } } },
      { $unwind: "$attendanceLogsArray" },
      { $match: { "attendanceLogsArray.v": true } },
      { $group: { _id: "$attendanceLogsArray.k", count: { $sum: 1 } } }
    ]);

    attendanceLogsGrouped.forEach(item => {
      if (item._id && dailyAttendance[item._id] !== undefined) {
        dailyAttendance[item._id] = item.count;
      }
    });

    return res.json({
      success: true,
      stats: {
        total,
        checkedIn,
        printed,
        kitbagCollected,
        certificateGiven,
        hallEntriesCount,
        hallExitsCount,
        workshopScansCount,
        food,
        dailyAttendance,
        totalDays
      }
    });
  } catch (error) {
    console.error("Dashboard stats aggregation error:", error);
    return res.status(500).json({ error: error.message });
  }
};