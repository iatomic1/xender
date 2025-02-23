export default defineContentScript({
  matches: [
    "*://*.discord.com/*",
    "*://*.twitter.com/*",
    "*://twitter.com/*",
    "*://x.com/*",
  ],
  async main() {
    console.log("Injecting script...");
    await injectScript("/example-main-world.js", {
      keepInDom: true,
    });
    // await injectScript("/connect.js", {
    //   keepInDom: true,
    // }).then(async () => {
    //   await injectScript("/transactions.js", {
    //     keepInDom: true,
    //   });
    // });
    console.log("Done!");
  },
});
