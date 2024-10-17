<template>
  <!-- <div id="payment_page" v-if="loading === false">
    <h1>Payments Page</h1>
    <form @submit.prevent="submitPayment">
      <fieldset>
        <h3>Total: {{ this.total }} $</h3>
        <label for="cardNumber">
          Card Number
          <input
            type="text"
            id="cardNumber"
            v-model="cardNumber"
            @input="formatCardNumber"
            placeholder="1234 1234 1234 1234"
            maxlength="19"
          />
        </label>
        <div id="nnn">
          <label for="expiryDate">
            Expiry Date
            <input
              type="text"
              id="expiryDate"
              v-model="expiryDate"
              @input="formatExpiryDate"
              placeholder="MM/YY"
              maxlength="5"
            />
          </label>
          <label for="cvv">
            CVV
            <input
              type="text"
              id="cvv"
              v-model="cvv"
              placeholder="123"
              maxlength="3"
            />
          </label>
        </div>
        <button type="submit">Pay</button>
      </fieldset>
    </form>
  </div> -->
  <div id="lll" v-if="loading === true">
    <div class="loader"></div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "PaymentPage",
  // props: {
  //   msg: String,
  // },
  data() {
    return {
      // info: {},
      loading: true,
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      total: 1.0,
      merchant_key: "",
      merchant_pass: "",
      operation: "purchase",
      cancel_url: "",
      success_url: "https://funnnel-fusion.onrender.com/return",
      // hash: "",
      order: {
        description: "",
        number: "",
        amount: "",
        currency: "",
      },
      customer: {
        name: "",
        email: "",
      },
    };
  },
  methods: {
    formatCardNumber() {
      this.cardNumber = this.cardNumber
        .replace(/\D/g, "")
        .replace(/(.{4})/g, "$1 ")
        .trim();
    },
    formatExpiryDate() {
      this.expiryDate = this.expiryDate
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d{1,2})/, "$1/$2")
        .slice(0, 5);
    },
    async submitPayment() {
      // Add payment submission logic here

      // const todoObject = {
      //   merchant_key: this.merchant_key,
      //   merchant_pass: this.merchant_pass,
      //   operation: this.operation,
      //   cancel_url: this.cancel_url,
      //   success_url: this.success_url,
      //   // hash: this.hash,
      //   order: {
      //     description: this.order.description,
      //     number: this.order.number,
      //     amount: this.order.amount,
      //     currency: this.order.currency,
      //   },
      //   customer: {
      //     name: this.customer.name,
      //     email: this.customer.email,
      //   },
      // };
      const pay = await axios
        .post("/getPaymentRedirectURL", {
          merchant_key: this.merchant_key,
          merchant_pass: this.merchant_pass,
          operation: this.operation,
          cancel_url: this.cancel_url,
          success_url: this.success_url,
          order: {
            description: this.order.description,
            number: "B07",
            amount: this.order.amount,
            currency: this.order.currency,
          },
          customer: {
            name: this.customer.name,
            email: this.customer.email,
          },
        })
        .then((response) => {
          return response.data.redirect_url;
        })
        .catch((err) => {
          console.log(err);
        });

      // console.log("Pay", pay);

      window.parent.location.href = pay;
    },
    async getSavedInfo(locationId) {
      console.log("Get Saved Info");
      const info = await window.ghl.getSavedInfo(locationId);
      // console.log(info);
      if (info.TestmerchantKey) {
        this.merchant_key = info.TestmerchantKey;
      }
      if (info.TestmerchantPass) {
        this.merchant_pass = info.TestmerchantPass;
      }
      if (info.merchantKey !== "" || info.merchantKey !== null) {
        this.merchant_key = info.merchantKey;
      }
      if (info.merchantPass !== "" || info.merchantPass !== null) {
        this.merchant_pass = info.merchantPass;
      }

      console.log("Got Saved Info");
      this.submitPayment();
    },
  },
  mounted() {
    window.addEventListener("message", async ({ data }) => {
      console.log("Called Patrent Iframe");
      data = JSON.parse(data);
      this.total = data.amount;

      if (data.currency.toUpperCase() === "JOD") {
        this.order.amount = this.total.toFixed(3);
      } else {
        this.order.amount = this.total.toFixed(2);
      }
      this.order.currency = data.currency.toUpperCase();
      if (data.description === "") {
        this.order.description = "this product doesn't have a description";
      } else {
        this.order.description = data.description;
      }
      this.order.number = data.orderId;
      this.customer.name = data.contact.name;
      this.customer.email = data.contact.email;
      this.getSavedInfo(data.locationId);
      console.log("finished Calling Parent Iframe");
    });
    window.parent.postMessage(
      JSON.stringify({
        type: "custom_provider_ready",
        loaded: true,
      }),
      "*"
    );
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
#payment_page {
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

      h3 {
        width: 100%;
        margin-left: 20px;
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

      #nnn {
        display: flex;
        width: 80%;
      }

      button {
        background-color: #155eef;
        font-size: 14px;
        color: white;
        font-weight: 500;
        padding: 0.6rem 1.5rem;
        margin-left: 20px;
        border-radius: 8px;
        width: 20%;
      }
    }
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
