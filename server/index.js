const express = require('express');
const cors = require('cors');
const todoRoutes = require('./src/routes/todo.routes');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use('/todos', todoRoutes);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
