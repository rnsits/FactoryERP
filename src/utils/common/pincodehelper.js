// const axios = require('axios');

// // Create the axios instance here
// const instance = axios.create({
//     baseURL: 'https://api.postalpincode.in',
//     timeout: 10000,
// });

// async function getPostOffice(pincode) {
//     const response = await instance.get(`/pincode/${pincode}`);
//     return response.data[0].PostOffice[0]; // Return the first PostOffice object
// }

// module.exports = { getPostOffice };

// Define the pincode ranges for each state and union territory
const pincodeRanges = {
    "Jammu & Kashmir": [180001, 194999],
    "Himachal Pradesh": [171001, 177999],
    "Punjab": [140001, 160999],
    "Haryana": [121001, 136999],
    "Uttarakhand": [244001, 263999],
    "Delhi": [110001, 110099],
    "Uttar Pradesh": [200001, 285999],
    "Chandigarh": [160001, 160999],
    "Madhya Pradesh": [450001, 488999],
    "Chhattisgarh": [490001, 497999],
    "Rajasthan": [301001, 345999],
    "Gujarat": [360001, 396999],
    "Maharashtra": [400001, 448999],
    "Goa": [403001, 403999],
    "Bihar": [800001, 855999],
    "Jharkhand": [814001, 835999],
    "West Bengal": [700001, 743999],
    "Odisha": [750001, 779999],
    "Karnataka": [560001, 590999],
    "Andhra Pradesh": [515001, 535999],
    "Telangana": [500001, 509999],
    "Tamil Nadu": [600001, 643999],
    "Kerala": [670001, 695999],
    "Puducherry": [605001, 609999],
    "Assam": [781001, 788999],
    "Meghalaya": [793001, 794999],
    "Nagaland": [797001, 798999],
    "Manipur": [795001, 795999],
    "Mizoram": [796001, 796999],
    "Tripura": [799001, 799999],
    "Arunachal Pradesh": [790001, 792999],
    "Sikkim": [737101, 737999],
    "Andaman & Nicobar Islands": [744101, 744999],
    "Lakshadweep": [682551, 682559],
    "Dadra & Nagar Haveli and Daman & Diu": [396210, 396239],
    "Ladakh": [194101, 194999],
  };
  
  // Function to check the region based on pincode
  function findStateByPincode(pincode) {
    // Ensure the pincode is a number and is of 6 digits
    if (!/^\d{6}$/.test(pincode)) {
      return "Invalid pincode format. It should be a 6-digit number.";
    }
  
    // Convert pincode to number if it's passed as a string
    pincode = Number(pincode);
  
    // Iterate over the pincode ranges
    for (const [region, range] of Object.entries(pincodeRanges)) {
      const [min, max] = range;
      if (pincode >= min && pincode <= max) {
        return region;
      }
    }
  
    return "Pincode does not belong to any known region.";
  }
  
//   // Example usage
//   console.log(findRegionByPincode(110001)); // "Delhi"
//   console.log(findRegionByPincode(781006)); // "Assam"
//   console.log(findRegionByPincode(999999)); // "Pincode does not belong to any known region."
  

module.exports = {
    findStateByPincode
}