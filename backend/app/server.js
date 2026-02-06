require("dotenv").config();
const { createServer } = require("./app");

const PORT = process.env.PORT || 5000;

createServer()
  .then((app) => {
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`LifeLens API running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Failed to start server", err);
  });
