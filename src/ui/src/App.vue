<template>
  <div>
    <h1>MontyPay Configuration</h1>
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
            v-model="merchantPassword"
            type="password"
            placeholder="Merchant Password"
          />
        </label>
      </fieldset>
      <button type="submit">Save</button>
    </form>
    <div>
      {{ JSON.stringify(user, null, 4) }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const user = ref({});
const merchantKey = ref("");
const merchantPassword = ref("");
const locationId = ref("");

async function getUserData() {
  const data = await window.ghl.getUserData();
  user.value = data;
  locationId.value = data.activeLocation;
}

onMounted(() => {
  getUserData();
});

async function saveMerchantInfo() {
  // console.log("Merchant Key:", merchantKey.value);
  // console.log("Merchant Password:", merchantPassword.value);
  // console.log("Location ID:", locationId.value);
  if (locationId.value === "") {
    console.log("LocationID Empty");
    return;
  }
  const data = await window.ghl.saveMerchantInfo(
    merchantKey.value,
    merchantPassword.value,
    locationId.value
  );
  if (!data) {
    console.log("error:", data);
  }
}
</script>

<style></style>
