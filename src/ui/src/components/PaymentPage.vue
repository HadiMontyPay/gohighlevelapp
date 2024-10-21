<template>
  <div id="payment_page" v-if="loading === false">
    <h1>Monty Pay Payment</h1>
    <iframe :src="iframeSrc"></iframe>
    <h2>New Data: {{ newData }}</h2>
    <p v-if="connectionStatus">Connected to WebSocket</p>
    <p v-else>Not connected to WebSocket</p>
  </div>
  <div id="lll" v-if="loading === true">
    <div class="loader"></div>
  </div>
</template>

<script>
import axios from "axios";

import { io } from "socket.io-client";

export default {
  name: "PaymentPage",
  // props: {
  //   msg: String,
  // },
  data() {
    return {
      newData: null,
      connectionStatus: false,
      iframeSrc: "about:blank",
      loading: true,
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      total: 1.0,
      merchant_key: "",
      merchant_pass: "",
      operation: "purchase",
      cancel_url: "",
      success_url: "https://merchantapp.montypay.com/paysuccess",
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

      // window.open(pay, "_blank");
      this.iframeSrc = pay;
      this.loading = false;
    },
    async getSavedInfo(locationId) {
      // console.log("Get Saved Info");
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

      // console.log("Got Saved Info");
      this.submitPayment();
    },
  },
  mounted() {
    const socket = io("https://funnnel-fusion.onrender.com/notifications", {
      transports: ["websocket"], // Ensure the WebSocket transport is used
      reconnectionAttempts: 3,
    });

    // Check if connected
    socket.on("connect", () => {
      console.log("Connected to /notifications namespace:", socket.id);
      this.connectionStatus = true;
    });

    // Check if disconnected
    socket.on("disconnect", () => {
      console.log("Disconnected from /notifications namespace");
      this.connectionStatus = false;
    });

    // Listen for new data
    socket.on("newData", (data) => {
      this.newData = data;
      console.log("New data received:", data);
    });
    window.addEventListener("message", async ({ data }) => {
      // console.log("Called Patrent Iframe");
      data = JSON.parse(data);
      console.log("Data:", data);
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
      // console.log("finished Calling Parent Iframe");
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

<style>
#payment_page {
  height: 100vh;
  h1 {
    border: none;
    font-size: 20px;
  }

  iframe {
    min-height: 90%;
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
