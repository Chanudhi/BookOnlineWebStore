// const app = require('./app');
// const dotenv = require('dotenv');
// const mongoose = require('mongoose');

// dotenv.config();    

// mongoose.connect(process.env.MONGO_URI, )
//     .then(()=>{
//         console.log('MongoDB connected');
//     app.listen(process.env.PORT, () =>console.log(`Server is running on port ${process.env.PORT}`));
//     })
//     .catch((err) => {
//         console.log(err);
//     });
// server/server.js
const app = require('./app');

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
