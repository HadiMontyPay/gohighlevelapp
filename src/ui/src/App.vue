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
    <!-- <p style="color: white">{{ JSON.stringify(user, null, 4) }}</p> -->
    <p>User: {{ data }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      data: [],
    };
  },
  async created() {
    await this.fetchData();
  },
  methods: {
    async fetchData() {
      const res = await this.getUserData();
      this.data = res;
      console.log(res);
    },
    async getUserData() {
      const key = await new Promise((resolve) => {
        window.parent.postMessage({ message: "REQUEST_USER_DATA" }, "*");
        window.addEventListener("message", ({ data }) => {
          if (data.message === "REQUEST_USER_DATA_RESPONSE") {
            resolve(data.payload);
          }
        });
      });
      const res = await fetch(
        `${process.env.VUE_APP_BACKEND_URL}/decrypt-sso`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ key }),
        }
      );
      const data_1 = await res.json();
      return await data_1;
    },
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
