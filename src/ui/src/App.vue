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
    <p style="color: white">{{ JSON.stringify(user, null, 4) }}</p>
  </div>
</template>

<script>
import { ref } from "vue";
const user = ref({});

export default {
  name: "App",
  components: {},
  async mounted() {
    const data = await window.ghl.getUserData();
    console.log("user-details", data);
    user.value = data;
  },
};
</script>

<style>
/* #app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
} */
</style>
