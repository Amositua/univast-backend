import app from "./app.js";

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/payment-success', (req, res) => {
  res.send('Payment was successful! You can close this window.');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port  ${PORT}`);
});