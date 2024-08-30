<template>
  <div id="settings_page">
    <h1>MontyPay Configuration</h1>
    <p>
      Please update the test and live credentials below to use payment gateway.
    </p>
    <form @submit.prevent="saveTestMerchantInfo">
      <fieldset>
        <legend>Test Credentials</legend>
        <label>
          <span> Merchant Key: </span>
          <input
            v-model="TestmerchantKey"
            type="text"
            placeholder="Merchant Key"
          />
        </label>
        <label>
          <span> Merchant Password: </span>
          <input
            v-model="TestmerchantPass"
            type="password"
            placeholder="Merchant Password"
          />
        </label>
        <button type="submit">Connect</button>
      </fieldset>
    </form>
    <form @submit.prevent="saveMerchantInfo">
      <fieldset>
        <legend>Live Credentials</legend>
        <label>
          <span> Merchant Key: </span>
          <input v-model="merchantKey" type="text" placeholder="Merchant Key" />
        </label>
        <label>
          <span> Merchant Password: </span>
          <input
            v-model="merchantPass"
            type="password"
            placeholder="Merchant Password"
          />
        </label>
        <button type="submit">Connect</button>
      </fieldset>
    </form>
  </div>
</template>

<script setup>
// import axios from "axios";
import { ref, onMounted } from "vue";

const merchantKey = ref("");
const merchantPass = ref("");

const locationId = ref("Wo0JTzsjoXSRdWMGyGNM");

const TestmerchantKey = ref("");
const TestmerchantPass = ref("");

async function getUserData() {
  const data = await window.ghl.getUserData();
  locationId.value = data.activeLocation;
  // await CreateNewIntegration();
}

// async function CreateNewIntegration() {
//   try {
//     const locationIdResponse = await fetch(
//       `/get-by-locationId?locationId=${locationId.value}`
//     );

//     // Check if the response is okay (status 200-299)
//     if (!locationIdResponse.ok) {
//       const errorText = await locationIdResponse.text(); // Get the text to understand what the error is
//       throw new Error(
//         `Error fetching locationId: ${locationIdResponse.status} ${errorText}`
//       );
//     }

//     const locationIdData = await locationIdResponse.json();
//     console.log(locationIdData);

//     const url = `https://services.leadconnectorhq.com/payments/custom-provider/provider?locationId=${locationIdData.locationId}`;

//     const headers = {
//       Accept: "application/json",
//       Authorization: `Bearer ${locationIdData.access_token}`,
//       "Content-Type": "application/json",
//       Version: "2021-07-28",
//     };

//     const data = {
//       name: "MontyPay Payment",
//       description:
//         "MontyPay allows merchants to collect payments globally with ease. Our multiple plugins, APIs, and SDKs ensure seamless integration with merchants’ websites and apps.",
//       paymentsUrl: "https://funnnel-fusion.onrender.com/payment",
//       queryUrl: "https://funnnel-fusion.onrender.com",
//       imageUrl: "https://funnnel-fusion.onrender.com/logo.png",
//     };

//     fetch(url, {
//       method: "POST",
//       headers: headers,
//       body: JSON.stringify(data),
//     })
//       .then((response) => response.json())
//       .then((result) => {
//         axios
//           .post("/add-providerConfig", {
//             providerConfig: result.providerConfig,
//             locationId: locationIdData.locationId,
//           })
//           .then((resp) => {
//             console.log("Provider config Added");
//           });
//       })
//       .catch((err) => {
//         console.log("Provider Config Error:", err);
//       })
//       .catch((error) => console.error("Error:", error));
//   } catch (err) {
//     console.error({ Error: err });
//   }
// }

onMounted(() => {
  getUserData();
});

function validateMerchantKey(str) {
  let regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(str);
}

function validateMerchantPass(str) {
  if (str.length < 32) {
    return false;
  } else {
    return true;
  }
}
async function saveMerchantInfo() {
  if (locationId.value === "") {
    console.log("LocationID Empty");
    return;
  }

  if (!validateMerchantKey(merchantKey.value)) {
    console.log("Merchant Key Invalid");
    return;
  }

  if (!validateMerchantPass(merchantPass.value)) {
    console.log("Merchant Password Invalid");
    return;
  }

  const data = await window.ghl.saveMerchantInfo(
    merchantKey.value,
    merchantPass.value,
    locationId.value
  );
  if (!data) {
    console.log("error:", data);
  }
}

async function saveTestMerchantInfo() {
  if (locationId.value === "") {
    console.log("LocationID Empty");
    return;
  }

  if (!validateMerchantKey(TestmerchantKey.value)) {
    console.log("Merchant Key Invalid");
    return;
  }

  if (!validateMerchantPass(TestmerchantPass.value)) {
    console.log("Merchant Password Invalid");
    return;
  }

  const data = await window.ghl.saveTestMerchantInfo(
    TestmerchantKey.value,
    TestmerchantPass.value,
    locationId.value
  );
  // found.value = data;
  if (!data) {
    console.log("error:", data);
  }
}
</script>

<script>
export default {
  name: "SettingsPage",
  //   props: {
  //     msg: String
  //   }
};
</script>

<style>
#settings_page {
  h1 {
    border: none;
    font-size: 20px;
  }

  p {
    font-size: 14px;
  }

  form {
    border-top: 1px solid #eaecf0;
    border-radius: 0;

    fieldset {
      border: none;
      width: 90%;

      legend {
        font-size: 14px;
      }

      label {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        align-items: flex-start;
        margin-left: 20px;

        span {
          font-size: 14px;
        }

        input {
          width: 80%;
          max-width: 80%;
          font-size: 14px;
          padding: 0.75rem 1rem;
        }
      }

      button {
        background-color: #155eef;
        font-size: 14px;
        color: white;
        font-weight: 500;
        padding: 0.6rem 1.5rem;
        margin-left: 20px;
        border-radius: 8px;
      }
    }
  }
}
</style>
