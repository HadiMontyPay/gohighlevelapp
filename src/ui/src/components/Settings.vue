<template>
  <div id="settings_page" v-if="loading === false">
    <h1>MontyPay Configuration</h1>
    <p>
      Please update the test and live credentials below to use payment gateway.
    </p>
    <div id="message">{{ Message }}</div>
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
  <div id="lll" v-if="loading === true">
    <div class="loader"></div>
  </div>
</template>

<script setup>
// import axios from "axios";
import { ref, onMounted } from "vue";

const merchantKey = ref("");
const merchantPass = ref("");
const loading = ref(true);

const locationId = ref("");

const TestmerchantKey = ref("");
const TestmerchantPass = ref("");

const Message = ref("");

async function getUserData() {
  const data = await window.ghl.getUserData();
  locationId.value = data.activeLocation;
  await getSavedInfo(data.activeLocation);
}

async function getSavedInfo(locationId) {
  const info = await window.ghl.getSavedInfo(locationId);
  // console.log(info);
  if (info) {
    if (info.merchantKey) {
      merchantKey.value = info.merchantKey;
    }
    if (info.merchantPass) {
      merchantPass.value = info.merchantPass;
    }
    if (info.TestmerchantKey) {
      TestmerchantKey.value = info.TestmerchantKey;
    }
    if (info.TestmerchantPass) {
      TestmerchantPass.value = info.TestmerchantPass;
    }

    loading.value = false;
  } else {
    loading.value = false;
  }
}

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
  Message.value = data;
  if (!data) {
    console.log("error:", data);
    Message.value = data;
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
  // console.log("Data:", data);
  Message.value = data;
  // found.value = data;
  if (!data) {
    console.log("error:", data);
    Message.value = data;
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
  position: relative;

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

  #message {
    position: absolute;
    top: 0;
    right: 30px;
    padding: 1rem;
    background-color: #ffffff;
    border-radius: 8px;
    border: 2px solid #155eef;
  }
}

#lll {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;

  .loader {
    margin-top: 2rem;
    width: 50px;
    aspect-ratio: 1;
    border-radius: 50%;
    border: 8px solid #155eef;
    animation: l20-1 0.8s infinite linear alternate, l20-2 1.6s infinite linear;
  }
}
@keyframes l20-1 {
  0% {
    clip-path: polygon(50% 50%, 0 0, 50% 0%, 50% 0%, 50% 0%, 50% 0%, 50% 0%);
  }
  12.5% {
    clip-path: polygon(
      50% 50%,
      0 0,
      50% 0%,
      100% 0%,
      100% 0%,
      100% 0%,
      100% 0%
    );
  }
  25% {
    clip-path: polygon(
      50% 50%,
      0 0,
      50% 0%,
      100% 0%,
      100% 100%,
      100% 100%,
      100% 100%
    );
  }
  50% {
    clip-path: polygon(
      50% 50%,
      0 0,
      50% 0%,
      100% 0%,
      100% 100%,
      50% 100%,
      0% 100%
    );
  }
  62.5% {
    clip-path: polygon(
      50% 50%,
      100% 0,
      100% 0%,
      100% 0%,
      100% 100%,
      50% 100%,
      0% 100%
    );
  }
  75% {
    clip-path: polygon(
      50% 50%,
      100% 100%,
      100% 100%,
      100% 100%,
      100% 100%,
      50% 100%,
      0% 100%
    );
  }
  100% {
    clip-path: polygon(
      50% 50%,
      50% 100%,
      50% 100%,
      50% 100%,
      50% 100%,
      50% 100%,
      0% 100%
    );
  }
}
@keyframes l20-2 {
  0% {
    transform: scaleY(1) rotate(0deg);
  }
  49.99% {
    transform: scaleY(1) rotate(135deg);
  }
  50% {
    transform: scaleY(-1) rotate(0deg);
  }
  100% {
    transform: scaleY(-1) rotate(-135deg);
  }
}
</style>
