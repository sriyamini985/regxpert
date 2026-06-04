import Participant from "../models/Participant.js";

export const getDashboardStats =
  async (req, res) => {
    try {
      const {
        conferenceId,
      } = req.params;

      const totalParticipants =
        await Participant.countDocuments({
          conferenceId,
        });

      const checkedIn =
        await Participant.countDocuments({
          conferenceId,
          isCheckedIn: true,
        });

      const foodScans =
        await Participant.countDocuments({
          conferenceId,
          foodScanned: true,
        });

      const certificates =
        await Participant.countDocuments({
          conferenceId,
          certificateGiven: true,
        });

      const printed =
        await Participant.countDocuments({
          conferenceId,
          printed: true,
        });

      res.json({
        totalParticipants,
        checkedIn,
        foodScans,
        certificates,
        printed,
      });
    } catch (error) {
      res.status(500).json({
        error: error.message,
      });
    }
  };

  