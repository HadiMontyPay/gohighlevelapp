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
}

async function association() {
  await axios
    .get(`/get-by-locationId?locationId=${locationId.value}`)
    .then((resp) => {
      found.value = resp.data;
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
