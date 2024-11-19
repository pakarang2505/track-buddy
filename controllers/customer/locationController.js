const LocationModel = require('../../models/customer/locationModel');

exports.getAllDistributions = async (req, res) => {
  try {
    const [distributions] = await LocationModel.getAllDistributions();
    res.status(200).json(distributions);
  } catch (error) {
    console.error("Error fetching distributions:", error);
    res.status(500).json({ error: "Error fetching distributions" });
  }
};

exports.searchDistributions = async (req, res) => {
  try {
    const { query } = req.query;

    // If no search term is provided, return all distributions
    if (!query || query.trim() === '') {
      return exports.getAllDistributions(req, res);
    }

    const [distributions] = await LocationModel.searchDistributions(query);
    res.status(200).json(distributions);
  } catch (error) {
    console.error("Error searching distributions:", error);
    res.status(500).json({ error: "Error searching distributions" });
  }
};
