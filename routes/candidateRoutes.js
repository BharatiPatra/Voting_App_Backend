const express = require("express");
const router = express.Router();
const Candidate = require("../models/candidate.models");
const User = require("../models/user.models");

const { jwtAuthMiddleware } = require("./../jwt");
const checkAdminRole = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user.role === "admin";
  } catch (err) {
    return false;
  }
};

// POST route to add a candidate
router.post("/", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id)))
      return res.status(403).json({ message: "user does not have admin role" });

    const data = req.body; //assuming the request body contains the candidate data
    const newCandidate = new Candidate(data); //create a new candidate document using the mongoose model
    const response = await newCandidate.save(); //save the new candidate to the database
    res.status(200).json({ response: response });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:candidateId", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!checkAdminRole(req.user.id))
      return res.status(403).json({ message: "user does not have admin role" });
    const candidateId = req.params.candidateId; //Extract the id from the url parameter
    const updatedCandidateData = req.body; //updated data for the candidate
    const response = await Candidate.findByIdAndUpdate(
      candidateId,
      updatedCandidateData,
      {
        new: true, //return the updated documents
        runValidators: true, //run mongoose validations
      }
    );
    if (!response) {
      return res.status(404).json({ error: "candidate not found" });
    }
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.delete("/:candidateId", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!checkAdminRole(req.user.id))
      return res.status(403).json({ message: "user does not have admin role" });
    const candidateId = req.params.candidateId; //Extract the id from the url parameter
    const response = await Candidate.findByIdAndDelete(candidateId);
    if (!response) {
      return res.status(404).json({ error: "candidate not found" });
    }
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//let's start voting
router.post("/vote/:candidateId", jwtAuthMiddleware, async (req, res) => {
  //no admin can vote
  //user can only vote once
  const candidateId = req.params.candidateId;
  const userId = req.user.id;
  try {
    //find the candidate document with the specified candidateId
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.isVoted) {
      return res.status(400).json({ message: "You have already voted" });
    }
    if (user.role === "admin") {
      return res.status(403).json({ message: "Admin is not allowed" });
    }
    //update the candidate document to record the vote
    candidate.votes.push({ user: userId });
    candidate.voteCount++;
    await candidate.save();
    //update the user document
    user.isVoted = true;
    await user.save();
    return res.status(200).json({ message: "vote recoded successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//vote count
router.get("/vote/count", async (req, res) => {
  try {
    //find all candidates and sort them by voteCount in descending order
    const candidate = await Candidate.find().sort({ voteCount: "desc" });
    //Map the candidates to only return their name and voteCount
    const voteRecord = candidate.map((data) => {
      return {
        party: data.party,
        count: data.voteCount,
      };
    });
    return res.status(200).json(voteRecord);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Get List of all candidates with only name and party fields
router.get("/", async (req, res) => {
  try {
    // Find all candidates and select only the name and party fields, excluding _id
    const candidates = await Candidate.find({}, "name party -_id");
    // Return the list of candidates
    res.status(200).json(candidates);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = router;
