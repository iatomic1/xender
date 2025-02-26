import puppeteer from "puppeteer";

const getTwitterProfilePic = async (username: string) => {
  const url = `https://twitter.com/${username}`;

  const browser = await puppeteer.launch({
    headless: true, // Use true for full headless mode
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  // Wait for the profile picture to load
  await page.waitForSelector(
    'img[src^="https://pbs.twimg.com/profile_images/"]',
  );

  // Get the profile picture URL
  const profilePic = await page.evaluate(() => {
    const img = document.querySelector(
      'img[src^="https://pbs.twimg.com/profile_images/"]',
    );
    return img ? img.getAttribute("src") : null;
  });

  await browser.close();

  return profilePic;
};

// Example usage
getTwitterProfilePic("jack")
  .then((pic) => console.log("Profile Picture:", pic))
  .catch((err) => console.error("Error:", err));
