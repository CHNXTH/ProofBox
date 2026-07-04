export default {
  onLaunch(options) {
    console.log("ProofBox launch", options || {});
  },

  onShow() {
    console.log("ProofBox show");
  },

  onHide() {
    console.log("ProofBox hide");
  },

  onError(error) {
    console.error("ProofBox error", error);
  },

  globalData: {
    appName: "开箱有证 ProofBox",
    version: "1.0.0"
  }
};
