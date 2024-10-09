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

  getPaymentData() {
    return new Promise((resolve) => {
      window.addEventListener("message", ({ data }) => {
        console.log("Data: ", data);
        if (data.type === "payment_initiate_props") {
          resolve(data);
        }
      });
    });
  }

  async saveMerchantInfo(merchantKey, merchantPass, locationId) {
    const res = await axios.post(
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
    );
    return res.data.userInfo;
  }

  async saveTestMerchantInfo(TestmerchantKey, TestmerchantPass, locationId) {
    const res = await axios.post(
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
    );

    return res.data.userInfo;
  }

  async payment(todoObject) {
    try {
      const response = await fetch(
        "https://checkout.montypay.com/api/v1/session",
        {
          method: "POST",
          body: JSON.stringify(todoObject),
          headers: { "Content-Type": "application/json" },
        }
      );
      const jsonResponse = await response.json();
      // window.location.href = jsonResponse.redirect_url;
      return jsonResponse.redirect_url;
    } catch (err) {
      console.log("ERROR", err);
      return;
    }
  }

  async getSavedInfo(locationId) {
    const res = await axios.get(`/get-by-locationId?locationId=${locationId}`);

    return res.data;
  }
}
