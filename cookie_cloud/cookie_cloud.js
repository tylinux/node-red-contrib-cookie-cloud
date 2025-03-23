module.exports = function (RED) {
  const CryptoJS = require("crypto-js");
  function CookieCloud(config) {
    RED.nodes.createNode(this, config);
    this.on("input", async function (msg) {
      try {
        const protocol = config.protocol;
        const host = config.host;
        const port = config.port;
        const uuid = config.uuid;
        const password = config.password;
        if (!protocol || !host || !port || !uuid || !password) {
          msg.payload = "Missing required fields";
          this.send(msg);
          return;
        }
        const url = `${protocol}://${host}:${port}/get/${uuid}`;
        const response = await fetch(url, {
          method: "GET",
        });
        const data = await response.json();
        msg.payload = decrypt(data.encrypted, uuid, password);
        this.send(msg);
      } catch (error) {
        msg.payload = "Error: " + error;
        this.send(msg);
      }
    });
  }
  function decrypt(encrypted, uuid, password) {
    const the_key = CryptoJS.MD5(uuid + "-" + password)
      .toString()
      .substring(0, 16);
    const decrypted = CryptoJS.AES.decrypt(encrypted, the_key).toString(
      CryptoJS.enc.Utf8,
    );
    const parsed = JSON.parse(decrypted);
    return parsed;
  }
  RED.nodes.registerType("cookie-cloud", CookieCloud);
};
