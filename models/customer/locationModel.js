const db = require('../../config/db');

const LocationModel = {
  // Fetch all distributions with address details
  getAllDistributions: () => {
    const query = `
      SELECT d.dist_id, d.dist_name, a.district, a.sub_district, a.province, a.postal_code
      FROM Distribution d
      JOIN Address a ON d.dist_addr_id = a.address_id
      ORDER BY a.province, a.district, d.dist_name;
    `;
    return db.promise().query(query);
  },

  // Fetch distributions based on search criteria
  searchDistributions: (searchTerm) => {
    const query = `
      SELECT d.dist_id, d.dist_name, a.district, a.sub_district, a.province, a.postal_code
      FROM Distribution d
      JOIN Address a ON d.dist_addr_id = a.address_id
      WHERE 
        LOWER(a.district) LIKE LOWER(?) OR
        LOWER(a.sub_district) LIKE LOWER(?) OR
        LOWER(a.province) LIKE LOWER(?) OR
        a.postal_code LIKE ? OR
        LOWER(d.dist_name) LIKE LOWER(?)
      ORDER BY a.province, a.district, d.dist_name;
    `;
    const likeQuery = `%${searchTerm}%`;
    return db.promise().query(query, [
      likeQuery, // District
      likeQuery, // Sub-district
      likeQuery, // Province
      likeQuery, // Postal code
      likeQuery  // Distribution name
    ]);
  }
};

module.exports = LocationModel;
