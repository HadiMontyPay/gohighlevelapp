<template>
  <div>
    <h1>MontyPay Configuration</h1>
    <form @submit.prevent="saveTestMerchantInfo">
      <fieldset>
        <legend>Test Merchant Info</legend>
        <label>
          Test Merchant Key:
          <input
            v-model="TestmerchantKey"
            type="text"
            placeholder="Merchant Key"
          />
        </label>
        <label>
          Test Merchant Password:
          <input
            v-model="TestmerchantPass"
            type="password"
            placeholder="Merchant Password"
          />
        </label>
        <button type="submit">Save</button>
      </fieldset>
    </form>
    <form @submit.prevent="saveMerchantInfo">
      <fieldset>
        <legend>Merchant Info</legend>
        <label>
          Merchant Key:
          <input v-model="merchantKey" type="text" placeholder="Merchant Key" />
        </label>
        <label>
          Merchant Password:
          <input
            v-model="merchantPass"
            type="password"
            placeholder="Merchant Password"
          />
        </label>
        <button type="submit">Save</button>
      </fieldset>
    </form>
  </div>
</template>

<script setup>
// import axios from "axios";
import { ref, onMounted } from "vue";

const merchantKey = ref("");
const merchantPass = ref("");

const locationId = ref("");

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

async function saveMerchantInfo() {
  if (locationId.value === "") {
    console.log("LocationID Empty");
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
