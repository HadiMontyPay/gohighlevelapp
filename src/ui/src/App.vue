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

    <div>
      {{ JSON.stringify(user, null, 4) }}
    </div>
    <div>
      <button v-on:click="association()">Test</button>
      {{ JSON.stringify(found, null, 4) }}
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, onMounted } from "vue";

const user = ref({});
const merchantKey = ref("");
const merchantPass = ref("");

const locationId = ref("");

const TestmerchantKey = ref("");
const TestmerchantPass = ref("");

const found = ref({});

async function getUserData() {
  const data = await window.ghl.getUserData();
  user.value = data;
  locationId.value = data.activeLocation;
  await association();
}

async function association() {
  await axios
    .get(`/get-by-locationId?locationId=${locationId.value}`)
    .then((resp) => {
      found.value = resp.data;
    })
    .then(async (resp) => {
      await axios.post(
        `https://services.leadconnectorhq.com/payments/custom-provider/provider?locationId=${resp.data.locationId}`,
        {
          name: "MontyPay Payment",
          description:
            "MontyPay allows merchants to collect payments globally with ease. Our multiple plugins, APIs, and SDKs ensure seamless integration with merchants’ websites and apps. Offering features like online and mobile checkouts, payment links, smart routing, fraud prevention, and advanced reporting, MontyPay is designed to address your payment challenges. In addition, our unified dashboard and mobile app provide real-time transaction insights on the go. We know that integration can be complex, with high transaction rates and low acceptance, but MontyPay simplifies the process. With our global reach, we can onboard businesses worldwide with a single payment gateway, making global transactions smoother than ever.",
          paymentsUrl: `${process.env.VUE_APP_BACKEND_URL}`,
        },
        {
          headers: {
            "content-type": "application/x-www-form-urlencoded",
            Authorization: `${resp.data.token_type} ${resp.data.access_token}`,
            Version: "2021-07-28",
          },
        }
      );
    });
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

<style></style>
