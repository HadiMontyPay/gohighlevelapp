<template>
  <div>
    <h1>MontyPay Configuration</h1>
    <form>
      <fieldset>
        <legend>Merchant Info</legend>
        <label>
          Merchant Key:
          <input type="text" placeholder="Merchant Key" />
        </label>
        <label>
          Merchant Password:
          <input type="password" placeholder="Merchant Password" />
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
async function getUserData() {
  const data = await window.ghl.getUserData();
  user.value = data;
}

onMounted(() => {
  getUserData();
});
</script>

<style></style>
