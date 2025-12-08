const apiKey = "DEMO_KEY";

async function getAPOD() {
  const res = await fetch(
    `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`
  );
  const data = await res.json();
  console.log(data);
}

getAPOD();
