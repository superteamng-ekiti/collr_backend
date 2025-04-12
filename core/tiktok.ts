import puppeteer from "puppeteer";

const scrape_tiktok_profile = async (url: string) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    // Wait for basic profile details to load
    await page.waitForSelector("[data-e2e='user-title']");

    const profileData = await page.evaluate(() => {
      const getText = (selector: string) =>
        document.querySelector(selector)?.textContent?.trim() || null;

      const getAttr = (selector: string, attr: string) =>
        document.querySelector(selector)?.getAttribute(attr) || null;

      const username = getText("[data-e2e='user-title']");
      const displayName = getText("[data-e2e='user-subtitle']");
      const bio = getText("[data-e2e='user-bio']");
      const followers = getText("[data-e2e='followers-count']");
      const profileImg = getAttr("[data-e2e='user-avatar'] img", "src");

      const videoEls = Array.from(
        document.querySelectorAll("div[data-e2e='user-post-item']")
      ).slice(0, 5);

      const topVideos = videoEls.map((el) => {
        const link = el.querySelector("a")?.href || null;
        const thumb = el.querySelector("img")?.src || null;
        const title = el.querySelector("img")?.alt || "No title";
        return { title, link, thumb };
      });

      return {
        username,
        displayName,
        bio,
        followers,
        profileImg,
        topVideos
      };
    });

    await browser.close();
    return profileData;
  } catch (error) {
    await browser.close();
    console.error("Scraping error:", error);
    throw new Error("Failed to scrape TikTok profile");
  }
};

// Example Usage
// const url = "https://www.tiktok.com/@oyinstar8"; // Replace with an actual TikTok profile URL
// scrape_tiktok_profile(url).then((profile) => {
//   console.log(profile);
// });

export { scrape_tiktok_profile };
