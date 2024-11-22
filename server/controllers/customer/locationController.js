const LocationModel = require('../../models/customer/locationModel');

exports.getAllDistributions = async (req, res) => {
  try {
    const [distributions] = await LocationModel.getAllDistributions(req.db);
    res.status(200).json(distributions);
  } catch (error) {
    console.error('Error fetching distributions:', error.message);
    res.status(500).json({ error: 'Error fetching distributions' });
  }
};

exports.searchDistributions = async (req, res) => {
  try {
    const { query } = req.query;

    // If no search term is provided, fetch all distributions
    if (!query || query.trim() === '') {
      const [distributions] = await LocationModel.getAllDistributions(req.db);
      return res.status(200).json(distributions);
    }

    const [distributions] = await LocationModel.searchDistributions(req.db, query);
    res.status(200).json(distributions);
  } catch (error) {
    console.error('Error searching distributions:', error.message);
    res.status(500).json({ error: 'Error searching distributions' });
  }
};
