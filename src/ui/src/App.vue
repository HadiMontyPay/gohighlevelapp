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
import { ref, onMounted } from "vue";

export default {
  name: "App",
  setup() {
    const user = ref({}); // Define user as a reactive reference

    const getUserData = async () => {
      const key = await new Promise((resolve) => {
        window.parent.postMessage({ message: "REQUEST_USER_DATA" }, "*");
        window.addEventListener("message", ({ data }) => {
          if (data.message === "REQUEST_USER_DATA_RESPONSE") {
            resolve(data.payload);
            console.log("User data:", data.payload);
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
    };

    onMounted(async () => {
      const data = await getUserData();
      console.log("user-details", data);
      user.value = data; // Update the user reference with the fetched data
    });

    return { user }; // Return the reactive reference for use in the template
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
