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
import { ref, onMounted } from "vue";

const merchantKey = ref("");
const merchantPass = ref("");

const locationId = ref("");

const TestmerchantKey = ref("");
const TestmerchantPass = ref("");

async function getUserData() {
  const data = await window.ghl.getUserData();
  locationId.value = data.activeLocation;
  await association();
}

async function association() {
  const locationIdResponse = await fetch(
    `/get-by-locationId?locationId=${locationId.value}`
  );
  const locationIdData = await locationIdResponse.json();

  console.log(locationIdData);

  const postData = {
    name: "MontyPay Payment",
    description:
      "MontyPay allows merchants to collect payments globally with ease. Our multiple plugins, APIs, and SDKs ensure seamless integration with merchants’ websites and apps.",
    paymentsUrl: `${process.env.VUE_APP_BACKEND_URL}/payment`,
    queryUrl: `${process.env.VUE_APP_BACKEND_URL}`,
    imageUrl: `${process.env.VUE_APP_BACKEND_URL}/logo.png`,
  };

  const postHeaders = {
    "content-type": "application/x-www-form-urlencoded",
    Authorization: `${locationIdData.token_type} ${locationIdData.access_token}`,
    Version: "2021-07-28",
    Accept: "application/json",
  };

  try {
    const postResponse = await fetch(
      `${process.env.GHL_API_DOMAIN}/payments/custom-provider/provider?locationId=${locationIdData.locationId}`,
      {
        method: "POST",
        headers: postHeaders,
        body: JSON.stringify(postData),
      }
    );

    const postResponseData = await postResponse.json();
    console.log(postResponseData);
  } catch (err) {
    console.log({ Error: err });
  }
}

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
