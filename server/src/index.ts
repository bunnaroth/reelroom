import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Security engine running locally on http://localhost:${PORT}`);
});
