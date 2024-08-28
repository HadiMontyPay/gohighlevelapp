/* The above class is a JavaScript GHL helper class that retrieves user data by sending a request to a server and
decrypting the response using a key. */
import axios from "axios";
export class GHL {
  appId;

  constructor() {}

  async getUserData() {
    const key = await new Promise((resolve) => {
      window.parent.postMessage({ message: "REQUEST_USER_DATA" }, "*");
      window.addEventListener("message", ({ data }) => {
        if (data.message === "REQUEST_USER_DATA_RESPONSE") {
          resolve(data.payload);
        }
      });
    });
    const res = await fetch("/decrypt-sso", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ key }),
    });
    const data = await res.json();
    return data;
  }

  async saveMerchantInfo(merchantKey, merchantPass, locationId) {
    const res = await axios
      .post(
        "/save-merchant-info",
        {
          merchantKey: merchantKey,
          merchantPass: merchantPass,
          locationId: locationId,
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        axios.post(
          `https://services.leadconnectorhq.com/payments/custom-provider/connect?locationId=${response.data.userInfo.locationId}`,
          {
            live: {
              apiKey: merchantKey,
              publishableKey: merchantPass,
            },
            test: {
              apiKey: "",
              publishableKey: "",
            },
          },
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${response.data.userInfo.access_token}`,
              "Content-Type": "application/json",
              Version: "2021-07-28",
            },
          }
        );
      });
    return res.data.userInfo;
  }
  async saveTestMerchantInfo(TestmerchantKey, TestmerchantPass, locationId) {
    const res = await axios
      .post(
        "/save-test-merchant-info",
        {
          TestmerchantKey: TestmerchantKey,
          TestmerchantPass: TestmerchantPass,
          locationId: locationId,
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        axios.post(
          `https://services.leadconnectorhq.com/payments/custom-provider/connect?locationId=${response.data.userInfo.locationId}`,
          {
            live: {
              apiKey: "",
              publishableKey: "",
            },
            test: {
              apiKey: TestmerchantKey,
              publishableKey: TestmerchantPass,
            },
          },
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${response.data.userInfo.access_token}`,
              "Content-Type": "application/json",
              Version: "2021-07-28",
            },
          }
        );
      });

    return res.data.userInfo;
  }
}
