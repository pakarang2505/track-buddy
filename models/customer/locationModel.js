const LocationModel = {
  // Fetch all distributions with address details
  getAllDistributions: async (db) => {
    try {
      const query = `
        SELECT d.dist_id, d.dist_name, a.district, a.sub_district, a.province, a.postal_code
        FROM Distribution d
        JOIN Address a ON d.dist_addr_id = a.address_id
        ORDER BY a.province, a.district, d.dist_name;
      `;
      return await db.query(query);
    } catch (error) {
      throw new Error('Error fetching all distributions: ' + error.message);
    }
  },

  // Fetch distributions based on search criteria
  searchDistributions: async (db, searchTerm) => {
    try {
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
      return await db.query(query, [
        likeQuery, // District
        likeQuery, // Sub-district
        likeQuery, // Province
        likeQuery, // Postal code
        likeQuery, // Distribution name
      ]);
    } catch (error) {
      throw new Error('Error searching distributions: ' + error.message);
    }
  },
};

module.exports = LocationModel;
