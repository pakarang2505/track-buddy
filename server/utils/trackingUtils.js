const generateTrackingId = () => {
    const prefix = "TBD";
    const randomNumber = Math.floor(1000000000 + Math.random() * 9000000000); // Generate a 10-digit random number
    return `${prefix}${randomNumber}`;
  };
  
  module.exports = {
    generateTrackingId,
  };
  