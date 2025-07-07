fetch("https://ipwho.is/")
  .then(res => res.json())
  .then(data => {
    fetch("https://hook.us2.make.com/1ixi3sknown9lfp1fzi0nuv5rojl617p", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ip: data.ip,
        country: data.country
      })
    });
  })
  .catch(err => console.error("Fetch failed", err));
